import { describe, it, expect } from 'vitest';
import {
  STRUCTURES,
  hasStructure,
  getStructure,
  checkSectionsPresent,
  checkSectionsOrder,
  checkLevelsPresent,
} from '../../lib/validators/structures';

describe('STRUCTURES', () => {
  it('cobre os 12 tipos de saída', () => {
    const tipos = Object.keys(STRUCTURES);
    expect(tipos).toContain('PTD');
    expect(tipos).toContain('aula');
    expect(tipos).toContain('avaliacao_capitulo');
    expect(tipos).toContain('simulado');
    expect(tipos).toContain('rubrica');
    expect(tipos).toContain('pauta_observacao');
    expect(tipos).toContain('plenaria');
    expect(tipos).toContain('pauta_leitura');
    expect(tipos).toContain('atividade');
    expect(tipos).toContain('observacao');
    expect(tipos).toContain('relatorio');
    expect(tipos).toContain('painel');
  });

  it('PTD tem 8 seções na ordem correta', () => {
    expect(STRUCTURES.PTD.sections).toEqual([
      'COMPETÊNCIAS',
      'HABILIDADES',
      'CAPÍTULO DO MATERIAL',
      'OBJETIVOS',
      'EVIDÊNCIAS DE APRENDIZAGEM',
      'AÇÕES A DESENVOLVER',
      'ALUNOS COM FLEXIBILIZAÇÃO',
      'PLANEJAMENTO INTEGRADO',
    ]);
  });

  it('Observação requer pergunta interativa final', () => {
    expect(STRUCTURES.observacao.requires_interactive_final).toBe(true);
  });

  it('Relatório requer terceira pessoa + assinatura + max 1 página', () => {
    expect(STRUCTURES.relatorio.requires_third_person).toBe(true);
    expect(STRUCTURES.relatorio.requires_signature).toBe('Professora Sheila Goes');
    expect(STRUCTURES.relatorio.max_pages).toBe(1);
  });

  it('Simulado tem 24 questões esperadas', () => {
    expect(STRUCTURES.simulado.expected_questions).toBe(24);
  });

  it('Painel tem catálogo de 4 intervenções', () => {
    expect(STRUCTURES.painel.intervencao_catalogo).toHaveLength(4);
  });
});

describe('hasStructure', () => {
  it('retorna true para tipos conhecidos', () => {
    expect(hasStructure('PTD')).toBe(true);
    expect(hasStructure('observacao')).toBe(true);
  });

  it('retorna false para desconhecidos', () => {
    expect(hasStructure('plano')).toBe(false);
    expect(hasStructure('')).toBe(false);
    expect(hasStructure(null)).toBe(false);
  });
});

describe('checkSectionsPresent', () => {
  it('retorna vazio quando todas presentes', () => {
    const content = 'COMPETÊNCIAS\nHABILIDADES\nCAPÍTULO DO MATERIAL\nOBJETIVOS\n' +
      'EVIDÊNCIAS DE APRENDIZAGEM\nAÇÕES A DESENVOLVER\nALUNOS COM FLEXIBILIZAÇÃO\nPLANEJAMENTO INTEGRADO';
    expect(checkSectionsPresent(content, 'PTD')).toEqual([]);
  });

  it('retorna seções faltantes', () => {
    const content = 'COMPETÊNCIAS\nHABILIDADES';
    const missing = checkSectionsPresent(content, 'PTD');
    expect(missing).toContain('OBJETIVOS');
    expect(missing).toContain('PLANEJAMENTO INTEGRADO');
    expect(missing).toHaveLength(6);
  });

  it('retorna vazio para tipo sem sections definidas', () => {
    expect(checkSectionsPresent('qualquer texto', 'rubrica')).toEqual([]);
  });

  it('é case-insensitive na comparação', () => {
    const content = 'competências\nhabilidades\ncapítulo do material\nobjetivos\n' +
      'evidências de aprendizagem\nações a desenvolver\nalunos com flexibilização\nplanejamento integrado';
    expect(checkSectionsPresent(content, 'PTD')).toEqual([]);
  });
});

describe('checkSectionsOrder', () => {
  it('ok=true quando ordem está correta', () => {
    const content = 'COMPETÊNCIAS\nHABILIDADES\nCAPÍTULO DO MATERIAL\nOBJETIVOS\n' +
      'EVIDÊNCIAS DE APRENDIZAGEM\nAÇÕES A DESENVOLVER\nALUNOS COM FLEXIBILIZAÇÃO\nPLANEJAMENTO INTEGRADO';
    const result = checkSectionsOrder(content, 'PTD');
    expect(result.ok).toBe(true);
  });

  it('ok=false quando ordem está errada', () => {
    const content = 'OBJETIVOS\nCOMPETÊNCIAS\nHABILIDADES\nCAPÍTULO DO MATERIAL\n' +
      'EVIDÊNCIAS DE APRENDIZAGEM\nAÇÕES A DESENVOLVER\nALUNOS COM FLEXIBILIZAÇÃO\nPLANEJAMENTO INTEGRADO';
    const result = checkSectionsOrder(content, 'PTD');
    expect(result.ok).toBe(false);
    expect(result.expected[0]).toBe('COMPETÊNCIAS');
    expect(result.actual[0]).toBe('OBJETIVOS');
  });

  it('ok=true quando enforce_order=false', () => {
    const result = checkSectionsOrder('Nome\nObservação\nNível\nHabilidade', 'pauta_observacao');
    expect(result.ok).toBe(true);
  });
});

describe('checkLevelsPresent', () => {
  it('retorna vazio quando todos níveis presentes', () => {
    const content = 'aula com N1, N2, N3 e N4';
    expect(checkLevelsPresent(content, 'aula')).toEqual([]);
  });

  it('retorna níveis faltantes', () => {
    const content = 'aula só com N1 e N3';
    const missing = checkLevelsPresent(content, 'aula');
    expect(missing).toContain('N2');
    expect(missing).toContain('N4');
  });

  it('retorna vazio para tipo sem levels_required', () => {
    expect(checkLevelsPresent('texto', 'plenaria')).toEqual([]);
  });
});

describe('getStructure', () => {
  it('retorna estrutura para tipo conhecido', () => {
    const ptd = getStructure('PTD');
    expect(ptd).not.toBeNull();
    expect(ptd.sections).toHaveLength(8);
  });

  it('retorna null para desconhecido', () => {
    expect(getStructure('xyz')).toBeNull();
  });
});
