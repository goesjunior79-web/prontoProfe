# SESI Edu — Complexity Assessment (Phase 2)

> **Status:** Phase 2 do Spec Pipeline AIOX — concluída em 2026-05-01
> **Agente executor:** `@aiox-master` Orion atuando com persona `@architect` Aria
> **Input:** `01-requirements.md`
> **Próxima fase:** Phase 3 — Research (`@analyst` Alex) ou Phase 4 — Spec Writing
> direto se score for SIMPLE

---

## 1. Complexity Scoring (5 dimensões × 1-5)

### 1.1 Scope — 5/5 (alto)

**Justificativa:** O MVP cobre **8 telas** novas/refeitas, **8 prompts canônicos**, **3
tabelas de banco**, pipeline Generator + Critic, validador determinístico com 18+
checks, modo conservador, refactor grande de `planoBuilder.js`, novo campo Capítulo,
exportação .docx fiel ao template SESI, integração de assets institucionais (catálogo
descritores, logos, brasão, modelos), 6 sub-botões na Tela Avaliação (4 dos quais
inexistentes hoje), painel N1-N4 com persistência longitudinal, **e** 7º módulo novo
(Aula Diária/Semanário).

| Item | Estado | Trabalho |
|---|---|---|
| Telas novas | 4 (Aula Diária, Observações, Relatório, Painel) | Alto |
| Telas a refazer | 4 (PTD, Avaliação, Atividades, Tela Inicial) | Alto |
| Prompts canônicos | 8 prontos, ainda precisam ser integrados ao API | Médio |
| Schema DB | 3 tabelas a criar do zero | Médio |
| Validadores | determinístico + LLM (PROMPT 6 v2) — não existem | Alto |
| Exportação .docx | refactor grande do planoBuilder + integrar templates oficiais | Alto |

> Score 5/5 = projeto NÃO é refactor incremental. É reconstrução parcial com features
> novas.

### 1.2 Integration — 3/5 (médio)

**Justificativa:** A maior parte das integrações **já existe** no app:
- ✅ Anthropic Claude API (`pages/api/generate.js`)
- ✅ Supabase client (`lib/supabase.js`)
- ✅ NextAuth Google OAuth
- ✅ Google Drive (`lib/cloud/google-drive.js`)
- ✅ OneDrive (`lib/cloud/onedrive.js`)
- ✅ pdf.js + mammoth (extração de material)

**Trabalho de integração novo:**
- Supabase Storage para upload de assets (catálogo descritores, logos custom)
- Supabase RLS (Row Level Security) para multi-tenancy futuro
- Possíveis Edge Functions para validador LLM batch
- Eventualmente Vercel para deploy (não confirmado)

> Score 3/5 = sólido fundamental, integrações novas são incrementais.

### 1.3 Infrastructure — 3/5 (médio)

**Justificativa:**
- Migrations Supabase (3 tabelas + storage buckets + RLS policies)
- Pipeline de geração em **3 etapas** (gerador → corretor → validador determinístico)
  com retry policy
- Cache de planejamentos para re-download sem regerar
- Endpoints Next.js para gerar .docx (já existem dois: `/api/gerar-plano-docx` e
  `/api/gerar-docx`) — refactor para suportar 6+ tipos de documento
- Sem CI/CD complexo (provavelmente Vercel auto-deploy)
- Sem necessidade de Kubernetes, microservices, fila/queue

> Score 3/5 = infraestrutura conhecida, demanda configuração mas sem inovação.

### 1.4 Knowledge — 3/5 (médio)

**Justificativa:**

| Área | Sidney domina? | Codificada? |
|---|---|---|
| Next.js / React | ✅ alto | parcial |
| Anthropic SDK | ✅ alto | parcial |
| Supabase | 🟡 médio | preparado mas não usado |
| Geração `.docx` (mammoth, docx) | ✅ alto | sim (`lib/exporters/word.js`) |
| BNCC + AVALIA SESI | ❌ via Sheila | ✅ nos docs |
| LGPD | ❌ a estudar | ❌ |
| Validação heurística de LLM | 🟡 médio | ❌ |
| Pedagogia anos iniciais EF | ❌ via Sheila | ✅ nos docs |

> Score 3/5 = maior parte conhecida; LGPD e validação heurística são pontos novos.

### 1.5 Risk — 4/5 (alto)

**Justificativa:**

| Risco | Severidade | Mitigação proposta |
|---|---|---|
| **LGPD em dados de alunos com laudos** | 🔴 ALTA | RLS no Supabase + criptografia + privacy by design + termo de consentimento |
| **LLM inventa apesar das regras** | 🔴 ALTA | Pipeline Generator + Critic + validador determinístico + modo conservador |
| **Coordenação SESI rejeitar output** | 🟡 MÉDIA | Validação alpha com Sheila a cada feature; uso de templates oficiais |
| **Custo de API com PROMPT 6 (2x tokens)** | 🟡 MÉDIA | Pipeline híbrido (determinístico primeiro); ajuste no plano Free se necessário |
| **Refactor planoBuilder.js quebrar export** | 🟡 MÉDIA | Testes de regressão em formatos `.docx` antes de migrar |
| **Bloqueio dos 4 assets pendentes** | 🟢 BAIXA | Modo conservador funciona sem eles |
| **Validação subjetiva da Sheila** | 🟢 BAIXA | Iterações curtas, feedback loops |

> Score 4/5 = LGPD + qualidade pedagógica são riscos sérios. Não é proibitivo, mas
> exige cuidado deliberado.

---

## 2. Classificação

| Dimensão | Score |
|---|---|
| Scope | 5 |
| Integration | 3 |
| Infrastructure | 3 |
| Knowledge | 3 |
| Risk | 4 |
| **TOTAL** | **18 / 25** |

### Decisão: **COMPLEX (≥ 16)**

Caminho do Spec Pipeline:
- ✅ Phase 1 — Gather (concluída)
- ✅ Phase 2 — Assess (esta — concluída)
- 🔜 **Phase 3 — Research** (obrigatória em COMPLEX)
- 🔜 Phase 4 — Spec Writing
- 🔜 Phase 5 — Critique (com **revision cycle** se NEEDS_REVISION)
- 🔜 Phase 6 — Plan / Implementation

---

## 3. Riscos arquiteturais críticos (a endereçar)

### RISCO-001 — LGPD nos dados pessoais de alunos
**Detalhes:** Tabela `avaliacoes` armazenará nível e observações por aluno por
componente; alunos podem ter laudos médicos (TEA, TDAH, dislexia). LGPD trata isso como
**dado sensível**.

**Mitigações arquiteturais:**
- **RLS no Supabase:** cada professora vê só seus próprios alunos (`user_id` em todas
  as tabelas)
- **Criptografia em repouso** dos campos sensíveis (laudos, observações)
- **Termo de consentimento** explícito ao cadastrar aluno
- **Direito ao esquecimento:** botão "exportar todos meus dados" + "excluir conta"
- **Audit log** de acessos a dados pessoais (quem, quando, o quê)
- **Não treinar modelo** com dados de alunos (Anthropic API tem zero data retention,
  manter)
- **`.gitignore`** para `docs/assets-esposa/*.docx` (template real tem nomes)

### RISCO-002 — LLM inventar conteúdo (No Invention)
**Detalhes:** Apesar de PROMPT MESTRE explicitar, LLMs têm tendência a "preencher
lacunas" criativamente.

**Mitigações arquiteturais:**
- **Pipeline em 3 camadas:** PROMPT MESTRE (system) + PROMPT 6 v2 (corretor LLM) +
  Validador determinístico (regex/listas)
- **Modo conservador:** se faltar catálogo de descritores → omite, não inventa
- **Temperatura baixa** (0.3-0.5) na chamada principal
- **Material extraído via ProjetosModal** sempre passado como contexto rico
- **Validador semântico:** comparar output com material extraído (heurística de overlap
  de termos)
- **Limite de retries:** max 3 regenerações por geração

### RISCO-003 — Custo de API com Generator + Critic
**Detalhes:** PROMPT 6 v2 dobra os tokens por geração. Plano Free (10/mês) pode pesar.

**Mitigações:**
- **Pipeline híbrido escalonado:**
  1. Determinístico primeiro (rápido, ~zero custo)
  2. PROMPT 6 v2 só se determinístico passou (validação de invenção/aplicabilidade)
  3. Regenerar com PROMPT N original se v2 falha
- **Cache de planejamentos** na tabela `planejamentos` — não regerar idênticos
- **Modelo Haiku** (mais barato) como fallback no plano Free, **Sonnet 4-6** no Pro/School
- **Métrica de tokens consumidos** por geração — visível pra usuária

### RISCO-004 — Refactor de `lib/planoBuilder.js`
**Detalhes:** Lista `SECOES` atual tem 14 seções da estrutura SESI **antiga**. Precisa
virar 8 seções da v3. Risco de quebrar export existente.

**Mitigações:**
- **Testes de snapshot** antes do refactor — gerar PTD com mesmo input pre/pós e
  comparar
- **Feature flag** durante transição: `useLegacyBuilder=true` mantém builder antigo
  até v3 estar 100% testado
- **Backup do `.docx`** gerado pela usuária antes de qualquer refactor que afete export

### RISCO-005 — Sub-pendências de produto
**Detalhes:** Pauta de Leitura combinatória (5 termos vs 2 eixos) e aplicação a Mat;
N4 do Painel; assets pendentes.

**Mitigações:**
- **Defaults documentados:** Pauta de Leitura = 2 eixos combináveis; Painel N4 =
  "avançado / autônomo + estratégia"; Pauta Leitura aplica só LP por padrão
- **Marcadores TBD** no código para revisão fácil quando confirmado
- **Modo conservador** já cobre assets pendentes

---

## 4. Recomendações de Stack

### Mantido (já presente)
| Camada | Stack | Justificativa |
|---|---|---|
| **Frontend framework** | Next.js (atual) | Estável, Sidney domina, Vercel-ready |
| **Auth** | NextAuth + Google OAuth (atual) | Funcional, sem refactor necessário |
| **AI provider** | Anthropic Claude (atual) | Modelo `claude-sonnet-4-6` default; Haiku como fallback economy |
| **Document parsing** | pdf.js + mammoth (atual) | Funcionam bem, integração estável |
| **Cloud opcional** | Google Drive + OneDrive (atual) | Já implementado, manter |

### A adicionar / promover
| Camada | Stack | Justificativa |
|---|---|---|
| **Database** | Supabase Postgres com RLS | Já preparado em `lib/supabase.js`. RLS resolve LGPD multi-tenant |
| **Storage de assets** | Supabase Storage | Catálogo descritores, logos custom, templates Word |
| **Validador determinístico** | Library própria (TypeScript) | Sem dep externa — regex + listas em `lib/validators/` |
| **Validador LLM** | PROMPT 6 v2 via Anthropic API | Mesma API, prompt diferente |
| **Document export** | `lib/docBuilder.js` + `lib/planoBuilder.js` refatorados + html-to-docx (já no fluxo) | Já existe, refatorar lista SECOES |

### Não adicionar (no MVP)
- ❌ TypeScript migration (apesar de recomendado, é refactor à parte — projeto é JS hoje)
- ❌ Tailwind CSS (estilos inline são funcionais, não bloqueiam)
- ❌ Vitest/Jest pesado (testes leves de regressão são suficientes pro MVP)
- ❌ Edge Functions (overkill pra carga atual)
- ❌ tRPC (Next.js API routes basta)
- ❌ Vercel AI SDK (uso direto da Anthropic SDK é suficiente)

---

## 5. Dependências entre módulos (ordem sugerida de implementação)

```
                  ┌─────────────────────┐
                  │ FASE 0 — Bedrock    │ ← Refactor SESI_SYSTEM_PROMPT → PROMPT MESTRE
                  │ - PROMPT MESTRE     │ ← Implementar pipeline Generator + Critic
                  │ - Validador deter.  │ ← Validador determinístico básico
                  │ - Modo conservador  │ ← Avisos quando faltam assets
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │ FASE 1 — DB + Auth  │ ← Migrations Supabase (3 tabelas)
                  │ - Schema DB         │ ← RLS por user_id
                  │ - Migração local    │ ← Importar localStorage → Supabase
                  └──────────┬──────────┘
                             │
                ┌────────────┼────────────┬───────────────┐
                ▼            ▼            ▼               ▼
      ┌─────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐
      │ PTD (T2)    │ │ Aula (T3)  │ │ Aval(T4) │ │ Atividade  │
      │ + Builder   │ │ Semanário  │ │ 6 sub    │ │ (T5)       │
      │ refeito     │ │ + horário  │ │ botões   │ │            │
      └──────┬──────┘ └─────┬──────┘ └────┬─────┘ └─────┬──────┘
             └───────┬──────┴───────┬─────┴──────┬──────┘
                     ▼              ▼            ▼
                ┌────────────────────────────────┐
                │ FASE 2 — Por aluno (T6, T7, T8)│
                │ - Observações                  │
                │ - Relatório de etapa           │
                │ - Painel N1-N4                 │
                └────────────────────────────────┘
                                 │
                                 ▼
                ┌────────────────────────────────┐
                │ FASE 3 — Polimento             │
                │ - Upload de assets             │
                │ - Modo cores semáforo          │
                │ - Perfil professora            │
                └────────────────────────────────┘
```

> A FASE 0 é **bloqueante** — sem ela, todos os módulos geram com `SESI_SYSTEM_PROMPT`
> antigo e sem validação. PTD (T2) deve vir primeiro entre as features porque alimenta
> Aula Diária (T3).

---

## 6. Estimativa de esforço (high-level)

| Fase | Complexidade | Esforço estimado |
|---|---|---|
| FASE 0 — Bedrock | Médio | 1-2 semanas |
| FASE 1 — DB + Auth | Médio | 1 semana |
| FASE 2 — PTD + Aula + Avaliação + Atividade | Alto | 3-4 semanas |
| FASE 3 — Observações + Relatório + Painel | Alto | 3-4 semanas |
| FASE 4 — Polimento | Baixo | 1 semana |
| **TOTAL** | | **9-12 semanas** |

> Estimativa para 1 dev (Sidney) trabalhando part-time. Pode ser comprimida com
> dedicação full-time ou ampliada se aparecerem desafios de LGPD ou refactor.

---

## 7. Decisão final — encaminhar para Phase 3 (Research)

**Score 18 = COMPLEX** → Phase 3 é **obrigatória**.

Tópicos de research para `@analyst` Alex investigar:
1. **LGPD** aplicável a dados de alunos com laudos médicos — requisitos mínimos
2. **Bibliotecas de validação heurística** de output LLM (existem patterns conhecidos?)
3. **Performance** do html-to-docx vs `docx` library (qual escala melhor)
4. **Best practices RLS Supabase** para multi-tenancy
5. **Catálogo BNCC** — existe API/dataset oficial pra códigos EF15LP05 etc?
6. **Catálogo AVALIA SESI** — já que o oficial está pendente, há fontes públicas?
7. **Generator + Critic patterns** — referências de implementação em produção
8. **Custo Anthropic API** projetado nos 3 planos (Free/Pro/School) com Generator + Critic

Após Phase 3, Phase 4 (Spec Writing) consolida tudo num `04-spec.md` executável.
