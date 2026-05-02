-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 005 — Métrica de cache hit rate em planejamentos
-- ═══════════════════════════════════════════════════════════════════════════
-- Story: US-016 (FASE 4 Polimento)
--
-- Permite observabilidade de quanto o prompt cache está economizando.
-- Endpoint /api/admin/cache-stats agrega por período/modelo.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.planejamentos
  ADD COLUMN IF NOT EXISTS cache_hit_rate NUMERIC(5,4);

COMMENT ON COLUMN public.planejamentos.cache_hit_rate IS
  'Cache hit rate (0..1) do pipeline LLM — cache_read / (input + cache_creation + cache_read)';

CREATE INDEX IF NOT EXISTS idx_planejamentos_modelo_created
  ON public.planejamentos(modelo_llm, created_at DESC);
