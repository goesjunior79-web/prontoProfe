/**
 * Operações em `usuarios` — sincroniza NextAuth Google com Supabase.
 *
 * Story: US-004a (FASE 1 DB+Auth)
 * ADRs: ADR-004 (RLS service_role) + ADR-006 (multi-tenancy via user_id)
 *
 * Fluxo:
 *   1. NextAuth Google completa login → callback jwt() é chamado
 *   2. jwt() chama upsertUser() com profile do Google
 *   3. upsertUser cria ou atualiza registro em `usuarios`, retorna id (UUID)
 *   4. token.userId = UUID Supabase → propaga para session.user.id
 *   5. Endpoints usam session.user.id como user_id em queries do banco
 */

import { supabase } from '../supabase';
import { TABLES } from './schema';

const COLUMNS = 'id, google_id, email, nome, imagem_url, cidade, escola, preferencias, criado_em, atualizado_em, ultimo_login';

/**
 * Cria ou atualiza usuário com base no perfil do Google.
 *
 * @param {object} profile
 * @param {string} profile.googleId   — sub do Google (account.providerAccountId)
 * @param {string} profile.email
 * @param {string} [profile.nome]
 * @param {string} [profile.imagemUrl]
 * @returns {Promise<object>} usuário Supabase com id UUID
 */
export async function upsertUser({ googleId, email, nome, imagemUrl }) {
  if (!googleId) throw new Error('upsertUser: googleId obrigatório');
  if (!email) throw new Error('upsertUser: email obrigatório');

  // 1. Procura por google_id (chave primária de sincronização)
  const existing = await getUserByGoogleId(googleId);

  if (existing) {
    // 2a. Atualiza dados básicos (caso mudaram no Google) + ultimo_login
    const { data: updated, error } = await supabase
      .from(TABLES.USUARIOS)
      .update({
        email,
        nome: nome || existing.nome,
        imagem_url: imagemUrl || existing.imagem_url,
        ultimo_login: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select(COLUMNS)
      .single();

    if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    return updated;
  }

  // 2b. Insere novo usuário
  const { data: created, error } = await supabase
    .from(TABLES.USUARIOS)
    .insert({
      google_id: googleId,
      email,
      nome: nome || null,
      imagem_url: imagemUrl || null,
    })
    .select(COLUMNS)
    .single();

  if (error) throw new Error(`Erro ao criar usuário: ${error.message}`);
  return created;
}

/**
 * Busca usuário pelo Google ID. Retorna null se não existir.
 */
export async function getUserByGoogleId(googleId) {
  if (!googleId) return null;
  const { data, error } = await supabase
    .from(TABLES.USUARIOS)
    .select(COLUMNS)
    .eq('google_id', googleId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar usuário (google_id): ${error.message}`);
  return data;
}

/**
 * Busca usuário pelo email. Retorna null se não existir.
 */
export async function getUserByEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from(TABLES.USUARIOS)
    .select(COLUMNS)
    .eq('email', email)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar usuário (email): ${error.message}`);
  return data;
}

/**
 * Busca usuário pelo UUID Supabase.
 */
export async function getUserById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from(TABLES.USUARIOS)
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar usuário (id): ${error.message}`);
  return data;
}

/**
 * Atualiza preferências (JSONB) do usuário — usado pela tela Configurações.
 */
export async function updatePreferences(userId, preferencias) {
  const { data, error } = await supabase
    .from(TABLES.USUARIOS)
    .update({ preferencias })
    .eq('id', userId)
    .select('preferencias')
    .single();

  if (error) throw new Error(`Erro ao atualizar preferências: ${error.message}`);
  return data.preferencias;
}

/**
 * Atualiza dados básicos do perfil (nome, cidade, escola).
 */
export async function updateProfile(userId, updates) {
  const allowed = ['nome', 'cidade', 'escola'];
  const payload = Object.fromEntries(
    Object.entries(updates).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  );

  if (Object.keys(payload).length === 0) {
    throw new Error('updateProfile: nenhum campo válido para atualizar');
  }

  const { data, error } = await supabase
    .from(TABLES.USUARIOS)
    .update(payload)
    .eq('id', userId)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  return data;
}

/**
 * LGPD — Direito ao esquecimento.
 * Soft-delete cascata em usuarios + recursos relacionados.
 * Hard delete fica para job futuro (30 dias).
 */
export async function deleteAccount(userId) {
  if (!userId) throw new Error('deleteAccount: userId obrigatório');

  const now = new Date().toISOString();

  // Soft delete cascata — order matters (usuário por último)
  // Idempotente: re-marcar deleted_at em registros já soft-deleted é inofensivo.
  await supabase.from(TABLES.ALUNOS).update({ deleted_at: now }).eq('user_id', userId);
  await supabase.from(TABLES.PLANEJAMENTOS).update({ deleted_at: now }).eq('user_id', userId);
  await supabase.from(TABLES.AVALIACOES).update({ deleted_at: now }).eq('user_id', userId);

  const { data, error } = await supabase
    .from(TABLES.USUARIOS)
    .update({ deleted_at: now })
    .eq('id', userId)
    .select('id, deleted_at')
    .single();

  if (error) throw new Error(`Erro ao excluir conta: ${error.message}`);
  return data;
}
