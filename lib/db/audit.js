/**
 * Audit log LGPD — registra acessos a dados pessoais.
 *
 * Story: US-012 (FASE 1 DB+Auth)
 * Compliance: LGPD Art. 37 (registros de tratamento)
 *
 * Toda operação CRUD em dados pessoais (alunos, avaliacoes) deve chamar
 * logAcesso() — pra eventual auditoria futura.
 */

import { supabase } from '../supabase';
import { TABLES, validateAcaoAudit } from './schema';

/**
 * Registra um acesso a dados pessoais.
 *
 * @param {object} params
 * @param {string} params.userId — UUID do usuário que executou a ação
 * @param {string} [params.alunoId] — UUID do aluno afetado (quando aplicável)
 * @param {string} params.acao — 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT'
 * @param {string} params.recurso — 'alunos' | 'avaliacoes' | 'planejamentos' | 'usuarios'
 * @param {object} [params.metadata] — JSON com info adicional (ex.: campos alterados)
 *
 * Não bloqueia o fluxo se falhar — só loga warning. App não pode quebrar
 * porque o audit log falhou.
 */
export async function logAcesso({ userId, alunoId = null, acao, recurso, metadata = null }) {
  if (!userId) {
    console.warn('logAcesso chamado sem userId — pulando');
    return null;
  }

  try {
    validateAcaoAudit(acao);
  } catch (e) {
    console.warn('logAcesso: ação inválida:', acao, e.message);
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.ACESSOS_DADOS)
      .insert({
        user_id: userId,
        aluno_id: alunoId,
        acao,
        recurso,
        metadata,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.warn('logAcesso falhou:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('logAcesso erro inesperado:', e.message);
    return null;
  }
}

/**
 * Busca histórico de acessos de um usuário (uso em painel admin LGPD).
 */
export async function getAccessLogByUser(userId, limit = 100) {
  const { data, error } = await supabase
    .from(TABLES.ACESSOS_DADOS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Erro ao buscar audit log: ${error.message}`);
  return data || [];
}
