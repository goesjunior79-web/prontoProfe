import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getOrCreateProfile } from '../../lib/db/profile';
import { supabase } from '../../lib/supabase';

const PLAN_LIMITS = { free: 10, pro: 150, school: Infinity };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });

  const email = session.user.email;

  try {
    const [profile, histResult, tiposResult] = await Promise.all([
      getOrCreateProfile(email, session.user.name, session.user.image),
      supabase
        .from('generations')
        .select('id, tipo, titulo, disciplina, serie, provider, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('generations')
        .select('tipo')
        .eq('email', email),
    ]);

    const history = (histResult.data || []).map(g => ({
      ...g,
      data: new Date(g.created_at).toLocaleDateString('pt-BR'),
    }));

    const stats = (tiposResult.data || []).reduce((acc, { tipo }) => {
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, { prova: 0, plano: 0, atividade: 0 });

    return res.status(200).json({
      name:    profile.name || session.user.name,
      image:   profile.image || session.user.image,
      plan:    profile.plan,
      usage:   profile.usage,
      limit:   PLAN_LIMITS[profile.plan],
      stats,
      history,
    });
  } catch {
    return res.status(500).json({ error: 'db_error' });
  }
}
