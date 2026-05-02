/**
 * CRUD modelos persistentes (PDFs/Word de referência).
 *
 * Storage físico no bucket user-assets/{userId}/modelos/{stamp}_{nome}.
 * Esta camada gerencia apenas a metadata.
 */

import { supabase } from '../supabase';
import { BUCKETS } from './schema';
import { logAcesso } from './audit';

const COLUMNS = 'id, user_id, nome, descricao, tipo, storage_path, size_bytes, is_default, tipos_aplicaveis, created_at, deleted_at';

export async function createModelo({ userId, nome, descricao = null, tipo, storagePath, sizeBytes, isDefault = false, tiposAplicaveis = [] }) {
  if (!userId || !nome || !tipo || !storagePath || sizeBytes == null) {
    throw new Error('createModelo: parâmetros obrigatórios faltando');
  }
  // is_default só desmarca outros do MESMO escopo de tipos
  if (isDefault) {
    let q = supabase.from('modelos').update({ is_default: false }).eq('user_id', userId);
    // se o novo tem tipos_aplicaveis, só desmarca os que se sobrepõem
    if (Array.isArray(tiposAplicaveis) && tiposAplicaveis.length > 0) {
      q = q.overlaps('tipos_aplicaveis', tiposAplicaveis);
    }
    await q;
  }
  const { data, error } = await supabase
    .from('modelos')
    .insert({
      user_id: userId, nome, descricao, tipo,
      storage_path: storagePath, size_bytes: sizeBytes, is_default: isDefault,
      tipos_aplicaveis: Array.isArray(tiposAplicaveis) ? tiposAplicaveis : [],
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(`Erro ao criar modelo: ${error.message}`);

  await logAcesso({ userId, acao: 'CREATE', recurso: 'usuarios', metadata: { kind: 'modelo', nome, tipo, sizeBytes } });
  return data;
}

export async function listModelos(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('modelos').select(COLUMNS)
    .eq('user_id', userId).is('deleted_at', null)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Erro ao listar modelos: ${error.message}`);
  return data || [];
}

export async function getModelo(userId, modeloId) {
  if (!userId || !modeloId) return null;
  const { data, error } = await supabase
    .from('modelos').select(COLUMNS)
    .eq('user_id', userId).eq('id', modeloId).is('deleted_at', null).maybeSingle();
  if (error) throw new Error(`Erro ao buscar modelo: ${error.message}`);
  return data;
}

export async function setDefaultModelo(userId, modeloId) {
  if (!userId || !modeloId) throw new Error('setDefaultModelo: params obrigatórios');
  await supabase.from('modelos').update({ is_default: false }).eq('user_id', userId);
  const { data, error } = await supabase
    .from('modelos').update({ is_default: true })
    .eq('id', modeloId).eq('user_id', userId).is('deleted_at', null)
    .select(COLUMNS).single();
  if (error) throw new Error(`Erro ao marcar default: ${error.message}`);
  return data;
}

export async function updateTiposAplicaveis(userId, modeloId, tiposAplicaveis) {
  if (!userId || !modeloId) throw new Error('updateTiposAplicaveis: params obrigatórios');
  const arr = Array.isArray(tiposAplicaveis) ? tiposAplicaveis : [];
  const { data, error } = await supabase
    .from('modelos')
    .update({ tipos_aplicaveis: arr })
    .eq('id', modeloId).eq('user_id', userId).is('deleted_at', null)
    .select(COLUMNS).single();
  if (error) throw new Error(`Erro ao atualizar tipos: ${error.message}`);
  return data;
}

export async function softDeleteModelo(userId, modeloId) {
  if (!userId || !modeloId) throw new Error('softDeleteModelo: params obrigatórios');
  const modelo = await getModelo(userId, modeloId);
  if (!modelo) return null;

  // Remove físico do bucket primeiro (idempotente)
  await supabase.storage.from(BUCKETS.USER).remove([modelo.storage_path]).catch(() => {});

  const { data, error } = await supabase
    .from('modelos').update({ deleted_at: new Date().toISOString() })
    .eq('id', modeloId).eq('user_id', userId).select('id').single();
  if (error) throw new Error(`Erro ao excluir modelo: ${error.message}`);

  await logAcesso({ userId, acao: 'DELETE', recurso: 'usuarios', metadata: { kind: 'modelo', modeloId } });
  return data;
}

/**
 * Gera signed URL temporário para download/leitura do modelo.
 * Usado pra anexar ao prompt da geração (server fetch + base64).
 */
export async function getSignedDownloadUrl(userId, modeloId, expiresIn = 60) {
  const modelo = await getModelo(userId, modeloId);
  if (!modelo) return null;
  const { data, error } = await supabase.storage
    .from(BUCKETS.USER)
    .createSignedUrl(modelo.storage_path, expiresIn);
  if (error) throw new Error(`Erro ao assinar URL: ${error.message}`);
  return { url: data.signedUrl, modelo };
}
