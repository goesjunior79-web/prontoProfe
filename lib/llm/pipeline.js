/**
 * Pipeline Generator + Critic — orquestra geração com PROMPT MESTRE,
 * validador determinístico e corretor LLM (PROMPT 6 v2), com retry policy.
 *
 * Story: US-003 (FASE 0 Bedrock)
 * ADRs: ADR-002 (Generator + Critic com cache) + ADR-003 (validador determinístico)
 *
 * Fluxo:
 *   1. Generator (PROMPT MESTRE com cache)              → v1
 *   2. Validador determinístico em v1                   → estrutura ok?
 *   3. Critic (PROMPT 6 v2 com cache)                   → v2 (corrigida)
 *   4. Validador determinístico em v2                   → tudo ok?
 *   5. Se v2.passed → retorna sucesso
 *      Se falhar → regenera (max 3 tentativas)
 *
 * Custo estimado é calculado e logado.
 */

import { PROMPT_MESTRE, VERSION as MESTRE_VERSION } from '../prompts/master.js';
import {
  PROMPT_6_VALIDADOR,
  VERSION as VALIDADOR_VERSION,
} from '../prompts/validator.js';
import { PROMPT_PTD, VERSION_PTD } from '../prompts/ptd.js';
import { validateOutput } from '../validators/index.js';

/**
 * Seleciona system prompt apropriado baseado no tipo de saída.
 * Especializações sobrescrevem o PROMPT_MESTRE genérico para tipos
 * que precisam de estrutura/regras únicas.
 */
function pickSystemPrompt(tipoDeSaida) {
  if (tipoDeSaida === 'PTD') {
    return { text: PROMPT_PTD, version: `ptd-${VERSION_PTD}` };
  }
  return { text: PROMPT_MESTRE, version: `master-${MESTRE_VERSION}` };
}

const DEFAULT_MAX_RETRIES = 3;
const TEMPERATURE_GENERATOR = 0.3;
const TEMPERATURE_CRITIC = 0.2;
const MAX_TOKENS = 8000;

/**
 * Tabela de preços por modelo (USD por 1M tokens).
 * Mantida sincronizada com docs/spec-pipeline/03-research.md §8.
 */
const PRICING = {
  'claude-sonnet-4-6': {
    input: 3.0,
    output: 15.0,
    cache_read: 0.30,
    cache_creation: 3.75,
  },
  'claude-haiku-4-5': {
    input: 0.25,
    output: 1.25,
    cache_read: 0.025,
    cache_creation: 0.3125,
  },
  'claude-opus-4-7': {
    input: 15.0,
    output: 75.0,
    cache_read: 1.5,
    cache_creation: 18.75,
  },
};

/**
 * Executa o pipeline completo Generator + Critic com retry.
 *
 * @param {object} params
 * @param {object} params.client — instância Anthropic já configurada
 * @param {string} params.model — id do modelo Claude
 * @param {Array} params.userMessage — content do user message (parts)
 * @param {string} [params.tipoDeSaida] — tipo do output (PTD, aula, etc.)
 *   usado pelo validador determinístico. Se não informado, validação
 *   estrutural é skipada (só checa termos proibidos).
 * @param {number} [params.maxRetries=3]
 * @returns {Promise<PipelineResult>}
 */
export async function runPipeline({
  client,
  model,
  userMessage,
  tipoDeSaida,
  maxRetries = DEFAULT_MAX_RETRIES,
  skipCritic = false,
  maxTokens = MAX_TOKENS,
}) {
  const usage = newUsage();
  let lastV1 = null;
  let lastV2 = null;
  let lastValidation = null;
  const attemptsLog = [];

  const systemPrompt = pickSystemPrompt(tipoDeSaida);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // ── 1. Generator ──────────────────────────────────────────────────────
    const v1Response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: TEMPERATURE_GENERATOR,
      system: [
        {
          type: 'text',
          text: systemPrompt.text,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    });
    accumulateUsage(usage, v1Response.usage);
    const v1 = extractText(v1Response);
    lastV1 = v1;

    // ── 2. Validador determinístico em v1 ────────────────────────────────
    const v1Check = validateOutput(v1, tipoDeSaida);
    attemptsLog.push({ attempt, stage: 'generator', passed: v1Check.passed, errors: v1Check.errors.length });

    if (!v1Check.passed && hasStructuralErrors(v1Check)) {
      // Estrutura quebrada — regenerar do zero (skip critic, mais barato)
      lastValidation = v1Check;
      continue;
    }

    // Modo "skipCritic": prompt grande / fontes pesadas — devolve só v1 se passou.
    // Economiza 1 LLM call (~15-25s) e mantém qualidade aceitável quando o
    // generator já entregou estrutura correta na primeira tentativa.
    if (skipCritic && v1Check.passed) {
      return {
        content: v1,
        v1,
        passed: true,
        attempts: attempt,
        attemptsLog,
        warnings: v1Check.warnings,
        usage,
        custoEstimado: estimateCost(usage, model),
        promptVersao: composeVersion(),
        cacheStats: computeCacheStats(usage),
        skippedCritic: true,
      };
    }

    // ── 3. Critic (PROMPT 6 v2) ──────────────────────────────────────────
    const v2Response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: TEMPERATURE_CRITIC,
      system: [
        {
          type: 'text',
          text: PROMPT_6_VALIDADOR,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: v1 }],
    });
    accumulateUsage(usage, v2Response.usage);
    const v2 = extractText(v2Response);
    lastV2 = v2;

    // ── 4. Validador determinístico em v2 ────────────────────────────────
    const v2Check = validateOutput(v2, tipoDeSaida);
    lastValidation = v2Check;
    attemptsLog.push({ attempt, stage: 'critic', passed: v2Check.passed, errors: v2Check.errors.length });

    if (v2Check.passed) {
      return {
        content: v2,
        v1,
        passed: true,
        attempts: attempt,
        attemptsLog,
        warnings: v2Check.warnings,
        usage,
        custoEstimado: estimateCost(usage, model),
        promptVersao: composeVersion(),
        cacheStats: computeCacheStats(usage),
      };
    }
  }

  // Max retries excedido — retorna o último v2 com warnings
  return {
    content: lastV2 || lastV1,
    v1: lastV1,
    passed: false,
    attempts: maxRetries,
    attemptsLog,
    errors: lastValidation?.errors || [],
    warnings: [
      ...(lastValidation?.warnings || []),
      {
        code: 'MAX_RETRIES_EXCEEDED',
        severity: 'medium',
        message: `Validação não passou após ${maxRetries} tentativas. Output final entregue com warnings.`,
      },
    ],
    usage,
    custoEstimado: estimateCost(usage, model),
    promptVersao: composeVersion(),
    cacheStats: computeCacheStats(usage),
  };
}

/**
 * US-016 — Métricas de cache hit rate.
 *
 * cache_read_input_tokens / (input_tokens + cache_creation + cache_read)
 * Quanto maior, melhor (cache de prompts está economizando custo).
 */
export function computeCacheStats(usage) {
  if (!usage) return null;
  const cacheRead = usage.cache_read_input_tokens || 0;
  const cacheCreation = usage.cache_creation_input_tokens || 0;
  const input = usage.input_tokens || 0;
  const totalInputCacheable = cacheRead + cacheCreation + input;
  const hitRate = totalInputCacheable > 0 ? cacheRead / totalInputCacheable : 0;
  return {
    cacheRead,
    cacheCreation,
    input,
    totalInputCacheable,
    hitRate: Number(hitRate.toFixed(4)),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function extractText(response) {
  return response?.content?.[0]?.text || '';
}

function newUsage() {
  return {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };
}

function accumulateUsage(total, usage) {
  if (!usage) return;
  total.input_tokens += usage.input_tokens || 0;
  total.output_tokens += usage.output_tokens || 0;
  total.cache_creation_input_tokens += usage.cache_creation_input_tokens || 0;
  total.cache_read_input_tokens += usage.cache_read_input_tokens || 0;
}

/**
 * Calcula custo estimado em USD com base no usage e modelo.
 *
 * Fórmula:
 *   custo = input * rate.input
 *         + output * rate.output
 *         + cache_read * rate.cache_read
 *         + cache_creation * rate.cache_creation
 *
 * Importante: input_tokens da Anthropic API JÁ EXCLUI cache_read e cache_creation.
 * Logo, somam-se as 4 categorias separadamente.
 */
export function estimateCost(usage, model) {
  const rates = PRICING[model] || PRICING['claude-sonnet-4-6'];
  const cost =
    (usage.input_tokens * rates.input) / 1e6 +
    (usage.output_tokens * rates.output) / 1e6 +
    (usage.cache_read_input_tokens * rates.cache_read) / 1e6 +
    (usage.cache_creation_input_tokens * rates.cache_creation) / 1e6;
  return Number(cost.toFixed(6));
}

function composeVersion() {
  return `master-${MESTRE_VERSION}+ptd-${VERSION_PTD}+validador-${VALIDADOR_VERSION}`;
}

/**
 * Heurística: erro estrutural = vale regenerar. Só termo proibido →
 * critic pode resolver.
 */
function hasStructuralErrors(check) {
  if (!check?.errors) return false;
  return check.errors.some(e =>
    [
      'STRUCTURE_MISSING_SECTION',
      'STRUCTURE_OUT_OF_ORDER',
      'STRUCTURE_MISSING_LEVEL',
      'MISSING_INTERACTIVE_QUESTION',
      'MISSING_SIGNATURE',
      'MISSING_CARTAO_RESPOSTA',
    ].includes(e.code)
  );
}
