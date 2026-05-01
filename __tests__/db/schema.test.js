import { describe, it, expect } from 'vitest';
import {
  TABLES,
  NIVEIS,
  TIPOS_PLANEJAMENTO,
  FONTES_AVALIACAO,
  ACOES_AUDIT,
  BUCKETS,
  RECURSOS_AUDIT,
  validateNivel,
  validateTipoPlanejamento,
  validateAcaoAudit,
  validateFonte,
} from '../../lib/db/schema';

describe('TABLES', () => {
  it('exporta os 5 nomes de tabelas', () => {
    expect(TABLES.USUARIOS).toBe('usuarios');
    expect(TABLES.ALUNOS).toBe('alunos');
    expect(TABLES.AVALIACOES).toBe('avaliacoes');
    expect(TABLES.PLANEJAMENTOS).toBe('planejamentos');
    expect(TABLES.ACESSOS_DADOS).toBe('acessos_dados');
  });

  it('é frozen (não pode ser mutado)', () => {
    expect(Object.isFrozen(TABLES)).toBe(true);
  });
});

describe('NIVEIS', () => {
  it('são os 4 níveis canônicos', () => {
    expect(NIVEIS).toEqual(['N1', 'N2', 'N3', 'N4']);
  });

  it('é frozen', () => {
    expect(Object.isFrozen(NIVEIS)).toBe(true);
  });
});

describe('TIPOS_PLANEJAMENTO', () => {
  it('contém os 12 tipos canônicos', () => {
    expect(TIPOS_PLANEJAMENTO).toHaveLength(12);
    expect(TIPOS_PLANEJAMENTO).toContain('PTD');
    expect(TIPOS_PLANEJAMENTO).toContain('aula');
    expect(TIPOS_PLANEJAMENTO).toContain('avaliacao_capitulo');
    expect(TIPOS_PLANEJAMENTO).toContain('simulado');
    expect(TIPOS_PLANEJAMENTO).toContain('rubrica');
    expect(TIPOS_PLANEJAMENTO).toContain('pauta_observacao');
    expect(TIPOS_PLANEJAMENTO).toContain('plenaria');
    expect(TIPOS_PLANEJAMENTO).toContain('pauta_leitura');
    expect(TIPOS_PLANEJAMENTO).toContain('atividade');
    expect(TIPOS_PLANEJAMENTO).toContain('observacao');
    expect(TIPOS_PLANEJAMENTO).toContain('relatorio');
    expect(TIPOS_PLANEJAMENTO).toContain('painel');
  });
});

describe('FONTES_AVALIACAO', () => {
  it('tem 3 fontes', () => {
    expect(FONTES_AVALIACAO).toEqual(['manual', 'classificador_llm', 'avaliacao']);
  });
});

describe('ACOES_AUDIT', () => {
  it('tem 5 ações LGPD', () => {
    expect(ACOES_AUDIT).toEqual(['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT']);
  });
});

describe('BUCKETS', () => {
  it('exporta os 2 buckets', () => {
    expect(BUCKETS.INSTITUTIONAL).toBe('institutional-assets');
    expect(BUCKETS.USER).toBe('user-assets');
  });
});

describe('RECURSOS_AUDIT', () => {
  it('lista os 4 recursos auditáveis', () => {
    expect(RECURSOS_AUDIT).toContain('alunos');
    expect(RECURSOS_AUDIT).toContain('avaliacoes');
    expect(RECURSOS_AUDIT).toContain('planejamentos');
    expect(RECURSOS_AUDIT).toContain('usuarios');
  });
});

describe('validators', () => {
  describe('validateNivel', () => {
    it('aceita N1-N4', () => {
      expect(() => validateNivel('N1')).not.toThrow();
      expect(() => validateNivel('N2')).not.toThrow();
      expect(() => validateNivel('N3')).not.toThrow();
      expect(() => validateNivel('N4')).not.toThrow();
    });

    it('rejeita inválidos', () => {
      expect(() => validateNivel('N5')).toThrow(/Nível inválido/);
      expect(() => validateNivel('n1')).toThrow();
      expect(() => validateNivel('')).toThrow();
    });
  });

  describe('validateTipoPlanejamento', () => {
    it('aceita tipos válidos', () => {
      expect(() => validateTipoPlanejamento('PTD')).not.toThrow();
      expect(() => validateTipoPlanejamento('aula')).not.toThrow();
    });

    it('rejeita inválidos', () => {
      expect(() => validateTipoPlanejamento('plano')).toThrow(/Tipo de planejamento inválido/);
      expect(() => validateTipoPlanejamento('prova')).toThrow();
    });
  });

  describe('validateAcaoAudit', () => {
    it('aceita ações válidas', () => {
      expect(() => validateAcaoAudit('VIEW')).not.toThrow();
      expect(() => validateAcaoAudit('DELETE')).not.toThrow();
    });

    it('rejeita inválidas', () => {
      expect(() => validateAcaoAudit('view')).toThrow();
      expect(() => validateAcaoAudit('READ')).toThrow();
    });
  });

  describe('validateFonte', () => {
    it('aceita fontes válidas', () => {
      expect(() => validateFonte('manual')).not.toThrow();
      expect(() => validateFonte('classificador_llm')).not.toThrow();
    });

    it('aceita null/undefined (nullable)', () => {
      expect(() => validateFonte(null)).not.toThrow();
      expect(() => validateFonte(undefined)).not.toThrow();
    });

    it('rejeita string inválida', () => {
      expect(() => validateFonte('outra_fonte')).toThrow();
    });
  });
});
