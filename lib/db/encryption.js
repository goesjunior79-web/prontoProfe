/**
 * Criptografia de campos sensíveis (LGPD).
 *
 * Story: US-012b (FASE 1 DB+Auth)
 * ADR: ADR-008 (criptografia de dados sensíveis)
 *
 * Usa AES-256-GCM (autenticated encryption) com chave derivada por usuário.
 * Cada professora tem chave própria — derivada de SUPABASE_ENCRYPTION_SECRET
 * + user_id via HKDF-SHA256.
 *
 * Formato do token armazenado:
 *   v1.{iv-base64}.{tag-base64}.{ciphertext-base64}
 *
 * Vantagens AES-GCM vs CBC:
 *   - Authenticated encryption (detecta tampering)
 *   - IV de 96 bits é recomendação NIST
 *   - Tag de 128 bits prova integridade
 *
 * Usado em:
 *   - alunos.obs_nee (laudos / NEE — dado sensível LGPD)
 */

import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // 96 bits (recomendação GCM)
const VERSION = 'v1';

/**
 * Deriva chave de 32 bytes a partir do master secret + user_id.
 * Usa HKDF-SHA256.
 */
function deriveKey(masterSecret, userId) {
  if (!masterSecret) {
    throw new Error('SUPABASE_ENCRYPTION_SECRET não configurado');
  }
  if (masterSecret.length < 32) {
    throw new Error('SUPABASE_ENCRYPTION_SECRET muito curto (mínimo 32 caracteres)');
  }
  // HKDF: extract+expand
  // Info inclui o userId — chave única por professora
  const info = `sesi-edu:user:${userId}`;
  return Buffer.from(crypto.hkdfSync('sha256', masterSecret, Buffer.alloc(0), info, KEY_LENGTH));
}

function getMasterSecret() {
  return process.env.SUPABASE_ENCRYPTION_SECRET;
}

/**
 * Criptografa plaintext. Retorna token base64-encoded com versão + IV + tag + ciphertext.
 *
 * @param {string} plaintext — texto a criptografar
 * @param {string} userId — UUID do usuário dono (deriva chave única)
 * @returns {string|null} token criptografado, ou null se plaintext vazio
 */
export function encrypt(plaintext, userId) {
  if (plaintext === null || plaintext === undefined || plaintext === '') return null;
  if (!userId) throw new Error('encrypt: userId obrigatório');

  const masterSecret = getMasterSecret();
  const key = deriveKey(masterSecret, userId);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(plaintext), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join('.');
}

/**
 * Descriptografa token. Retorna plaintext UTF-8.
 *
 * @param {string} token — token v1.iv.tag.ciphertext
 * @param {string} userId — UUID do usuário dono
 * @returns {string|null} plaintext, ou null se token vazio
 *
 * Joga erro se:
 *   - Versão não suportada
 *   - Tag inválida (tampering ou chave errada)
 *   - SUPABASE_ENCRYPTION_SECRET ausente
 */
export function decrypt(token, userId) {
  if (token === null || token === undefined || token === '') return null;
  if (!userId) throw new Error('decrypt: userId obrigatório');

  const masterSecret = getMasterSecret();
  const parts = String(token).split('.');

  if (parts.length !== 4) {
    throw new Error('Token criptografado inválido (formato esperado: v.iv.tag.ct)');
  }

  const [version, ivB64, tagB64, ciphertextB64] = parts;

  if (version !== VERSION) {
    throw new Error(`Versão de criptografia não suportada: "${version}". Esperado: "${VERSION}"`);
  }

  const key = deriveKey(masterSecret, userId);
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

/**
 * Tenta descriptografar; em caso de erro, retorna fallback (default null) + loga warning.
 * Usado quando não queremos quebrar listagens por causa de uma row corrompida.
 */
export function tryDecrypt(token, userId, fallback = null) {
  try {
    return decrypt(token, userId);
  } catch (e) {
    console.warn(`tryDecrypt falhou (userId=${userId}):`, e.message);
    return fallback;
  }
}

/**
 * Verifica se um valor parece um token criptografado v1 (sem tentar decrypt).
 * Útil em migrações.
 */
export function looksEncrypted(value) {
  if (typeof value !== 'string') return false;
  return /^v1\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/.test(value);
}
