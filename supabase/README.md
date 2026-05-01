# Supabase — Schema e migrations

> **Story:** US-004 (FASE 1 DB+Auth) — Sprint 2
> **ADRs:** ADR-004 (RLS via service_role no MVP) + ADR-006 (schema mínimo)
> **Spec:** [`docs/specs/SCHEMA-DB.md`](../docs/specs/SCHEMA-DB.md)

## Estrutura

```
supabase/
├── migrations/
│   ├── 001_init.sql       — schema base (5 tabelas + RLS)
│   ├── 002_storage.sql    — buckets de Storage
│   └── 003_pgcrypto.sql   — extension pra criptografia (US-012b)
└── README.md              — este arquivo
```

## Pré-requisitos

1. Projeto Supabase criado em [supabase.com/dashboard](https://supabase.com/dashboard)
2. Supabase CLI instalado: `npm install -g supabase`
3. Variáveis de ambiente em `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...        # ⚠ secret — não commitar
   SUPABASE_ENCRYPTION_SECRET=...          # 32+ chars — pra US-012b
   ```

## Como rodar as migrations

### Opção A — Supabase CLI (recomendado)

```bash
# 1. Login no Supabase
supabase login

# 2. Linkar projeto local com remoto
supabase link --project-ref <project-ref>

# 3. Aplicar migrations
supabase db push
```

### Opção B — SQL Editor manual (alternativa simples)

1. Abrir [Dashboard Supabase → SQL Editor](https://supabase.com/dashboard)
2. Copiar conteúdo de cada migration na ordem (001 → 002 → 003)
3. Executar uma por vez

## Verificação pós-migration

```sql
-- Tabelas criadas?
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Esperado: acessos_dados, alunos, avaliacoes, planejamentos, usuarios

-- RLS ativo?
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';
-- rowsecurity = true em todas

-- Buckets criados?
SELECT id, name, public FROM storage.buckets;
-- Esperado: institutional-assets (public=true), user-assets (public=false)

-- pgcrypto habilitada?
SELECT extname, extversion FROM pg_extension WHERE extname = 'pgcrypto';
-- 1 linha
```

## Rollback de emergência

⚠ **Destrutivo** — só usar em ambiente de desenvolvimento.

```sql
DROP TABLE IF EXISTS public.acessos_dados CASCADE;
DROP TABLE IF EXISTS public.planejamentos CASCADE;
DROP TABLE IF EXISTS public.avaliacoes CASCADE;
DROP TABLE IF EXISTS public.alunos CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.set_atualizado_em() CASCADE;

-- Storage buckets (remove arquivos!)
DELETE FROM storage.buckets WHERE id IN ('institutional-assets', 'user-assets');
```

## Próximas stories que dependem deste schema

- **US-004a** — Sincronização NextAuth ↔ Supabase usuarios
- **US-012** — Cadastro de alunos com consentimento LGPD
- **US-012b** — Criptografia de obs_nee (usa pgcrypto)
- **US-005..US-011** — Telas que persistem em planejamentos/avaliacoes
- **US-013** — Upload de assets (usa Storage buckets)

## Sobre LGPD

- `acessos_dados` audita todos os CRUD em dados pessoais
- `alunos.consent_at` registra consentimento dos pais
- `alunos.deleted_at` permite soft delete (hard delete em 30 dias via job futuro)
- `obs_nee` deve ser criptografado em produção (US-012b)
- Não commitar `.env.local` no Git (`.gitignore` já cobre)

Detalhes legais em [`docs/spec-pipeline/03-research.md §1`](../docs/spec-pipeline/03-research.md).
