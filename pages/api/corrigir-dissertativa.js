import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });

  const { foto, rubrica, valorTotal } = req.body;
  if (!foto || !rubrica?.length) return res.status(400).json({ error: 'Dados insuficientes.' });

  const rubrText = rubrica.map(q =>
    `Questão ${q.num} (${q.peso} pontos):\n` +
    q.criterios.map(c => `  - ${c.nome} (${c.pct}%): ${c.descricao}`).join('\n')
  ).join('\n\n');

  const prompt = `Você está corrigindo uma prova dissertativa escolar. Analise a imagem com as respostas do aluno e avalie cada questão conforme a rubrica abaixo.

RUBRICA:
${rubrText}

Para cada questão, avalie cada critério de 0 a 100 (porcentagem atingida).

Retorne APENAS JSON válido, sem texto extra:
{
  "questoes": [
    {
      "num": "01",
      "criterios": {
        "Nome do critério": { "pct": 40, "atingido": 80, "comentario": "comentário breve" }
      },
      "comentario": "comentário geral da questão"
    }
  ],
  "comentarioGeral": "feedback geral ao aluno"
}

Se não conseguir ler a resposta de uma questão, use atingido: 0 e comentario: "Resposta ilegível".`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: foto.mediaType || 'image/jpeg', data: foto.b64 } },
          { type: 'text', text: prompt },
        ],
      }],
    });

    const raw = response.content[0]?.text?.replace(/```json|```/g, '').trim();
    const dados = JSON.parse(raw);

    // Calcula nota de cada questão e total
    let total = 0;
    const questoes = dados.questoes.map(q => {
      const rubQ = rubrica.find(r => r.num === q.num);
      if (!rubQ) return q;
      const notaQ = Object.entries(q.criterios).reduce((soma, [nome, val]) => {
        const crit = rubQ.criterios.find(c => c.nome === nome || nome.includes(c.nome.split(' ')[0]));
        const pct  = crit?.pct ?? val.pct ?? 0;
        return soma + (val.atingido / 100) * (pct / 100) * rubQ.peso;
      }, 0);
      total += notaQ;
      return { ...q, nota: parseFloat(notaQ.toFixed(2)), max: rubQ.peso };
    });

    return res.status(200).json({ questoes, total: parseFloat(total.toFixed(2)), comentarioGeral: dados.comentarioGeral });
  } catch (e) {
    console.error('Erro corrigir-dissertativa:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };
