/**
 * GET /api/assets/status
 *
 * Retorna status dos assets institucionais para a UI exibir banner
 * de modo conservador quando algo falta.
 *
 * Story: US-014a (FASE 0 Bedrock)
 * ADR: ADR-007 (modo conservador)
 */

import { getStatusSummary } from '../../../lib/assets/registry';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const summary = getStatusSummary();
    res.status(200).json(summary);
  } catch (e) {
    console.error('Erro ao verificar assets:', e.message);
    res.status(500).json({ error: 'Erro ao verificar assets', detail: e.message });
  }
}
