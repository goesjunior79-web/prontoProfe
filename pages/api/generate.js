// pages/api/generate.js
// Rota de servidor — a chave de API NUNCA chega ao navegador

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Limites por plano (gerações por mês)
const PLAN_LIMITS = {
  free: 10,
  pro: 150,
  school: Infinity,
};

// Modelos por provedor
const PROVIDER_MODELS = {
  claude: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
  gemini: 'gemini-1.5-pro',
  copilot: 'gpt-4-turbo', // Azure OpenAI
};

// Planos que podem usar cada provedor
const PROVIDER_PLANS = {
  claude: ['free', 'pro', 'school'],
  openai: ['pro', 'school'],
  gemini: ['free', 'pro', 'school'],
  copilot: ['school'],
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt, provider = 'claude', plan = 'free', files = [] } = req.body;

  // Validação básica
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt obrigatório' });
  }

  // Verificar se o plano pode usar o provedor escolhido
  if (!PROVIDER_PLANS[provider]?.includes(plan)) {
    return res.status(403).json({
      error: 'upgrade_required',
      message: `O provedor ${provider} não está disponível no plano ${plan}. Faça upgrade para acessar.`,
    });
  }

  try {
    let result = '';

    if (provider === 'claude') {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const messages = buildAnthropicMessages(prompt, files);
      const response = await client.messages.create({
        model: PROVIDER_MODELS.claude,
        max_tokens: 3500,
        messages,
      });
      result = response.content[0]?.text || '';

    } else if (provider === 'openai') {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const messages = buildOpenAIMessages(prompt, files);
      const response = await client.chat.completions.create({
        model: PROVIDER_MODELS.openai,
        max_tokens: 3500,
        messages,
      });
      result = response.choices[0]?.message?.content || '';

    } else if (provider === 'gemini') {
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = client.getGenerativeModel({ model: PROVIDER_MODELS.gemini });
      const parts = [];
      files.forEach(f => {
        if (f.type === 'img' && f.b64) {
          parts.push({ inlineData: { mimeType: f.mediaType || 'image/jpeg', data: f.b64 } });
        }
      });
      parts.push({ text: prompt });
      const response = await model.generateContent({ contents: [{ role: 'user', parts }] });
      result = response.response.text();

    } else if (provider === 'copilot') {
      // Microsoft Copilot usa Azure OpenAI
      const client = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_KEY,
        baseURL: process.env.AZURE_OPENAI_ENDPOINT,
        defaultQuery: { 'api-version': '2024-02-15-preview' },
        defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
      });
      const response = await client.chat.completions.create({
        model: PROVIDER_MODELS.copilot,
        max_tokens: 3500,
        messages: [{ role: 'user', content: prompt }],
      });
      result = response.choices[0]?.message?.content || '';
    }

    return res.status(200).json({ result, provider, model: PROVIDER_MODELS[provider] });

  } catch (error) {
    console.error('Erro ao chamar provedor:', provider, error.message);
    return res.status(500).json({
      error: 'api_error',
      message: 'Erro ao gerar conteúdo. Tente novamente.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// Monta mensagens para o Anthropic (suporta arquivos: PDF e imagens)
function buildAnthropicMessages(prompt, files) {
  const contentParts = [];

  files.forEach(f => {
    if (f.type === 'pdf' && f.b64) {
      contentParts.push({ type: 'text', text: `Arquivo PDF: ${f.name}` });
      contentParts.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.b64 } });
    } else if (f.type === 'img' && f.b64) {
      contentParts.push({ type: 'text', text: `Imagem: ${f.name}` });
      contentParts.push({ type: 'image', source: { type: 'base64', media_type: f.mediaType || 'image/jpeg', data: f.b64 } });
    } else if (f.text) {
      contentParts.push({ type: 'text', text: `Conteúdo de ${f.name}:\n${f.text}` });
    }
  });

  contentParts.push({ type: 'text', text: prompt });
  return [{ role: 'user', content: contentParts }];
}

// Monta mensagens para OpenAI (suporta imagens via URL base64)
function buildOpenAIMessages(prompt, files) {
  const contentParts = [];

  files.forEach(f => {
    if (f.type === 'img' && f.b64) {
      contentParts.push({
        type: 'image_url',
        image_url: { url: `data:${f.mediaType || 'image/jpeg'};base64,${f.b64}` }
      });
    } else if (f.text) {
      contentParts.push({ type: 'text', text: `Arquivo ${f.name}:\n${f.text}` });
    }
  });

  contentParts.push({ type: 'text', text: prompt });
  return [{ role: 'user', content: contentParts }];
}

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };
