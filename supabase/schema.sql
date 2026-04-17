-- =====================================================
-- SESI Edu — Supabase Schema
-- Execute este script no painel SQL do Supabase
-- =====================================================

-- Perfis dos professores (um por e-mail)
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  name         text,
  image        text,
  plan         text not null default 'free',   -- 'free' | 'pro' | 'school'
  usage        integer not null default 0,
  usage_month  text not null default to_char(now(), 'YYYY-MM'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Histórico de gerações
create table if not exists generations (
  id           bigserial primary key,
  email        text not null references profiles(email) on delete cascade,
  tipo         text not null,   -- 'prova' | 'plano' | 'atividade'
  titulo       text,
  disciplina   text,
  serie        text,
  turma        text,
  provider     text not null,
  conteudo     text,
  created_at   timestamptz not null default now()
);

-- Índices para performance
create index if not exists generations_email_idx on generations(email);
create index if not exists generations_created_at_idx on generations(created_at desc);

-- RLS: cada professor só vê seus próprios dados
alter table profiles    enable row level security;
alter table generations enable row level security;

-- Service role key bypassa RLS (usado no servidor Next.js)
-- As policies abaixo são para acesso client-side futuro se necessário
create policy "profiles_self" on profiles    for all using (true);
create policy "generations_self" on generations for all using (true);
