/**
 * GET  /api/alunos    — lista alunos do usuário autenticado
 * POST /api/alunos    — cria novo aluno (com consentimento LGPD)
 *
 * Story: US-012 (FASE 1)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createAluno, listAlunos } from '../../../lib/db/alunos';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'auth_required', message: 'Faça login para continuar.' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const { turma, serie } = req.query;
      const alunos = await listAlunos(userId, { turma, serie });
      return res.status(200).json({ alunos });
    } catch (e) {
      console.error('GET /api/alunos:', e.message);
      return res.status(500).json({ error: 'db_error', message: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome, turma, serie, obs_nee, consentido } = req.body;

      if (!consentido) {
        return res.status(400).json({
          error: 'consent_required',
          message: 'Confirme que tem autorização dos pais/responsáveis (LGPD).',
        });
      }

      const aluno = await createAluno({
        userId,
        nome,
        turma,
        serie,
        obs_nee,
        consentido,
      });

      return res.status(201).json({ aluno });
    } catch (e) {
      console.error('POST /api/alunos:', e.message);
      const status = /obrigatóri|consent/i.test(e.message) ? 400 : 500;
      return res.status(status).json({ error: 'db_error', message: e.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
