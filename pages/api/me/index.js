/**
 * GET    /api/me  — perfil + preferências do usuário autenticado
 * PUT    /api/me  — atualiza perfil e/ou preferências
 * DELETE /api/me  — soft-delete de conta (LGPD esquecimento)
 *
 * Story: US-013 (FASE 4 Polimento)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserById, updateProfile, updatePreferences, deleteAccount } from '../../../lib/db/users';
import { requireSameOrigin } from '../../../lib/api/csrf';
import { safeErrorMessage } from '../../../lib/api/safeError';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'auth_required', message: 'Faça login para continuar.' });
  }

  // CSRF guard nos métodos mutantes (PUT/DELETE).
  if (!requireSameOrigin(req, res)) return;

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const user = await getUserById(userId);
      if (!user) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ user });
    } catch (e) {
      console.error('GET /api/me:', e.message);
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { profile, preferencias } = req.body || {};
      const out = {};

      if (profile && Object.keys(profile).length > 0) {
        out.user = await updateProfile(userId, profile);
      }
      if (preferencias && typeof preferencias === 'object') {
        out.preferencias = await updatePreferences(userId, preferencias);
      }

      if (Object.keys(out).length === 0) {
        return res.status(400).json({ error: 'validation_error', message: 'profile ou preferencias obrigatório' });
      }

      return res.status(200).json(out);
    } catch (e) {
      console.error('PUT /api/me:', e.message);
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { confirm } = req.body || {};
      if (confirm !== 'EXCLUIR_MINHA_CONTA') {
        return res.status(400).json({
          error: 'confirm_required',
          message: 'Para excluir sua conta, envie { confirm: "EXCLUIR_MINHA_CONTA" }.',
        });
      }
      const result = await deleteAccount(userId, session.user.email);
      return res.status(200).json({ deleted: true, ...result });
    } catch (e) {
      console.error('DELETE /api/me:', e.message);
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
