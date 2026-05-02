/**
 * POST /api/modelos/sign-upload
 *
 * Gera uma signed URL pra upload direto cliente→Supabase Storage.
 * Bypassa o cap de 4.5 MB do Vercel — upload de PDFs até o limit do
 * bucket user-assets (10 MB hoje).
 *
 * Body: { filename: 'modelo.pdf', mime: 'application/pdf', sizeBytes: 9130789 }
 * Resp: { uploadUrl, path, token, key }
 *
 * Cliente faz: PUT uploadUrl com o file body. Não passa pelo Next.js.
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { supabase } from '../../../lib/supabase';
import { BUCKETS } from '../../../lib/db/schema';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB (alinhado com bucket user-assets)
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/webp',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!requireSameOrigin(req, res)) return;

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'auth_required' });

  const { filename, mime, sizeBytes } = req.body || {};
  if (!filename || !mime) {
    return res.status(400).json({ error: 'validation_error', message: 'filename e mime obrigatórios' });
  }
  if (!ALLOWED_MIME.has(mime)) {
    return res.status(400).json({ error: 'mime_not_allowed', message: `Tipo ${mime} não suportado.` });
  }
  if (typeof sizeBytes === 'number' && sizeBytes > MAX_BYTES) {
    return res.status(413).json({ error: 'too_large', message: `Limite ${MAX_BYTES} bytes.` });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const stamp = Date.now();
  const path = `${session.user.id}/modelos/${stamp}_${safeName}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS.USER)
      .createSignedUploadUrl(path);

    if (error) throw new Error(error.message);

    return res.status(200).json({
      uploadUrl: data.signedUrl,
      path: data.path,
      token: data.token,
      key: stamp,
    });
  } catch (e) {
    console.error('POST /api/modelos/sign-upload:', e.message);
    return res.status(500).json({ error: 'sign_error', message: safeErrorMessage(e) });
  }
}
