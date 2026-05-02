/**
 * GET  /api/planejamentos        — lista planejamentos do usuário
 * POST /api/planejamentos        — salva novo planejamento (após geração)
 *
 * Story: US-005 (FASE 2 Telas por capítulo)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { savePlanejamento, listPlanejamentos } from '../../../lib/db/planejamentos';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'auth_required' });
  }

  if (!requireSameOrigin(req, res)) return;

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const { tipo, ano, componente, capitulo, limit } = req.query;
      const planejamentos = await listPlanejamentos(userId, {
        tipo, ano, componente, capitulo,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return res.status(200).json({ planejamentos });
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'POST') {
    try {
      const planejamento = await savePlanejamento({
        userId,
        ...req.body,
      });
      return res.status(201).json({ planejamento });
    } catch (e) {
      const status = /obrigatóri|inválido/i.test(e.message) ? 400 : 500;
      return res.status(status).json({ error: 'validation_error', message: safeErrorMessage(e) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
