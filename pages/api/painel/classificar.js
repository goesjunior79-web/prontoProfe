/**
 * POST /api/painel/classificar
 *
 * Classifica alunos da turma em N1-N4 com observação + intervenção.
 * Engine LLM = PROMPT 8 (classificador automático).
 *
 * Story: US-011b
 *
 * Body:
 *   { turma: string, componente: string }
 *
 * Response:
 *   { tabela: [{ alunoId, nome, nivel, observacao, intervencao }], custo, savedCount }
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Anthropic from '@anthropic-ai/sdk';
import { listAlunos } from '../../../lib/db/alunos';
import { createAvaliacao } from '../../../lib/db/avaliacoes';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

const MODEL = 'claude-sonnet-4-6';
const TEMPERATURE = 0.2;

const SYSTEM_CLASSIFIER = `Você é professora especialista do SESI.

Classificar alunos em níveis de proficiência:
🔵 N1 – abaixo do básico
🟢 N2 – básico
🟡 N3 – adequado
🔴 N4 – avançado

Critérios: autonomia, compreensão, necessidade de ajuda.

Para cada aluno gere:
- Nível (N1-N4)
- Observação objetiva (linguagem ética, sem termos: "desinteressado","lento","atrasado")
- Intervenção (USE EXATAMENTE uma destas 4 opções):
  N1: Atendimento individual + material concreto
  N2: Mediação dirigida + leitura guiada
  N3: Consolidação com prática
  N4: Desafio / atividade avançada

Responda APENAS em JSON válido no formato:
{ "tabela": [{ "alunoId": "uuid", "nome": "...", "nivel": "N1|N2|N3|N4", "observacao": "...", "intervencao": "..." }] }

Não inclua markdown, não explique, apenas o JSON.`;

const INTERVENCOES_VALIDAS = [
  'Atendimento individual + material concreto',
  'Mediação dirigida + leitura guiada',
  'Consolidação com prática',
  'Desafio / atividade avançada',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!requireSameOrigin(req, res)) return;

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'auth_required' });

  const userId = session.user.id;
  const { turma, componente } = req.body;

  if (!turma || !componente) {
    return res.status(400).json({ error: 'validation_error', message: 'turma e componente obrigatórios' });
  }

  try {
    const alunos = await listAlunos(userId, { turma });
    if (alunos.length === 0) {
      return res.status(200).json({ tabela: [], custo: 0, savedCount: 0 });
    }

    // Privacidade (decisão produto 2026-05-02): app interno, dados de aluno
    // são sigilosos. IA recebe apenas:
    //  - primeiro nome (sem sobrenome)
    //  - turma + série (info pedagógica básica)
    //  - obs_nee SOMENTE se a professora marcou opt-in (permite_ia_usar_obs=true)
    const dadosDosAlunos = alunos.map(a => {
      const primeiroNome = (a.nome || '').trim().split(/\s+/)[0] || '';
      const payload = {
        alunoId: a.id,
        nome: primeiroNome,
        turma: a.turma,
        serie: a.serie,
      };
      if (a.permite_ia_usar_obs && a.obs_nee) {
        payload.observacaoNEE = a.obs_nee;
      }
      return payload;
    });

    const userMessage = `Componente: ${componente}\n\nDados dos alunos da turma ${turma}:\n${JSON.stringify(dadosDosAlunos, null, 2)}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: TEMPERATURE,
      system: [{ type: 'text', text: SYSTEM_CLASSIFIER, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content?.[0]?.text || '';
    let parsed;
    try {
      // Strip markdown code fences se houver
      const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('Erro ao parsear JSON do classificador:', e.message);
      return res.status(500).json({ error: 'parse_error', message: 'A classificação automática não pôde ser concluída. Tente novamente.' });
    }

    // Mapa pra restaurar nome completo a partir do alunoId (IA só viu primeiro nome)
    const nomeCompletoPorId = new Map(alunos.map(a => [a.id, a.nome]));

    const tabela = (parsed.tabela || []).filter(row => {
      // Sanity check: nivel ∈ N1-N4
      if (!['N1', 'N2', 'N3', 'N4'].includes(row.nivel)) return false;
      // Intervenção do catálogo
      if (!INTERVENCOES_VALIDAS.includes(row.intervencao)) {
        // Forçar fallback do catálogo correto
        const map = { N1: INTERVENCOES_VALIDAS[0], N2: INTERVENCOES_VALIDAS[1], N3: INTERVENCOES_VALIDAS[2], N4: INTERVENCOES_VALIDAS[3] };
        row.intervencao = map[row.nivel];
      }
      // Restaura nome completo (privacidade: IA só viu primeiro nome)
      const nomeCompleto = nomeCompletoPorId.get(row.alunoId);
      if (nomeCompleto) row.nome = nomeCompleto;
      return true;
    });

    // Persiste em avaliacoes (fonte='classificador_llm')
    let savedCount = 0;
    for (const row of tabela) {
      try {
        await createAvaliacao({
          userId,
          alunoId: row.alunoId,
          componente,
          nivel: row.nivel,
          observacao: row.observacao,
          intervencao: row.intervencao,
          fonte: 'classificador_llm',
        });
        savedCount++;
      } catch (e) {
        console.warn(`Erro ao salvar avaliação do aluno ${row.alunoId}:`, e.message);
      }
    }

    const custo = estimateCost(response.usage, MODEL);

    return res.status(200).json({
      tabela,
      custo,
      savedCount,
      total: tabela.length,
    });
  } catch (e) {
    console.error('POST /api/painel/classificar:', e.message);
    return res.status(500).json({ error: 'classifier_error', message: safeErrorMessage(e) });
  }
}

// maxDuration estendido — classificação de turma com 30+ alunos
// pode passar de 10s default Hobby.
export const config = { maxDuration: 60 };

function estimateCost(usage, model) {
  if (!usage) return 0;
  const rates = { 'claude-sonnet-4-6': { input: 3, output: 15, cache_read: 0.3, cache_creation: 3.75 } };
  const r = rates[model] || rates['claude-sonnet-4-6'];
  const cost = (usage.input_tokens * r.input) / 1e6 +
               (usage.output_tokens * r.output) / 1e6 +
               ((usage.cache_read_input_tokens || 0) * r.cache_read) / 1e6 +
               ((usage.cache_creation_input_tokens || 0) * r.cache_creation) / 1e6;
  return Number(cost.toFixed(6));
}
