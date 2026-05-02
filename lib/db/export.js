/**
 * LGPD — Direito à portabilidade.
 *
 * Exporta TODOS os dados pessoais do usuário em estrutura JSON única.
 * Inclui obs_nee descriptografada (titular tem direito a ver seus próprios dados).
 *
 * Story: US-013 (FASE 4 Polimento) + Fase 9 (paginação + tabelas legacy)
 */

import { supabase } from '../supabase';
import { TABLES } from './schema';
import { tryDecrypt } from './encryption';
import { logAcesso } from './audit';

const PAGE_SIZE = 1000;

/**
 * Pagina query Supabase usando .range(). Retorna array completo.
 * Necessário porque Supabase retorna max 1000 rows por default.
 */
async function paginateAll(table, filterFn) {
  const out = [];
  let from = 0;
  while (true) {
    const to = from + PAGE_SIZE - 1;
    const q = filterFn(supabase.from(table).select('*').range(from, to));
    const { data, error } = await q;
    if (error) throw new Error(`Erro ao paginar ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return out;
}

export async function exportUserData(userId, userEmail = null) {
  if (!userId) throw new Error('exportUserData: userId obrigatório');

  const filterByUserId = (q) => q.eq('user_id', userId);
  const filterByEmail = (q) => userEmail ? q.eq('email', userEmail) : q.eq('email', '__never__');

  const [usuario, alunos, planejamentos, avaliacoes, acessos, profilesLegacy, generationsLegacy] =
    await Promise.all([
      supabase.from(TABLES.USUARIOS).select('*').eq('id', userId).maybeSingle().then(r => r.data),
      paginateAll(TABLES.ALUNOS, filterByUserId),
      paginateAll(TABLES.PLANEJAMENTOS, filterByUserId),
      paginateAll(TABLES.AVALIACOES, filterByUserId),
      paginateAll(TABLES.ACESSOS_DADOS, filterByUserId),
      // Tabelas legacy (matched por email — não tem user_id)
      userEmail ? paginateAll('profiles', filterByEmail) : Promise.resolve([]),
      userEmail ? paginateAll('generations', filterByEmail) : Promise.resolve([]),
    ]);

  const alunosDecrypted = alunos.map(a => ({
    ...a,
    obs_nee: a.obs_nee ? tryDecrypt(a.obs_nee, userId) : null,
  }));

  await logAcesso({
    userId,
    acao: 'EXPORT',
    recurso: 'usuarios',
    metadata: {
      alunos: alunos.length,
      planejamentos: planejamentos.length,
      avaliacoes: avaliacoes.length,
      profiles_legacy: profilesLegacy.length,
      generations_legacy: generationsLegacy.length,
    },
  });

  return {
    exportadoEm: new Date().toISOString(),
    formato: 'sesi-edu/lgpd-export-v2',
    usuario,
    alunos: alunosDecrypted,
    planejamentos,
    avaliacoes,
    acessos_dados: acessos,
    profiles_legacy: profilesLegacy,
    generations_legacy: generationsLegacy,
    counts: {
      alunos: alunos.length,
      planejamentos: planejamentos.length,
      avaliacoes: avaliacoes.length,
      acessos_dados: acessos.length,
      profiles_legacy: profilesLegacy.length,
      generations_legacy: generationsLegacy.length,
    },
  };
}
