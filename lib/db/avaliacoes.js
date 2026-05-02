/**
 * CRUD em `avaliacoes` — histórico longitudinal aluno × componente × nível.
 *
 * Story: US-011a (Painel UI)
 */

import { supabase } from '../supabase';
import { TABLES, validateNivel, validateFonte } from './schema';
import { logAcesso } from './audit';

const COLUMNS = 'id, user_id, aluno_id, componente, nivel, observacao, intervencao, data, fonte, created_at';

export async function createAvaliacao({ userId, alunoId, componente, nivel, observacao = null, intervencao = null, fonte = 'manual' }) {
  if (!userId || !alunoId || !componente || !nivel) {
    throw new Error('createAvaliacao: userId, alunoId, componente, nivel obrigatórios');
  }
  validateNivel(nivel);
  validateFonte(fonte);

  const { data, error } = await supabase
    .from(TABLES.AVALIACOES)
    .insert({ user_id: userId, aluno_id: alunoId, componente, nivel, observacao, intervencao, fonte })
    .select(COLUMNS)
    .single();

  if (error) throw new Error(`Erro ao criar avaliação: ${error.message}`);

  await logAcesso({ userId, alunoId, acao: 'CREATE', recurso: 'avaliacoes', metadata: { componente, nivel } });
  return data;
}

export async function listAvaliacoesByAluno(userId, alunoId, limit = 100) {
  if (!userId || !alunoId) return [];

  const { data, error } = await supabase
    .from(TABLES.AVALIACOES)
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('aluno_id', alunoId)
    .is('deleted_at', null)
    .order('data', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Erro ao listar avaliações: ${error.message}`);
  return data || [];
}

/**
 * Última avaliação por aluno × componente — usado pelo Painel para
 * mostrar nível atual.
 */
export async function getLatestByAluno(userId, alunoId, componente) {
  if (!userId || !alunoId || !componente) return null;

  const { data, error } = await supabase
    .from(TABLES.AVALIACOES)
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('aluno_id', alunoId)
    .eq('componente', componente)
    .is('deleted_at', null)
    .order('data', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar última avaliação: ${error.message}`);
  return data;
}
