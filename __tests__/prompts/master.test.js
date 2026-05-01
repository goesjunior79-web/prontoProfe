import { describe, it, expect } from 'vitest';
import {
  PROMPT_MESTRE,
  VERSION,
  TIPOS_DE_SAIDA,
  isTipoDeSaidaValido,
} from '../../lib/prompts/master';

describe('lib/prompts/master', () => {
  describe('VERSION', () => {
    it('exporta VERSION no formato YYYY-MM-DD', () => {
      expect(VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('PROMPT_MESTRE', () => {
    it('é uma string não-vazia', () => {
      expect(typeof PROMPT_MESTRE).toBe('string');
      expect(PROMPT_MESTRE.length).toBeGreaterThan(1000);
    });

    it('contém regras absolutas', () => {
      expect(PROMPT_MESTRE).toContain('NÃO inventar conteúdos');
      expect(PROMPT_MESTRE).toContain('NÃO criar descritores Avalia');
      expect(PROMPT_MESTRE).toContain('NÃO alterar estruturas solicitadas');
    });

    it('contém princípio guia "praticidade"', () => {
      expect(PROMPT_MESTRE).toContain('PRATICIDADE');
    });

    it('contém os 4 níveis N1-N4 com semântica', () => {
      expect(PROMPT_MESTRE).toContain('N1: abaixo do básico');
      expect(PROMPT_MESTRE).toContain('N2: básico');
      expect(PROMPT_MESTRE).toContain('N3: adequado');
      expect(PROMPT_MESTRE).toContain('N4: avançado');
    });

    it('contém termos a evitar (regra ética)', () => {
      expect(PROMPT_MESTRE).toContain('"desinteressado"');
      expect(PROMPT_MESTRE).toContain('"lento"');
      expect(PROMPT_MESTRE).toContain('"atrasado"');
    });

    it('contém pergunta interativa final da Observação', () => {
      expect(PROMPT_MESTRE).toContain(
        'Deseja sugestão de atividade para trabalhar com o aluno?'
      );
    });

    it('contém assinatura "Professora Sheila Goes"', () => {
      expect(PROMPT_MESTRE).toContain('Professora Sheila Goes');
    });

    it('lista os 7 módulos do sistema', () => {
      expect(PROMPT_MESTRE).toContain('1. PTD');
      expect(PROMPT_MESTRE).toContain('2. Aula diária (semanário)');
      expect(PROMPT_MESTRE).toContain('3. Avaliação');
      expect(PROMPT_MESTRE).toContain('4. Atividades');
      expect(PROMPT_MESTRE).toContain('5. Observações');
      expect(PROMPT_MESTRE).toContain('6. Painel');
      expect(PROMPT_MESTRE).toContain('7. Relatório final de etapa');
    });

    it('contém os 4 critérios de validação final', () => {
      expect(PROMPT_MESTRE).toContain('Estrutura correta?');
      expect(PROMPT_MESTRE).toContain('Nada inventado?');
      expect(PROMPT_MESTRE).toContain('Linguagem pedagógica?');
      expect(PROMPT_MESTRE).toContain('Aplicável em sala?');
    });
  });

  describe('TIPOS_DE_SAIDA', () => {
    it('exporta array com 12 valores', () => {
      expect(TIPOS_DE_SAIDA).toHaveLength(12);
    });

    it('inclui os 7 módulos da spec', () => {
      expect(TIPOS_DE_SAIDA).toContain('PTD');
      expect(TIPOS_DE_SAIDA).toContain('aula');
      expect(TIPOS_DE_SAIDA).toContain('atividade');
      expect(TIPOS_DE_SAIDA).toContain('observacao');
      expect(TIPOS_DE_SAIDA).toContain('relatorio');
      expect(TIPOS_DE_SAIDA).toContain('painel');
    });

    it('inclui os 6 sub-tipos da Avaliação', () => {
      expect(TIPOS_DE_SAIDA).toContain('avaliacao_capitulo');
      expect(TIPOS_DE_SAIDA).toContain('simulado');
      expect(TIPOS_DE_SAIDA).toContain('rubrica');
      expect(TIPOS_DE_SAIDA).toContain('pauta_observacao');
      expect(TIPOS_DE_SAIDA).toContain('plenaria');
      expect(TIPOS_DE_SAIDA).toContain('pauta_leitura');
    });
  });

  describe('isTipoDeSaidaValido', () => {
    it('retorna true para tipos válidos', () => {
      expect(isTipoDeSaidaValido('PTD')).toBe(true);
      expect(isTipoDeSaidaValido('aula')).toBe(true);
      expect(isTipoDeSaidaValido('painel')).toBe(true);
    });

    it('retorna false para tipos inválidos', () => {
      expect(isTipoDeSaidaValido('plano')).toBe(false); // legacy
      expect(isTipoDeSaidaValido('prova')).toBe(false); // legacy
      expect(isTipoDeSaidaValido('')).toBe(false);
      expect(isTipoDeSaidaValido(null)).toBe(false);
      expect(isTipoDeSaidaValido(undefined)).toBe(false);
    });

    it('é case-sensitive', () => {
      expect(isTipoDeSaidaValido('ptd')).toBe(false);
      expect(isTipoDeSaidaValido('Ptd')).toBe(false);
      expect(isTipoDeSaidaValido('PTD')).toBe(true);
    });
  });
});
