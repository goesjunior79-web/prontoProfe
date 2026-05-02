/**
 * GET /api/admin/cache-stats
 *
 * Agrega cache hit rate de planejamentos por período/modelo.
 *
 * Query params:
 *   ?dias=30   (default: últimos 30 dias)
 *
 * Acesso: apenas emails em ADMIN_EMAILS.
 *
 * Story: US-016 (FASE 4 Polimento)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { isAdminSession } from '../../../lib/admin';
import { supabase } from '../../../lib/supabase';
import { TABLES } from '../../../lib/db/schema';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });
  if (!isAdminSession(session)) {
    return res.status(403).json({ error: 'forbidden', message: 'Acesso restrito a administradores.' });
  }

  const dias = Math.min(Math.max(parseInt(req.query.dias, 10) || 30, 1), 365);
  const inicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: rows, error } = await supabase
      .from(TABLES.PLANEJAMENTOS)
      .select('id, modelo_llm, cache_hit_rate, custo_estimado, created_at')
      .gte('created_at', inicio)
      .not('cache_hit_rate', 'is', null);

    if (error) throw new Error(error.message);

    const linhas = rows || [];
    const porModelo = new Map();
    let somaHit = 0;
    let somaCusto = 0;

    for (const r of linhas) {
      const modelo = r.modelo_llm || 'unknown';
      const m = porModelo.get(modelo) || { modelo, count: 0, somaHit: 0, somaCusto: 0 };
      m.count += 1;
      m.somaHit += Number(r.cache_hit_rate || 0);
      m.somaCusto += Number(r.custo_estimado || 0);
      porModelo.set(modelo, m);
      somaHit += Number(r.cache_hit_rate || 0);
      somaCusto += Number(r.custo_estimado || 0);
    }

    const detalhePorModelo = Array.from(porModelo.values()).map(m => ({
      modelo: m.modelo,
      documentos: m.count,
      cacheHitRateMedio: m.count > 0 ? Number((m.somaHit / m.count).toFixed(4)) : 0,
      custoTotalUSD: Number(m.somaCusto.toFixed(6)),
    })).sort((a, b) => b.documentos - a.documentos);

    return res.status(200).json({
      periodo: { dias, desde: inicio },
      totalDocumentos: linhas.length,
      cacheHitRateMedio: linhas.length > 0 ? Number((somaHit / linhas.length).toFixed(4)) : 0,
      custoTotalUSD: Number(somaCusto.toFixed(6)),
      porModelo: detalhePorModelo,
    });
  } catch (e) {
    console.error('GET /api/admin/cache-stats:', e.message);
    return res.status(500).json({ error: 'db_error', message: e.message });
  }
}
