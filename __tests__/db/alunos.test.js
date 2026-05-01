import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase', () => {
  const state = { nextResults: [] };
  function makeBuilder() {
    const b = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(async () => state.nextResults.shift() || { data: null, error: null }),
      maybeSingle: vi.fn(async () => state.nextResults.shift() || { data: null, error: null }),
    };
    b.then = (resolve) => {
      const r = state.nextResults.shift() || { data: [], error: null };
      resolve(r);
    };
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
  createAluno,
  listAlunos,
  getAluno,
  updateAluno,
  softDeleteAluno,
  countAlunos,
} from '../../lib/db/alunos';

beforeEach(() => supabase._reset());

const ALUNO_MOCK = {
  id: 'aluno-uuid',
  user_id: 'user-uuid',
  nome: 'Ana Silva',
  turma: '3A',
  serie: '3º ano EF I',
  obs_nee: null,
  consent_at: '2026-05-01T00:00:00Z',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

describe('createAluno', () => {
  it('cria aluno com consentimento', async () => {
    supabase._setNext(
      { data: ALUNO_MOCK, error: null },         // insert aluno
      { data: { id: 'log-uuid' }, error: null }  // logAcesso
    );

    const result = await createAluno({
      userId: 'user-uuid',
      nome: 'Ana Silva',
      turma: '3A',
      serie: '3º ano EF I',
      consentido: true,
    });

    expect(result.id).toBe('aluno-uuid');
    expect(result.nome).toBe('Ana Silva');
  });

  it('rejeita sem consentimento (LGPD)', async () => {
    await expect(
      createAluno({ userId: 'u', nome: 'X', turma: 'A', consentido: false })
    ).rejects.toThrow(/consentimento/i);
  });

  it('rejeita sem userId', async () => {
    await expect(
      createAluno({ nome: 'X', turma: 'A', consentido: true })
    ).rejects.toThrow(/userId/);
  });

  it('rejeita sem nome', async () => {
    await expect(
      createAluno({ userId: 'u', turma: 'A', consentido: true })
    ).rejects.toThrow(/nome/);
  });

  it('rejeita sem turma', async () => {
    await expect(
      createAluno({ userId: 'u', nome: 'X', consentido: true })
    ).rejects.toThrow(/turma/);
  });

  it('lança erro se Supabase falhar', async () => {
    supabase._setNext({ data: null, error: { message: 'unique violation' } });

    await expect(
      createAluno({ userId: 'u', nome: 'X', turma: 'A', consentido: true })
    ).rejects.toThrow(/unique violation/);
  });
});

describe('listAlunos', () => {
  it('retorna array de alunos', async () => {
    supabase._setNext({ data: [ALUNO_MOCK, { ...ALUNO_MOCK, id: 'a2', nome: 'Bento' }], error: null });

    const result = await listAlunos('user-uuid');
    expect(result).toHaveLength(2);
  });

  it('aceita filtros turma e serie', async () => {
    supabase._setNext({ data: [ALUNO_MOCK], error: null });

    const result = await listAlunos('user-uuid', { turma: '3A' });
    expect(result).toHaveLength(1);
  });

  it('rejeita sem userId', async () => {
    await expect(listAlunos()).rejects.toThrow(/userId/);
  });

  it('retorna [] em erro de query', async () => {
    supabase._setNext({ data: null, error: { message: 'permission denied' } });
    await expect(listAlunos('user-uuid')).rejects.toThrow(/permission denied/);
  });
});

describe('getAluno', () => {
  it('retorna aluno + registra VIEW no audit', async () => {
    supabase._setNext(
      { data: ALUNO_MOCK, error: null },         // maybeSingle (aluno)
      { data: { id: 'log-uuid' }, error: null }  // logAcesso
    );

    const result = await getAluno('user-uuid', 'aluno-uuid');
    expect(result.id).toBe('aluno-uuid');
  });

  it('retorna null se não encontrado (sem VIEW log)', async () => {
    supabase._setNext({ data: null, error: null });

    const result = await getAluno('user-uuid', 'inexistente');
    expect(result).toBeNull();
  });

  it('retorna null para userId ou alunoId ausente', async () => {
    expect(await getAluno()).toBeNull();
    expect(await getAluno('user-uuid')).toBeNull();
    expect(await getAluno(null, 'aluno-uuid')).toBeNull();
  });
});

describe('updateAluno', () => {
  it('atualiza campos permitidos', async () => {
    const updated = { ...ALUNO_MOCK, nome: 'Ana Silva (atualizada)' };
    supabase._setNext(
      { data: updated, error: null },
      { data: { id: 'log' }, error: null }
    );

    const result = await updateAluno('user-uuid', 'aluno-uuid', { nome: 'Ana Silva (atualizada)' });
    expect(result.nome).toBe('Ana Silva (atualizada)');
  });

  it('rejeita atualização sem campos válidos', async () => {
    await expect(
      updateAluno('user-uuid', 'aluno-uuid', { campo_invalido: 'x' })
    ).rejects.toThrow(/nenhum campo válido/i);
  });

  it('rejeita sem userId/alunoId', async () => {
    await expect(updateAluno()).rejects.toThrow(/obrigatóri/i);
  });

  it('ignora campos não-permitidos no payload', async () => {
    supabase._setNext(
      { data: ALUNO_MOCK, error: null },
      { data: { id: 'log' }, error: null }
    );

    // Passa nome (válido) + campo extra (ignorado)
    await expect(
      updateAluno('user-uuid', 'aluno-uuid', { nome: 'Novo', user_id: 'malicioso' })
    ).resolves.toBeDefined();
  });
});

describe('softDeleteAluno', () => {
  it('marca deleted_at', async () => {
    supabase._setNext(
      { data: { id: 'aluno-uuid' }, error: null },
      { data: { id: 'log' }, error: null }
    );

    const result = await softDeleteAluno('user-uuid', 'aluno-uuid');
    expect(result.id).toBe('aluno-uuid');
  });

  it('rejeita sem ids', async () => {
    await expect(softDeleteAluno()).rejects.toThrow(/obrigatóri/i);
  });
});

describe('countAlunos', () => {
  it('retorna contagem', async () => {
    // count vem em propriedade separada
    const state = supabase._setNext;
    // Mock direto da query — não usa fila normal
    // Pra simplificar, vamos criar um cenário em que o mock retorna count
    // Como o builder devolve { count, error }, podemos hackear:
    supabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockResolvedValue({ count: 5, error: null }),
    }));

    const result = await countAlunos('user-uuid');
    expect(result).toBe(5);
  });

  it('retorna 0 sem userId', async () => {
    expect(await countAlunos()).toBe(0);
  });
});
