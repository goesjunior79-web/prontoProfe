/**
 * Operações em `planejamentos` — cache de outputs gerados pelo pipeline.
 *
 * Story: US-005 (FASE 2 Telas por capítulo)
 * Tabela: ver supabase/migrations/001_init.sql
 *
 * Cada chamada do pipeline (US-003) opcionalmente persiste em planejamentos
 * pra:
 *   - Re-baixar sem regerar (economia de tokens)
 *   - Auditoria (v1 + v2 + custo + attempts)
 *   - Histórico de planejamentos da professora
 */

import { supabase } from '../supabase';
import { TABLES, validateTipoPlanejamento } from './schema';
import { logAcesso } from './audit';

const COLUMNS = `
  id, user_id, tipo, ano, componente, capitulo, aluno_id,
  conteudo_gerado, conteudo_v1,
  prompt_versao, modelo_llm, custo_estimado, cache_hit_rate,
  pipeline_passed, pipeline_attempts,
  created_at, deleted_at
`;

/**
 * Salva planejamento gerado.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.tipo — TIPOS_PLANEJAMENTO
 * @param {string} [params.ano]
 * @param {string} [params.componente]
 * @param {string} [params.capitulo]
 * @param {string} [params.alunoId]
 * @param {string} params.conteudoGerado
 * @param {string} [params.conteudoV1]
 * @param {string} [params.promptVersao]
 * @param {string} [params.modeloLlm]
 * @param {number} [params.custoEstimado]
 * @param {boolean} [params.pipelinePassed]
 * @param {number} [params.pipelineAttempts]
 */
export async function savePlanejamento(params) {
  const {
    userId, tipo, ano = null, componente = null, capitulo = null, alunoId = null,
    conteudoGerado, conteudoV1 = null, promptVersao = null, modeloLlm = null,
    custoEstimado = null, cacheHitRate = null,
    pipelinePassed = null, pipelineAttempts = null,
  } = params;

  if (!userId) throw new Error('savePlanejamento: userId obrigatório');
  if (!conteudoGerado) throw new Error('savePlanejamento: conteudoGerado obrigatório');
  validateTipoPlanejamento(tipo);

  const { data, error } = await supabase
    .from(TABLES.PLANEJAMENTOS)
    .insert({
      user_id: userId,
      tipo,
      ano,
      componente,
      capitulo,
      aluno_id: alunoId,
      conteudo_gerado: conteudoGerado,
      conteudo_v1: conteudoV1,
      prompt_versao: promptVersao,
      modelo_llm: modeloLlm,
      custo_estimado: custoEstimado,
      cache_hit_rate: cacheHitRate,
      pipeline_passed: pipelinePassed,
      pipeline_attempts: pipelineAttempts,
    })
    .select(COLUMNS)
    .single();

  if (error) throw new Error(`Erro ao salvar planejamento: ${error.message}`);

  await logAcesso({
    userId,
    acao: 'CREATE',
    recurso: 'planejamentos',
    metadata: { tipo, ano, componente, capitulo },
  });

  return data;
}

/**
 * Lista planejamentos do usuário, com filtros opcionais.
 */
export async function listPlanejamentos(userId, filtros = {}) {
  if (!userId) throw new Error('listPlanejamentos: userId obrigatório');

  let query = supabase
    .from(TABLES.PLANEJAMENTOS)
    .select(COLUMNS)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
  if (filtros.ano) query = query.eq('ano', filtros.ano);
  if (filtros.componente) query = query.eq('componente', filtros.componente);
  if (filtros.capitulo) query = query.eq('capitulo', filtros.capitulo);
  if (filtros.limit) query = query.limit(filtros.limit);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar planejamentos: ${error.message}`);

  return data || [];
}

/**
 * Busca planejamento por ID.
 */
export async function getPlanejamento(userId, planejamentoId) {
  if (!userId || !planejamentoId) return null;

  const { data, error } = await supabase
    .from(TABLES.PLANEJAMENTOS)
    .select(COLUMNS)
    .eq('id', planejamentoId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar planejamento: ${error.message}`);

  if (data) {
    await logAcesso({
      userId,
      acao: 'VIEW',
      recurso: 'planejamentos',
      metadata: { tipo: data.tipo },
    });
  }

  return data;
}

/**
 * Soft delete.
 */
export async function softDeletePlanejamento(userId, planejamentoId) {
  if (!userId || !planejamentoId) {
    throw new Error('softDeletePlanejamento: userId e planejamentoId obrigatórios');
  }

  const { data, error } = await supabase
    .from(TABLES.PLANEJAMENTOS)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', planejamentoId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select('id')
    .single();

  if (error) throw new Error(`Erro ao excluir planejamento: ${error.message}`);

  await logAcesso({
    userId,
    acao: 'DELETE',
    recurso: 'planejamentos',
  });

  return data;
}

/**
 * Busca o último planejamento de um capítulo (cache hit pra re-baixar).
 */
export async function findLatestByCapitulo(userId, params = {}) {
  const { tipo, ano, componente, capitulo } = params;
  if (!userId || !tipo) return null;

  let query = supabase
    .from(TABLES.PLANEJAMENTOS)
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('tipo', tipo)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (ano) query = query.eq('ano', ano);
  if (componente) query = query.eq('componente', componente);
  if (capitulo) query = query.eq('capitulo', capitulo);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar planejamento: ${error.message}`);

  return data?.[0] || null;
}
