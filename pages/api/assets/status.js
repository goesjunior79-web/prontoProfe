/**
 * GET /api/assets/status
 *
 * Retorna status dos assets institucionais + uploads dinâmicos do usuário.
 * UI usa para exibir banner de modo conservador quando algo falta.
 *
 * Story: US-014a (FASE 0 Bedrock) + US-014b (FASE 4 Polimento — uploads)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getStatusSummary, getStatusSummaryForUser } from '../../../lib/assets/registry';
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;

    const summary = userId
      ? await getStatusSummaryForUser(userId, supabase)
      : getStatusSummary();

    res.status(200).json(summary);
  } catch (e) {
    console.error('Erro ao verificar assets:', e.message);
    res.status(500).json({ error: 'Erro ao verificar assets', detail: e.message });
  }
}
