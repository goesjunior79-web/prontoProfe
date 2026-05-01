import { describe, it, expect } from 'vitest';
import {
  startsWithInfinitiveVerb,
  isThirdPerson,
  hasInteractiveFinalQuestion,
  hasSignature,
  countWords,
  withinPageLimit,
  endsPositively,
  hasSection,
} from '../../lib/validators/heuristics';

describe('startsWithInfinitiveVerb', () => {
  it('aceita verbos regulares -ar/-er/-ir', () => {
    expect(startsWithInfinitiveVerb('Compreender o gênero relato')).toBe(true);
    expect(startsWithInfinitiveVerb('Identificar informações explícitas')).toBe(true);
    expect(startsWithInfinitiveVerb('Planejar produção textual')).toBe(true);
    expect(startsWithInfinitiveVerb('Inferir significados')).toBe(true);
  });

  it('aceita verbos irregulares', () => {
    expect(startsWithInfinitiveVerb('Ser capaz de identificar')).toBe(true);
    expect(startsWithInfinitiveVerb('Ter autonomia na leitura')).toBe(true);
    expect(startsWithInfinitiveVerb('Fazer inferências')).toBe(true);
  });

  it('ignora marcadores de lista', () => {
    expect(startsWithInfinitiveVerb('- Compreender o tema')).toBe(true);
    expect(startsWithInfinitiveVerb('• Reler o texto')).toBe(true);
    expect(startsWithInfinitiveVerb('1. Ler em voz alta')).toBe(true);
  });

  it('rejeita verbos conjugados', () => {
    expect(startsWithInfinitiveVerb('Compreendo o gênero')).toBe(false);
    expect(startsWithInfinitiveVerb('Aluno aprendeu a inferir')).toBe(false);
  });

  it('rejeita substantivos', () => {
    expect(startsWithInfinitiveVerb('Capacidade de inferência')).toBe(false);
    expect(startsWithInfinitiveVerb('Compreensão textual')).toBe(false);
  });
});

describe('isThirdPerson', () => {
  it('retorna true para terceira pessoa', () => {
    expect(isThirdPerson('A professora observou avanços do aluno')).toBe(true);
    expect(isThirdPerson('O estudante demonstrou compreensão')).toBe(true);
  });

  it('retorna false ao detectar primeira pessoa', () => {
    expect(isThirdPerson('Observei que o aluno avançou')).toBe(false);
    expect(isThirdPerson('Verifiquei dificuldade na leitura')).toBe(false);
    expect(isThirdPerson('Notei progresso significativo')).toBe(false);
    expect(isThirdPerson('Trabalhei com o aluno individualmente')).toBe(false);
  });
});

describe('hasInteractiveFinalQuestion', () => {
  it('detecta pergunta exata', () => {
    expect(
      hasInteractiveFinalQuestion(
        'Texto da observação...\n\nDeseja sugestão de atividade para trabalhar com o aluno?'
      )
    ).toBe(true);
  });

  it('detecta variações de acentuação', () => {
    expect(
      hasInteractiveFinalQuestion('Deseja sugestao de atividade para trabalhar com o aluno?')
    ).toBe(true);
  });

  it('aceita sem ponto de interrogação final (regex permite)', () => {
    expect(
      hasInteractiveFinalQuestion('Deseja sugestão de atividade para trabalhar com o aluno')
    ).toBe(true);
  });

  it('retorna false sem a pergunta', () => {
    expect(hasInteractiveFinalQuestion('Texto sem a pergunta final.')).toBe(false);
  });
});

describe('hasSignature', () => {
  it('detecta assinatura nos últimos 500 chars', () => {
    const text = 'Lorem ipsum '.repeat(20) + '\n\nProfessora Sheila Goes';
    expect(hasSignature(text)).toBe(true);
  });

  it('aceita assinatura customizada', () => {
    const text = 'Texto qualquer\n\nProfessora Maria Silva';
    expect(hasSignature(text, 'Professora Maria Silva')).toBe(true);
  });

  it('retorna false se não encontrada no rodapé', () => {
    const text = 'Texto sem assinatura no final.';
    expect(hasSignature(text)).toBe(false);
  });
});

describe('countWords', () => {
  it('conta palavras separadas por whitespace', () => {
    expect(countWords('uma duas três')).toBe(3);
    expect(countWords('  uma   duas   três  ')).toBe(3);
    expect(countWords('uma\nduas\ttrês')).toBe(3);
  });

  it('retorna 0 para string vazia', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });
});

describe('withinPageLimit', () => {
  it('retorna true para texto dentro do limite', () => {
    const text = 'palavra '.repeat(400); // 400 palavras
    expect(withinPageLimit(text, 1)).toBe(true);
  });

  it('retorna false para texto excedendo limite', () => {
    const text = 'palavra '.repeat(600); // 600 palavras
    expect(withinPageLimit(text, 1)).toBe(false);
  });

  it('aceita customização de wordsPerPage', () => {
    const text = 'palavra '.repeat(200);
    expect(withinPageLimit(text, 1, 100)).toBe(false);
    expect(withinPageLimit(text, 1, 300)).toBe(true);
  });
});

describe('endsPositively', () => {
  it('detecta tom positivo no final', () => {
    expect(
      endsPositively('Texto inicial...\n\nO aluno demonstra avanço significativo.')
    ).toBe(true);
    expect(
      endsPositively('Texto...\n\nSegue em evolução constante, com potencial para crescer.')
    ).toBe(true);
  });

  it('retorna false sem termos positivos no final', () => {
    expect(endsPositively('Aluno apresenta dificuldades técnicas em diversos aspectos.')).toBe(false);
  });
});

describe('hasSection', () => {
  it('detecta seção case-insensitive', () => {
    expect(hasSection('CARTÃO-RESPOSTA\n1.A 2.B', 'CARTÃO-RESPOSTA')).toBe(true);
    expect(hasSection('cartão-resposta\n1.A', 'CARTÃO-RESPOSTA')).toBe(true);
  });

  it('retorna false sem a seção', () => {
    expect(hasSection('Apenas conteúdo simples', 'GABARITO')).toBe(false);
  });
});
