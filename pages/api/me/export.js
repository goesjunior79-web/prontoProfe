/**
 * GET /api/me/export — LGPD Direito à portabilidade.
 *
 * Retorna JSON consolidado com todos os dados pessoais do usuário.
 * Headers force download attachment.
 *
 * Story: US-013 (FASE 4 Polimento)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { exportUserData } from '../../../lib/db/export';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'auth_required' });
  }

  try {
    const data = await exportUserData(session.user.id);
    const filename = `sesi-edu-export-${session.user.id.slice(0, 8)}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('GET /api/me/export:', e.message);
    return res.status(500).json({ error: 'export_error', message: e.message });
  }
}
