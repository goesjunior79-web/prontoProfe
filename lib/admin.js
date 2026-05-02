/**
 * Helpers de autorização administrativa.
 *
 * Admins são identificados por email na env `ADMIN_EMAILS` (lista CSV).
 * Sem ADMIN_EMAILS configurada → ninguém é admin (fail closed).
 *
 * Story: US-015 (FASE 4 Polimento)
 */

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export function isAdminSession(session) {
  return isAdminEmail(session?.user?.email);
}
