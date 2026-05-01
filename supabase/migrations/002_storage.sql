-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 002 — Storage buckets para assets institucionais
-- ═══════════════════════════════════════════════════════════════════════════
-- Story: US-004 (FASE 1 DB+Auth) — preparação pra US-013 (upload de assets)
--
-- Buckets:
--   - institutional-assets (público) — logos, brasões compartilhados
--   - user-assets (privado)         — uploads custom da professora
--                                     (template Word, descritores AVALIA)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institutional-assets',
  'institutional-assets',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-assets',
  'user-assets',
  false,
  10485760,  -- 10 MB (templates Word podem ser maiores)
  ARRAY[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  -- .docx
    'application/pdf',
    'application/json',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy storage: user-assets só acessível via service_role (igual schema)
-- institutional-assets é público (read all)

CREATE POLICY "institutional_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'institutional-assets');

CREATE POLICY "user_assets_service_only"
  ON storage.objects FOR ALL
  USING (bucket_id = 'user-assets' AND false);  -- service_role bypassa
