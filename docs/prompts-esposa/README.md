# Prompts da Esposa — Fonte da Verdade

Este diretório guarda os prompts que a esposa do Sidney (professora SESI) já usa no ChatGPT pago e
que ela considera **funcionais** — produzem output que ela aceita ou ajusta pouco.

## Por que isso é importante

Estes prompts são a **spec implícita** do produto. Antes de inventar features no SESI Edu,
nós portamos / adequamos o que ela já validou. Constitution AIOX, Artigo IV — **No Invention**.

## 📜 Documentos canônicos

### Princípios e Spec
- 📐 [**DNA SESI**](./00-dna-sesi.md) — invariantes cross-prompt, princípios e arquitetura
- 📋 [**SPEC OFICIAL da esposa**](../specs/SPEC-OFICIAL-esposa.md) — 5 módulos
- 🔒 [**REGRAS FINAIS**](../specs/REGRAS-FINAIS.md) — 4 regras absolutas do sistema
  (Não inventar conteúdo / Não criar descritores / Não alterar estrutura / Seguir documentos enviados)
- 🔍 [**GAP ANALYSIS**](../specs/GAP-ANALYSIS.md) — comparação rigorosa: spec vs app atual

### Validação e Implementação
- ✅ [**CHECKLIST DE VALIDAÇÃO**](../specs/CHECKLIST-VALIDACAO.md) — 18+ checks em 6 categorias
- 🖼 [**TELAS MVP**](../specs/TELAS-MVP.md) — wireframe canônico das 7 telas
- 🗄 [**SCHEMA DB**](../specs/SCHEMA-DB.md) — 3 tabelas mínimas (alunos, avaliacoes, planejamentos)

### Prompts e Assets
- 🤖 [**App-prompts**](./app-prompts/) — versões finais com placeholders
- 📦 [**Assets pendentes**](../assets-esposa/) — 6 documentos institucionais a receber

**Leitura obrigatória antes de qualquer feature pedagógica.**

## Três categorias de artefatos da esposa

| Categoria | Quem usa | Onde fica |
|---|---|---|
| **ChatGPT humano** (NN-tema.md) | A esposa, manualmente | `docs/prompts-esposa/` raiz |
| **App programático** (app-prompts/NN-tema.md) | O app, com placeholders | `docs/prompts-esposa/app-prompts/` |
| **Features/UI** (feature-NN-tema.md) | UI do app, não o LLM | `docs/prompts-esposa/` raiz |

A categoria "app-prompt" vira chamada ao Claude. A categoria "feature" vira tela/dashboard.
A categoria "ChatGPT humano" é referência histórica da evolução do produto.

## Features registradas

| # | Feature | Arquivo | Recebido |
|---|---|---|---|
| 01 | Painel de Acompanhamento N1-N4 | [feature-01-painel-acompanhamento.md](./feature-01-painel-acompanhamento.md) | ✅ 2026-04-29 |

## Status

| # | Prompt | Componente | Tipo | Recebido |
|---|--------|-----------|------|----------|
| 00 | [**DNA SESI**](./00-dna-sesi.md) | Cross-prompt | Princípios e invariantes | ♾ vivo |
| 01 | [PTD SESI](./01-ptd-sesi.md) | LP / Matemática | Plano de Trabalho Docente | ✅ 2026-04-29 |
| 02 | [Simulado AVALIA](./02-simulado-avalia.md) | LP **+** Matemática | Prova multidisciplinar (24 questões) | ✅ 2026-04-29 |
| 03 | [Avaliação (Prova)](./03-avaliacao-prova.md) | LP **ou** Matemática | Prova regular de capítulo (10 q., MC+abertas) | ✅ 2026-04-29 |

> Pendentes: atividade, plano de aula avulso, correção de redação, adaptação para alunos
> com laudos, plano de recuperação, e quaisquer outros que a esposa usar no ChatGPT.

## Trinca de provas (consolidada após o prompt #03)

| Modalidade | Quando usar | Estrutura |
|---|---|---|
| **Prova regular** (#03) | Fechamento de capítulo | 1 disciplina, ~10 q., MC + 1-2 abertas |
| **Simulado AVALIA** (#02) | Diagnóstico, preparação para Avalia/SARESP | LP+Mat, 24 q. MC, análise pedagógica |
| **Prova dissertativa** (parcial no app) | Produção textual com rubrica | Variável |

## Padrões emergentes (DNA SESI)

A partir dos prompts acumulados, fica visível um conjunto de **invariantes** comuns:

- **No Invention** — usar EXCLUSIVAMENTE o material didático
- **Descritores AVALIA** — sempre presentes (seção dedicada ou rotulagem por questão)
- **Níveis de Proficiência N1-N4** — modelo recorrente
- **Inclusão / heterogeneidade** — turma de 32 alunos, sempre considerar diversidade
- **Padrão Avalia/SARESP** — benchmark de qualidade
- **Linguagem profissional/pedagógica** — em prosa, sem jargão técnico

Detalhes em cada arquivo, seção 6/7 ("Padrões emergentes" / "Implicação arquitetural").

## Convenção de nome do arquivo

`NN-tema-curto.md` (ex.: `02-prova-objetiva.md`, `03-correcao-redacao.md`).

Cada arquivo deve conter:

1. **Prompt original** (texto exato que ela cola no ChatGPT, sem editar)
2. **Como ela usa** — passo a passo, em palavras dela se possível
3. **O que ela faz com o output** — copia, formata, reescreve, descarta partes? Onde está a dor?
4. **Análise estruturada** — entradas, restrições, estrutura do output, pontos invariantes vs. parametrizáveis
5. **Mapeamento para o SESI Edu** — o que do app atual atende? o que falta? feature nova ou ajuste?
