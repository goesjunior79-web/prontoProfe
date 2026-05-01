import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  encrypt,
  decrypt,
  tryDecrypt,
  looksEncrypted,
} from '../../lib/db/encryption';

const VALID_SECRET = 'super-secret-key-with-at-least-32-characters-long-XX';
let originalSecret;

beforeEach(() => {
  originalSecret = process.env.SUPABASE_ENCRYPTION_SECRET;
  process.env.SUPABASE_ENCRYPTION_SECRET = VALID_SECRET;
});

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.SUPABASE_ENCRYPTION_SECRET;
  } else {
    process.env.SUPABASE_ENCRYPTION_SECRET = originalSecret;
  }
});

describe('encrypt', () => {
  it('cria token v1 com 4 partes (versão.iv.tag.ct)', () => {
    const token = encrypt('TDAH com mediação', 'user-uuid-1');
    const parts = token.split('.');
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('v1');
    expect(parts[1].length).toBeGreaterThan(0);
    expect(parts[2].length).toBeGreaterThan(0);
    expect(parts[3].length).toBeGreaterThan(0);
  });

  it('retorna null para plaintext vazio/null/undefined', () => {
    expect(encrypt('', 'u1')).toBeNull();
    expect(encrypt(null, 'u1')).toBeNull();
    expect(encrypt(undefined, 'u1')).toBeNull();
  });

  it('rejeita sem userId', () => {
    expect(() => encrypt('texto', '')).toThrow(/userId/);
    expect(() => encrypt('texto', null)).toThrow(/userId/);
  });

  it('IV diferente em cada chamada (não-determinístico)', () => {
    const t1 = encrypt('mesmo texto', 'u1');
    const t2 = encrypt('mesmo texto', 'u1');
    expect(t1).not.toBe(t2); // IV random garante tokens diferentes
  });

  it('rejeita master secret muito curto', () => {
    process.env.SUPABASE_ENCRYPTION_SECRET = 'curto';
    expect(() => encrypt('texto', 'u1')).toThrow(/muito curto/i);
  });

  it('rejeita master secret ausente', () => {
    delete process.env.SUPABASE_ENCRYPTION_SECRET;
    expect(() => encrypt('texto', 'u1')).toThrow(/não configurado/i);
  });
});

describe('decrypt', () => {
  it('decripta corretamente o que foi encriptado', () => {
    const original = 'Aluno tem TDAH e dislexia, requer mediação';
    const token = encrypt(original, 'user-uuid-1');
    const decrypted = decrypt(token, 'user-uuid-1');
    expect(decrypted).toBe(original);
  });

  it('decripta texto com caracteres especiais (acentos, emoji)', () => {
    const original = 'Aluno é dedicado, demonstra interesse 🌟 conquistas notáveis!';
    const token = encrypt(original, 'user-uuid-1');
    expect(decrypt(token, 'user-uuid-1')).toBe(original);
  });

  it('falha quando userId é diferente (chave errada)', () => {
    const token = encrypt('texto', 'user-A');
    expect(() => decrypt(token, 'user-B')).toThrow();
  });

  it('falha em token corrompido (tampering)', () => {
    const token = encrypt('texto', 'user-uuid-1');
    const parts = token.split('.');
    // Corrompe o ciphertext
    const tampered = `${parts[0]}.${parts[1]}.${parts[2]}.AAAAAAAA`;
    expect(() => decrypt(tampered, 'user-uuid-1')).toThrow();
  });

  it('rejeita token de versão desconhecida', () => {
    expect(() => decrypt('v99.AAA.BBB.CCC', 'u1')).toThrow(/Versão.*não suportada/);
  });

  it('rejeita token mal formatado (poucas partes)', () => {
    expect(() => decrypt('v1.AA.BB', 'u1')).toThrow(/inválido/i);
    expect(() => decrypt('not-a-token', 'u1')).toThrow();
  });

  it('retorna null para token vazio', () => {
    expect(decrypt('', 'u1')).toBeNull();
    expect(decrypt(null, 'u1')).toBeNull();
    expect(decrypt(undefined, 'u1')).toBeNull();
  });

  it('rejeita sem userId', () => {
    const token = encrypt('texto', 'u1');
    expect(() => decrypt(token, '')).toThrow(/userId/);
  });
});

describe('round-trip', () => {
  it('encrypt + decrypt restaura o original (texto grande)', () => {
    const big = 'TDAH severo com hiperatividade. '.repeat(100);
    const token = encrypt(big, 'u1');
    expect(decrypt(token, 'u1')).toBe(big);
  });

  it('chaves derivadas por user são independentes', () => {
    const t1 = encrypt('segredo', 'user-A');
    const t2 = encrypt('segredo', 'user-B');
    expect(decrypt(t1, 'user-A')).toBe('segredo');
    expect(decrypt(t2, 'user-B')).toBe('segredo');
    expect(() => decrypt(t1, 'user-B')).toThrow();
  });
});

describe('tryDecrypt', () => {
  it('retorna plaintext em sucesso', () => {
    const token = encrypt('ok', 'u1');
    expect(tryDecrypt(token, 'u1')).toBe('ok');
  });

  it('retorna fallback (null default) em erro', () => {
    expect(tryDecrypt('token-corrompido', 'u1')).toBeNull();
  });

  it('retorna fallback customizado em erro', () => {
    expect(tryDecrypt('corrompido', 'u1', '[ERRO]')).toBe('[ERRO]');
  });

  it('retorna null para token null/empty (não tenta decrypt)', () => {
    expect(tryDecrypt(null, 'u1')).toBeNull();
    expect(tryDecrypt('', 'u1')).toBeNull();
  });
});

describe('looksEncrypted', () => {
  it('reconhece token v1 válido', () => {
    const token = encrypt('texto', 'u1');
    expect(looksEncrypted(token)).toBe(true);
  });

  it('rejeita strings normais', () => {
    expect(looksEncrypted('TDAH')).toBe(false);
    expect(looksEncrypted('Aluno desatento')).toBe(false);
    expect(looksEncrypted('')).toBe(false);
  });

  it('rejeita não-strings', () => {
    expect(looksEncrypted(null)).toBe(false);
    expect(looksEncrypted(undefined)).toBe(false);
    expect(looksEncrypted(123)).toBe(false);
    expect(looksEncrypted({})).toBe(false);
  });
});
