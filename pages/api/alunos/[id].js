/**
 * GET    /api/alunos/:id — busca aluno (audit VIEW)
 * PATCH  /api/alunos/:id — atualiza aluno
 * DELETE /api/alunos/:id — soft delete
 *
 * Story: US-012 (FASE 1)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAluno, updateAluno, softDeleteAluno } from '../../../lib/db/alunos';
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
      const aluno = await getAluno(userId, id);
      if (!aluno) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ aluno });
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const updates = req.body || {};
      const aluno = await updateAluno(userId, id, updates);
      return res.status(200).json({ aluno });
    } catch (e) {
      const status = /nenhum campo|obrigatóri/i.test(e.message) ? 400 : 500;
      return res.status(status).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await softDeleteAluno(userId, id);
      return res.status(204).end();
    } catch (e) {
      return res.status(500).json({ error: 'db_error', message: safeErrorMessage(e) });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
