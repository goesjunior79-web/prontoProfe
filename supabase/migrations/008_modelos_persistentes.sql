-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 008 — Modelos persistentes (PDFs/Word de referência da professora)
-- ═══════════════════════════════════════════════════════════════════════════
-- Sheila quer guardar PDFs de atividades complementares como modelos
-- reutilizáveis. Storage físico vai pro bucket user-assets/{userId}/modelos/.
-- Esta tabela mantém metadata + flag default + descrição.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.modelos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  tipo        TEXT NOT NULL CHECK (tipo IN ('pdf','docx','imagem')),
  storage_path TEXT NOT NULL,            -- path no bucket user-assets
  size_bytes  BIGINT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_modelos_user ON public.modelos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_modelos_default ON public.modelos(user_id) WHERE is_default = TRUE AND deleted_at IS NULL;

ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "no_public_access" ON public.modelos;
CREATE POLICY "no_public_access" ON public.modelos FOR ALL USING (false);

COMMENT ON TABLE public.modelos IS 'Modelos persistentes (PDFs/Word) que a professora reutiliza como referência em gerações';
