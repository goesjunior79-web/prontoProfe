/**
 * CRUD operations para tabela `alunos`.
 *
 * Story: US-012 (FASE 1 DB+Auth)
 * ADRs: ADR-004 (RLS service_role) + ADR-006 (multi-tenancy via user_id) + CON-006 (LGPD)
 *
 * Princípios:
 *   - Toda operação registra acesso em acessos_dados (LGPD)
 *   - user_id sempre filtra (multi-tenancy)
 *   - Soft delete (deleted_at) — hard delete em job futuro
 *   - obs_nee criptografado em produção (US-012b)
 */

import { supabase } from '../supabase';
import { TABLES } from './schema';
import { logAcesso } from './audit';
import { encrypt, tryDecrypt } from './encryption';

const COLUMNS = 'id, user_id, nome, turma, serie, obs_nee, permite_ia_usar_obs, consent_at, created_at, updated_at';

/**
 * Aplica decrypt em obs_nee se presente. Retorna o aluno modificado.
 * Usado após queries que retornam obs_nee criptografado.
 */
function decryptAluno(aluno, userId) {
  if (!aluno) return aluno;
  if (aluno.obs_nee) {
    aluno.obs_nee = tryDecrypt(aluno.obs_nee, userId);
  }
  return aluno;
}

/**
 * Cria novo aluno. Requer consentimento explícito (consent_at).
 *
 * @param {object} params
 * @param {string} params.userId — UUID da professora dona
 * @param {string} params.nome
 * @param {string} params.turma
 * @param {string} [params.serie]
 * @param {string} [params.obs_nee] — laudo/NEE (será criptografado em US-012b)
 * @param {boolean} params.consentido — se true, registra consent_at = NOW()
 *
 * @returns {Promise<object>} aluno criado
 */
export async function createAluno({ userId, nome, turma, serie = null, obs_nee = null, permite_ia_usar_obs = false, consentido = false }) {
  if (!userId) throw new Error('createAluno: userId obrigatório');
  if (!nome?.trim()) throw new Error('createAluno: nome obrigatório');
  if (!turma?.trim()) throw new Error('createAluno: turma obrigatória');
  if (!consentido) {
    throw new Error('createAluno: consentimento dos pais é obrigatório (LGPD)');
  }

  // Criptografa obs_nee antes do INSERT (LGPD — dado sensível em repouso)
  const obsNeeCipher = obs_nee ? encrypt(obs_nee, userId) : null;

  const payload = {
    user_id: userId,
    nome: nome.trim(),
    turma: turma.trim(),
    serie,
    obs_nee: obsNeeCipher,
    permite_ia_usar_obs: !!permite_ia_usar_obs,
    consent_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLES.ALUNOS)
    .insert(payload)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(`Erro ao criar aluno: ${error.message}`);

  await logAcesso({
    userId,
    alunoId: data.id,
    acao: 'CREATE',
    recurso: 'alunos',
    metadata: { turma, serie },
  });

  // Retorna com obs_nee em plaintext (decrypt pra app consumir)
  return decryptAluno(data, userId);
}

/**
 * Lista alunos do usuário (filtra deleted_at IS NULL).
 *
 * @param {string} userId
 * @param {object} [filtros]
 * @param {string} [filtros.turma] — filtra por turma
 * @param {string} [filtros.serie] — filtra por série
 */
export async function listAlunos(userId, filtros = {}) {
  if (!userId) throw new Error('listAlunos: userId obrigatório');

  let query = supabase
    .from(TABLES.ALUNOS)
    .select(COLUMNS)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('nome', { ascending: true });

  if (filtros.turma) query = query.eq('turma', filtros.turma);
  if (filtros.serie) query = query.eq('serie', filtros.serie);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar alunos: ${error.message}`);

  // Descriptografa obs_nee em cada aluno
  return (data || []).map(a => decryptAluno(a, userId));
}

/**
 * Busca aluno por ID (verifica que pertence ao userId).
 */
export async function getAluno(userId, alunoId) {
  if (!userId || !alunoId) return null;

  const { data, error } = await supabase
    .from(TABLES.ALUNOS)
    .select(COLUMNS)
    .eq('id', alunoId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar aluno: ${error.message}`);

  if (data) {
    await logAcesso({
      userId,
      alunoId,
      acao: 'VIEW',
      recurso: 'alunos',
    });
  }

  return decryptAluno(data, userId);
}

/**
 * Atualiza aluno (campos parciais). Verifica ownership pelo user_id.
 */
export async function updateAluno(userId, alunoId, updates) {
  if (!userId || !alunoId) throw new Error('updateAluno: userId e alunoId obrigatórios');

  // Sanitiza updates: só campos permitidos
  const allowed = ['nome', 'turma', 'serie', 'obs_nee', 'permite_ia_usar_obs'];
  const payload = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(payload).length === 0) {
    throw new Error('updateAluno: nenhum campo válido para atualizar');
  }

  // Criptografa obs_nee se presente no update
  if ('obs_nee' in payload) {
    payload.obs_nee = payload.obs_nee ? encrypt(payload.obs_nee, userId) : null;
  }

  const { data, error } = await supabase
    .from(TABLES.ALUNOS)
    .update(payload)
    .eq('id', alunoId)
    .eq('user_id', userId)  // multi-tenancy enforcement
    .is('deleted_at', null)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(`Erro ao atualizar aluno: ${error.message}`);

  await logAcesso({
    userId,
    alunoId,
    acao: 'UPDATE',
    recurso: 'alunos',
    metadata: { campos: Object.keys(payload) },
  });

  return decryptAluno(data, userId);
}

/**
 * Soft delete — define deleted_at = NOW().
 * Hard delete em 30 dias via job futuro (LGPD esquecimento).
 */
export async function softDeleteAluno(userId, alunoId) {
  if (!userId || !alunoId) throw new Error('softDeleteAluno: userId e alunoId obrigatórios');

  const { data, error } = await supabase
    .from(TABLES.ALUNOS)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', alunoId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select('id')
    .single();

  if (error) throw new Error(`Erro ao excluir aluno: ${error.message}`);

  await logAcesso({
    userId,
    alunoId,
    acao: 'DELETE',
    recurso: 'alunos',
  });

  return data;
}

/**
 * Conta quantos alunos ativos a professora tem.
 */
export async function countAlunos(userId) {
  if (!userId) return 0;

  const { count, error } = await supabase
    .from(TABLES.ALUNOS)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) throw new Error(`Erro ao contar alunos: ${error.message}`);
  return count || 0;
}
