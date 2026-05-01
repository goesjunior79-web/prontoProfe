# App-prompt 05 — Relatório Final de Etapa (v3 Final)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v3 — PROMPT FINAL** recebida em 2026-05-01 (substitui v2).
>
> Versão **enxuta** alinhada ao padrão das outras v3 finais. Schema reduzido de 5 para
> 4 eixos. Confia no PROMPT MESTRE pra dar contexto ético e diretrizes para família.

---

## 1. Prompt original (v3 — Final)

```
Você é professora pedagoga.

Gerar relatório final.

REGRAS:
- 1 página
- Terceira pessoa
- Linguagem acolhedora

INCLUIR:
- Desenvolvimento
- Avanços
- Dificuldades
- Estratégias

FINAL positivo

ASSINATURA:
Professora Sheila Goes

Gerar completo.
```

---

## 2. Estrutura final do output

### Cabeçalho/diretrizes (3 regras)
- **1 página** (limite rígido)
- **Terceira pessoa** ("a professora observou…", não "observei…")
- **Linguagem acolhedora** (tom familiar/afetivo, sem perder profissionalismo)

### 4 eixos obrigatórios (na ordem)
1. **Desenvolvimento** — visão geral do que o aluno desenvolveu na etapa
2. **Avanços** — vitórias específicas, mesmo pequenas (regra de ouro: sempre mencionar)
3. **Dificuldades** — gaps que ainda persistem (com tom propositivo, não derrotista)
4. **Estratégias** — o que a professora fez para apoiar (verbo no passado)

### Fechamento obrigatório
- **Final positivo** — última frase/parágrafo deve ter tom propositivo, indicar
  continuidade ou potencial

### Assinatura
- **"Professora Sheila Goes"** (configurável via `cfg.nomeProfessora` em
  `pages/index.js`)

---

## 3. Mudanças vs v2

### 🔻 Schema reduzido de 5 para 4 eixos
v2 tinha:
1. Desenvolvimento
2. Avanços
3. Dificuldades
4. Estratégias
5. **Considerações finais** ← removido na v3

A "Considerações finais" virou implícita no "**FINAL positivo**" — em vez de seção
própria, é orientação de fechamento.

### 🔻 Removidos da v3
- Header longo ("Você é uma professora pedagoga do Ensino Fundamental")
- Regras "Sempre mencionar evolução" + "Evitar termos negativos" — delegados ao PROMPT
  MESTRE (regras universais de Observação/Relatório)
- Bloco "ESTILO: Prosa / clareza / foco pedagógico" — fica implícito

### 🔧 Refinamento
- "Linguagem acolhedora" (v3) destaca a **dimensão familiar** específica do relatório
  — diferente da "objetividade" da Observação (interna)

### 🔧 Mantido
- Terceira pessoa
- 1 página
- Final positivo
- Assinatura "Professora Sheila Goes"

---

## 4. Validador estrutural

| Item | Tipo |
|---|---|
| Output em 1 página | Determinístico (limite de palavras/parágrafos) |
| Terceira pessoa | Determinístico (regex em pronomes/verbos) |
| 4 eixos presentes | Determinístico (palavras-chave) |
| Final positivo | LLM (heurística no último parágrafo) |
| Assinatura presente | Determinístico (string match no final) |
| Linguagem acolhedora | LLM (PROMPT 6) |
| Termos proibidos ausentes | Determinístico (lista do PROMPT MESTRE) |

---

## 5. Implicação na Tela de Relatório (Botão 6 dos atalhos)

Continua o fluxo já mapeado:
```
Entrada:
  • Aluno: (nome do aluno)
  • Informações: (texto livre — histórico/evidências da etapa)

Saída:
  • Relatório de 1 página em terceira pessoa
  • Assinatura: Professora Sheila Goes
  • Pronto para Word (.docx)
```

Fonte de dados: tabela `avaliacoes` (histórico longitudinal — `docs/specs/SCHEMA-DB.md`)
filtrada pelo aluno + período da etapa.

---

## 6. Diferença vs Módulo 4 (Observação)

| Aspecto | Observação (Módulo 4) | Relatório (Módulo 5) |
|---|---|---|
| Audiência | Interno (professora, coordenação) | **Família** |
| Tom | Ético + objetivo | **Acolhedor** |
| Schema | 4 eixos: Desempenho/Dificuldade/Estratégia/Resposta | 4 eixos: Desenvolvimento/Avanços/Dificuldades/Estratégias |
| Foco temporal | Pontual (uma situação) | **Etapa inteira** |
| Frequência | Várias por etapa | 1 por aluno por etapa |
| Pessoa narrativa | Objetiva (sem pessoa explícita) | **Terceira pessoa explícita** |
| Final | Pergunta interativa (sugestão de atividade) | **Final positivo** |
| Assinatura | (não exigida) | **Professora Sheila Goes** |
| Páginas | Variável (objetiva) | **1 página** |

---

## 7. Histórico evolutivo do PROMPT 5

| Versão | Data | Características |
|---|---|---|
| v1 | 2026-04-29 | "PROMPT 5 — RELATÓRIO FINAL". 5 eixos. Audiência família declarada |
| v2 | 2026-04-30 | Confirmações: 3ª pessoa + Sheila Goes + 1 página + termos negativos a evitar |
| **v3 (Final)** | **2026-05-01** | **Definitiva.** 3 regras + 4 eixos (sem "Considerações finais") + Final positivo + Assinatura Sheila Goes. Termos proibidos delegados ao PROMPT MESTRE |
