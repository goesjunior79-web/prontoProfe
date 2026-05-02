/**
 * PATCH  /api/modelos/[id] — { isDefault: true } marca como default
 * DELETE /api/modelos/[id] — soft-delete + remove storage
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { setDefaultModelo, softDeleteModelo } from '../../../lib/db/modelos';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'auth_required' });
  if (!requireSameOrigin(req, res)) return;

  const userId = session.user.id;
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id_required' });

  if (req.method === 'PATCH') {
    try {
      const { isDefault } = req.body || {};
      if (isDefault) {
        const modelo = await setDefaultModelo(userId, id);
        return res.status(200).json({ modelo });
      }
      return res.status(400).json({ error: 'noop' });
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await softDeleteModelo(userId, id);
      return res.status(204).end();
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
