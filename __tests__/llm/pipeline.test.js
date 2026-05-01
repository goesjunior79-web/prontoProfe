import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runPipeline, estimateCost } from '../../lib/llm/pipeline';

/**
 * Cria mock do client Anthropic com sequência configurável de respostas.
 * Cada chamada de messages.create() consome a próxima resposta da fila.
 */
function makeClient(responses) {
  const queue = [...responses];
  const client = {
    messages: {
      create: vi.fn(() => {
        const next = queue.shift();
        if (!next) throw new Error('Mock sem mais respostas');
        return Promise.resolve(next);
      }),
    },
  };
  return client;
}

function makeResponse(text, usage = {}) {
  return {
    content: [{ type: 'text', text }],
    usage: {
      input_tokens: 100,
      output_tokens: 200,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      ...usage,
    },
  };
}

const VALID_OBSERVACAO = `
Desempenho: O aluno apresenta avanço.
Dificuldade: Tem dificuldade na leitura silábica.
Estratégia: A professora utilizou material concreto.
Resposta: Demonstrou maior segurança.

Deseja sugestão de atividade para trabalhar com o aluno?`;

describe('runPipeline — happy path', () => {
  it('passa em 1 attempt quando v1 ok e v2 ok', async () => {
    const client = makeClient([
      makeResponse(VALID_OBSERVACAO),  // v1
      makeResponse(VALID_OBSERVACAO),  // v2 (corretor)
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'gere observação' }],
      tipoDeSaida: 'observacao',
    });

    expect(result.passed).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.content).toBe(VALID_OBSERVACAO);
    expect(client.messages.create).toHaveBeenCalledTimes(2);
  });

  it('inclui v1 separado do v2 final', async () => {
    const v1Text = VALID_OBSERVACAO + '\n\n[rascunho]';
    const v2Text = VALID_OBSERVACAO;

    const client = makeClient([
      makeResponse(v1Text),
      makeResponse(v2Text),
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
    });

    expect(result.v1).toBe(v1Text);
    expect(result.content).toBe(v2Text);
  });
});

describe('runPipeline — retry com erro estrutural', () => {
  it('regenera quando v1 tem erro estrutural (skip critic)', async () => {
    const v1Bad = 'Texto sem estrutura';      // sem 4 eixos
    const v1Good = VALID_OBSERVACAO;

    const client = makeClient([
      makeResponse(v1Bad),    // attempt 1: estrutural ruim → skip critic
      makeResponse(v1Good),   // attempt 2: v1 ok
      makeResponse(v1Good),   // attempt 2: v2 ok
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
    });

    expect(result.passed).toBe(true);
    expect(result.attempts).toBe(2);
    // 1 v1 ruim + 1 v1 bom + 1 v2 = 3 chamadas (skip critic do attempt 1)
    expect(client.messages.create).toHaveBeenCalledTimes(3);
  });
});

describe('runPipeline — max retries excedido', () => {
  it('retorna passed=false após 3 tentativas', async () => {
    // Sempre v1 ruim → 3 attempts × 1 chamada (só generator, skip critic)
    const v1Bad = 'sem estrutura';
    const client = makeClient([
      makeResponse(v1Bad),
      makeResponse(v1Bad),
      makeResponse(v1Bad),
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
      maxRetries: 3,
    });

    expect(result.passed).toBe(false);
    expect(result.attempts).toBe(3);
    expect(result.warnings.some(w => w.code === 'MAX_RETRIES_EXCEEDED')).toBe(true);
  });

  it('retorna content do último v2 (mesmo que tenha falhado)', async () => {
    // v1 ok, mas v2 introduz termo proibido todas as vezes
    const v1Text = VALID_OBSERVACAO;
    const v2Bad = VALID_OBSERVACAO + '\nO aluno está desinteressado.';

    const client = makeClient([
      makeResponse(v1Text), makeResponse(v2Bad),
      makeResponse(v1Text), makeResponse(v2Bad),
      makeResponse(v1Text), makeResponse(v2Bad),
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
      maxRetries: 3,
    });

    expect(result.passed).toBe(false);
    expect(result.content).toBe(v2Bad);
  });
});

describe('runPipeline — usage acumulado', () => {
  it('soma usage de todas as chamadas', async () => {
    const client = makeClient([
      makeResponse(VALID_OBSERVACAO, { input_tokens: 100, output_tokens: 200 }),
      makeResponse(VALID_OBSERVACAO, { input_tokens: 300, output_tokens: 400 }),
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
    });

    expect(result.usage.input_tokens).toBe(400);   // 100 + 300
    expect(result.usage.output_tokens).toBe(600);  // 200 + 400
  });

  it('soma cache_read e cache_creation separadamente', async () => {
    const client = makeClient([
      makeResponse(VALID_OBSERVACAO, {
        input_tokens: 100,
        cache_creation_input_tokens: 1000,
        cache_read_input_tokens: 0,
      }),
      makeResponse(VALID_OBSERVACAO, {
        input_tokens: 100,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 1000,
      }),
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
    });

    expect(result.usage.cache_creation_input_tokens).toBe(1000);
    expect(result.usage.cache_read_input_tokens).toBe(1000);
  });
});

describe('runPipeline — versão e prompt_versao', () => {
  it('compoe promptVersao com master + validador', async () => {
    const client = makeClient([
      makeResponse(VALID_OBSERVACAO),
      makeResponse(VALID_OBSERVACAO),
    ]);

    const result = await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
    });

    expect(result.promptVersao).toMatch(/^master-\d{4}-\d{2}-\d{2}\+validador-\d{4}-\d{2}-\d{2}$/);
  });
});

describe('runPipeline — cache control', () => {
  it('aplica cache_control nas chamadas', async () => {
    const client = makeClient([
      makeResponse(VALID_OBSERVACAO),
      makeResponse(VALID_OBSERVACAO),
    ]);

    await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
    });

    const calls = client.messages.create.mock.calls;
    expect(calls[0][0].system[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(calls[1][0].system[0].cache_control).toEqual({ type: 'ephemeral' });
  });

  it('temperatura 0.3 no generator e 0.2 no critic', async () => {
    const client = makeClient([
      makeResponse(VALID_OBSERVACAO),
      makeResponse(VALID_OBSERVACAO),
    ]);

    await runPipeline({
      client,
      model: 'claude-sonnet-4-6',
      userMessage: [{ type: 'text', text: 'x' }],
      tipoDeSaida: 'observacao',
    });

    const calls = client.messages.create.mock.calls;
    expect(calls[0][0].temperature).toBe(0.3);
    expect(calls[1][0].temperature).toBe(0.2);
  });
});

describe('estimateCost', () => {
  it('calcula custo Sonnet 4-6 com input + output', () => {
    const usage = {
      input_tokens: 1_000_000,    // $3
      output_tokens: 1_000_000,   // $15
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    };
    expect(estimateCost(usage, 'claude-sonnet-4-6')).toBe(18);
  });

  it('aplica desconto cache_read', () => {
    const usage = {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 1_000_000,  // $0.30
    };
    expect(estimateCost(usage, 'claude-sonnet-4-6')).toBe(0.3);
  });

  it('aplica preço cache_creation', () => {
    const usage = {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_input_tokens: 1_000_000,  // $3.75
      cache_read_input_tokens: 0,
    };
    expect(estimateCost(usage, 'claude-sonnet-4-6')).toBe(3.75);
  });

  it('Haiku 4-5 é ~12x mais barato que Sonnet', () => {
    const usage = {
      input_tokens: 1_000_000,
      output_tokens: 1_000_000,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    };
    const sonnet = estimateCost(usage, 'claude-sonnet-4-6');
    const haiku = estimateCost(usage, 'claude-haiku-4-5');
    expect(haiku).toBeLessThan(sonnet / 10);
  });

  it('modelo desconhecido cai pra Sonnet (fallback)', () => {
    const usage = {
      input_tokens: 1_000_000,
      output_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    };
    expect(estimateCost(usage, 'modelo-desconhecido')).toBe(3);
  });
});
