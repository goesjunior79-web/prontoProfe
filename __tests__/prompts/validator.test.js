import { describe, it, expect } from 'vitest';
import { PROMPT_6_VALIDADOR, VERSION } from '../../lib/prompts/validator';

describe('lib/prompts/validator', () => {
  it('exporta VERSION no formato YYYY-MM-DD', () => {
    expect(VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('PROMPT_6_VALIDADOR é string não-vazia', () => {
    expect(typeof PROMPT_6_VALIDADOR).toBe('string');
    expect(PROMPT_6_VALIDADOR.length).toBeGreaterThan(50);
  });

  it('contém os 4 critérios de validação', () => {
    expect(PROMPT_6_VALIDADOR).toContain('Estrutura correta?');
    expect(PROMPT_6_VALIDADOR).toContain('Nada inventado?');
    expect(PROMPT_6_VALIDADOR).toContain('Linguagem pedagógica?');
    expect(PROMPT_6_VALIDADOR).toContain('Aplicável?');
  });

  it('instrui a corrigir automaticamente', () => {
    expect(PROMPT_6_VALIDADOR).toContain('Corrigir automaticamente');
  });

  it('instrui a NÃO explicar', () => {
    expect(PROMPT_6_VALIDADOR).toContain('Não explicar');
  });

  it('instrui a entregar versão final', () => {
    expect(PROMPT_6_VALIDADOR).toContain('Entregar versão final');
  });
});
