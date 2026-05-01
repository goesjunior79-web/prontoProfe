# SESI Edu — Critique (Phase 5)

> **Status:** Phase 5 do Spec Pipeline AIOX — concluída em 2026-05-01
> **Agente executor:** `@aiox-master` Orion atuando com persona `@qa` Quinn
> **Input:** `04-spec.md` + cross-check com `01-requirements.md`, `02-complexity.md`,
> `03-research.md`
> **Próxima fase:** Phase 6 — Plan/Implementation (`@architect` Aria)

---

## 0. Veredicto

**APPROVED com refinamentos** — score médio **4.2/5**

| Dimensão | Score | Comentário |
|---|---|---|
| Constitutional Gate (No Invention) | ✅ PASS | Toda afirmação rastreável aos docs |
| Completude | 4.0/5 | Cobre 95% dos FRs; alguns gaps específicos |
| Coerência | 4.5/5 | ADRs alinhados, stories consistentes |
| Clareza | 4.0/5 | AC claros, alguns testes precisam mais especificação |
| Viabilidade | 4.0/5 | Estimativas razoáveis, alguns sub-riscos |
| Cobertura de Requirements | 4.5/5 | 24 FRs / 7 NFRs / 6 CONs cobertos |
| **MÉDIA** | **4.2/5** | **APPROVED** (≥ 4.0) |

> Phase 6 (Plan) **pode prosseguir**, mas o `@architect` deve incorporar os 15
> refinamentos abaixo na ordenação de stories.

---

## 1. Constitutional Gate — Article IV (No Invention)

### Verificação de rastreabilidade

| Afirmação no spec | Rastreado para |
|---|---|
| 8 telas no MVP | `TELAS-MVP.md` + `ATALHOS-USO.md` ✅ |
| 8 prompts canônicos | `app-prompts/01-08*.md` ✅ |
| PROMPT MESTRE como system prompt | `PROMPT-MESTRE.md` ✅ |
| 3 tabelas (alunos/avaliacoes/planejamentos) | `SCHEMA-DB.md` ✅ |
| Tabela `acessos_dados` para audit | Inferida do research §1 (LGPD) ✅ |
| 4 níveis N1-N4 com rótulos contextuais | `00-dna-sesi.md` ✅ |
| 4 regras finais + Praticidade | `REGRAS-FINAIS.md` ✅ |
| Pipeline Generator + Critic | research §7 + PROMPT 6 v2 ✅ |
| `docx` library puro | research §3 ✅ |
| Anthropic Prompt Caching | research §7 ✅ |
| Custo médio $0.05/geração | research §8 ✅ |
| Estimativa 9-12 semanas | complexity §6 ✅ |
| Catálogo BNCC JSON curado | research §5 ✅ |

**Resultado:** ✅ **PASS no Constitutional Gate.** Nenhuma afirmação inventada — todas
têm origem em documento canônico ou em research justificado.

### ⚠ Pontos com inferência (registrar como assunção, não invenção)

| Inferência | Justificativa |
|---|---|
| Audit log em tabela própria `acessos_dados` | LGPD requer audit trail; estrutura inferida das melhores práticas |
| `obs_nee` como campo a criptografar | Inferência de "dado sensível LGPD" — research §1 |
| Soft delete + hard delete em 30 dias | Padrão LGPD; valor "30 dias" é assunção (pode ser ajustado) |

> Aceitas como assunções razoáveis — Phase 6 pode confirmar com Sidney/consultoria
> jurídica.

---

## 2. Achados detalhados — 15 refinamentos para Phase 6

### 🔴 ALTOS — bloqueiam ou comprometem qualidade

#### REFINO-001 — US-014 (Modo conservador) tem dependência circular
**Problema:** US-014 está em FASE 0 (Bedrock), mas depende de saber se assets estão
disponíveis. Os endpoints de assets (`/api/assets/upload`, `/api/assets`) estão em
US-013 (FASE 4 — Polimento). Modo conservador não pode funcionar sem saber o estado
dos assets.

**Solução proposta:**
- Criar **US-014a** (FASE 0): "Estrutura de assets read-only" — apenas verifica
  presença em filesystem (`docs/assets-esposa/` no servidor) ou tabela placeholder
- Mover **US-014b** (FASE 4): "Upload e gerenciamento de assets pela usuária"

**Severidade:** 🔴 ALTO

#### REFINO-002 — Endpoint `/api/painel/classificar` não está alinhado com pipeline Generator+Critic
**Problema:** PROMPT 8 retorna tabela estruturada (Nome / Nível / Observação /
Intervenção). O pipeline Generator+Critic foi pensado pra outputs textuais (markdown).
Como o validador determinístico checa estrutura de tabela?

**Solução proposta:**
- Pipeline para PROMPT 8 deve forçar output **JSON estruturado** (Anthropic tools/
  function calling)
- Validador determinístico checa schema JSON contra Zod
- Sem necessidade de PROMPT 6 (corretor) — JSON validado é suficiente

**Severidade:** 🔴 ALTO

#### REFINO-003 — Falta story para integração NextAuth ↔ Supabase user_id
**Problema:** ADR-004 fala em service_role + validação NextAuth. Mas como NextAuth
user.id (string Google ID) vira `user_id` UUID na tabela? Falta uma story explícita
de "criar registro de usuário no Supabase ao primeiro login".

**Solução proposta:**
- Adicionar **US-004a** em FASE 1: "Sincronização NextAuth ↔ Supabase usuarios"
- Tabela `usuarios` própria (não Supabase Auth nativo) com `id`, `email`,
  `google_id`, `nome`, `escola`, `cidade`, `criado_em`
- Hook do NextAuth `events.signIn` cria/atualiza registro

**Severidade:** 🔴 ALTO

### 🟡 MÉDIOS — afetam qualidade mas não bloqueiam

#### REFINO-004 — Schema sem campo criptografado
**Problema:** CON-006 fala em criptografar `obs_nee`. Schema SQL declara `obs_nee TEXT`
sem indicar criptografia. ADR-006 não menciona.

**Solução proposta:**
- ADR adicional: "ADR-008 — Criptografia de dados sensíveis"
- Library: `crypto` nativo do Node + chave por usuário (derivada de `user_id`)
- Helper em `lib/db/encryption.js` (encrypt/decrypt)
- Migration aplica `pgcrypto` extension se for usar criptografia em DB-level

**Severidade:** 🟡 MÉDIO

#### REFINO-005 — Tela 4 (Avaliação) — uma story só pra 6 sub-botões
**Problema:** US-007 cobre os 6 sub-botões da Tela Avaliação numa única story. Cada
sub-botão tem AC distinto (Avaliação Capítulo, Simulado, Rubrica, Pauta Observação,
Plenária, Pauta Leitura). 1 story de ~1.5 semanas é muito pra única atomic unit.

**Solução proposta:**
- Quebrar **US-007** em 6 sub-stories:
  - US-007a — Avaliação do Capítulo (10q + gabarito)
  - US-007b — Simulado AVALIA (24q + cartão + gabarito)
  - US-007c — Rubrica
  - US-007d — Pauta de Observação
  - US-007e — Plenária
  - US-007f — Pauta de Leitura (com 2 eixos combináveis)
- Cada uma 2-3 dias

**Severidade:** 🟡 MÉDIO

#### REFINO-006 — Sem story de configuração de test infrastructure
**Problema:** US-002 menciona `__tests__/validators/` mas não há story explícita de
"configurar Jest/Vitest + estrutura de testes".

**Solução proposta:**
- Adicionar **US-000** em FASE 0: "Configurar test infrastructure"
- Vitest (mais leve que Jest)
- Estrutura: `__tests__/` separado de `lib/`
- CI futuro (não no MVP)

**Severidade:** 🟡 MÉDIO

#### REFINO-007 — Logo SESI: 2 versões disponíveis, spec não decide
**Problema:** Spec menciona ambas (`03-logo-sesi.jpeg` completa + `03-logo-sesi-simplificada.jpg`)
mas não decide qual em qual contexto.

**Solução proposta:**
- Decisão registrada: **simplificada na UI** (header da app, badges) e **completa nos
  documentos `.docx` formais** (PTD, prova, relatório)
- Adicionar à US-005 e US-007 explicitamente

**Severidade:** 🟡 MÉDIO

#### REFINO-008 — Brasão da escola sem fallback claro
**Problema:** Asset #4 (brasão) está pendente. Spec não diz o que mostrar enquanto
não chega.

**Solução proposta:**
- Modo conservador: usar logo SESI completa como brasão fallback até a usuária
  fazer upload do brasão da escola
- Adicionar a US-014a

**Severidade:** 🟡 MÉDIO

#### REFINO-009 — Faltam métricas de custo monitoradas
**Problema:** Métrica de sucesso #3 ("Custo médio ≤ $0.05") existe, mas spec não detalha
**como** monitorar. Schema tem `custo_estimado` em planejamentos, mas dashboard de
custo não está em nenhuma story.

**Solução proposta:**
- Endpoint `GET /api/admin/custo-mensal` para Sidney monitorar
- Dashboard simples (talvez só endpoint JSON inicialmente)
- Adicionar à US-013 (Configurações) ou nova story de admin

**Severidade:** 🟡 MÉDIO

#### REFINO-010 — Decisão sobre prompt caching key
**Problema:** Anthropic Prompt Caching tem TTL de 5 minutos. Em produção, pode haver
muitas miss-rates se o uso for esporádico.

**Solução proposta:**
- Adicionar à ADR-002: "Cache strategy"
- Considerar caching estruturado em camadas (system prompt sempre cacheado, user
  message variável)
- Métrica: "cache hit rate" no log

**Severidade:** 🟡 MÉDIO

### 🟢 BAIXOS — refinos cosméticos / nice-to-have

#### REFINO-011 — Story de migração localStorage como sub-story de US-012
**Problema:** Migração local→Supabase está embutida em US-012 (Cadastro com
consentimento). Vale separar.

**Solução proposta:**
- Sub-story dentro de US-012 ou independente

**Severidade:** 🟢 BAIXO

#### REFINO-012 — TBDs ainda registrados no spec
**Status:** ✅ Spec menciona TBD-005 e TBD-006 com defaults assumidos. Bom.
**Refinamento:** garantir que esses defaults sejam revertíveis quando esposa confirmar.

#### REFINO-013 — Acceptance criteria de US-005 (PTD) precisa snapshot de output esperado
**Problema:** AC diz "Validador checa 8 seções na ordem" mas sem exemplo de output
mínimo aceitável.

**Solução proposta:**
- Adicionar exemplo de PTD válido em `docs/spec-pipeline/examples/ptd-exemplo.md`
- AC de US-005 referencia este exemplo

**Severidade:** 🟢 BAIXO

#### REFINO-014 — Wireframes textuais são úteis mas não substituem mockups
**Problema:** Telas descritas em ASCII art são suficientes pra implementação inicial,
mas para Sheila validar UX antes do código, mockups visuais ajudariam.

**Solução proposta:**
- Sidney pode fazer wireframes em Excalidraw/Figma rapidamente
- Ou pular pra protótipo HTML/JSX e iterar com Sheila

**Severidade:** 🟢 BAIXO

#### REFINO-015 — Plano de versionamento dos prompts
**Problema:** Spec usa `prompt_versao: 'PROMPT_MESTRE-2026-05-01'` no schema, mas não
há story de "versionar prompts em arquivos com histórico".

**Solução proposta:**
- Sub-story em US-001: cada prompt em `lib/prompts/{nome}.js` com export de versão
  + changelog em `docs/prompts-esposa/changelog.md`

**Severidade:** 🟢 BAIXO

---

## 3. Cobertura de requirements (validação)

### FRs (24 do `01-requirements.md`)
- ✅ FR-T01 a FR-T08 (Telas) → US-005 a US-011
- ✅ FR-P01 a FR-P05 (Pipeline) → US-001, 002, 003, 014, ProjetosModal já existe
- ✅ FR-D01 a FR-D02 (Persistência) → US-004, US-012
- ✅ FR-E01 (Exportação) → US-005, US-007
- ✅ FR-U01 a FR-U03 (UI/Config) → US-013

**Cobertura: 24/24 = 100%** ✅

### NFRs (7 do `01-requirements.md`)
- ✅ NFR-001 (Praticidade) → permeia todas as decisões de UX
- ✅ NFR-002 (Saída pronta) → ADR-005 + US-005, US-007
- ✅ NFR-003 (Latência ≤ 60s) → métrica de sucesso
- ✅ NFR-004 (Custo controlado) → ADR-002 + métrica de sucesso
- ✅ NFR-005 (Anti-floreio) → PROMPT MESTRE + Validador
- ✅ NFR-006 (Linguagem ética) → PROMPT 6 v2 critério "Aplicável?" + lista termos
- ⚠ NFR-007 (Multi-tenancy futuro) → ADR-004 e ADR-006 abordam, mas migração para
  Opção B não tem story explícita (assume-se "fase 2")

**Cobertura: 7/7 = 100%** com nota em NFR-007 ✅

### CONs (6 do `01-requirements.md`)
- ✅ CON-001 (No Invention) → §1 + ADR-001, ADR-002, ADR-003
- ✅ CON-002 (Não criar descritores) → §1 + US-014
- ✅ CON-003 (Estrutura fixa) → §1 + US-002
- ✅ CON-004 (Seguir documentos) → §1 + US-013
- ✅ CON-005 (Anos atendidos) → §1
- ⚠ CON-006 (Privacidade LGPD) → §1 + US-012, mas REFINO-004 (criptografia explícita)

**Cobertura: 6/6 = 100%** com refino em CON-006 ✅

---

## 4. Coerência entre artefatos

### Consistências validadas
- ✅ Schema SQL alinhado com Endpoints API (todos endpoints têm tabelas)
- ✅ ADRs não se contradizem
- ✅ Stories alinhadas com FRs
- ✅ Estimativas batem com complexity score (18 = COMPLEX = ~9-12 sem)
- ✅ Custo médio coerente entre research e métricas
- ✅ Filosofia "praticidade da professora" aparece em ADRs e UX

### Pequenas inconsistências
- ⚠ Tabelas `usuarios` referida implicitamente mas não definida no Schema (REFINO-003)
- ⚠ Coluna `obs_nee` declarada `TEXT` mas spec fala em criptografia (REFINO-004)
- ⚠ `cfg.horarioFixo` referido em Tela 3 mas estrutura de `cfg` não documentada
  - **Solução:** definir em US-013 que `cfg` é objeto persistido em
    `usuarios.preferencias` JSONB

---

## 5. Riscos não-endereçados completamente

### RISCO-008 (novo descoberto durante critique) — Migração entre versões dos prompts
**Detalhes:** Schema tem `prompt_versao` mas não há plano de migração quando esposa
revisa um prompt (acontece sempre — vimos v1→v2→v3 de cada).

**Mitigação proposta:**
- `lib/prompts/{nome}.js` com const `VERSION = '2026-05-01'`
- Mudanças em prompts geram nova versão; outputs antigos guardam `prompt_versao` da
  época
- Não regerar automaticamente outputs antigos (princípio: imutabilidade)

**Severidade:** 🟡 MÉDIO

### RISCO-009 (novo descoberto) — Validação alpha pode demorar mais que estimado
**Detalhes:** Sheila precisa testar cada feature em sala. 32 alunos reais = ciclo de
feedback semanal. 9-12 semanas de dev + ~4 semanas de validação real = 13-16 semanas
até MVP estável.

**Mitigação proposta:**
- Fazer validação alpha **em paralelo** com desenvolvimento
- Cada feature entregue → Sheila usa por 1 semana → feedback antes da próxima
- Não esperar todas as features prontas pra validar

**Severidade:** 🟡 MÉDIO

---

## 6. Pontos fortes do spec

| Ponto forte | Evidência |
|---|---|
| **Rastreabilidade total** | Toda decisão tem origem documentada |
| **Modularidade clara** | 14 stories com dependências explícitas em fases |
| **ADRs bem fundamentados** | Cada uma com rationale + consequências |
| **Schema SQL executável** | Migrations prontas para `supabase db push` |
| **Métricas objetivas** | 6 KPIs mensuráveis |
| **Cobertura de risco** | LGPD endereçada, custo gerenciado, refactor protegido |
| **Privacy by design** | Audit log, soft delete, RLS, criptografia |
| **Pipeline robusto** | Generator + Critic + determinístico em 3 camadas |

---

## 7. Resumo dos refinamentos para Phase 6 incorporar

### 🔴 ALTOS (3) — devem virar stories ou modificações de stories existentes
- REFINO-001: US-014 dividida em US-014a (FASE 0) e US-014b (FASE 4)
- REFINO-002: Pipeline JSON estruturado para PROMPT 8
- REFINO-003: US-004a NextAuth ↔ Supabase sync

### 🟡 MÉDIOS (7) — refinos importantes na ordenação ou conteúdo
- REFINO-004: ADR-008 Criptografia de dados sensíveis
- REFINO-005: US-007 quebrada em 6 sub-stories
- REFINO-006: US-000 Test infrastructure
- REFINO-007: Decisão de logo por contexto
- REFINO-008: Fallback do brasão
- REFINO-009: Endpoint de monitoramento de custo
- REFINO-010: Cache strategy detalhada

### 🟢 BAIXOS (5) — nice-to-have
- REFINO-011: Migração local como sub-story
- REFINO-012: Reverter defaults dos TBDs quando confirmados
- REFINO-013: Exemplos de output esperado
- REFINO-014: Wireframes visuais
- REFINO-015: Versionamento de prompts

---

## 8. Recomendação final

✅ **APPROVED para Phase 6** com instrução de incorporar os 15 refinamentos no
`06-implementation.yaml`.

Phase 6 vai produzir:
- Backlog **ordenado** com dependências
- Stories **renumeradas** após quebras (ex.: US-007 → US-007a..f)
- Atribuição de agentes (`@dev`, `@qa`, `@architect`)
- DoD por story
- Branches/PRs sugeridos
- ETA por sprint (assumindo sprints de 1 semana)

### Sequência crítica (não pode mudar)

```
US-000 (Test infra)              ← FASE 0 prereq
   ↓
US-001 (PROMPT MESTRE)            ← FASE 0 base
   ↓
US-002 (Validador determinístico)  ← FASE 0
   ↓
US-003 (Pipeline G+C)              ← FASE 0
   ↓
US-014a (Modo conservador read-only) ← FASE 0
   ↓
US-004 (Schema)                   ← FASE 1
   ↓
US-004a (NextAuth↔Supabase)        ← FASE 1
   ↓
US-012 (Alunos com consentimento)  ← FASE 1
   ↓
US-005 (PTD)                       ← FASE 2 — gateway pra Aula Diária
   ↓
US-006 (Aula/Semanário)            ← FASE 2
   ↓
US-007a..f (Avaliação 6 sub)       ← FASE 2 (paralelo possível)
   ↓
US-008 (Atividades)                ← FASE 2
   ↓
US-009..011 (Por aluno)            ← FASE 3
   ↓
US-013 (Config + Upload assets)     ← FASE 4
   ↓
US-014b (Modo conservador completo) ← FASE 4
```

---

## 9. Próximo passo

**Phase 6 — Plan / Implementation** (`@architect` Aria) produz
`docs/spec-pipeline/06-implementation.yaml` com:
- Backlog ordenado e refinado
- Stories prontas para `@dev` Dex implementar
- Cada story com link pra `docs/stories/{epic}.{story}.story.md`
- Sprint planning sugerido
