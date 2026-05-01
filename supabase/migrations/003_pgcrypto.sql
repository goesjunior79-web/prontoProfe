-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 003 — Extension pgcrypto (preparação pra US-012b)
-- ═══════════════════════════════════════════════════════════════════════════
-- Story: US-004 (FASE 1 DB+Auth) — habilita pgcrypto pra ser usado em US-012b
--   (ADR-008: criptografia de dados sensíveis)
--
-- pgcrypto fornece funções de criptografia simétrica (pgp_sym_encrypt /
-- pgp_sym_decrypt) que podem ser usadas como alternativa à criptografia
-- application-level em lib/db/encryption.js.
--
-- Decisão final (app-level vs db-level) fica para US-012b. Esta migration
-- só habilita a extension — não força uso.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Verificação:
-- SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
