# App-prompt 08 — Painel N1-N4 / Classificador (v3 Final)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v3 — PROMPT FINAL** recebida em 2026-05-01 (substitui v1).
>
> Versão **enxuta** alinhada ao padrão das outras v3 finais. Engine LLM da Feature 01
> (Painel N1-N4 — Tela 7). Confia no PROMPT MESTRE pra dar contexto pedagógico, regras
> de intervenção (do catálogo Feature 01 parte C) e cores oficiais.

---

## 1. Prompt original (v3 — Final)

```
Você é professora especialista.

Classificar alunos:

N1 – abaixo do básico
N2 – básico
N3 – adequado
N4 – avançado

INCLUIR:
- Nome
- Nível
- Observação
- Intervenção

Gerar tabela.
```

---

## 2. Estrutura final do output

### Tabela com 4 colunas (uma linha por aluno)

| Coluna | Conteúdo |
|---|---|
| **Nome** | Nome do aluno |
| **Nível** | N1, N2, N3 ou N4 (rótulo "abaixo do básico" / "básico" / "adequado" / "avançado") |
| **Observação** | Texto curto descritivo do desempenho (linguagem ética, sem julgamentos) |
| **Intervenção** | Ação pedagógica do catálogo da Feature 01 parte C (não inventar) |

### Catálogo de intervenções (do PROMPT MESTRE / Feature 01 parte C)

| Nível | Intervenção fixa |
|---|---|
| N1 | Atendimento individual + material concreto |
| N2 | Mediação dirigida + leitura guiada |
| N3 | Consolidação com prática |
| N4 | Desafio / atividade avançada |

> O LLM **deve escolher exatamente** uma das 4 intervenções acima — não inventar nem
> parafrasear. Validador determinístico verifica match exato.

---

## 3. Mudanças vs v1

### 🔻 Removidos da v3
- Header longo: "Você é uma professora pedagoga especialista"
- Emojis coloridos (🔵🟢🟡🔴) das categorias — cores ainda existem no UI, vêm do PROMPT
  MESTRE / Feature 01 parte B
- Bloco "Critérios: Autonomia / Compreensão / Necessidade de ajuda" — fica implícito
  no PROMPT MESTRE
- Placeholder explícito `{dados_dos_alunos}` — delegado ao PROMPT MESTRE
- "Observação objetiva" → simplificado para "Observação"
- "Intervenção pedagógica" → simplificado para "Intervenção"

### 🔧 Mantido
- 4 níveis N1-N4 com semântica
- Tabela como formato de saída
- 4 colunas: Nome / Nível / Observação / Intervenção

---

## 4. Posicionamento — engine da Feature 01 (Painel)

```
┌─────────────────────────────────────┐
│  TELA 7 — PAINEL N1-N4              │
│  (UI de visualização)               │
└────────────────┬────────────────────┘
                 │ recebe dados de
                 ▼
┌─────────────────────────────────────┐
│  PROMPT 8 v3 (este)                 │
│  Classifica alunos em tabela        │
└────────────────┬────────────────────┘
                 │ usa fonte
                 ▼
┌─────────────────────────────────────┐
│  Tabela `avaliacoes` (Schema DB)    │
│  + `alunos`                         │
│  → histórico longitudinal por aluno │
└─────────────────────────────────────┘
```

A Feature 01 (Painel) é a tela. O PROMPT 8 é o motor LLM que **alimenta** a Tela 7 com
classificações automáticas. Os dados persistem na tabela `avaliacoes` do Supabase
(ver `docs/specs/SCHEMA-DB.md`).

---

## 5. Diretrizes herdadas do PROMPT MESTRE (não precisam estar neste prompt)

- **Não inventar** intervenções (usar catálogo)
- **Cores N1🔵 N2🟢 N3🟡 N4🔴** na visualização (modo padrão)
- **Modo "semáforo"** alternativo na UI (configurável)
- **Critérios de classificação** (Autonomia / Compreensão / Necessidade de ajuda)
- **Termos proibidos** na observação (desinteressado / lento / atrasado / julgamentos)

---

## 6. Validador estrutural

| Item | Tipo |
|---|---|
| Tabela presente com 4 colunas | Determinístico |
| Cada linha tem nome de aluno | Determinístico |
| Nível ∈ {N1, N2, N3, N4} | Determinístico |
| Intervenção ∈ catálogo da Feature 01 parte C | Determinístico |
| Observação sem termos proibidos | Determinístico (lista) |
| Observação alinhada com nível atribuído | LLM |
| Não invenção sobre o aluno | LLM (PROMPT 6) |

---

## 7. Histórico evolutivo do PROMPT 8

| Versão | Data | Características |
|---|---|---|
| v1 | 2026-04-29 | "PROMPT PARA GERAR AUTOMÁTICO". Header longo, critérios explícitos, emojis coloridos, placeholder `{dados_dos_alunos}` |
| **v3 (Final)** | **2026-05-01** | **Definitiva.** Enxuta. 4 níveis + 4 colunas. Critérios e cores delegados ao PROMPT MESTRE. (Não houve v2 separada — v3 sucede v1 diretamente) |
