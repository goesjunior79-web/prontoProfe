import { describe, it, expect } from 'vitest';
import { safeErrorMessage, FALLBACK } from '../../lib/api/safeError';

describe('safeErrorMessage', () => {
  it('retorna fallback quando err é vazio/null', () => {
    expect(safeErrorMessage(null)).toBe(FALLBACK);
    expect(safeErrorMessage('')).toBe(FALLBACK);
    expect(safeErrorMessage(undefined)).toBe(FALLBACK);
  });

  it('retorna fallback pra erros de Postgres', () => {
    expect(safeErrorMessage(new Error('duplicate key value violates unique constraint "alunos_pkey"'))).toBe(FALLBACK);
    expect(safeErrorMessage(new Error('relation "usuarios" does not exist'))).toBe(FALLBACK);
    expect(safeErrorMessage(new Error('column "obs_nee" does not exist'))).toBe(FALLBACK);
    expect(safeErrorMessage(new Error('rls policy violated'))).toBe(FALLBACK);
  });

  it('retorna fallback pra erros do SDK Anthropic/Claude', () => {
    expect(safeErrorMessage(new Error('Anthropic API key invalid'))).toBe(FALLBACK);
    expect(safeErrorMessage(new Error('rate-limit exceeded for claude'))).toBe(FALLBACK);
    expect(safeErrorMessage(new Error('Pipeline failed: critic returned empty'))).toBe(FALLBACK);
  });

  it('retorna fallback pra erros de rede', () => {
    expect(safeErrorMessage(new Error('ECONNREFUSED 127.0.0.1:5432'))).toBe(FALLBACK);
    expect(safeErrorMessage(new Error('fetch failed'))).toBe(FALLBACK);
  });

  it('retorna fallback pra erros de cripto', () => {
    expect(safeErrorMessage(new Error('aes-256-gcm cipher init failed'))).toBe(FALLBACK);
    expect(safeErrorMessage(new Error('decrypt: invalid tag'))).toBe(FALLBACK);
  });

  it('passa mensagens amigáveis sem alterar', () => {
    expect(safeErrorMessage('Confirme que tem autorização dos pais')).toBe('Confirme que tem autorização dos pais');
    expect(safeErrorMessage(new Error('nome é obrigatório'))).toBe('nome é obrigatório');
  });

  it('aceita string crua como input', () => {
    expect(safeErrorMessage('Mensagem amigável simples')).toBe('Mensagem amigável simples');
  });

  it('trunca mensagens muito longas', () => {
    const longa = 'a'.repeat(500);
    const out = safeErrorMessage(longa);
    expect(out.length).toBeLessThanOrEqual(240);
    expect(out.endsWith('…')).toBe(true);
  });

  it('respeita fallback customizado', () => {
    expect(safeErrorMessage(new Error('rls policy violated'), 'Erro específico do contexto')).toBe('Erro específico do contexto');
  });

  it('detecta stack trace fragments', () => {
    expect(safeErrorMessage(new Error('Cannot read property foo at handler (/var/task/...)'))).toBe(FALLBACK);
  });
});
