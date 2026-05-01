import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('vitest está funcionando', () => {
    expect(1 + 1).toBe(2);
  });

  it('strings funcionam', () => {
    expect('SESI'.toLowerCase()).toBe('sesi');
  });

  it('arrays funcionam', () => {
    const niveis = ['N1', 'N2', 'N3', 'N4'];
    expect(niveis).toHaveLength(4);
    expect(niveis).toContain('N3');
  });
});
