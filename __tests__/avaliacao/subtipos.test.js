import { describe, it, expect } from 'vitest';
import { SUBTIPOS, listSubtipos, getSubtipo } from '../../lib/avaliacao/subtipos';

describe('SUBTIPOS', () => {
  it('define os 6 sub-tipos canônicos', () => {
    expect(Object.keys(SUBTIPOS)).toHaveLength(6);
    expect(SUBTIPOS).toHaveProperty('capitulo');
    expect(SUBTIPOS).toHaveProperty('simulado');
    expect(SUBTIPOS).toHaveProperty('rubrica');
    expect(SUBTIPOS).toHaveProperty('pauta-observacao');
    expect(SUBTIPOS).toHaveProperty('plenaria');
    expect(SUBTIPOS).toHaveProperty('pauta-leitura');
  });

  it('cada subtipo tem campos obrigatórios', () => {
    for (const subt of Object.values(SUBTIPOS)) {
      expect(subt.slug).toBeTruthy();
      expect(subt.tipo).toBeTruthy();
      expect(subt.title).toBeTruthy();
      expect(subt.icon).toBeTruthy();
      expect(subt.descricao).toBeTruthy();
      expect(subt.cor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(typeof subt.buildPrompt).toBe('function');
    }
  });

  it('mapeamento slug → tipo de saída válido', () => {
    expect(SUBTIPOS.capitulo.tipo).toBe('avaliacao_capitulo');
    expect(SUBTIPOS.simulado.tipo).toBe('simulado');
    expect(SUBTIPOS.rubrica.tipo).toBe('rubrica');
    expect(SUBTIPOS['pauta-observacao'].tipo).toBe('pauta_observacao');
    expect(SUBTIPOS.plenaria.tipo).toBe('plenaria');
    expect(SUBTIPOS['pauta-leitura'].tipo).toBe('pauta_leitura');
  });
});

describe('buildPrompt', () => {
  const params = { ano: '3º ano EF I', componente: 'Língua Portuguesa', capitulo: 'Capítulo 2' };

  it('capitulo: pede 10 questões mix 7+3', () => {
    const p = SUBTIPOS.capitulo.buildPrompt(params);
    expect(p).toContain('10 questões');
    expect(p).toMatch(/7 objetivas/i);
    expect(p).toMatch(/3 dissertativas/i);
    expect(p).toContain('GABARITO');
  });

  it('simulado: 24q + cartão-resposta + descritores', () => {
    const p = SUBTIPOS.simulado.buildPrompt(params);
    expect(p).toContain('24 questões');
    expect(p).toContain('CARTÃO-RESPOSTA');
    expect(p).toContain('GABARITO');
    expect(p).toContain('N1-N4');  // distribuição equilibrada
  });

  it('rubrica: tabela com 4 níveis', () => {
    const p = SUBTIPOS.rubrica.buildPrompt(params);
    expect(p).toContain('N1');
    expect(p).toContain('N2');
    expect(p).toContain('N3');
    expect(p).toContain('N4');
  });

  it('pauta-leitura: usa termos técnicos exatos', () => {
    const p = SUBTIPOS['pauta-leitura'].buildPrompt(params);
    expect(p).toContain('Decodificação');
    expect(p).toContain('Fluência');
    expect(p).toContain('Fluente');
    expect(p).toContain('Com compreensão');
    expect(p).toContain('Sem compreensão');
    expect(p).toMatch(/2 EIXOS/i);
  });

  it('pauta-observacao: aceita lista de alunos opcional', () => {
    const p = SUBTIPOS['pauta-observacao'].buildPrompt({
      ...params,
      alunos: 'Ana Silva\nBento Maciel',
    });
    expect(p).toContain('Ana Silva');
    expect(p).toContain('Bento Maciel');
  });

  it('plenaria: 5 a 7 perguntas reflexivas', () => {
    const p = SUBTIPOS.plenaria.buildPrompt(params);
    expect(p).toMatch(/5 a 7/i);
    expect(p).toContain('PERGUNTAS REFLEXIVAS');
  });

  it('todos buildPrompt incluem ano + componente + capitulo', () => {
    for (const subt of Object.values(SUBTIPOS)) {
      const p = subt.buildPrompt(params);
      expect(p).toContain('3º ano EF I');
      expect(p).toContain('Língua Portuguesa');
      expect(p).toContain('Capítulo 2');
    }
  });
});

describe('listSubtipos', () => {
  it('retorna array com 6 itens', () => {
    expect(listSubtipos()).toHaveLength(6);
  });
});

describe('getSubtipo', () => {
  it('retorna config por slug', () => {
    expect(getSubtipo('capitulo')).toBeDefined();
    expect(getSubtipo('capitulo').title).toBe('Avaliação do Capítulo');
  });

  it('retorna null para slug desconhecido', () => {
    expect(getSubtipo('xyz')).toBeNull();
  });
});
