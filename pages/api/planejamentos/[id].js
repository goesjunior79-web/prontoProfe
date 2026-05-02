/**
 * GET    /api/planejamentos/:id — busca + audit VIEW
 * DELETE /api/planejamentos/:id — soft delete
 *
 * Story: US-005 (FASE 2)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getPlanejamento, softDeletePlanejamento } from '../../../lib/db/planejamentos';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'auth_required' });
  }

  if (!requireSameOrigin(req, res)) return;

  const userId = session.user.id;
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'id_required' });

  if (req.method === 'GET') {
    try {
      const planejamento = await getPlanejamento(userId, id);
      if (!planejamento) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ planejamento });
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await softDeletePlanejamento(userId, id);
      return res.status(204).end();
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
