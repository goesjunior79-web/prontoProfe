# SESI Edu — Spec Executável (Phase 4)

> **Status:** Phase 4 do Spec Pipeline AIOX — concluída em 2026-05-01
> **Agente executor:** `@aiox-master` Orion atuando com persona `@pm` Morgan
> **Input:** `01-requirements.md` + `02-complexity.md` + `03-research.md`
> **Próxima fase:** Phase 5 — Critique (`@qa` Quinn)
>
> **Este é o documento que vira código.** Cada seção é referenciável por agentes de
> implementação. Stories derivadas em Phase 6 vão para `docs/stories/`.

---

## 0. Sumário executivo

**Produto:** SESI Edu / ProntoProfe! — app Next.js que **zera o retrabalho**
pedagógico da professora SESI dos anos iniciais EF.

**Norte:** entregar `.docx` em padrão SESI prontos para impressão, sem precisar
formatar manualmente.

**MVP:** 7 telas (PTD, Aula Diária/Semanário, Avaliação 6-em-1, Atividades, Observações,
Relatório de Etapa, Painel N1-N4), pipeline Generator + Critic com PROMPT MESTRE,
Supabase com RLS, validação determinística + LLM, modo conservador para assets
pendentes.

**Stack:** Next.js (mantido), NextAuth Google (mantido), Anthropic Claude
(`claude-sonnet-4-6` + prompt caching), Supabase Postgres + Storage, `docx` library
para fidelidade ao template, validador próprio em `lib/validators/`.

**Estimativa:** 9-12 semanas em 4 fases (Bedrock → DB → Telas por capítulo →
Telas por aluno → Polimento).

---

## 1. Princípios inegociáveis (CON)

> Implementação concreta dos `CON-001` a `CON-006` do `01-requirements.md`.

### CON-001 — No Invention
**Implementação:**
- PROMPT MESTRE (`docs/specs/PROMPT-MESTRE.md`) como system prompt em
  `pages/api/generate.js`
- PROMPT 6 v2 como segunda chamada LLM auditando invenção
- Validador determinístico cruza output com material extraído via `ProjetosModal`
  (heurística de overlap mínimo de termos)
- Temperatura 0.3 nas chamadas principais

### CON-002 — Não criar descritores
**Implementação:**
- Catálogo `lib/data/avalia-descritores.json` (estrutura pronta, conteúdo carregado
  do asset oficial quando chegar)
- Função `mustHaveDescritor(componente, ano)` retorna true para LP/Mat anos iniciais
- Se `mustHaveDescritor === true && catalogo === null` → modo conservador (omite
  coluna + aviso UI)

### CON-003 — Estrutura fixa
**Implementação:**
- Lista canônica de seções por tipo em `lib/validators/structures.js`:
  ```js
  export const STRUCTURES = {
    ptd: ['COMPETÊNCIAS', 'HABILIDADES', 'CAPÍTULO DO MATERIAL', ...8 seções],
    avaliacao_capitulo: ['QUESTÃO 01', ..., 'GABARITO'],
    aula_diaria: ['OBJETIVO', 'HABILIDADE', 'INÍCIO', ...8 blocos por aula],
    observacao: ['Desempenho', 'Dificuldade', 'Estratégia', 'Resposta'],
    relatorio: ['Desenvolvimento', 'Avanços', 'Dificuldades', 'Estratégias'],
    painel: ['Nome', 'Nível', 'Observação', 'Intervenção']
  };
  ```
- Validador `checkStructure(output, type)` verifica presença + ordem

### CON-004 — Seguir documentos enviados
**Implementação:**
- Templates Word em `docs/assets-esposa/` carregados como base para `lib/docBuilder.js`
- Logo SESI em `public/logo_sesi.jpg` (substituir placeholder atual)
- Configuração via `cfg`: `nomeProfessora`, `cidade`, `docCode`

### CON-005 — Anos atendidos (1º-5º EF)
**Implementação:**
- `lib/constants.js`: filtrar SERIES default para apenas `1º a 5º ano EF I`
- Outras séries continuam disponíveis mas não default

### CON-006 — Privacidade (LGPD)
**Implementação:**
- `.gitignore` com `docs/assets-esposa/*.docx`
- Tabelas Supabase com `user_id` em todas + RLS policies
- Coluna `obs` (laudo) criptografada com chave por usuário
- Audit log em tabela `acessos_dados`
- Termo de consentimento ao cadastrar aluno (checkbox + log)

---

## 2. ADRs — Architecture Decision Records

> Decisões arquiteturais documentadas. Cada uma é referência durante implementação.

### ADR-001 — System prompt central via PROMPT MESTRE
**Decisão:** Substituir `SESI_SYSTEM_PROMPT` (genérico) em `pages/api/generate.js`
pelo conteúdo de `docs/specs/PROMPT-MESTRE.md`.
**Rationale:** Centraliza regras pedagógicas, perfil, semântica N1-N4, validação.
**Consequências:** Single source of truth. Mudança no prompt = atualização no doc + redeploy.

### ADR-002 — Pipeline Generator + Critic com cache
**Decisão:** Após cada geração, rodar PROMPT 6 v2 (corretor) com Anthropic Prompt
Caching ativo no system prompt.
**Rationale:** Qualidade do output (research §7); cache reduz custo ~90%.
**Consequências:** Latência ~2x; custo gerenciável; fidelidade ao "no invention".

### ADR-003 — Validador determinístico em `lib/validators/`
**Decisão:** Implementar checks de estrutura/ordem/títulos/termos proibidos em JS puro,
sem dependência externa.
**Rationale:** Zero dep + controle total + fácil manutenção (research §2).
**Consequências:** ~3-5 dias de implementação inicial; padrão claro para extensões.

### ADR-004 — Supabase RLS via service_role (Opção A)
**Decisão:** API routes Next.js validam sessão NextAuth, depois usam Supabase
service_role key. RLS desabilitado no MVP.
**Rationale:** Simplicidade; segurança no server (research §4).
**Consequências:** Mais código no server; refactor futuro pra Opção B (JWT) se
introduzir clientes pesados.
**Migration path:** quando precisar realtime ou clientes ricos, mover pra JWT compartilhado.

### ADR-005 — `docx` library puro para PTD e Avaliação
**Decisão:** Migrar `lib/planoBuilder.js` (HTML) para `docx` library na Tela PTD e
Avaliação. Manter `html-to-docx` para outputs simples (Atividade, Plenária).
**Rationale:** Fidelidade total ao template SESI (research §3).
**Consequências:** ~1 semana de migração; output `.docx` indistinguível do template oficial.

### ADR-006 — Schema mínimo + multi-tenancy preparado
**Decisão:** 3 tabelas (`alunos`, `avaliacoes`, `planejamentos`) com `user_id` em todas
desde o MVP.
**Rationale:** Schema da esposa + futuro multi-tenant sem refactor.
**Consequências:** Pequeno overhead em queries; preparado pra escala.

### ADR-007 — Modo conservador para assets pendentes
**Decisão:** Quando faltam catálogo/template/logo, app **avisa usuária** e omite —
não improvisa.
**Rationale:** REGRAS-FINAIS regra #4 (seguir documentos enviados).
**Consequências:** UX explícita ("Sem catálogo, descritores omitidos. Importe nas
Configurações"); usuária toma decisão consciente.

---

## 3. Schema do banco — Supabase Postgres

### 3.1 Migrations SQL

```sql
-- ============================================================
-- Migration 001: Schema base (alunos, avaliacoes, planejamentos)
-- ============================================================

-- Tabela: usuarios (extensão de auth.users do Supabase)
-- Já existe via Supabase Auth ou criar tabela própria se não usar Supabase Auth nativo.

-- Tabela: alunos
CREATE TABLE public.alunos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,           -- FK para usuario (NextAuth user.id ou auth.uid())
  nome         TEXT NOT NULL,
  turma        TEXT NOT NULL,
  serie        TEXT,                    -- ex: "3º ano EF I"
  obs_nee      TEXT,                    -- laudo/NEE — campo CRIPTOGRAFADO em produção
  consent_at   TIMESTAMPTZ,             -- quando foi dado consentimento dos pais
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ              -- soft delete (LGPD)
);

CREATE INDEX idx_alunos_user_id ON public.alunos(user_id);
CREATE INDEX idx_alunos_user_turma ON public.alunos(user_id, turma);

-- Tabela: avaliacoes (histórico longitudinal por aluno × componente)
CREATE TABLE public.avaliacoes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  aluno_id     UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  componente   TEXT NOT NULL,           -- 'Língua Portuguesa' | 'Matemática'
  nivel        TEXT NOT NULL CHECK (nivel IN ('N1','N2','N3','N4')),
  observacao   TEXT,                    -- texto livre estruturado
  intervencao  TEXT,                    -- do catálogo Feature 01 parte C
  data         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fonte        TEXT,                    -- 'manual' | 'classificador_llm' | 'avaliacao'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_avaliacoes_aluno ON public.avaliacoes(aluno_id, data DESC);
CREATE INDEX idx_avaliacoes_user_componente ON public.avaliacoes(user_id, componente);

-- Tabela: planejamentos (cache de conteúdos gerados)
CREATE TABLE public.planejamentos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  tipo              TEXT NOT NULL CHECK (tipo IN (
    'PTD','aula','avaliacao_capitulo','simulado','rubrica',
    'pauta_observacao','plenaria','pauta_leitura',
    'atividade','observacao','relatorio','painel'
  )),
  ano               TEXT,
  componente        TEXT,
  capitulo          TEXT,
  aluno_id          UUID,                -- FK opcional para tipos por aluno
  conteudo_gerado   TEXT NOT NULL,       -- markdown ou JSON
  conteudo_v1       TEXT,                -- pré-corretor (auditoria)
  prompt_versao     TEXT,                -- ex: 'PROMPT_MESTRE-2026-05-01'
  modelo_llm        TEXT,                -- ex: 'claude-sonnet-4-6'
  custo_estimado    NUMERIC(10,4),       -- USD
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_planejamentos_user_tipo ON public.planejamentos(user_id, tipo);
CREATE INDEX idx_planejamentos_capitulo ON public.planejamentos(user_id, ano, componente, capitulo);

-- Tabela: acessos_dados (audit log LGPD)
CREATE TABLE public.acessos_dados (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  aluno_id     UUID,
  acao         TEXT NOT NULL,            -- 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT'
  recurso      TEXT NOT NULL,            -- 'alunos' | 'avaliacoes' | 'planejamentos'
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_acessos_user_data ON public.acessos_dados(user_id, created_at DESC);

-- ============================================================
-- Migration 002: Storage buckets para assets institucionais
-- ============================================================

-- Bucket público pra logos (compartilhados)
INSERT INTO storage.buckets (id, name, public)
VALUES ('institutional-assets', 'institutional-assets', true)
ON CONFLICT DO NOTHING;

-- Bucket privado para uploads custom da professora
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-assets', 'user-assets', false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Migration 003: RLS Policies (Opção A — service_role apenas no MVP)
-- ============================================================

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planejamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acessos_dados ENABLE ROW LEVEL SECURITY;

-- Service role bypass (chamado pelo server Next.js após validar NextAuth)
-- No MVP, todas as operações vêm via service_role — não há acesso direto do cliente.
-- Quando migrar para Opção B (JWT), substituir por:
-- CREATE POLICY "users see own" ON alunos FOR ALL USING (auth.uid()::text = user_id::text);
```

### 3.2 Migração do localStorage

Função em `lib/db/migrate-local-to-supabase.js`:

```js
export async function migrateLocalToSupabase(userId) {
  const sesiAlunos = JSON.parse(localStorage.getItem('sesi_alunos') || '[]');
  for (const aluno of sesiAlunos) {
    await supabase.from('alunos').insert({
      user_id: userId,
      nome: aluno.nome,
      turma: aluno.turma,
      serie: aluno.serie,
      obs_nee: aluno.obs,  // criptografar antes em produção
      consent_at: new Date().toISOString()
    });
  }
  // Manter localStorage como cache opcional
}
```

---

## 4. Endpoints API

### 4.1 Existentes (refatorar)

| Endpoint | Método | Mudança | Descrição |
|---|---|---|---|
| `/api/generate` | POST | **Refactor pesado** | Usa PROMPT MESTRE + pipeline Generator+Critic + cache. Aceita `tipo_de_saida` |
| `/api/dashboard` | GET | Manter | Dashboard de uso (já existe) |
| `/api/upgrade` | POST | Manter | Upgrade de plano |
| `/api/gerar-plano-docx` | POST | **Refactor para `docx` puro** | Gera PTD .docx fiel ao template |
| `/api/gerar-docx` | POST | **Refactor para `docx` puro** | Gera Avaliação .docx fiel ao CE-228 |
| `/api/auth/*` | (NextAuth) | Manter | Auth Google |

### 4.2 Novos endpoints

| Endpoint | Método | Descrição |
|---|---|---|
| `POST /api/alunos` | POST | Criar aluno (com consentimento) |
| `GET /api/alunos` | GET | Listar alunos do usuário |
| `PATCH /api/alunos/:id` | PATCH | Atualizar aluno |
| `DELETE /api/alunos/:id` | DELETE | Soft delete (audit log) |
| `POST /api/avaliacoes` | POST | Registrar avaliação/observação |
| `GET /api/avaliacoes/aluno/:id` | GET | Histórico longitudinal de aluno |
| `GET /api/painel/:turma` | GET | Dados agregados pra Painel N1-N4 |
| `POST /api/painel/classificar` | POST | Trigger classificação automática (PROMPT 8) |
| `POST /api/assets/upload` | POST | Upload de catálogo descritores / template / logo custom |
| `GET /api/assets` | GET | Lista assets do usuário |
| `GET /api/planejamentos/:tipo` | GET | Cache de planejamentos gerados (re-baixar) |
| `GET /api/me/export` | GET | LGPD — exportar todos os dados do usuário (JSON) |
| `DELETE /api/me` | DELETE | LGPD — excluir conta + todos os dados (soft → hard 30d) |

### 4.3 Pipeline `/api/generate` reformulado

```js
// pages/api/generate.js (pseudo-código)
import { PROMPT_MESTRE } from '@/lib/prompts/master';
import { PROMPT_6_VALIDADOR } from '@/lib/prompts/validator';
import { validateOutput } from '@/lib/validators';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: 'auth_required' });

  const profile = await getOrCreateProfile(session.user.email);
  if (atingiuLimite(profile)) return res.status(403).json({ error: 'limit_reached' });

  const { tipo_de_saida, ano, componente, capitulo, horario_semanal,
          informacoes_do_aluno, dados_dos_alunos, files = [] } = req.body;

  const userMessage = buildUserMessage({ tipo_de_saida, ano, componente, capitulo,
                                         horario_semanal, informacoes_do_aluno,
                                         dados_dos_alunos, files });

  // Tentar até 3 vezes
  for (let attempt = 1; attempt <= 3; attempt++) {
    // Generator (com prompt caching)
    const v1 = await callClaude({
      system: [{ type: 'text', text: PROMPT_MESTRE,
                 cache_control: { type: 'ephemeral' } }],  // 🆕 caching
      messages: [{ role: 'user', content: userMessage }],
      model: CLAUDE_MODEL,
      temperature: 0.3,
      max_tokens: 8000,
    });

    // Validador determinístico
    const detCheck = validateOutput(v1.content, tipo_de_saida);
    if (!detCheck.passed) {
      console.warn('Det check failed:', detCheck.errors);
      continue;
    }

    // Critic (PROMPT 6 v2)
    const v2 = await callClaude({
      system: [{ type: 'text', text: PROMPT_6_VALIDADOR,
                 cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: v1.content }],
      model: CLAUDE_MODEL,
      temperature: 0.2,
      max_tokens: 8000,
    });

    const v2Check = validateOutput(v2.content, tipo_de_saida);
    if (v2Check.passed) {
      // Persist
      await incrementUsage(session.user.email);
      await saveGeneration({ user_id: profile.id, tipo: tipo_de_saida,
                             ano, componente, capitulo,
                             conteudo_gerado: v2.content,
                             conteudo_v1: v1.content,
                             prompt_versao: 'PROMPT_MESTRE-2026-05-01',
                             modelo_llm: CLAUDE_MODEL,
                             custo_estimado: calcCusto(v1.usage, v2.usage) });
      return res.status(200).json({ result: v2.content, plan: profile.plan,
                                     usage: profile.usage + 1 });
    }
  }

  // Falhou 3x — retorna v2 com warnings
  return res.status(200).json({ result: lastV2, warnings: 'validação parcial',
                                 plan: profile.plan, usage: profile.usage + 1 });
}
```

---

## 5. Telas — UI Flow detalhado

> Implementação em `pages/index.js` → refatorar para `pages/inicio.js` (tela inicial)
> + telas dedicadas. Componentes em `components/` reutilizam o que existe.

### Tela 1 — Inicial (`pages/inicio.js`)

```
┌─────────────────────────────────────────┐
│  [👩‍🏫 ProntoProfe!]      [Sheila Goes ▼] │
├─────────────────────────────────────────┤
│                                         │
│   Olá, Sheila! O que você quer fazer?   │
│                                         │
│   ┌──────┐ ┌──────┐ ┌──────┐           │
│   │ 📋   │ │ 📅   │ │ 📝   │           │
│   │ PTD  │ │ Aula │ │ Aval │           │
│   └──────┘ └──────┘ └──────┘           │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│   │ ✏️   │ │ 👁   │ │ 📄   │ │ 📊   │  │
│   │ Ativ │ │ Obs  │ │ Rel  │ │ Painel  │
│   └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│   Materiais recentes                    │
│   • PTD - Mat 3º ano - Cap 5 (hoje)    │
│   • Aula semana - LP - Cap 4 (ontem)   │
└─────────────────────────────────────────┘
```

### Tela 2 — PTD (`pages/ptd.js`)

```
Form (3 campos):
  • Ano (select — default 3º ano EF I)
  • Componente (select — Língua Portuguesa | Matemática)
  • Capítulo (text — nome exato)

Botão: [🚀 Gerar PTD]  [📁 Selecionar projeto ativo]

Output:
  - Preview do PTD em 8 seções
  - Ações: [📥 Baixar Word] [📅 Gerar aula semanal] [✏️ Editar]
```

### Tela 3 — Aula Diária / Semanário (`pages/aula.js`)

```
Form (4 campos):
  • Capítulo
  • Componente (autopreenchido se vier do PTD)
  • Ano (autopreenchido se vier do PTD)
  • Horário semanal (text — ex: "seg 2, ter 2, qua 2, sex 1")
    → autopreenchido se cfg.horarioFixo

Botão: [🚀 Gerar semanário]

Output:
  - Tabs por dia (segunda, terça, quarta, sexta)
  - Cada dia: 8 blocos (Objetivo, Habilidade, Início, ...)
```

### Tela 4 — Avaliação (6 sub-botões)

```
6 cards de entrada:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Aval. Cap.  │ │ Sim. Avalia │ │ Rubrica     │
└─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Pauta Obs.  │ │ Plenária    │ │ Pauta Leit. │
└─────────────┘ └─────────────┘ └─────────────┘

Cada card → tela específica com formulário curto.
```

### Tela 5 — Atividades (`pages/atividade.js`)

```
Form: Ano + Componente + Capítulo

Botão: [🚀 Gerar atividade principal]

Output:
  - Atividade (Objetivo + Habilidade + Enunciado + Contexto)
  - Botão: [➕ Gerar nova ▼]
       ├ Pra N1 (apoio integral)
       ├ Pra N2 (apoio parcial)
       ├ Pra N3 (esperado)
       ├ Pra N4 (desafio)
       ├ Pra aluno [select]
       └ Outro foco / nova proposta
```

### Tela 6 — Observações (`pages/observacao.js`)

```
Form:
  • Aluno (select com busca — vem da turma cadastrada)
  • Descrição rápida (textarea)

Botão: [🚀 Gerar observação]

Output:
  - Texto formal estruturado em 4 eixos
  - "Deseja sugestão de atividade para trabalhar com o aluno?"
  - Botão: [💡 Gerar atividade pra ajudar]
       → encaminha pra Tela 5 já parametrizada
```

### Tela 7 — Relatório de Etapa (`pages/relatorio.js`)

```
Form:
  • Aluno (select)
  • Etapa (1ª, 2ª, 3ª, 4ª — auto-detectado pela data)
  • Informações (textarea — opcional, autopreenchido com histórico longitudinal)

Botão: [🚀 Gerar relatório]

Output:
  - Relatório de 1 página, terceira pessoa, fechamento positivo
  - Assinatura: Professora Sheila Goes
  - Ações: [📥 Baixar Word] [✉️ Enviar pra família]
```

### Tela 8 — Painel N1-N4 (`pages/painel.js`)

```
Filtros:
  • Turma (select)
  • Componente (LP | Mat)

Tabela:
┌──────────────────┬──────┬──────────────┬─────────────────────┐
│ Aluno            │Nível │ Observação   │ Intervenção         │
├──────────────────┼──────┼──────────────┼─────────────────────┤
│ Ana Paula Souza  │ 🟡N3 │ Compreende.. │ Consolidação prática│
│ João Silva       │ 🔵N1 │ Mediação...  │ Atendim. individ... │
│ ...              │      │              │                     │
└──────────────────┴──────┴──────────────┴─────────────────────┘

Botões: [🔄 Atualizar painel] [📊 Filtros avançados]

Cada linha clicável → modal com histórico longitudinal + botão
"💡 Gerar atividade adaptada"

Toggle no rodapé: [⚙️ Modo cores: Padrão | Semáforo]
```

---

## 6. User Stories (com Acceptance Criteria)

> Formato AIOX: cada story tem ID, título, descrição, AC, file list.

### US-001 — Bedrock: PROMPT MESTRE em produção
**Como** developer
**Quero** substituir `SESI_SYSTEM_PROMPT` pelo PROMPT MESTRE
**Para** centralizar todas as regras pedagógicas e habilitar o pipeline Generator+Critic.

**Acceptance Criteria:**
- [ ] `lib/prompts/master.js` exporta o PROMPT MESTRE como string
- [ ] `pages/api/generate.js` usa esse import
- [ ] Anthropic Prompt Caching ativado no system prompt
- [ ] Aceita `tipo_de_saida` no request body (PTD | aula | avaliacao_capitulo |
      simulado | rubrica | pauta_observacao | plenaria | pauta_leitura | atividade |
      observacao | relatorio | painel)
- [ ] Modelo padrão: `claude-sonnet-4-6`, temperatura 0.3, max_tokens 8000
- [ ] Teste manual: chamar com tipo "PTD" + ano/componente/capítulo retorna PTD
      estruturado em 8 seções

### US-002 — Validador determinístico
**Como** sistema
**Quero** verificar estrutura/ordem/títulos/termos proibidos do output
**Para** rejeitar outputs com defeitos antes de mostrar à usuária.

**AC:**
- [ ] `lib/validators/structures.js` define listas canônicas por tipo
- [ ] `lib/validators/forbiddenTerms.js` lista termos proibidos
- [ ] `lib/validators/index.js` exporta `validateOutput(content, tipo)` retornando
      `{ passed, errors[] }`
- [ ] Testes unitários para cada validador em `__tests__/validators/`
- [ ] Cobertura: 6 estruturas + lista de termos + heurística de "verbos no infinitivo"

### US-003 — Pipeline Generator + Critic
**Como** sistema
**Quero** rodar PROMPT 6 v2 após cada geração principal
**Para** auditar invenção, linguagem e aplicabilidade.

**AC:**
- [ ] `lib/prompts/validator.js` exporta PROMPT_6_VALIDADOR
- [ ] `pages/api/generate.js` faz 2ª chamada com esse prompt
- [ ] Retry policy: max 3 tentativas, regenera se determinístico falha
- [ ] Custo da chamada extra logado em `planejamentos.custo_estimado`

### US-004 — Schema do banco com migrations
**Como** developer
**Quero** criar tabelas `alunos`, `avaliacoes`, `planejamentos`, `acessos_dados`
**Para** persistir dados do app fora do localStorage.

**AC:**
- [ ] Migrations Supabase em `supabase/migrations/001_init.sql`
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas service_role bypass no MVP
- [ ] Indexes criados
- [ ] CHECK constraints (nivel, tipo)
- [ ] FKs com ON DELETE CASCADE
- [ ] Testar com `supabase db push`

### US-005 — Refactor PTD (Tela 2)
**Como** professora
**Quero** gerar PTD em 8 seções no padrão SESI
**Para** entregar à coordenação sem retrabalho de formatação.

**AC:**
- [ ] Formulário com Ano/Componente/Capítulo
- [ ] Chama `/api/generate` com `tipo_de_saida='PTD'`
- [ ] `lib/planoBuilder.js` lista `SECOES` atualizada para as 8 da v3
- [ ] Builder gera HTML com cabeçalho da Profª Sheila + cidade + vigência
- [ ] Export `.docx` via `docx` library puro (não `html-to-docx`)
- [ ] Botão "Gerar aula semanal" navega para Tela 3 com dados pré-populados
- [ ] Validador checa 8 seções na ordem

### US-006 — Tela Aula Diária / Semanário (NOVA)
**Como** professora
**Quero** gerar planejamento da semana baseado no PTD ativo
**Para** ter aulas prontas para aplicar respeitando 50min/aula.

**AC:**
- [ ] Página nova `pages/aula.js`
- [ ] Form: Ano + Componente + Capítulo + Horário semanal
- [ ] Horário semanal autopreenchido do `cfg.horarioFixo`
- [ ] Chama `/api/generate` com `tipo_de_saida='aula'`
- [ ] Output mostra tabs por dia da semana
- [ ] Cada dia tem 8 blocos validados
- [ ] Export `.docx` da semana inteira

### US-007 — Tela Avaliação 6-em-1
**Como** professora
**Quero** acessar 6 instrumentos avaliativos em uma só tela
**Para** escolher o adequado à situação.

**AC:**
- [ ] `pages/avaliacao.js` mostra 6 cards
- [ ] Cada card → sub-tela específica
- [ ] Avaliação do Capítulo: 10q (7 obj + 3 diss) + gabarito com nível
- [ ] Simulado AVALIA: 100% MC + cartão-resposta separado + gabarito (resposta + descritor + nível)
- [ ] Rubrica: tabela Critérios × N1-N4
- [ ] Pauta de Observação: planilha por aluno
- [ ] Plenária: roteiro de perguntas reflexivas
- [ ] Pauta de Leitura: 2 eixos combináveis (fase × compreensão)
- [ ] Modo conservador para Avaliação Capítulo + Simulado se sem catálogo descritores

### US-008 — Tela Atividades (refactor)
**Como** professora
**Quero** gerar 1 atividade principal alinhada ao PTD + variantes sob demanda
**Para** atender necessidades específicas da turma.

**AC:**
- [ ] Geração padrão: 1 atividade principal (Objetivo/Habilidade/Enunciado/Contexto)
- [ ] Botão "Gerar nova" com seletor de variante (nível N1-N4 / aluno / outro foco)
- [ ] Cada variante chama `/api/generate` com instrução adicional

### US-009 — Tela Observações (NOVA)
**Como** professora
**Quero** registrar observações pedagógicas formais a partir de evidências rápidas
**Para** ter diário de classe + base para relatório de etapa.

**AC:**
- [ ] Página `pages/observacao.js`
- [ ] Form: Aluno (select) + Descrição rápida (textarea)
- [ ] Output: 4 eixos (Desempenho/Dificuldade/Estratégia/Resposta) + final interativo
- [ ] Persistência em `avaliacoes` (com observação textual + nível inferido se aplicável)
- [ ] Botão "Gerar atividade pra ajudar" → encaminha pra Tela 5 com aluno+nível pré-populados

### US-010 — Tela Relatório de Etapa (NOVA)
**Como** professora
**Quero** gerar relatório de 1 página por aluno por etapa
**Para** entregar à família.

**AC:**
- [ ] Página `pages/relatorio.js`
- [ ] Form: Aluno (select) + Etapa (auto) + Informações (textarea — opcional, autopopula com histórico)
- [ ] Output: 1 página, terceira pessoa, 4 eixos + final positivo + assinatura "Professora Sheila Goes"
- [ ] Validador checa: 1 página (limite de palavras), terceira pessoa (regex), 4 eixos, ausência de termos negativos
- [ ] Export `.docx` em padrão SESI

### US-011 — Tela Painel N1-N4 (NOVA)
**Como** professora
**Quero** ver classificação automática dos alunos por componente
**Para** identificar quem precisa de intervenção pedagógica.

**AC:**
- [ ] Página `pages/painel.js`
- [ ] Filtros: turma + componente
- [ ] Tabela: Nome / Nível (cor) / Observação / Intervenção
- [ ] Endpoint `GET /api/painel/:turma` agrega `avaliacoes` mais recentes por aluno
- [ ] Botão "Atualizar painel" chama `POST /api/painel/classificar` (executa PROMPT 8)
- [ ] Toggle "Modo cores: Padrão | Semáforo" persiste em `cfg`
- [ ] Linha clicável → modal com histórico longitudinal + botão "Gerar atividade adaptada"

### US-012 — Cadastro de Alunos com consentimento (refactor)
**Como** professora
**Quero** cadastrar alunos com observação de NEE de forma compatível com LGPD
**Para** estar em conformidade legal.

**AC:**
- [ ] `AlunosModal` com checkbox de consentimento (obrigatório)
- [ ] Texto explicativo sobre LGPD
- [ ] Migração de `localStorage.sesi_alunos` para Supabase ao primeiro login
- [ ] Audit log em `acessos_dados` para CREATE/UPDATE/DELETE
- [ ] Soft delete (campo `deleted_at`)

### US-013 — Configurações + Upload de assets
**Como** professora
**Quero** fazer upload do catálogo de descritores e template Word custom
**Para** o app gerar com fidelidade ao padrão da minha escola.

**AC:**
- [ ] Página `pages/config.js`
- [ ] Upload de PDF/planilha do Catálogo AVALIA → `lib/data/avalia-descritores.json`
- [ ] Upload de logo, brasão, template Word
- [ ] Persistir em Supabase Storage (bucket `user-assets`)
- [ ] Modo cores: toggle Padrão/Semáforo
- [ ] Horário semanal padrão (autopreenche Aula Diária)
- [ ] Nome da professora, cidade, escola
- [ ] LGPD: botões "Exportar meus dados" + "Excluir conta"

### US-014 — Modo conservador
**Como** sistema
**Quero** avisar a usuária quando faltam assets institucionais
**Para** não inventar conteúdo.

**AC:**
- [ ] Banner na UI: "Sem catálogo oficial de descritores. Importe nas Configurações."
- [ ] Backend: gera output omitindo seção de descritores (Avaliação Cap + Simulado)
- [ ] Mesmo padrão para template Word custom (usa template genérico SESI)
- [ ] Logo padrão SESI (extraído) usado se não houver custom

---

## 7. Plano de Implementação por Fase

### FASE 0 — Bedrock (1-2 semanas)
**Objetivo:** Pipeline base + system prompt + validador. Tudo o resto depende disso.

| Story | Estimativa |
|---|---|
| US-001 — PROMPT MESTRE em produção | 2 dias |
| US-002 — Validador determinístico | 3 dias |
| US-003 — Pipeline Generator + Critic | 2 dias |
| US-014 — Modo conservador | 1 dia |
| Testes integrados | 2 dias |

### FASE 1 — DB + Auth (1 semana)
**Objetivo:** Persistência funcionando end-to-end.

| Story | Estimativa |
|---|---|
| US-004 — Schema do banco + migrations | 2 dias |
| US-012 — Cadastro de alunos com consentimento | 2 dias |
| Migração `localStorage` → Supabase | 1 dia |

### FASE 2 — Telas por capítulo (3-4 semanas)
**Objetivo:** PTD + Aula + Avaliação + Atividade.

| Story | Estimativa |
|---|---|
| US-005 — Refactor PTD | 1 semana |
| US-006 — Tela Aula Diária / Semanário | 1 semana |
| US-007 — Tela Avaliação 6-em-1 | 1.5 semanas |
| US-008 — Tela Atividades refactor | 0.5 semana |

### FASE 3 — Telas por aluno (3-4 semanas)
**Objetivo:** Observação + Relatório + Painel.

| Story | Estimativa |
|---|---|
| US-009 — Tela Observações | 1 semana |
| US-010 — Tela Relatório de Etapa | 1 semana |
| US-011 — Tela Painel N1-N4 | 1.5 semanas |

### FASE 4 — Polimento (1 semana)
**Objetivo:** Configurações + UX final.

| Story | Estimativa |
|---|---|
| US-013 — Configurações + Upload | 3 dias |
| Modo cores semáforo | 1 dia |
| LGPD: exportar/excluir conta | 1 dia |
| Polimento geral + bug fixes | 2 dias |

---

## 8. Critérios de Aceite Globais (DoD do MVP)

- [ ] Sheila gera PTD para 1 capítulo em < 2 min e aceita o output sem editar
- [ ] Sheila gera Avaliação do Capítulo (Tela 4 sub-botão 1) e a coordenação aceita
- [ ] Sheila gera Aula Diária (Semanário) baseada em PTD ativo
- [ ] Painel N1-N4 mostra alunos da turma com nível e intervenção sugerida
- [ ] Observação pedagógica gera texto ético sem termos proibidos
- [ ] Relatório de etapa em 1 página, terceira pessoa, com assinatura
- [ ] Validador (determinístico + LLM) bloqueia outputs com invenção/estrutura errada
- [ ] Modo conservador funciona quando faltam assets institucionais
- [ ] Export `.docx` fiel ao padrão SESI (template oficial CE-228 e PTD)
- [ ] LGPD: termo de consentimento ativo, audit log funcional, export/delete da conta
- [ ] Anthropic Prompt Caching ON (custo médio ≤ $0.05/geração)
- [ ] Custo médio por usuário Pro ≤ R$5/mês (mantém margem positiva)

---

## 9. Métricas de sucesso

| Métrica | Target MVP | Como medir |
|---|---|---|
| Taxa de aceitação do output | ≥ 85% | Sheila testa por 2 semanas, conta quantas vezes não precisou editar |
| Tempo médio de geração | ≤ 60s end-to-end | Log do `generate.js` |
| Custo médio por geração | ≤ $0.05 com cache | Soma `custo_estimado` em `planejamentos` |
| Taxa de retry | ≤ 20% | Log de validações falhas |
| Termos proibidos no output final | 0% | Validador determinístico |
| Bugs críticos pós-launch | 0 em 1 semana | Issue tracker |

---

## 10. Riscos remanescentes (atualizado)

| Risco | Severidade | Mitigação |
|---|---|---|
| LGPD sem consultoria jurídica | 🔴 ALTO | Bloquear comercialização até consultoria fechada |
| Custo API com Pro deficitário sem cache | 🟡 MÉDIO | Cache desde MVP; Haiku como economy fallback |
| Refactor `planoBuilder.js` quebrar export | 🟡 MÉDIO | Snapshots + feature flag |
| Validação alpha demorar | 🟡 MÉDIO | Sheila já testando — ciclos curtos |
| Catálogo AVALIA nunca chegar | 🟢 BAIXO | Modo conservador funcional |
| Migração para Opção B (RLS JWT) ser dolorosa | 🟢 BAIXO | Adiar até real necessidade |

---

## 11. Stories prontas pra Phase 6 (Plan)

As 14 stories acima (US-001 a US-014) viram backlog. Phase 6 produzirá
`06-implementation.yaml` com:
- Ordenação final por dependência
- Atribuição de agentes (`@dev`, `@qa`, `@architect`)
- Branches/PRs sugeridos
- DoD por story

---

## 12. Próximo passo: Phase 5 — Critique

`@qa` Quinn vai auditar este `04-spec.md` segundo Constitutional Gate (Article IV —
No Invention) e checklist de qualidade. Possíveis verdicts:
- **APPROVED** (≥4.0) → Phase 6 (Plan)
- **NEEDS_REVISION** (3.0-3.9) → revisão e re-critique
- **BLOCKED** (<3.0) → escalar para `@architect`

Output: `docs/spec-pipeline/05-critique.md`
