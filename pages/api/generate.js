import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Anthropic from '@anthropic-ai/sdk';
import { getOrCreateProfile, incrementUsage } from '../../lib/db/profile';
import { saveGeneration } from '../../lib/db/history';
import { isTipoDeSaidaValido } from '../../lib/prompts/master';
import { runPipeline } from '../../lib/llm/pipeline';
import { listModelos, getSignedDownloadUrl } from '../../lib/db/modelos';

const PLAN_LIMITS = { free: 10, pro: 150, school: Infinity };
const CLAUDE_MODEL = 'claude-sonnet-4-6';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // ── Autenticação ──────────────────────────────────────────────────────────
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'auth_required', message: 'Faça login para continuar.' });
  }

  const { prompt, tipo_de_saida, files = [], meta = {} } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

  // tipo_de_saida é opcional (backward compat). Se vier, validar mas não bloquear.
  if (tipo_de_saida && !isTipoDeSaidaValido(tipo_de_saida)) {
    console.warn('tipo_de_saida desconhecido:', tipo_de_saida);
  }

  const MAX_PROMPT = 120000;
  if (prompt.length > MAX_PROMPT) {
    return res.status(400).json({ error: 'prompt_too_large', message: 'Conteúdo muito extenso. Reduza o texto enviado e tente novamente.' });
  }

  // ── Plano e limites (server-authoritative) ────────────────────────────────
  let profile;
  try {
    profile = await getOrCreateProfile(session.user.email, session.user.name, session.user.image);
  } catch (e) {
    console.error('Erro ao buscar perfil:', e.message);
    return res.status(500).json({ error: 'db_error', message: 'Erro ao verificar sua conta. Tente novamente.' });
  }

  const { plan } = profile;

  if (plan !== 'school' && profile.usage >= PLAN_LIMITS[plan]) {
    return res.status(403).json({
      error: 'limit_reached',
      message: `Você atingiu o limite de ${PLAN_LIMITS[plan]} gerações este mês.`,
    });
  }

  // ── Geração via pipeline Generator + Critic (ADR-002) ─────────────────────
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Modelo padrão da professora (anexa automaticamente como contexto)
    let modeloDefault = null;
    try {
      const userId = profile?.id || null;
      // profile vem por email — buscamos modelo via session.user.id direto se disponível
      const allModelos = session.user.id ? await listModelos(session.user.id) : [];
      modeloDefault = allModelos.find(m => m.is_default) || null;
    } catch (e) { console.warn('listModelos falhou:', e.message); }

    let augmentedFiles = [...(files || [])];
    if (modeloDefault && session.user.id) {
      try {
        const signed = await getSignedDownloadUrl(session.user.id, modeloDefault.id, 60);
        if (signed?.url) {
          const fileBuf = await fetch(signed.url).then(r => r.arrayBuffer());
          const b64 = Buffer.from(fileBuf).toString('base64');
          if (modeloDefault.tipo === 'pdf') {
            augmentedFiles.unshift({ type: 'pdf', b64, name: `MODELO_${modeloDefault.nome}` });
          } else if (modeloDefault.tipo === 'imagem') {
            const ext = (modeloDefault.nome.split('.').pop() || '').toLowerCase();
            const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
            augmentedFiles.unshift({ type: 'img', b64, mediaType, name: `MODELO_${modeloDefault.nome}` });
          }
          // docx pega caminho diferente — mammoth não roda no edge, deixa pra depois
        }
      } catch (e) { console.warn('Falha ao anexar modelo:', e.message); }
    }

    const userMessage = buildAnthropicMessages(prompt, tipo_de_saida, augmentedFiles);

    const pipelineResult = await runPipeline({
      client,
      model: CLAUDE_MODEL,
      userMessage,
      tipoDeSaida: tipo_de_saida,
      // Hobby: pipeline 6 calls (3 retries × Generator+Critic) pode passar 60s.
      // Reduzido pra 2 = max 4 calls. Antes era 3.
      maxRetries: 2,
    });

    const result = pipelineResult.content;

    // ── Salvar no banco ───────────────────────────────────────────────────────
    await incrementUsage(session.user.email);
    await saveGeneration(session.user.email, {
      tipo:       meta.tipo       || tipo_de_saida || 'prova',
      titulo:     meta.titulo     || null,
      disciplina: meta.disciplina || null,
      serie:      meta.serie      || null,
      turma:      meta.turma      || null,
      provider:   'claude',
      conteudo:   result,
    });

    return res.status(200).json({
      result,
      model:           CLAUDE_MODEL,
      tipo_de_saida:   tipo_de_saida || null,
      prompt_versao:   pipelineResult.promptVersao,
      pipeline_passed: pipelineResult.passed,
      pipeline_attempts: pipelineResult.attempts,
      custo_estimado:  pipelineResult.custoEstimado,
      cache_stats:     pipelineResult.cacheStats || null,
      warnings:        pipelineResult.warnings || [],
      usage:           profile.usage + 1,
      plan,
    });

  } catch (error) {
    console.error('Erro ao chamar Claude:', error.message, error.status);
    const msg = error.message || '';
    let statusCode = 500;
    let userMessage = 'Erro ao gerar conteúdo. Tente novamente.';
    if (/api.?key|apikey|unauthorized|invalid_api/i.test(msg)) {
      userMessage = 'Chave de API inválida ou não configurada no servidor.';
    } else if (/quota|rate.?limit|429|too many/i.test(msg) || error.status === 429) {
      statusCode = 429;
      userMessage = 'Limite de requisições da IA atingido. Aguarde alguns minutos e tente novamente.';
    } else if (/timeout|timed out|504/i.test(msg) || error.status === 504) {
      statusCode = 504;
      userMessage = 'A IA demorou muito para responder. Tente reduzir o conteúdo enviado.';
    } else if (/fetch|network|ECONNREFUSED/i.test(msg)) {
      userMessage = 'O servidor não conseguiu conectar à IA. Verifique a conectividade.';
    }
    return res.status(statusCode).json({
      error:   'api_error',
      message: userMessage,
      // detail removido (Fase 7) — vazava error.message do SDK Anthropic.
    });
  }
}

/**
 * Monta o array de "parts" do user message no formato Anthropic.
 * `runPipeline` envolve em { role: 'user', content: parts } depois.
 *
 * Cada part precisa ter `type` (text|image|document) — Anthropic rejeita 400
 * com "messages.0.content.0.type: Field required" se faltar.
 */
function buildAnthropicMessages(prompt, tipoDeSaida, files) {
  const parts = [];
  files.forEach(f => {
    if (f.type === 'pdf' && f.b64)  { parts.push({ type: 'text', text: `Arquivo PDF: ${f.name}` }); parts.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.b64 } }); }
    else if (f.type === 'img' && f.b64) { parts.push({ type: 'text', text: `Imagem: ${f.name}` }); parts.push({ type: 'image', source: { type: 'base64', media_type: f.mediaType || 'image/jpeg', data: f.b64 } }); }
    else if (f.text) parts.push({ type: 'text', text: `Conteúdo de ${f.name}:\n${f.text}` });
  });
  // tipo_de_saida (quando informado) é injetado antes do prompt para o LLM saber
  // qual seção do PROMPT MESTRE acionar.
  const promptFinal = tipoDeSaida
    ? `Tipo de saída: ${tipoDeSaida}\n\n${prompt}`
    : prompt;
  parts.push({ type: 'text', text: promptFinal });
  return parts;
}


// maxDuration: Vercel Hobby permite até 60s (default = 10s, insuficiente
// pra pipeline LLM com retries). Audit 2026-05-02 CRITICAL #2.
export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
  maxDuration: 60,
};
