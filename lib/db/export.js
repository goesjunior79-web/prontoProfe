/**
 * LGPD — Direito à portabilidade.
 *
 * Exporta TODOS os dados pessoais do usuário em estrutura JSON única.
 * Inclui obs_nee descriptografada (titular tem direito a ver seus próprios dados).
 *
 * Story: US-013 (FASE 4 Polimento)
 */

import { supabase } from '../supabase';
import { TABLES } from './schema';
import { tryDecrypt } from './encryption';
import { logAcesso } from './audit';

export async function exportUserData(userId) {
  if (!userId) throw new Error('exportUserData: userId obrigatório');

  const [usuario, alunos, planejamentos, avaliacoes, acessos] = await Promise.all([
    supabase.from(TABLES.USUARIOS).select('*').eq('id', userId).maybeSingle().then(r => r.data),
    supabase.from(TABLES.ALUNOS).select('*').eq('user_id', userId).then(r => r.data || []),
    supabase.from(TABLES.PLANEJAMENTOS).select('*').eq('user_id', userId).then(r => r.data || []),
    supabase.from(TABLES.AVALIACOES).select('*').eq('user_id', userId).then(r => r.data || []),
    supabase.from(TABLES.ACESSOS_DADOS).select('*').eq('user_id', userId).limit(1000).then(r => r.data || []),
  ]);

  const alunosDecrypted = alunos.map(a => ({
    ...a,
    obs_nee: a.obs_nee ? tryDecrypt(a.obs_nee, userId) : null,
  }));

  await logAcesso({
    userId,
    acao: 'EXPORT',
    recurso: 'usuarios',
    metadata: { alunos: alunos.length, planejamentos: planejamentos.length },
  });

  return {
    exportadoEm: new Date().toISOString(),
    formato: 'sesi-edu/lgpd-export-v1',
    usuario,
    alunos: alunosDecrypted,
    planejamentos,
    avaliacoes,
    acessos_dados: acessos,
    counts: {
      alunos: alunos.length,
      planejamentos: planejamentos.length,
      avaliacoes: avaliacoes.length,
      acessos_dados: acessos.length,
    },
  };
}
