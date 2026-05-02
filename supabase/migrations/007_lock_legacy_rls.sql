-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 007 — Travar RLS de tabelas legacy (profiles, generations)
-- ═══════════════════════════════════════════════════════════════════════════
-- Auditoria de segurança 2026-05-02 — issue C3 / S10:
-- profiles e generations herdaram policies USING (true) do schema antigo,
-- permitindo acesso anon/auth direto se a publishable key vazasse.
--
-- Defesa em profundidade: aplicar mesma política das tabelas novas
-- (USING false). Service role bypassa (que é como o app acessa).
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_self" ON public.profiles;
DROP POLICY IF EXISTS "generations_self" ON public.generations;

CREATE POLICY "no_public_access" ON public.profiles    FOR ALL USING (false);
CREATE POLICY "no_public_access" ON public.generations FOR ALL USING (false);
