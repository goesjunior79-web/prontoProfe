/**
 * POST /api/upgrade — promoção de plano.
 *
 * Status: app é INTERNO (decisão produto 2026-05-02). Auto-promoção foi
 * desativada para evitar abuso de Anthropic. Mudanças de plano só por
 * admin (ADMIN_EMAILS).
 *
 * Antes: qualquer logado fazia POST {plan:"school"} e ganhava Infinity gerações.
 * Agora: 403 a não-admins; admin pode promover qualquer email via body.email.
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabase } from '../../lib/supabase';
import { isAdminSession } from '../../lib/admin';
import { requireSameOrigin } from '../../lib/api/csrf';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!requireSameOrigin(req, res)) return;

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });

  if (!isAdminSession(session)) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Mudança de plano só pode ser feita por administrador. Contate o responsável pelo app.',
    });
  }

  const { plan, email } = req.body || {};
  if (!['free', 'pro', 'school'].includes(plan)) {
    return res.status(400).json({ error: 'invalid_plan' });
  }
  const targetEmail = (email || session.user.email).toLowerCase();

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('email', targetEmail);
    if (error) throw error;
    return res.status(200).json({ plan, email: targetEmail });
  } catch {
    return res.status(500).json({ error: 'db_error' });
  }
}
