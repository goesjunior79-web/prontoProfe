import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do client Supabase ANTES de importar o módulo testado.
// O mock implementa method chaining típico do supabase-js.
vi.mock('../../lib/supabase', () => {
  const state = {
    nextResults: [],  // fila de respostas { data, error }
    callsLog: [],
  };

  function makeQueryBuilder() {
    const builder = {
      _operation: null,
      _payload: null,
      _filters: [],

      from: vi.fn(function (table) {
        this._table = table;
        return this;
      }),
      select: vi.fn(function (cols) {
        this._select = cols;
        return this;
      }),
      eq: vi.fn(function (col, val) {
        this._filters.push({ col, val });
        return this;
      }),
      is: vi.fn(function (col, val) {
        this._filters.push({ col, val, op: 'is' });
        return this;
      }),
      insert: vi.fn(function (payload) {
        this._operation = 'insert';
        this._payload = payload;
        return this;
      }),
      update: vi.fn(function (payload) {
        this._operation = 'update';
        this._payload = payload;
        return this;
      }),
      delete: vi.fn(function () {
        this._operation = 'delete';
        return this;
      }),
      maybeSingle: vi.fn(async function () {
        const result = state.nextResults.shift() || { data: null, error: null };
        state.callsLog.push({ method: 'maybeSingle', table: this._table, filters: this._filters });
        return result;
      }),
      single: vi.fn(async function () {
        const result = state.nextResults.shift() || { data: null, error: null };
        state.callsLog.push({ method: 'single', table: this._table, op: this._operation, payload: this._payload });
        return result;
      }),
    };
    return builder;
  }

  // O mock da supabase é um objeto que tem `from` retornando builder novo
  const supabase = {
    from: vi.fn(table => {
      const b = makeQueryBuilder();
      b._table = table;
      return b;
    }),
    _state: state,
    _setNextResults(...results) {
      state.nextResults = [...results];
    },
    _resetMock() {
      state.nextResults = [];
      state.callsLog = [];
    },
  };

  return { supabase };
});

import { supabase } from '../../lib/supabase';
import {
  upsertUser,
  getUserByGoogleId,
  getUserByEmail,
  getUserById,
  updatePreferences,
  updateProfile,
  deleteAccount,
} from '../../lib/db/users';

beforeEach(() => {
  supabase._resetMock();
});

describe('upsertUser', () => {
  const profile = {
    googleId: '12345',
    email: 'sheila@example.com',
    nome: 'Sheila Goes',
    imagemUrl: 'https://example.com/avatar.jpg',
  };

  it('cria novo usuário se não existir (insert)', async () => {
    supabase._setNextResults(
      { data: null, error: null },  // maybeSingle (find by google_id)
      { data: { id: 'uuid-novo', email: profile.email, nome: profile.nome }, error: null }, // single (insert)
    );

    const result = await upsertUser(profile);
    expect(result.id).toBe('uuid-novo');
    expect(result.email).toBe(profile.email);
  });

  it('atualiza usuário existente (update + ultimo_login)', async () => {
    supabase._setNextResults(
      { data: { id: 'uuid-existente', email: 'old@example.com', nome: 'Old', imagem_url: null }, error: null },
      { data: { id: 'uuid-existente', email: profile.email, nome: profile.nome, imagem_url: profile.imagemUrl }, error: null },
    );

    const result = await upsertUser(profile);
    expect(result.id).toBe('uuid-existente');
    expect(result.email).toBe(profile.email);
  });

  it('rejeita se googleId ausente', async () => {
    await expect(upsertUser({ email: 'a@b.com' })).rejects.toThrow(/googleId/);
  });

  it('rejeita se email ausente', async () => {
    await expect(upsertUser({ googleId: '123' })).rejects.toThrow(/email/);
  });

  it('lança erro se Supabase retornar error no insert', async () => {
    supabase._setNextResults(
      { data: null, error: null },
      { data: null, error: { message: 'duplicate key violation' } },
    );

    await expect(upsertUser(profile)).rejects.toThrow(/duplicate key/);
  });

  it('preserva nome anterior se novo for null', async () => {
    supabase._setNextResults(
      { data: { id: 'uid', email: 'a@b.com', nome: 'Nome Antigo', imagem_url: 'old.jpg' }, error: null },
      { data: { id: 'uid', email: 'a@b.com', nome: 'Nome Antigo', imagem_url: 'old.jpg' }, error: null },
    );

    const result = await upsertUser({ googleId: '999', email: 'a@b.com', nome: null, imagemUrl: null });
    expect(result.nome).toBe('Nome Antigo');
  });
});

describe('getUserByGoogleId', () => {
  it('retorna usuário se encontrar', async () => {
    supabase._setNextResults({
      data: { id: 'uuid', google_id: '123', email: 'a@b.com', nome: 'Sheila' },
      error: null,
    });

    const result = await getUserByGoogleId('123');
    expect(result.id).toBe('uuid');
  });

  it('retorna null se não encontrar', async () => {
    supabase._setNextResults({ data: null, error: null });
    const result = await getUserByGoogleId('999');
    expect(result).toBeNull();
  });

  it('retorna null para googleId vazio', async () => {
    const result = await getUserByGoogleId('');
    expect(result).toBeNull();
  });

  it('lança erro se Supabase retornar error', async () => {
    supabase._setNextResults({ data: null, error: { message: 'connection refused' } });
    await expect(getUserByGoogleId('123')).rejects.toThrow(/connection refused/);
  });
});

describe('getUserByEmail', () => {
  it('retorna usuário se encontrar', async () => {
    supabase._setNextResults({
      data: { id: 'uuid', email: 'a@b.com' },
      error: null,
    });
    const result = await getUserByEmail('a@b.com');
    expect(result.id).toBe('uuid');
  });

  it('retorna null para email vazio', async () => {
    expect(await getUserByEmail('')).toBeNull();
  });
});

describe('getUserById', () => {
  it('retorna usuário pelo UUID', async () => {
    supabase._setNextResults({
      data: { id: 'uuid', email: 'a@b.com' },
      error: null,
    });
    const result = await getUserById('uuid');
    expect(result.id).toBe('uuid');
  });

  it('retorna null para id vazio', async () => {
    expect(await getUserById(null)).toBeNull();
  });
});

describe('updatePreferences', () => {
  it('atualiza preferências e retorna o JSONB', async () => {
    const prefs = { modoCores: 'semaforo', horarioFixo: 'seg 2, ter 2' };
    supabase._setNextResults({ data: { preferencias: prefs }, error: null });

    const result = await updatePreferences('uuid', prefs);
    expect(result).toEqual(prefs);
  });

  it('lança erro se Supabase falhar', async () => {
    supabase._setNextResults({ data: null, error: { message: 'rls policy violation' } });
    await expect(updatePreferences('uuid', {})).rejects.toThrow(/rls policy/);
  });
});

describe('updateProfile', () => {
  it('atualiza só campos permitidos', async () => {
    supabase._setNextResults({
      data: { id: 'uuid', nome: 'Sheila', cidade: 'BOTUCATU', escola: 'CE-228' },
      error: null,
    });

    const result = await updateProfile('uuid', {
      nome: 'Sheila',
      cidade: 'BOTUCATU',
      escola: 'CE-228',
      _hack: 'tentativa-injection',
    });
    expect(result.nome).toBe('Sheila');
    expect(result.cidade).toBe('BOTUCATU');
  });

  it('rejeita se nenhum campo válido', async () => {
    await expect(updateProfile('uuid', { _hack: 'x' })).rejects.toThrow(/nenhum campo/);
  });

  it('lança erro se Supabase falhar', async () => {
    supabase._setNextResults({ data: null, error: { message: 'db down' } });
    await expect(updateProfile('uuid', { nome: 'X' })).rejects.toThrow(/db down/);
  });
});

describe('deleteAccount', () => {
  it('cascata soft-delete e retorna usuário deletado', async () => {
    // Mock só consome resultado do .single() final (cascade updates resolvem
    // pelo builder não-thenable e não consomem fila).
    supabase._setNextResults({
      data: { id: 'uuid', deleted_at: '2026-04-29T00:00:00Z' },
      error: null,
    });

    const result = await deleteAccount('uuid');
    expect(result.id).toBe('uuid');
    expect(result.deleted_at).toBeTruthy();
  });

  it('rejeita se userId ausente', async () => {
    await expect(deleteAccount(null)).rejects.toThrow(/userId/);
  });

  it('lança erro se update final falhar', async () => {
    supabase._setNextResults({ data: null, error: { message: 'fk constraint' } });
    await expect(deleteAccount('uuid')).rejects.toThrow(/fk constraint/);
  });
});
