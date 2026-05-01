# Spec Pipeline — Artefatos por Fase

> Fluxo AIOX adaptado para o SESI Edu (sem `.aiox-core/` instalado).
> Iniciado em 2026-05-01 com handoff `@aiox-master` Orion → `@pm` Morgan.

---

## Fases do Spec Pipeline

| # | Fase | Agente | Output | Status |
|---|---|---|---|---|
| 1 | **Gather / Requirements** | @pm Morgan | `01-requirements.md` | ✅ 2026-05-01 |
| 2 | **Assess / Complexity** | @architect Aria | `02-complexity.md` | ✅ 2026-05-01 — Score 18 = COMPLEX |
| 3 | **Research** (se score ≥ 9) | @analyst Alex | `03-research.md` | ✅ 2026-05-01 |
| 4 | **Spec writing** | @pm Morgan | `04-spec.md` | ✅ 2026-05-01 |
| 5 | **Critique** | @qa Quinn | `05-critique.md` | ✅ 2026-05-01 — APPROVED 4.2/5 com 15 refinamentos |
| 6 | **Plan / Implementation** | @architect Aria | `06-implementation.yaml` | ✅ 2026-05-01 — 22 stories em 5 EPICs / 12 sprints |

---

## Documentos canônicos consultados (input do pipeline)

### Specs
- [`docs/specs/PROMPT-MESTRE.md`](../specs/PROMPT-MESTRE.md) — system prompt central
- [`docs/specs/REGRAS-FINAIS.md`](../specs/REGRAS-FINAIS.md) — 4 regras absolutas + princípio guia
- [`docs/specs/CHECKLIST-VALIDACAO.md`](../specs/CHECKLIST-VALIDACAO.md) — 18+ checks
- [`docs/specs/TELAS-MVP.md`](../specs/TELAS-MVP.md) — 7 telas
- [`docs/specs/SCHEMA-DB.md`](../specs/SCHEMA-DB.md) — 3 tabelas
- [`docs/specs/ATALHOS-USO.md`](../specs/ATALHOS-USO.md) — 7 botões com exemplos
- [`docs/specs/SPEC-OFICIAL-esposa.md`](../specs/SPEC-OFICIAL-esposa.md) — spec original
- [`docs/specs/GAP-ANALYSIS.md`](../specs/GAP-ANALYSIS.md) — comparação spec vs app

### Prompts
- [`docs/prompts-esposa/00-dna-sesi.md`](../prompts-esposa/00-dna-sesi.md) — DNA SESI
- [`docs/prompts-esposa/app-prompts/01-08*.md`](../prompts-esposa/app-prompts/) — 8 prompts em versão final

### Assets
- [`docs/assets-esposa/`](../assets-esposa/) — templates Word (Prova + PTD), 2 logos, imagem decorativa

---

## Notas de processo

- Projeto não tem `.aiox-core/` instalado. Pipeline é executado por `@aiox-master`
  (Orion) que pode executar qualquer task da framework sem precisar de subagentes
  reais.
- Cada fase produz markdown estruturado neste diretório.
- Quando a Phase 6 (implementation.yaml) terminar, deriva-se stories em
  `docs/stories/` para implementação por `@dev`.
