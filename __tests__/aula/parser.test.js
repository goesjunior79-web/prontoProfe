import { describe, it, expect } from 'vitest';
import {
  parseHorarioSemanal,
  totalAulas,
  formatHorarioSemanal,
} from '../../lib/aula/parser';

describe('parseHorarioSemanal', () => {
  it('parseia formato canônico', () => {
    const result = parseHorarioSemanal('seg 2, ter 2, qua 2, sex 1');
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ dia: 'segunda', nome: 'Segunda-feira', aulas: 2 });
    expect(result[3]).toEqual({ dia: 'sexta', nome: 'Sexta-feira', aulas: 1 });
  });

  it('aceita formas longas', () => {
    const result = parseHorarioSemanal('segunda 3, terça-feira 1');
    expect(result).toHaveLength(2);
    expect(result[0].dia).toBe('segunda');
    expect(result[0].aulas).toBe(3);
    expect(result[1].dia).toBe('terca');
  });

  it('aceita case-insensitive', () => {
    const result = parseHorarioSemanal('SEG 2, Ter 1');
    expect(result).toHaveLength(2);
  });

  it('aceita separadores ; e /', () => {
    const a = parseHorarioSemanal('seg 1; ter 2');
    expect(a).toHaveLength(2);
    const b = parseHorarioSemanal('seg 1 / ter 2');
    expect(b).toHaveLength(2);
  });

  it('aceita "seg:2" com dois pontos', () => {
    const result = parseHorarioSemanal('seg:2, ter:1');
    expect(result).toHaveLength(2);
  });

  it('ordena por dia da semana', () => {
    const result = parseHorarioSemanal('sex 1, seg 2, qua 1');
    expect(result.map(r => r.dia)).toEqual(['segunda', 'quarta', 'sexta']);
  });

  it('soma duplicatas do mesmo dia', () => {
    const result = parseHorarioSemanal('seg 1, seg 2');
    expect(result).toHaveLength(1);
    expect(result[0].aulas).toBe(3);
  });

  it('ignora entradas sem número', () => {
    const result = parseHorarioSemanal('seg 2, ter, qua 1');
    expect(result.map(r => r.dia)).toEqual(['segunda', 'quarta']);
  });

  it('ignora dias desconhecidos', () => {
    const result = parseHorarioSemanal('seg 2, blorp 3, ter 1');
    expect(result).toHaveLength(2);
  });

  it('ignora quantidades fora de 1-10', () => {
    const result = parseHorarioSemanal('seg 0, ter 99, qua 2');
    expect(result).toHaveLength(1);
    expect(result[0].dia).toBe('quarta');
  });

  it('rejeita string vazia', () => {
    expect(() => parseHorarioSemanal('')).toThrow(/vazio/i);
    expect(() => parseHorarioSemanal(null)).toThrow();
  });

  it('rejeita quando nada reconhecido', () => {
    expect(() => parseHorarioSemanal('xyz abc')).toThrow(/Nenhum dia/i);
  });
});

describe('totalAulas', () => {
  it('soma corretamente', () => {
    const horario = parseHorarioSemanal('seg 2, ter 2, qua 2, sex 1');
    expect(totalAulas(horario)).toBe(7);
  });

  it('retorna 0 para array vazio/null', () => {
    expect(totalAulas([])).toBe(0);
    expect(totalAulas(null)).toBe(0);
    expect(totalAulas(undefined)).toBe(0);
  });
});

describe('formatHorarioSemanal', () => {
  it('formata de volta em string canônica', () => {
    const horario = parseHorarioSemanal('seg 2, ter 2, qua 2, sex 1');
    expect(formatHorarioSemanal(horario)).toBe('seg 2, ter 2, qua 2, sex 1');
  });

  it('round-trip: parse + format = entrada normalizada', () => {
    const original = 'TERÇA-FEIRA 1, segunda 3';
    const parsed = parseHorarioSemanal(original);
    const formatted = formatHorarioSemanal(parsed);
    expect(formatted).toBe('seg 3, ter 1');
  });

  it('retorna vazio para array vazio', () => {
    expect(formatHorarioSemanal([])).toBe('');
    expect(formatHorarioSemanal(null)).toBe('');
  });
});
