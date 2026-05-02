/**
 * Migração de dados antigos do localStorage para Supabase.
 *
 * Story: US-012 (FASE 1)
 *
 * Antes do schema Supabase, alunos eram persistidos em
 * localStorage.sesi_alunos. Esta função importa esse array para a tabela
 * `alunos` no primeiro login da professora após implementação.
 *
 * Idempotente: se já migrou (flag `sesi_alunos_migrated`), não re-executa.
 */

const STORAGE_KEY_ALUNOS = 'sesi_alunos';
const STORAGE_KEY_FLAG = 'sesi_alunos_migrated';

/**
 * Lê alunos do localStorage e retorna array. Vazio se nada lá ou erro.
 * Funciona apenas no client-side (window/localStorage).
 */
export function readLocalAlunos() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALUNOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('readLocalAlunos: erro ao ler localStorage:', e.message);
    return [];
  }
}

/**
 * Marca migração como concluída.
 */
export function markAsMigrated() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_FLAG, new Date().toISOString());
  } catch {}
}

/**
 * Verifica se já migrou.
 */
export function hasAlreadyMigrated() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  return !!localStorage.getItem(STORAGE_KEY_FLAG);
}

/**
 * Migra alunos do localStorage para Supabase via /api/alunos.
 *
 * Schema do localStorage antigo:
 *   { nome, turma, serie, disciplina, obs }
 *
 * Mapeamento:
 *   nome → nome
 *   turma → turma
 *   serie → serie
 *   obs → obs_nee
 *   disciplina → (descartado — não cabe no schema novo)
 *
 * NOTA: a migração assume consentimento implícito (já estavam cadastrados
 * antes da app exigir consent). Sidney pode revisar essa premissa.
 *
 * @returns {Promise<{ migrated, errors }>}
 */
export async function migrateLocalToSupabase() {
  if (hasAlreadyMigrated()) {
    return { migrated: 0, errors: [], skipped: true };
  }

  const alunos = readLocalAlunos();
  if (alunos.length === 0) {
    markAsMigrated();
    return { migrated: 0, errors: [], skipped: false };
  }

  let migrated = 0;
  const errors = [];

  for (const aluno of alunos) {
    try {
      const payload = {
        nome: aluno.nome,
        turma: aluno.turma,
        serie: aluno.serie || null,
        obs_nee: aluno.obs || null,
        permite_ia_usar_obs: !!aluno.permite_ia_usar_obs,  // default false (Fase 1.2)
        consentido: true,  // assumindo consent implícito (cadastros pré-LGPD)
      };

      const response = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        migrated++;
      } else {
        const err = await response.json().catch(() => ({}));
        errors.push({ aluno: aluno.nome, status: response.status, message: err.message });
      }
    } catch (e) {
      errors.push({ aluno: aluno.nome, message: e.message });
    }
  }

  // Marca como migrado mesmo com alguns erros (evita loop)
  markAsMigrated();

  return { migrated, errors, skipped: false, total: alunos.length };
}
