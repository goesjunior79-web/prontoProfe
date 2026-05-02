-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 006 — Consentimento explícito para IA usar obs_nee
-- ═══════════════════════════════════════════════════════════════════════════
-- Decisão de produto (auditoria 2026-05-02): app interno, dados de aluno
-- são sigilosos por default. obs_nee (laudo NEE) só vai pra IA quando a
-- professora explicitamente marcar opt-in por aluno.
--
-- Default = FALSE (privacidade por padrão).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS permite_ia_usar_obs BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.alunos.permite_ia_usar_obs IS
  'Opt-in explícito da professora pra IA usar obs_nee (laudo NEE) deste aluno. Default FALSE.';
