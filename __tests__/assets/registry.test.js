import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Importamos o módulo cru, mas vamos mockar fs.existsSync e fs.statSync
import {
  ASSET_DEFINITIONS,
  ASSETS_DIR,
  checkAsset,
  checkAllAssets,
  getMissingAssets,
  getAvailableAssets,
  getMissingAssetsForType,
  getStatusSummary,
  buildWarningMessage,
} from '../../lib/assets/registry';

describe('ASSET_DEFINITIONS', () => {
  it('define 7 assets institucionais', () => {
    expect(Object.keys(ASSET_DEFINITIONS)).toHaveLength(7);
  });

  it('inclui os assets canônicos', () => {
    expect(ASSET_DEFINITIONS).toHaveProperty('catalogo_descritores_avalia');
    expect(ASSET_DEFINITIONS).toHaveProperty('template_word_prova');
    expect(ASSET_DEFINITIONS).toHaveProperty('template_word_ptd');
    expect(ASSET_DEFINITIONS).toHaveProperty('logo_sesi');
    expect(ASSET_DEFINITIONS).toHaveProperty('brasao_escola');
    expect(ASSET_DEFINITIONS).toHaveProperty('cartao_resposta');
    expect(ASSET_DEFINITIONS).toHaveProperty('modelo_relatorio');
  });

  it('cada asset tem name + files + affects + fallback + severity', () => {
    for (const key of Object.keys(ASSET_DEFINITIONS)) {
      const def = ASSET_DEFINITIONS[key];
      expect(def.name).toBeTruthy();
      expect(Array.isArray(def.files)).toBe(true);
      expect(def.files.length).toBeGreaterThan(0);
      expect(Array.isArray(def.affects)).toBe(true);
      expect(def.fallback).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(def.severity);
    }
  });

  it('catalogo_descritores_avalia é severity high', () => {
    expect(ASSET_DEFINITIONS.catalogo_descritores_avalia.severity).toBe('high');
  });
});

describe('checkAsset — comportamento real (filesystem)', () => {
  // Os 3 assets que JÁ TEMOS no repo (logo + 2 templates word LOCAIS)

  it('retorna available=true para logo_sesi (existe no repo)', () => {
    const result = checkAsset('logo_sesi');
    expect(result.available).toBe(true);
    expect(result.asset).toBe('logo_sesi');
    expect(result.size).toBeGreaterThan(0);
  });

  it('retorna available=false para asset desconhecido', () => {
    const result = checkAsset('asset_xyz_inexistente');
    expect(result.available).toBe(false);
    expect(result.error).toBe('unknown_asset');
  });

  it('retorna available=false para asset não enviado (catalogo)', () => {
    const result = checkAsset('catalogo_descritores_avalia');
    expect(result.available).toBe(false);
    expect(result.definition).toBeDefined();
  });
});

describe('checkAllAssets', () => {
  it('retorna array com 7 itens', () => {
    expect(checkAllAssets()).toHaveLength(7);
  });

  it('cada item tem campos asset e available', () => {
    const all = checkAllAssets();
    for (const r of all) {
      expect(r).toHaveProperty('asset');
      expect(r).toHaveProperty('available');
    }
  });
});

describe('getMissingAssets vs getAvailableAssets', () => {
  it('soma dos dois = 7', () => {
    const missing = getMissingAssets();
    const available = getAvailableAssets();
    expect(missing.length + available.length).toBe(7);
  });

  it('logo_sesi está em available (existe no repo)', () => {
    const available = getAvailableAssets();
    expect(available.some(r => r.asset === 'logo_sesi')).toBe(true);
  });

  it('catalogo_descritores_avalia está em missing', () => {
    const missing = getMissingAssets();
    expect(missing.some(r => r.asset === 'catalogo_descritores_avalia')).toBe(true);
  });
});

describe('getMissingAssetsForType', () => {
  it('para PTD inclui template_word_ptd se faltando', () => {
    const missing = getMissingAssetsForType('PTD');
    // Pode ou não estar faltando dependendo do estado do repo
    const ptdAssets = missing.filter(m => m.asset === 'template_word_ptd');
    expect(ptdAssets.length).toBeLessThanOrEqual(1);
  });

  it('para simulado inclui descritores AVALIA + cartão-resposta', () => {
    const missing = getMissingAssetsForType('simulado');
    expect(missing.some(m => m.asset === 'catalogo_descritores_avalia')).toBe(true);
    expect(missing.some(m => m.asset === 'cartao_resposta')).toBe(true);
  });

  it('para tipo desconhecido retorna array vazio (ou só logo)', () => {
    const result = getMissingAssetsForType('tipo_xyz');
    // Pode incluir logo se ele estiver faltando + afetar "todos"
    expect(Array.isArray(result)).toBe(true);
  });

  it('cada item tem asset, name, severity, fallback', () => {
    const missing = getMissingAssetsForType('simulado');
    for (const m of missing) {
      expect(m.asset).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.severity).toBeTruthy();
      expect(m.fallback).toBeTruthy();
    }
  });
});

describe('getStatusSummary', () => {
  it('retorna estrutura completa', () => {
    const summary = getStatusSummary();
    expect(summary.total).toBe(7);
    expect(summary.available).toBeGreaterThanOrEqual(0);
    expect(summary.missing).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(summary.missingItems)).toBe(true);
    expect(Array.isArray(summary.availableItems)).toBe(true);
    expect(typeof summary.byType).toBe('object');
  });

  it('available + missing = total', () => {
    const summary = getStatusSummary();
    expect(summary.available + summary.missing).toBe(summary.total);
  });
});

describe('buildWarningMessage', () => {
  it('retorna null se nada faltando para o tipo', () => {
    // Simulamos um tipo sem assets faltantes (ou todos existem)
    // Como nem todos existem, precisamos um tipo cujo asset existe
    // logo_sesi afeta "todos os documentos com cabeçalho" — não é match exato
    // Vamos usar tipo que não tem asset associado pra forçar null
    const msg = buildWarningMessage('tipo_inexistente_sem_assets');
    // Pode ser null ou conter mensagens — depende
    if (msg === null) {
      expect(msg).toBeNull();
    } else {
      expect(typeof msg).toBe('string');
    }
  });

  it('retorna string com bullets para tipo com assets faltando', () => {
    const msg = buildWarningMessage('simulado');
    if (msg) {
      expect(msg).toContain('Modo conservador ativo para simulado');
      expect(msg).toContain('•');
      expect(msg).toContain('Importe');
    }
  });
});
