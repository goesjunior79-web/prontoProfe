import { describe, it, expect } from 'vitest';
import { validateOutput } from '../../lib/validators';

describe('validateOutput — integração', () => {
  describe('termos proibidos (universal)', () => {
    it('rejeita output com termo proibido', () => {
      const result = validateOutput('O aluno está desinteressado.', 'observacao');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.code === 'FORBIDDEN_TERM')).toBe(true);
    });

    it('detecta múltiplos termos proibidos', () => {
      const result = validateOutput('aluno lento e atrasado', 'observacao');
      const forbidden = result.errors.filter(e => e.code === 'FORBIDDEN_TERM');
      expect(forbidden).toHaveLength(2);
    });
  });

  describe('PTD — 8 seções', () => {
    it('passa quando todas as 8 seções presentes na ordem', () => {
      const ptd = `
COMPETÊNCIAS
- Comp 1
HABILIDADES
- Hab 1
CAPÍTULO DO MATERIAL
- Cap 5
OBJETIVOS
- Compreender
EVIDÊNCIAS DE APRENDIZAGEM
- Evidência
AÇÕES A DESENVOLVER
- Ações
ALUNOS COM FLEXIBILIZAÇÃO
- Aluno X
PLANEJAMENTO INTEGRADO
- Integração`;
      const result = validateOutput(ptd, 'PTD');
      expect(result.passed).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('falha com seções faltantes', () => {
      const ptd = 'COMPETÊNCIAS\nHABILIDADES';
      const result = validateOutput(ptd, 'PTD');
      expect(result.passed).toBe(false);
      const missing = result.errors.filter(e => e.code === 'STRUCTURE_MISSING_SECTION');
      expect(missing.length).toBeGreaterThanOrEqual(6);
    });

    it('falha com seções fora de ordem', () => {
      const ptd = `
OBJETIVOS
- objs
COMPETÊNCIAS
- comps
HABILIDADES
- hab
CAPÍTULO DO MATERIAL
EVIDÊNCIAS DE APRENDIZAGEM
AÇÕES A DESENVOLVER
ALUNOS COM FLEXIBILIZAÇÃO
PLANEJAMENTO INTEGRADO`;
      const result = validateOutput(ptd, 'PTD');
      const orderErr = result.errors.find(e => e.code === 'STRUCTURE_OUT_OF_ORDER');
      expect(orderErr).toBeDefined();
    });
  });

  describe('Observação — pergunta interativa final', () => {
    it('passa quando tem todos os 4 eixos + pergunta final', () => {
      const obs = `
Desempenho: O aluno apresenta avanço.
Dificuldade: Tem dificuldade na leitura silábica.
Estratégia: A professora utilizou material concreto.
Resposta: Demonstrou maior segurança.

Deseja sugestão de atividade para trabalhar com o aluno?`;
      const result = validateOutput(obs, 'observacao');
      expect(result.passed).toBe(true);
    });

    it('falha sem a pergunta interativa final', () => {
      const obs = `Desempenho: ok.\nDificuldade: x.\nEstratégia: y.\nResposta: z.`;
      const result = validateOutput(obs, 'observacao');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_INTERACTIVE_QUESTION')).toBe(true);
    });
  });

  describe('Relatório — assinatura + 1 página + terceira pessoa', () => {
    it('passa com assinatura no final', () => {
      const rel = `
Desenvolvimento: O aluno apresenta avanço.
Avanços: Conquistou autonomia na leitura.
Dificuldades: Ainda apresenta hesitações.
Estratégias: A professora utilizou jogos.

Segue em evolução constante.

Professora Sheila Goes`;
      const result = validateOutput(rel, 'relatorio');
      expect(result.passed).toBe(true);
    });

    it('falha sem assinatura', () => {
      const rel = 'Desenvolvimento: x.\nAvanços: y.\nDificuldades: z.\nEstratégias: w.';
      const result = validateOutput(rel, 'relatorio');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_SIGNATURE')).toBe(true);
    });

    it('avisa quando primeira pessoa detectada', () => {
      const rel = `
Desenvolvimento: Observei avanço do aluno.
Avanços: Notei conquistas.
Dificuldades: x.
Estratégias: y.

Aluno com potencial de crescimento.

Professora Sheila Goes`;
      const result = validateOutput(rel, 'relatorio');
      expect(result.warnings.some(w => w.code === 'NOT_THIRD_PERSON')).toBe(true);
    });

    it('avisa quando excede 1 página', () => {
      const longText = 'palavra '.repeat(700);
      const rel = `Desenvolvimento\nAvanços\nDificuldades\nEstratégias\n\n${longText}\n\nProfessora Sheila Goes`;
      const result = validateOutput(rel, 'relatorio');
      expect(result.warnings.some(w => w.code === 'EXCEEDS_PAGE_LIMIT')).toBe(true);
    });
  });

  describe('Simulado — cartão-resposta', () => {
    it('falha sem cartão-resposta', () => {
      const sim = 'QUESTÃO 1\nA) ...\nGABARITO\n1.A';
      const result = validateOutput(sim, 'simulado');
      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_CARTAO_RESPOSTA')).toBe(true);
    });

    it('passa com cartão-resposta presente (com níveis e gabarito)', () => {
      const sim = 'QUESTÃO 1 N1\nA) opção\nB) opção\nC) opção\nD) opção\n' +
        'QUESTÃO 2 N2\nQUESTÃO 3 N3\nQUESTÃO 4 N4\n' +
        'CARTÃO-RESPOSTA\n1.A 2.B 3.C 4.D\nGABARITO\n1.A 2.B 3.C 4.D';
      const result = validateOutput(sim, 'simulado');
      expect(result.errors.some(e => e.code === 'MISSING_CARTAO_RESPOSTA')).toBe(false);
    });
  });

  describe('Aula — 4 níveis N1-N4', () => {
    it('falha sem todos os níveis', () => {
      const aula = `
OBJETIVO\nHABILIDADE\nINÍCIO\nDESENVOLVIMENTO\nDIFERENCIAÇÃO
N1: apoio
N3: esperado
FECHAMENTO\nEVIDÊNCIA\nAVALIAÇÃO FORMATIVA`;
      const result = validateOutput(aula, 'aula');
      const missingLevels = result.errors.filter(e => e.code === 'STRUCTURE_MISSING_LEVEL');
      expect(missingLevels.some(e => e.level === 'N2')).toBe(true);
      expect(missingLevels.some(e => e.level === 'N4')).toBe(true);
    });
  });

  describe('Tipo desconhecido', () => {
    it('passa com warning UNKNOWN_TYPE', () => {
      const result = validateOutput('qualquer texto', 'tipo_inexistente');
      expect(result.warnings.some(w => w.code === 'UNKNOWN_TYPE')).toBe(true);
    });
  });
});
