-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 004 — Soft delete em usuarios e avaliacoes (LGPD esquecimento)
-- ═══════════════════════════════════════════════════════════════════════════
-- Story: US-013 (FASE 4 Polimento)
--
-- Objetivo: permitir DELETE /api/me (direito ao esquecimento) sem perder
-- audit trail. Cascade soft-delete em todas as tabelas com user_id.
-- Hard delete em 30 dias por job futuro.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.usuarios   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_usuarios_deleted_at   ON public.usuarios(deleted_at)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_avaliacoes_deleted_at ON public.avaliacoes(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON COLUMN public.usuarios.deleted_at   IS 'Soft delete LGPD — hard delete em 30 dias';
COMMENT ON COLUMN public.avaliacoes.deleted_at IS 'Soft delete LGPD — hard delete em 30 dias';
