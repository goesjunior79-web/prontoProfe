import { describe, it, expect } from 'vitest';
import {
  TERMOS_PROIBIDOS,
  findForbiddenTerms,
  hasForbiddenTerms,
} from '../../lib/validators/forbiddenTerms';

describe('TERMOS_PROIBIDOS', () => {
  it('contém os 3 termos oficiais', () => {
    expect(TERMOS_PROIBIDOS).toContain('desinteressado');
    expect(TERMOS_PROIBIDOS).toContain('lento');
    expect(TERMOS_PROIBIDOS).toContain('atrasado');
  });
});

describe('hasForbiddenTerms', () => {
  it('detecta termo proibido', () => {
    expect(hasForbiddenTerms('O aluno está desinteressado nas aulas')).toBe(true);
    expect(hasForbiddenTerms('é lento para responder')).toBe(true);
    expect(hasForbiddenTerms('está atrasado em relação aos colegas')).toBe(true);
  });

  it('case-insensitive', () => {
    expect(hasForbiddenTerms('aluno DESINTERESSADO')).toBe(true);
    expect(hasForbiddenTerms('está Lento')).toBe(true);
  });

  it('retorna false para texto limpo', () => {
    expect(hasForbiddenTerms('O aluno demonstra avanço progressivo')).toBe(false);
    expect(hasForbiddenTerms('apresenta dificuldades técnicas')).toBe(false);
  });

  it('retorna false para substring (word boundary)', () => {
    // "lentoidade" não existe, mas vamos garantir word boundary
    expect(hasForbiddenTerms('lentamente')).toBe(false); // não é "lento"
    expect(hasForbiddenTerms('atrasaria')).toBe(false); // não é "atrasado"
  });
});

describe('findForbiddenTerms', () => {
  it('retorna array de matches com posição e contexto', () => {
    const text = 'O aluno está desinteressado nas atividades.';
    const matches = findForbiddenTerms(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].termo).toBe('desinteressado');
    expect(matches[0].position).toBe(13);
    expect(matches[0].context).toContain('desinteressado');
  });

  it('retorna múltiplas ocorrências', () => {
    const text = 'lento e atrasado';
    const matches = findForbiddenTerms(text);
    expect(matches).toHaveLength(2);
  });

  it('retorna array vazio para texto limpo', () => {
    expect(findForbiddenTerms('Apresenta avanço significativo')).toEqual([]);
  });

  it('detecta termos com pontuação adjacente', () => {
    expect(findForbiddenTerms('está atrasado.')).toHaveLength(1);
    expect(findForbiddenTerms('aluno (lento)')).toHaveLength(1);
  });
});
