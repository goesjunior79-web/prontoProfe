/**
 * Sanitiza mensagens de erro pra resposta HTTP.
 *
 * Audit 2026-05-02 H17 + UX 6: vários endpoints retornam `error.message`
 * cru no body. Vaza nomes de coluna Postgres, nomes de constraint,
 * stack do SDK Anthropic, etc — útil pra reconnaissance e ruim pra UX.
 *
 * Estratégia:
 *  - Se a mensagem casar com palavras técnicas conhecidas, devolve copy genérico.
 *  - Senão devolve a mensagem original (ela tende a ser amigável quando
 *    veio de um throw nosso).
 *  - O `console.error` continua tendo a mensagem completa (debug server-side).
 */

const TECHNICAL_PATTERNS = [
  // Postgres/Supabase
  /duplicate key/i,
  /violates? (foreign key|not[-_ ]?null|unique|check) constraint/i,
  /relation "\w+" does not exist/i,
  /column "\w+" does not exist/i,
  /permission denied for/i,
  /rls|row[-_ ]?level[-_ ]?security/i,
  /policy/i,
  // Anthropic SDK
  /anthropic|claude/i,
  /rate[-_ ]?limit|too many request/i,
  /api[_-]?key|unauthorized|invalid_api/i,
  /pipeline|generator|critic/i,
  // Network
  /econn(refused|reset|timed?out)/i,
  /fetch failed|network error|enotfound/i,
  /aborted|abortcontroller/i,
  // Cripto
  /aes-256|hkdf|cipher|decrypt|encrypt/i,
  // JS
  /typeerror|referenceerror|cannot read|undefined is not/i,
  /at \w+\s\(/, // stack trace fragment
];

const FRIENDLY_FALLBACK = 'Não foi possível concluir a operação agora. Tente novamente em alguns instantes.';

/**
 * Retorna mensagem segura pra exibir ao usuário.
 * @param {string|Error|null} err
 * @param {string} [fallback] — mensagem alternativa (default = FRIENDLY_FALLBACK)
 */
export function safeErrorMessage(err, fallback = FRIENDLY_FALLBACK) {
  const raw = err instanceof Error ? err.message : (typeof err === 'string' ? err : '');
  if (!raw) return fallback;

  for (const re of TECHNICAL_PATTERNS) {
    if (re.test(raw)) return fallback;
  }
  // Limita tamanho — nada útil acima disso, e evita vazamento extenso por descuido.
  return raw.length > 240 ? raw.slice(0, 237) + '…' : raw;
}

export const FALLBACK = FRIENDLY_FALLBACK;
