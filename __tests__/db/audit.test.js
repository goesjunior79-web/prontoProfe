import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase', () => {
  const state = { nextResults: [] };
  function makeBuilder() {
    const b = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(async () => state.nextResults.shift() || { data: null, error: null }),
      maybeSingle: vi.fn(async () => state.nextResults.shift() || { data: null, error: null }),
    };
    // queries que retornam array (sem .single) consomem da fila quando awaited
    b.then = (resolve) => {
      const r = state.nextResults.shift() || { data: [], error: null };
      resolve(r);
    };
    return b;
  }
  return {
    supabase: {
      from: vi.fn(() => makeBuilder()),
      _state: state,
      _setNext(...r) { state.nextResults = [...r]; },
      _reset() { state.nextResults = []; },
    },
  };
});

import { supabase } from '../../lib/supabase';
import { logAcesso, getAccessLogByUser } from '../../lib/db/audit';

beforeEach(() => supabase._reset());

describe('logAcesso', () => {
  it('insere registro no audit log', async () => {
    supabase._setNext({ data: { id: 'log-uuid', created_at: '2026-05-01T00:00:00Z' }, error: null });

    const result = await logAcesso({
      userId: 'user-uuid',
      alunoId: 'aluno-uuid',
      acao: 'CREATE',
      recurso: 'alunos',
    });

    expect(result.id).toBe('log-uuid');
  });

  it('não bloqueia se Supabase falhar', async () => {
    supabase._setNext({ data: null, error: { message: 'connection refused' } });

    const result = await logAcesso({
      userId: 'user-uuid',
      acao: 'VIEW',
      recurso: 'alunos',
    });

    expect(result).toBeNull();  // não joga erro
  });

  it('retorna null se userId ausente', async () => {
    const result = await logAcesso({ acao: 'VIEW', recurso: 'alunos' });
    expect(result).toBeNull();
  });

  it('retorna null para ação inválida', async () => {
    const result = await logAcesso({
      userId: 'user-uuid',
      acao: 'INVALID_ACTION',
      recurso: 'alunos',
    });
    expect(result).toBeNull();
  });

  it('aceita alunoId opcional (null)', async () => {
    supabase._setNext({ data: { id: 'log' }, error: null });

    const result = await logAcesso({
      userId: 'user-uuid',
      acao: 'EXPORT',
      recurso: 'planejamentos',
    });

    expect(result.id).toBe('log');
  });
});
