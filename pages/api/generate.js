import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getOrCreateProfile, incrementUsage } from '../../lib/db/profile';
import { saveGeneration } from '../../lib/db/history';

const SESI_SYSTEM_PROMPT = `Você é um especialista em educação da rede SESI (Serviço Social da Indústria) do Brasil.

Ao criar materiais pedagógicos, siga SEMPRE estas diretrizes:
- Use linguagem clara, objetiva e adequada à faixa etária dos alunos
- Baseie-se na Base Nacional Comum Curricular (BNCC) e nas competências socioemocionais SESI
- Mantenha formatação profissional, consistente e de fácil leitura
- Escreva em português brasileiro formal, sem erros gramaticais
- Estruture o conteúdo com títulos em MAIÚSCULAS para as seções principais
- Para provas: use o formato QUESTÃO 01, QUESTÃO 02... com alternativas A) B) C) D) e inclua GABARITO ao final
- Para planos de aula: siga a estrutura SESI padrão com identificação, objetivos, sequência didática e avaliação
- Para atividades: inclua título, objetivo, materiais, instruções claras e critérios de avaliação
- Seja completo e detalhado — não deixe seções incompletas`;

const PLAN_LIMITS = { free: 10, pro: 150, school: Infinity };

const PROVIDER_MODELS = {
  claude:  'claude-sonnet-4-6',
  openai:  'gpt-4o',
  gemini:  'gemini-2.0-flash',
  copilot: 'gpt-4-turbo',
};

const PROVIDER_PLANS = {
  claude:  ['free', 'pro', 'school'],
  openai:  ['pro', 'school'],
  gemini:  ['pro', 'school'],
  copilot: ['school'],
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // ── Autenticação ──────────────────────────────────────────────────────────
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'auth_required', message: 'Faça login para continuar.' });
  }

  const { prompt, provider = 'claude', files = [], meta = {} } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

  // ── Plano e limites (server-authoritative) ────────────────────────────────
  let profile;
  try {
    profile = await getOrCreateProfile(session.user.email, session.user.name, session.user.image);
  } catch (e) {
    console.error('Erro ao buscar perfil:', e.message);
    return res.status(500).json({ error: 'db_error', message: 'Erro ao verificar sua conta. Tente novamente.' });
  }

  const { plan } = profile;

  if (!PROVIDER_PLANS[provider]?.includes(plan)) {
    return res.status(403).json({
      error: 'upgrade_required',
      message: `O provedor ${provider} não está disponível no plano ${plan}. Faça upgrade para acessar.`,
    });
  }

  if (plan !== 'school' && profile.usage >= PLAN_LIMITS[plan]) {
    return res.status(403).json({
      error: 'limit_reached',
      message: `Você atingiu o limite de ${PLAN_LIMITS[plan]} gerações este mês.`,
    });
  }

  // ── Geração ───────────────────────────────────────────────────────────────
  try {
    let result = '';

    if (provider === 'claude') {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: PROVIDER_MODELS.claude,
        max_tokens: 8000,
        system: SESI_SYSTEM_PROMPT,
        messages: buildAnthropicMessages(prompt, files),
      });
      result = response.content[0]?.text || '';

    } else if (provider === 'openai') {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.chat.completions.create({
        model: PROVIDER_MODELS.openai,
        max_tokens: 8000,
        messages: [{ role: 'system', content: SESI_SYSTEM_PROMPT }, ...buildOpenAIMessages(prompt, files)],
      });
      result = response.choices[0]?.message?.content || '';

    } else if (provider === 'gemini') {
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = client.getGenerativeModel({ model: PROVIDER_MODELS.gemini, systemInstruction: SESI_SYSTEM_PROMPT });
      const response = await model.generateContent({ contents: [{ role: 'user', parts: buildGeminiParts(prompt, files) }] });
      result = response.response.text();

    } else if (provider === 'copilot') {
      const client = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_KEY,
        baseURL: process.env.AZURE_OPENAI_ENDPOINT,
        defaultQuery: { 'api-version': '2024-02-15-preview' },
        defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
      });
      const response = await client.chat.completions.create({
        model: PROVIDER_MODELS.copilot,
        max_tokens: 8000,
        messages: [{ role: 'system', content: SESI_SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      });
      result = response.choices[0]?.message?.content || '';
    }

    // ── Salvar no banco ───────────────────────────────────────────────────────
    await incrementUsage(session.user.email);
    await saveGeneration(session.user.email, {
      tipo:       meta.tipo       || 'prova',
      titulo:     meta.titulo     || null,
      disciplina: meta.disciplina || null,
      serie:      meta.serie      || null,
      turma:      meta.turma      || null,
      provider,
      conteudo:   result,
    });

    return res.status(200).json({
      result,
      provider,
      model:  PROVIDER_MODELS[provider],
      usage:  profile.usage + 1,
      plan,
    });

  } catch (error) {
    console.error('Erro ao chamar provedor:', provider, error.message);
    return res.status(500).json({
      error:   'api_error',
      message: 'Erro ao gerar conteúdo. Tente novamente.',
      detail:  process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

function buildAnthropicMessages(prompt, files) {
  const parts = [];
  files.forEach(f => {
    if (f.type === 'pdf' && f.b64)  { parts.push({ type: 'text', text: `Arquivo PDF: ${f.name}` }); parts.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.b64 } }); }
    else if (f.type === 'img' && f.b64) { parts.push({ type: 'text', text: `Imagem: ${f.name}` }); parts.push({ type: 'image', source: { type: 'base64', media_type: f.mediaType || 'image/jpeg', data: f.b64 } }); }
    else if (f.text) parts.push({ type: 'text', text: `Conteúdo de ${f.name}:\n${f.text}` });
  });
  parts.push({ type: 'text', text: prompt });
  return [{ role: 'user', content: parts }];
}

function buildGeminiParts(prompt, files) {
  const parts = [];
  files.forEach(f => {
    if (f.type === 'img' && f.b64) parts.push({ inlineData: { mimeType: f.mediaType || 'image/jpeg', data: f.b64 } });
    else if (f.text) parts.push({ text: `Arquivo ${f.name}:\n${f.text}` });
  });
  parts.push({ text: prompt });
  return parts;
}

function buildOpenAIMessages(prompt, files) {
  const parts = [];
  files.forEach(f => {
    if (f.type === 'img' && f.b64) parts.push({ type: 'image_url', image_url: { url: `data:${f.mediaType || 'image/jpeg'};base64,${f.b64}` } });
    else if (f.text) parts.push({ type: 'text', text: `Arquivo ${f.name}:\n${f.text}` });
  });
  parts.push({ type: 'text', text: prompt });
  return [{ role: 'user', content: parts }];
}

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };
