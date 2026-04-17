import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getOrCreateProfile } from '../../lib/db/profile';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });
  try {
    const profile = await getOrCreateProfile(session.user.email, session.user.name, session.user.image);
    return res.status(200).json({ plan: profile.plan, usage: profile.usage });
  } catch {
    return res.status(500).json({ error: 'db_error' });
  }
}
