/**
 * GET /api/admin/custo-mensal
 *
 * Agrega custo_estimado de planejamentos por período/usuário/tipo.
 *
 * Query params:
 *   ?ano=2026&mes=04   (default: mês corrente)
 *
 * Acesso: apenas emails em ADMIN_EMAILS (env).
 *
 * Response:
 *   {
 *     periodo: { inicio, fim },
 *     totalUSD: 0.4123,
 *     totalDocumentos: 42,
 *     porUsuario: [{ user_id, email, custo, count }],
 *     porTipo: [{ tipo, custo, count }]
 *   }
 *
 * Story: US-015 (FASE 4 Polimento)
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
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'auth_required' });
  }
  if (!isAdminSession(session)) {
    return res.status(403).json({ error: 'forbidden', message: 'Acesso restrito a administradores.' });
  }

  const now = new Date();
  const ano = parseInt(req.query.ano, 10) || now.getUTCFullYear();
  const mes = parseInt(req.query.mes, 10) || (now.getUTCMonth() + 1);

  if (mes < 1 || mes > 12) {
    return res.status(400).json({ error: 'validation_error', message: 'mes inválido' });
  }

  const inicio = new Date(Date.UTC(ano, mes - 1, 1)).toISOString();
  const fim = new Date(Date.UTC(ano, mes, 1)).toISOString();

  try {
    const { data: planos, error } = await supabase
      .from(TABLES.PLANEJAMENTOS)
      .select('id, user_id, tipo, custo_estimado, created_at')
      .gte('created_at', inicio)
      .lt('created_at', fim);

    if (error) throw new Error(error.message);

    const linhas = planos || [];

    // Agregação por usuário
    const porUsuarioMap = new Map();
    const porTipoMap = new Map();
    let totalUSD = 0;

    for (const p of linhas) {
      const custo = Number(p.custo_estimado || 0);
      totalUSD += custo;

      // user_id
      const u = porUsuarioMap.get(p.user_id) || { user_id: p.user_id, custo: 0, count: 0 };
      u.custo += custo;
      u.count += 1;
      porUsuarioMap.set(p.user_id, u);

      // tipo
      const t = porTipoMap.get(p.tipo) || { tipo: p.tipo, custo: 0, count: 0 };
      t.custo += custo;
      t.count += 1;
      porTipoMap.set(p.tipo, t);
    }

    // Enriquece porUsuario com email/nome
    const userIds = Array.from(porUsuarioMap.keys());
    let usuariosLookup = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from(TABLES.USUARIOS)
        .select('id, email, nome')
        .in('id', userIds);
      for (const u of users || []) usuariosLookup[u.id] = u;
    }

    const porUsuario = Array.from(porUsuarioMap.values())
      .map(u => ({
        ...u,
        email: usuariosLookup[u.user_id]?.email || null,
        nome: usuariosLookup[u.user_id]?.nome || null,
        custo: Number(u.custo.toFixed(6)),
      }))
      .sort((a, b) => b.custo - a.custo);

    const porTipo = Array.from(porTipoMap.values())
      .map(t => ({ ...t, custo: Number(t.custo.toFixed(6)) }))
      .sort((a, b) => b.custo - a.custo);

    return res.status(200).json({
      periodo: { ano, mes, inicio, fim },
      totalUSD: Number(totalUSD.toFixed(6)),
      totalDocumentos: linhas.length,
      porUsuario,
      porTipo,
    });
  } catch (e) {
    console.error('GET /api/admin/custo-mensal:', e.message);
    return res.status(500).json({ error: 'db_error', message: e.message });
  }
}
