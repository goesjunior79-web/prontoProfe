import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });
  const { plan } = req.body;
  if (!['pro', 'school'].includes(plan)) return res.status(400).json({ error: 'invalid_plan' });
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('email', session.user.email);
    if (error) throw error;
    return res.status(200).json({ plan });
  } catch {
    return res.status(500).json({ error: 'db_error' });
  }
}
