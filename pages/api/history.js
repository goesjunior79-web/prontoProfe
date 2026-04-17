import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getHistory } from '../../lib/db/history';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });
  try {
    const items = await getHistory(session.user.email, 15);
    return res.status(200).json({ items });
  } catch {
    return res.status(500).json({ items: [] });
  }
}
