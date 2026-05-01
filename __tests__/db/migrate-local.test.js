import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  readLocalAlunos,
  hasAlreadyMigrated,
  markAsMigrated,
  migrateLocalToSupabase,
} from '../../lib/db/migrate-local';

// Mock localStorage no ambiente de teste (Node)
const originalWindow = globalThis.window;

beforeEach(() => {
  const store = {};
  globalThis.window = {
    localStorage: {
      getItem: vi.fn(key => store[key] ?? null),
      setItem: vi.fn((key, val) => { store[key] = String(val); }),
      removeItem: vi.fn(key => { delete store[key]; }),
      clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
    },
  };
  globalThis.localStorage = globalThis.window.localStorage;

  // Mock global fetch (para migrateLocalToSupabase)
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.window = originalWindow;
  if (!originalWindow) delete globalThis.localStorage;
  delete globalThis.fetch;
});

describe('readLocalAlunos', () => {
  it('retorna [] se localStorage vazio', () => {
    expect(readLocalAlunos()).toEqual([]);
  });

  it('parseia JSON válido', () => {
    localStorage.setItem('sesi_alunos', JSON.stringify([{ nome: 'Ana', turma: 'A' }]));
    expect(readLocalAlunos()).toHaveLength(1);
  });

  it('retorna [] em JSON inválido', () => {
    localStorage.setItem('sesi_alunos', 'not-json{');
    expect(readLocalAlunos()).toEqual([]);
  });

  it('retorna [] se não-array', () => {
    localStorage.setItem('sesi_alunos', JSON.stringify({ x: 1 }));
    expect(readLocalAlunos()).toEqual([]);
  });
});

describe('markAsMigrated / hasAlreadyMigrated', () => {
  it('marca e detecta', () => {
    expect(hasAlreadyMigrated()).toBe(false);
    markAsMigrated();
    expect(hasAlreadyMigrated()).toBe(true);
  });
});

describe('migrateLocalToSupabase', () => {
  it('skipa se já migrou', async () => {
    markAsMigrated();
    const result = await migrateLocalToSupabase();
    expect(result.skipped).toBe(true);
    expect(result.migrated).toBe(0);
  });

  it('skipa silenciosamente se localStorage vazio', async () => {
    const result = await migrateLocalToSupabase();
    expect(result.skipped).toBe(false);
    expect(result.migrated).toBe(0);
    expect(hasAlreadyMigrated()).toBe(true);
  });

  it('migra alunos via fetch /api/alunos', async () => {
    localStorage.setItem('sesi_alunos', JSON.stringify([
      { nome: 'Ana', turma: 'A', serie: '3º', obs: 'TDAH' },
      { nome: 'Bento', turma: 'B', serie: '3º' },
    ]));

    fetch.mockResolvedValue({ ok: true, json: async () => ({ aluno: { id: 'x' } }) });

    const result = await migrateLocalToSupabase();
    expect(result.migrated).toBe(2);
    expect(result.errors).toHaveLength(0);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('continua mesmo com alguns erros', async () => {
    localStorage.setItem('sesi_alunos', JSON.stringify([
      { nome: 'Ana', turma: 'A' },
      { nome: 'Bento', turma: 'B' },
    ]));

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ aluno: { id: 'x' } }) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: 'falha' }) });

    const result = await migrateLocalToSupabase();
    expect(result.migrated).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(hasAlreadyMigrated()).toBe(true);  // marca mesmo com erros (evita loop)
  });

  it('marca consentido=true (cadastros pré-LGPD)', async () => {
    localStorage.setItem('sesi_alunos', JSON.stringify([{ nome: 'A', turma: '1' }]));
    fetch.mockResolvedValue({ ok: true, json: async () => ({ aluno: { id: 'x' } }) });

    await migrateLocalToSupabase();

    const callBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(callBody.consentido).toBe(true);
  });
});
