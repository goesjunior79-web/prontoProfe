# App-prompt 07 — Aula Diária + Semanário (v3 Final)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v3 — PROMPT FINAL** recebida em 2026-05-01 (substitui v2 "Comando Ajustado" e v1).
>
> Enxugada vs versões anteriores. Estrutura mais open-ended, deixando o LLM inferir
> mais a partir do contexto + PROMPT MESTRE.

---

## 1. Prompt original (v3 — Final)

```
Você é professora do SESI.

Gere um SEMANÁRIO alinhado ao PTD.

REGRAS:
- Aula de 50 minutos
- Considerar horário semanal
- Progressão pedagógica
- Mediação obrigatória

PARA CADA AULA:

OBJETIVO (infinitivo)
HABILIDADE

INÍCIO
- Ativação de conhecimento prévio

DESENVOLVIMENTO
- Atividade do capítulo
- Mediação da professora
- Intervenção

DIFERENCIAÇÃO
- Apoio integral
- Apoio parcial
- Esperado
- Desafio

FECHAMENTO
- Sistematização

EVIDÊNCIA
AVALIAÇÃO FORMATIVA

Gerar semana completa.
```

---

## 2. Estrutura final (por aula)

| Bloco | Conteúdo |
|---|---|
| **OBJETIVO** | Verbo no infinitivo |
| **HABILIDADE** | Habilidade trabalhada |
| **INÍCIO** | Ativação de conhecimento prévio |
| **DESENVOLVIMENTO** | Atividade do capítulo + Mediação da professora + Intervenção |
| **DIFERENCIAÇÃO** | Apoio integral / Apoio parcial / Esperado / Desafio |
| **FECHAMENTO** | Sistematização |
| **EVIDÊNCIA** | (observável e clara) |
| **AVALIAÇÃO FORMATIVA** | (o que a professora observa) |

### Diretrizes universais (regras)
- Aula de **50 minutos** (fixo)
- Considerar **horário semanal** informado
- **Progressão pedagógica** ao longo da semana
- **Mediação obrigatória** (ênfase nova)

---

## 3. Mudanças vs v2 (Comando Ajustado)

### 🔻 Simplificações
- **INÍCIO:** v2 listava 6 elementos detalhados (leitura/fluência/inferência/explícitas/
  implícitas/vocabulário + perguntas orientadoras) → v3 reduz para um único: **"Ativação
  de conhecimento prévio"**
- **FECHAMENTO:** v2 tinha 3 elementos (retomada do objetivo + pergunta reflexiva +
  socialização) → v3 reduz para um: **"Sistematização"**
- **Tempos cronometrados** (10-15 / 25-30 / 5-10 min) saíram — virou só "50 min por aula"

### 🆕 Reforços
- "**Mediação obrigatória**" como diretriz universal (era implícita antes)
- "**Mediação da professora**" e "**Intervenção**" como itens explícitos do Desenvolvimento

### 🔧 Refinamento de termos N1-N4
- **N1: "Apoio integral"** ← confirma terminologia do PROMPT MESTRE (era "apoio
  intensivo" na v2)
- N2: "Apoio parcial" (mantido)
- N3: "Esperado" (mantido)
- N4: "Desafio" (mantido)

> Esta v3 alinha com a tabela canônica N1-N4 do DNA SESI.

### 🔻 Header simplificado
- v2: "Você é uma professora pedagoga especialista do SESI"
- v3: "Você é professora do SESI" (mais conciso)

---

## 4. Filosofia da v3 — open-ended

A v3 é **deliberadamente menos prescritiva**. Em vez de listar 6 sub-elementos pro
INÍCIO e 3 pro FECHAMENTO, a esposa confia que:
1. O **PROMPT MESTRE** dá contexto pedagógico geral (regras de ouro, perfil, N1-N4)
2. O **PTD ativo** orienta o que cada aula tem que cobrir
3. O **LLM** infere os detalhes adequados (ex.: "ativação de conhecimento prévio" pode
   ser leitura, vídeo, pergunta, dependendo do conteúdo)

> **Implicação:** o validador estrutural fica mais flexível. Em vez de checar "tem
> leitura no Início?", checa "tem 'Ativação' no Início?" (heurística mais simples).

---

## 5. Placeholders interpolados pelo app

| Placeholder | Vem de | Validação |
|---|---|---|
| `{ano}` | Campo "Série" | Obrigatório |
| `{componente}` | Campo "Disciplina" | Obrigatório |
| `{capitulo}` | Campo "Capítulo" | Obrigatório |
| `{horario_semanal}` | Campo de horário (pré-preenchido) | Obrigatório |

> Os placeholders não estão listados explicitamente nesta v3 (o prompt fica mais limpo)
> mas continuam sendo aplicados pelo PROMPT MESTRE que envolve este sub-prompt.

---

## 6. Histórico evolutivo

| Versão | Data | Tamanho | Características |
|---|---|---|---|
| v1 (Aula Diária) | 2026-04-29 | Médio | 1 aula isolada, ~30-45min, com Rotina de Início detalhada (5 itens) |
| v2 (Comando Ajustado) | 2026-04-30 | Grande | Ampliou para SEMANÁRIO. 50 min/aula, horário semanal, continuidade entre dias. Início detalhado (6 itens), Fechamento (3 itens). N1=apoio intensivo |
| **v3 (Final)** | **2026-05-01** | **Compacto** | **Versão definitiva.** Open-ended. Início e Fechamento simplificados. N1=apoio integral. Mediação reforçada |

---

## 7. Mapeamento ao SESI Edu

### O que existe hoje
- ✅ Aba "plano" (`pages/index.js`) — pode receber sub-fluxo Aula Diária via botão
  "Gerar aula semanal" do PTD
- ✅ Campo `vigencia` em `DocumentFields.js` — período do plano

### Gaps específicos
- ❌ Tela 2 dedicada — Semanário (não existe)
- ❌ Estrutura de dados que liga Semanário ao PTD ativo
- ❌ Campo `{horario_semanal}` — UI de captura
- ❌ Algoritmo de progressão semana a semana
- ❌ Validador 8 blocos por dia (Objetivo/Habilidade/Início/Desenvolvimento/Diferenciação/
  Fechamento/Evidência/Avaliação Formativa)
