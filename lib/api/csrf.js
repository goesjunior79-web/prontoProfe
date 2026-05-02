/**
 * CSRF guard via origin pinning.
 *
 * Audit 2026-05-02 H15/H16: endpoints mutantes via cookie de sessão são
 * suscetíveis a CSRF (NextAuth v4 só emite token CSRF em /api/auth/*).
 *
 * Estratégia: aceitar request mutante apenas quando Origin ou Referer
 * casa com NEXTAUTH_URL. Browsers modernos sempre setam um dos dois
 * em cross-origin. Não bloqueia callbacks legítimos (mesma origin).
 *
 * Uso:
 *   if (!isSameOrigin(req)) return res.status(403).json({ error: 'csrf_blocked' });
 */

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getAllowedOrigins() {
  const list = [];
  if (process.env.NEXTAUTH_URL) list.push(process.env.NEXTAUTH_URL);
  if (process.env.VERCEL_URL) list.push(`https://${process.env.VERCEL_URL}`);
  // Em dev, NEXTAUTH_URL costuma cobrir localhost; mantemos só o que veio do env.
  return list;
}

function originOf(urlStr) {
  try {
    const u = new URL(urlStr);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

export function isSameOrigin(req) {
  // GET/HEAD/OPTIONS não precisam de CSRF (não mudam estado).
  if (!MUTATING.has(req.method)) return true;

  const allowed = getAllowedOrigins().map(originOf).filter(Boolean);
  if (allowed.length === 0) {
    // Sem env configurada — fail closed.
    return false;
  }

  const origin = req.headers.origin || null;
  const referer = req.headers.referer || null;

  if (origin && allowed.includes(origin)) return true;
  if (referer) {
    const refOrigin = originOf(referer);
    if (refOrigin && allowed.includes(refOrigin)) return true;
  }
  return false;
}

/**
 * Helper para uso direto no handler. Retorna true se passou; senão envia 403.
 */
export function requireSameOrigin(req, res) {
  if (isSameOrigin(req)) return true;
  res.status(403).json({ error: 'csrf_blocked', message: 'Origem não autorizada para esta operação.' });
  return false;
}
