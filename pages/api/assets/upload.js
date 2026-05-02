/**
 * POST /api/assets/upload
 *
 * Upload de asset institucional → bucket `user-assets` no Supabase Storage.
 * Path: {userId}/{assetKey}.{ext}
 *
 * Aceita JSON com payload base64 (evita dependência multipart).
 *
 * Body:
 *   { assetKey: 'template_word_prova', filename: 'modelo.docx', mime: '...', dataBase64: '...' }
 *
 * Response:
 *   { uploaded: true, path, size }
 *
 * Story: US-013 (FASE 4 Polimento)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { supabase } from '../../../lib/supabase';
import { ASSET_DEFINITIONS } from '../../../lib/assets/registry';
import { BUCKETS } from '../../../lib/db/schema';
import { logAcesso } from '../../../lib/db/audit';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (alinhado com bucket)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!requireSameOrigin(req, res)) return;

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'auth_required' });
  }

  const { assetKey, filename, mime, dataBase64 } = req.body || {};

  if (!assetKey || !ASSET_DEFINITIONS[assetKey]) {
    return res.status(400).json({ error: 'validation_error', message: 'assetKey inválido' });
  }
  if (!dataBase64 || typeof dataBase64 !== 'string') {
    return res.status(400).json({ error: 'validation_error', message: 'dataBase64 obrigatório' });
  }
  if (!filename || !mime) {
    return res.status(400).json({ error: 'validation_error', message: 'filename e mime obrigatórios' });
  }

  let buffer;
  try {
    buffer = Buffer.from(dataBase64, 'base64');
  } catch {
    return res.status(400).json({ error: 'validation_error', message: 'dataBase64 inválido' });
  }

  if (buffer.length === 0) {
    return res.status(400).json({ error: 'validation_error', message: 'arquivo vazio' });
  }
  if (buffer.length > MAX_BYTES) {
    return res.status(413).json({ error: 'too_large', message: `Limite ${MAX_BYTES} bytes` });
  }

  const ext = (filename.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
  const safeKey = assetKey.replace(/[^a-z0-9_]/gi, '');
  const path = `${session.user.id}/${safeKey}${ext}`;

  try {
    const { error: upErr } = await supabase.storage
      .from(BUCKETS.USER)
      .upload(path, buffer, { contentType: mime, upsert: true });

    if (upErr) {
      return res.status(500).json({ error: 'upload_error', message: safeErrorMessage(upErr) });
    }

    await logAcesso({
      userId: session.user.id,
      acao: 'CREATE',
      recurso: 'usuarios',
      metadata: { assetKey, filename, size: buffer.length, path },
    });

    return res.status(200).json({ uploaded: true, path, size: buffer.length, assetKey });
  } catch (e) {
    console.error('POST /api/assets/upload:', e.message);
    return res.status(500).json({ error: 'upload_error', message: safeErrorMessage(e) });
  }
}
