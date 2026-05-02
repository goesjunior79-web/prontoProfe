/**
 * GET  /api/modelos — lista modelos da professora
 * POST /api/modelos — registra metadata após upload bem-sucedido
 *                    (cliente já fez PUT na signed URL)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { listModelos, createModelo } from '../../../lib/db/modelos';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'auth_required' });

  if (req.method === 'GET') {
    try {
      const modelos = await listModelos(session.user.id);
      return res.status(200).json({ modelos });
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'POST') {
    if (!requireSameOrigin(req, res)) return;
    try {
      const { nome, descricao, tipo, storagePath, sizeBytes, isDefault } = req.body || {};
      const modelo = await createModelo({
        userId: session.user.id,
        nome, descricao, tipo, storagePath, sizeBytes, isDefault,
      });
      return res.status(201).json({ modelo });
    } catch (e) {
      const status = /obrigatóri|inválido|faltando/i.test(e.message) ? 400 : 500;
      return res.status(status).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
