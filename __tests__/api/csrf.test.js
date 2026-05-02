import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isSameOrigin, requireSameOrigin } from '../../lib/api/csrf';

const ORIG_ENV = { ...process.env };

beforeEach(() => {
  process.env.NEXTAUTH_URL = 'https://pronto-profe.vercel.app';
  delete process.env.VERCEL_URL;
});

afterEach(() => {
  process.env = { ...ORIG_ENV };
});

function reqOf({ method = 'POST', origin, referer } = {}) {
  return { method, headers: { origin, referer } };
}

function resOf() {
  const res = {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
  return res;
}

describe('isSameOrigin', () => {
  it('GET sempre passa (não muta estado)', () => {
    expect(isSameOrigin(reqOf({ method: 'GET' }))).toBe(true);
  });

  it('aceita Origin igual ao NEXTAUTH_URL', () => {
    expect(isSameOrigin(reqOf({ origin: 'https://pronto-profe.vercel.app' }))).toBe(true);
  });

  it('aceita Referer mesma origem', () => {
    expect(isSameOrigin(reqOf({ referer: 'https://pronto-profe.vercel.app/config' }))).toBe(true);
  });

  it('rejeita Origin de outro domínio', () => {
    expect(isSameOrigin(reqOf({ origin: 'https://evil.com' }))).toBe(false);
  });

  it('rejeita quando Origin e Referer ausentes', () => {
    expect(isSameOrigin(reqOf({}))).toBe(false);
  });

  it('rejeita referer parecido mas com domínio diferente', () => {
    expect(isSameOrigin(reqOf({ referer: 'https://pronto-profe.vercel.app.evil.com/config' }))).toBe(false);
  });

  it('aceita VERCEL_URL como segunda origem válida', () => {
    process.env.VERCEL_URL = 'pronto-profe-preview.vercel.app';
    expect(isSameOrigin(reqOf({ origin: 'https://pronto-profe-preview.vercel.app' }))).toBe(true);
  });

  it('fail-closed sem NEXTAUTH_URL', () => {
    delete process.env.NEXTAUTH_URL;
    expect(isSameOrigin(reqOf({ origin: 'https://pronto-profe.vercel.app' }))).toBe(false);
  });
});

describe('requireSameOrigin', () => {
  it('retorna true e não toca em res quando passa', () => {
    const res = resOf();
    expect(requireSameOrigin(reqOf({ origin: 'https://pronto-profe.vercel.app' }), res)).toBe(true);
    expect(res.statusCode).toBe(0);
  });

  it('retorna false e envia 403 quando bloqueia', () => {
    const res = resOf();
    expect(requireSameOrigin(reqOf({ origin: 'https://evil.com' }), res)).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('csrf_blocked');
  });
});
