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
import { ASSET_DEFINITIONS } from './definitions';

// Reexporta para compatibilidade com imports server-side existentes.
export { ASSET_DEFINITIONS };

// Diretório onde os assets institucionais são guardados
// (templates Word .docx ficam gitignored — só localmente)
export const ASSETS_DIR = path.join(process.cwd(), 'docs', 'assets-esposa');

/**
 * Verifica disponibilidade de um asset específico (filesystem fixo).
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
            source: 'filesystem',
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
 * US-014b — Verifica disponibilidade somando filesystem + uploads dinâmicos.
 *
 * Uploads dinâmicos vivem no bucket Supabase Storage `user-assets` em
 * paths `{userId}/{assetKey}.{ext}`. Quando presentes, sobrescrevem o asset
 * institucional (modo conservador desativa para esse asset/usuário).
 *
 * @param {string} assetKey
 * @param {object} [options]
 * @param {string} [options.userId] — quando passado, checa upload dinâmico
 * @param {object} [options.supabaseClient] — injeção pra testes
 * @returns {Promise<AssetStatus>}
 */
export async function checkAssetWithUploads(assetKey, { userId, supabaseClient } = {}) {
  // 1. Filesystem (institutional)
  const fsResult = checkAsset(assetKey);
  if (fsResult.available) return fsResult;

  // 2. Upload dinâmico do usuário (se userId fornecido)
  if (userId && supabaseClient) {
    const safeKey = assetKey.replace(/[^a-z0-9_]/gi, '');
    const def = ASSET_DEFINITIONS[assetKey];
    if (!def) return fsResult;

    try {
      const { data: files, error } = await supabaseClient.storage
        .from('user-assets')
        .list(userId, { limit: 100 });

      if (!error && Array.isArray(files)) {
        const match = files.find(f => f.name && f.name.startsWith(safeKey + '.'));
        if (match && (match.metadata?.size || 0) > 0) {
          return {
            available: true,
            asset: assetKey,
            file: match.name,
            size: match.metadata?.size || 0,
            source: 'user_upload',
            definition: def,
          };
        }
      }
    } catch (e) {
      // Falha de storage — fallback para indisponível
    }
  }

  return fsResult;
}

/**
 * Resumo com uploads do usuário considerados.
 */
export async function getStatusSummaryForUser(userId, supabaseClient) {
  const keys = Object.keys(ASSET_DEFINITIONS);
  const all = await Promise.all(
    keys.map(k => checkAssetWithUploads(k, { userId, supabaseClient }))
  );
  return buildSummary(all);
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
 * Resumo geral pra UI (filesystem-only):
 *   { total, available, missing, byType: { PTD: [...], simulado: [...] } }
 */
export function getStatusSummary() {
  return buildSummary(checkAllAssets());
}

function buildSummary(all) {
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
      source: r.source || 'filesystem',
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
