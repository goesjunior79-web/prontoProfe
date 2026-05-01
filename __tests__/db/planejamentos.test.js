import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase', () => {
  const state = { nextResults: [] };
  function makeBuilder() {
    const b = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(async () => state.nextResults.shift() || { data: null, error: null }),
      maybeSingle: vi.fn(async () => state.nextResults.shift() || { data: null, error: null }),
    };
    b.then = (resolve) => resolve(state.nextResults.shift() || { data: [], error: null });
    return b;
  }
  return {
    supabase: {
      from: vi.fn(() => makeBuilder()),
      _setNext(...r) { state.nextResults = [...r]; },
      _reset() { state.nextResults = []; },
    },
  };
});

import { supabase } from '../../lib/supabase';
import {
  savePlanejamento,
  listPlanejamentos,
  getPlanejamento,
  softDeletePlanejamento,
  findLatestByCapitulo,
} from '../../lib/db/planejamentos';

beforeEach(() => supabase._reset());

const PLANEJ_MOCK = {
  id: 'planej-uuid',
  user_id: 'user-uuid',
  tipo: 'PTD',
  ano: '3º ano EF I',
  componente: 'Língua Portuguesa',
  capitulo: 'Capítulo 2',
  conteudo_gerado: 'PTD gerado…',
  conteudo_v1: null,
  prompt_versao: 'master-2026-05-01+validador-2026-05-01',
  modelo_llm: 'claude-sonnet-4-6',
  custo_estimado: 0.0173,
  pipeline_passed: true,
  pipeline_attempts: 1,
  created_at: '2026-05-01T00:00:00Z',
};

describe('savePlanejamento', () => {
  it('salva com tipo válido e retorna registro', async () => {
    supabase._setNext(
      { data: PLANEJ_MOCK, error: null },     // insert
      { data: { id: 'log' }, error: null }    // logAcesso
    );

    const result = await savePlanejamento({
      userId: 'user-uuid',
      tipo: 'PTD',
      ano: '3º ano EF I',
      componente: 'Língua Portuguesa',
      capitulo: 'Capítulo 2',
      conteudoGerado: 'PTD gerado…',
    });

    expect(result.id).toBe('planej-uuid');
    expect(result.tipo).toBe('PTD');
  });

  it('rejeita sem userId', async () => {
    await expect(
      savePlanejamento({ tipo: 'PTD', conteudoGerado: 'x' })
    ).rejects.toThrow(/userId/);
  });

  it('rejeita sem conteudoGerado', async () => {
    await expect(
      savePlanejamento({ userId: 'u', tipo: 'PTD' })
    ).rejects.toThrow(/conteudoGerado/);
  });

  it('rejeita tipo inválido', async () => {
    await expect(
      savePlanejamento({ userId: 'u', tipo: 'invalido', conteudoGerado: 'x' })
    ).rejects.toThrow(/Tipo.*inválido/);
  });

  it('lança erro se Supabase falhar', async () => {
    supabase._setNext({ data: null, error: { message: 'fk constraint' } });

    await expect(
      savePlanejamento({ userId: 'u', tipo: 'PTD', conteudoGerado: 'x' })
    ).rejects.toThrow(/fk constraint/);
  });
});

describe('listPlanejamentos', () => {
  it('retorna array', async () => {
    supabase._setNext({ data: [PLANEJ_MOCK], error: null });
    const result = await listPlanejamentos('user-uuid');
    expect(result).toHaveLength(1);
  });

  it('aceita filtros', async () => {
    supabase._setNext({ data: [PLANEJ_MOCK], error: null });
    const result = await listPlanejamentos('user-uuid', {
      tipo: 'PTD',
      ano: '3º ano EF I',
      componente: 'Língua Portuguesa',
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });

  it('rejeita sem userId', async () => {
    await expect(listPlanejamentos()).rejects.toThrow(/userId/);
  });
});

describe('getPlanejamento', () => {
  it('retorna planejamento + log VIEW', async () => {
    supabase._setNext(
      { data: PLANEJ_MOCK, error: null },
      { data: { id: 'log' }, error: null }
    );

    const result = await getPlanejamento('user-uuid', 'planej-uuid');
    expect(result.id).toBe('planej-uuid');
  });

  it('retorna null para ids ausentes', async () => {
    expect(await getPlanejamento()).toBeNull();
    expect(await getPlanejamento('u')).toBeNull();
  });

  it('retorna null se não encontrado', async () => {
    supabase._setNext({ data: null, error: null });
    expect(await getPlanejamento('u', 'p')).toBeNull();
  });
});

describe('softDeletePlanejamento', () => {
  it('marca deleted_at + audit', async () => {
    supabase._setNext(
      { data: { id: 'p' }, error: null },
      { data: { id: 'log' }, error: null }
    );

    const result = await softDeletePlanejamento('u', 'p');
    expect(result.id).toBe('p');
  });

  it('rejeita sem ids', async () => {
    await expect(softDeletePlanejamento()).rejects.toThrow(/obrigatóri/i);
  });
});

describe('findLatestByCapitulo', () => {
  it('retorna o primeiro resultado', async () => {
    supabase._setNext({ data: [PLANEJ_MOCK], error: null });

    const result = await findLatestByCapitulo('u', {
      tipo: 'PTD',
      ano: '3º ano EF I',
      componente: 'Língua Portuguesa',
      capitulo: 'Capítulo 2',
    });
    expect(result.id).toBe('planej-uuid');
  });

  it('retorna null sem userId/tipo', async () => {
    expect(await findLatestByCapitulo()).toBeNull();
    expect(await findLatestByCapitulo('u')).toBeNull();
  });

  it('retorna null se array vazio', async () => {
    supabase._setNext({ data: [], error: null });
    expect(await findLatestByCapitulo('u', { tipo: 'PTD' })).toBeNull();
  });
});
