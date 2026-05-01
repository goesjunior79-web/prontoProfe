-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 001 — Schema base do SESI Edu
-- ═══════════════════════════════════════════════════════════════════════════
-- Story: US-004 (FASE 1 DB+Auth)
-- ADRs: ADR-004 (RLS via service_role no MVP) + ADR-006 (schema mínimo)
--
-- Cria:
--   - usuarios (sincroniza com NextAuth Google)
--   - alunos
--   - avaliacoes (histórico longitudinal)
--   - planejamentos (cache de outputs gerados + auditoria)
--   - acessos_dados (audit log LGPD)
--
-- RLS habilitado em todas. Policies bloqueiam acesso anon/auth no MVP — só
-- o server Next.js com service_role key acessa (Opção A do research §4).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Tabela: usuarios ───────────────────────────────────────────────────────
-- Sincroniza com NextAuth Google. Hook signIn do NextAuth chama upsert.
-- Não usa Supabase Auth nativo (REFINO-003).

CREATE TABLE public.usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id     TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  nome          TEXT,
  imagem_url    TEXT,
  -- Perfil pedagógico (preenchido em Configurações)
  cidade        TEXT,
  escola        TEXT,
  -- Preferências JSON (cores N1-N4, horário fixo, etc)
  preferencias  JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Auditoria
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_login  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email     ON public.usuarios(email);
CREATE INDEX idx_usuarios_google_id ON public.usuarios(google_id);

-- ── Tabela: alunos ─────────────────────────────────────────────────────────

CREATE TABLE public.alunos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  turma       TEXT NOT NULL,
  serie       TEXT,
  -- Observação NEE / laudo médico — CRIPTOGRAFADO via lib/db/encryption.js (US-012b)
  -- A coluna armazena o ciphertext (text)
  obs_nee     TEXT,
  -- Consentimento dos pais (LGPD) — log de quando foi dado
  consent_at  TIMESTAMPTZ,
  -- Soft delete (LGPD esquecimento — hard delete em 30 dias via job futuro)
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alunos_user_id    ON public.alunos(user_id);
CREATE INDEX idx_alunos_user_turma ON public.alunos(user_id, turma);

-- ── Tabela: avaliacoes ─────────────────────────────────────────────────────
-- Histórico longitudinal por aluno × componente. Cada linha = aferição do
-- nível em uma data com observação livre. Alimenta Painel N1-N4 e Relatórios.

CREATE TABLE public.avaliacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  aluno_id    UUID NOT NULL REFERENCES public.alunos(id)   ON DELETE CASCADE,
  componente  TEXT NOT NULL,                  -- 'Língua Portuguesa' | 'Matemática'
  nivel       TEXT NOT NULL CHECK (nivel IN ('N1','N2','N3','N4')),
  observacao  TEXT,                            -- texto pedagógico livre
  intervencao TEXT,                            -- do catálogo Feature 01 parte C
  data        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fonte       TEXT CHECK (fonte IN ('manual','classificador_llm','avaliacao')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_avaliacoes_aluno          ON public.avaliacoes(aluno_id, data DESC);
CREATE INDEX idx_avaliacoes_user_componente ON public.avaliacoes(user_id, componente);

-- ── Tabela: planejamentos ──────────────────────────────────────────────────
-- Cache de outputs gerados pelo pipeline. Permite re-baixar sem regerar
-- (economia de tokens) + auditoria do pipeline (v1 + v2 + custo).

CREATE TABLE public.planejamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL CHECK (tipo IN (
    'PTD',
    'aula',
    'avaliacao_capitulo',
    'simulado',
    'rubrica',
    'pauta_observacao',
    'plenaria',
    'pauta_leitura',
    'atividade',
    'observacao',
    'relatorio',
    'painel'
  )),
  ano             TEXT,
  componente      TEXT,
  capitulo        TEXT,
  aluno_id        UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
  -- v2 (final corrigido pelo pipeline) — o que a usuária recebe
  conteudo_gerado TEXT NOT NULL,
  -- v1 (rascunho do generator) — pra auditoria, comparação
  conteudo_v1     TEXT,
  -- Versionamento (REFINO-015): 'master-2026-05-01+validador-2026-05-01'
  prompt_versao   TEXT,
  modelo_llm      TEXT,                       -- 'claude-sonnet-4-6', etc
  custo_estimado  NUMERIC(10,6),              -- USD
  pipeline_passed BOOLEAN,                    -- validação completa passou?
  pipeline_attempts INT,                       -- quantas tentativas até converter
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_planejamentos_user_tipo
  ON public.planejamentos(user_id, tipo);
CREATE INDEX idx_planejamentos_capitulo
  ON public.planejamentos(user_id, ano, componente, capitulo);

-- ── Tabela: acessos_dados (audit log LGPD) ────────────────────────────────
-- Registra acessos a dados pessoais (alunos com laudos). Exigência LGPD
-- conforme research §1.

CREATE TABLE public.acessos_dados (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  aluno_id    UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
  acao        TEXT NOT NULL CHECK (acao IN ('VIEW','CREATE','UPDATE','DELETE','EXPORT')),
  recurso     TEXT NOT NULL,                  -- 'alunos','avaliacoes','planejamentos'
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_acessos_user_data ON public.acessos_dados(user_id, created_at DESC);
CREATE INDEX idx_acessos_aluno     ON public.acessos_dados(aluno_id);

-- ── Trigger: atualizar updated_at automaticamente ──────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger específica pra usuarios usa coluna atualizado_em
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_atualizado_em
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security — Opção A (service_role no MVP)
-- ═══════════════════════════════════════════════════════════════════════════
-- ADR-004: no MVP, todas as operações vêm via API routes Next.js usando
-- SUPABASE_SERVICE_ROLE_KEY (que bypassa RLS). Policies abaixo bloqueiam
-- acesso anon/authenticated direto — defesa em profundidade.
--
-- Em fase 2 (REFINO arquitetural quando introduzir clientes pesados),
-- migrar para Opção B: JWT compartilhado entre NextAuth e Supabase, e
-- substituir as policies por:
--   USING (auth.uid()::text = user_id::text)

ALTER TABLE public.usuarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planejamentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acessos_dados  ENABLE ROW LEVEL SECURITY;

-- Bloqueia acesso direto via cliente. Service role bypassa.
CREATE POLICY "no_public_access" ON public.usuarios       FOR ALL USING (false);
CREATE POLICY "no_public_access" ON public.alunos         FOR ALL USING (false);
CREATE POLICY "no_public_access" ON public.avaliacoes     FOR ALL USING (false);
CREATE POLICY "no_public_access" ON public.planejamentos  FOR ALL USING (false);
CREATE POLICY "no_public_access" ON public.acessos_dados  FOR ALL USING (false);

-- ═══════════════════════════════════════════════════════════════════════════
-- Comentários nas tabelas (documentação inline)
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE  public.usuarios      IS 'Sincronizada com NextAuth Google — não usa Supabase Auth nativo';
COMMENT ON TABLE  public.alunos        IS 'Cadastro de alunos. Campo obs_nee é criptografado em prod (US-012b)';
COMMENT ON TABLE  public.avaliacoes    IS 'Histórico longitudinal de níveis N1-N4 por aluno × componente';
COMMENT ON TABLE  public.planejamentos IS 'Cache de outputs gerados + auditoria do pipeline';
COMMENT ON TABLE  public.acessos_dados IS 'Audit log LGPD — quem acessou dados pessoais quando';
COMMENT ON COLUMN public.alunos.obs_nee IS 'Criptografado em produção (lib/db/encryption.js)';
COMMENT ON COLUMN public.alunos.consent_at IS 'Quando consentimento dos pais foi dado (LGPD)';
COMMENT ON COLUMN public.alunos.deleted_at IS 'Soft delete LGPD — hard delete em 30 dias';
