/**
 * Registry de assets institucionais — modo conservador read-only.
 *
 * Detecta presença/ausência dos 6 (+1) documentos institucionais que a esposa
 * precisa enviar e que afetam a qualidade dos outputs gerados.
 *
 * Fonte: docs/assets-esposa/README.md
 *
 * Story: US-014a (FASE 0 Bedrock)
 * ADR: ADR-007 (modo conservador para assets pendentes)
 *
 * Comportamento:
 *   - Quando asset está disponível: app gera com fidelidade total
 *   - Quando asset falta: app entra em "modo conservador" — avisa a usuária
 *     do que falta e omite/simplifica em vez de inventar.
 *
 * Princípio (REGRAS-FINAIS): "É preferível entregar incompleto e correto do
 * que completo e inventado."
 */

import fs from 'fs';
import path from 'path';

// Diretório onde os assets institucionais são guardados
// (templates Word .docx ficam gitignored — só localmente)
export const ASSETS_DIR = path.join(process.cwd(), 'docs', 'assets-esposa');

/**
 * Definição dos 7 assets institucionais.
 * `files` é uma lista de nomes — o primeiro encontrado conta como disponível.
 * Suporta múltiplas extensões/formatos.
 */
export const ASSET_DEFINITIONS = {
  catalogo_descritores_avalia: {
    name: 'Catálogo Descritores AVALIA',
    files: [
      '01-descritores-avalia-oficial.json',
      '01-descritores-avalia-oficial.csv',
      '01-descritores-avalia-oficial.xlsx',
      '01-descritores-avalia-oficial.pdf',
    ],
    affects: ['avaliacao_capitulo', 'simulado'],
    fallback: 'omitir descritores nas questões + aviso na UI',
    severity: 'high',
  },
  template_word_prova: {
    name: 'Template Word de Prova (CE-228)',
    files: ['02-template-word-sesi-prova.docx'],
    affects: ['avaliacao_capitulo', 'simulado'],
    fallback: 'usar layout HTML do docBuilder.js (~80% fiel)',
    severity: 'medium',
  },
  template_word_ptd: {
    name: 'Template Word de PTD',
    files: ['02b-template-word-sesi-plano.docx'],
    affects: ['PTD'],
    fallback: 'usar layout HTML do planoBuilder.js refatorado',
    severity: 'medium',
  },
  logo_sesi: {
    name: 'Logo SESI institucional',
    files: ['03-logo-sesi.jpeg', '03-logo-sesi-simplificada.jpg'],
    affects: ['todos os documentos com cabeçalho'],
    fallback: 'placeholder cinza com texto "[LOGO SESI]"',
    severity: 'low',
  },
  brasao_escola: {
    name: 'Brasão da escola/unidade',
    files: ['04-brasao-escola.png', '04-brasao-escola.jpg', '04-brasao-escola.svg'],
    affects: ['cabeçalhos institucionais'],
    fallback: 'usar logo SESI completa como brasão alternativo',
    severity: 'low',
  },
  cartao_resposta: {
    name: 'Modelo de cartão-resposta oficial',
    files: ['05-cartao-resposta-modelo.docx', '05-cartao-resposta-modelo.pdf'],
    affects: ['simulado'],
    fallback: 'cartão-resposta genérico (linha por questão A/B/C/D)',
    severity: 'medium',
  },
  modelo_relatorio: {
    name: 'Modelo de relatório final aceito pela escola',
    files: ['06-relatorio-final-modelo.docx'],
    affects: ['relatorio'],
    fallback: 'template inferido das 4 seções da spec + assinatura',
    severity: 'low',
  },
};

/**
 * Verifica disponibilidade de um asset específico.
 */
export function checkAsset(assetKey) {
  const def = ASSET_DEFINITIONS[assetKey];
  if (!def) return { available: false, asset: assetKey, error: 'unknown_asset' };

  for (const filename of def.files) {
    const filepath = path.join(ASSETS_DIR, filename);
    try {
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > 0) {
          return {
            available: true,
            asset: assetKey,
            file: filename,
            size: stats.size,
            definition: def,
          };
        }
      }
    } catch (e) {
      // Permission ou outro erro — tratar como não disponível
    }
  }

  return { available: false, asset: assetKey, definition: def };
}

/**
 * Verifica todos os assets. Retorna array com status de cada um.
 */
export function checkAllAssets() {
  return Object.keys(ASSET_DEFINITIONS).map(checkAsset);
}

/**
 * Retorna apenas os assets faltantes.
 */
export function getMissingAssets() {
  return checkAllAssets().filter(r => !r.available);
}

/**
 * Retorna apenas os assets disponíveis.
 */
export function getAvailableAssets() {
  return checkAllAssets().filter(r => r.available);
}

/**
 * Para um tipo de output específico, retorna lista de assets faltantes que
 * afetam esse tipo. Útil para o backend decidir o modo conservador a aplicar.
 *
 * @param {string} tipo — tipo de saída (PTD, simulado, etc.)
 * @returns array de { asset, name, fallback, severity }
 */
export function getMissingAssetsForType(tipo) {
  const missing = getMissingAssets();
  return missing
    .filter(r => {
      const affects = r.definition?.affects || [];
      return affects.includes(tipo) || affects.includes('todos os documentos com cabeçalho');
    })
    .map(r => ({
      asset: r.asset,
      name: r.definition.name,
      severity: r.definition.severity,
      fallback: r.definition.fallback,
    }));
}

/**
 * Resumo geral pra UI:
 *   { total, available, missing, byType: { PTD: [...], simulado: [...] } }
 */
export function getStatusSummary() {
  const all = checkAllAssets();
  const available = all.filter(r => r.available);
  const missing = all.filter(r => !r.available);

  const byType = {};
  for (const r of missing) {
    for (const tipo of r.definition.affects) {
      if (!byType[tipo]) byType[tipo] = [];
      byType[tipo].push({
        asset: r.asset,
        name: r.definition.name,
        severity: r.definition.severity,
        fallback: r.definition.fallback,
      });
    }
  }

  return {
    total: all.length,
    available: available.length,
    missing: missing.length,
    missingItems: missing.map(r => ({
      asset: r.asset,
      name: r.definition.name,
      severity: r.definition.severity,
      fallback: r.definition.fallback,
    })),
    availableItems: available.map(r => ({
      asset: r.asset,
      name: r.definition.name,
      file: r.file,
    })),
    byType,
  };
}

/**
 * Mensagem amigável para usuária explicando o que falta para um tipo
 * específico. Pode ser usada como banner na UI ou no body da response.
 */
export function buildWarningMessage(tipo) {
  const missing = getMissingAssetsForType(tipo);
  if (missing.length === 0) return null;

  const items = missing.map(m => `• ${m.name} — ${m.fallback}`).join('\n');
  return `Modo conservador ativo para ${tipo}. Itens faltando:\n${items}\n\nImporte nas Configurações para output completo.`;
}
