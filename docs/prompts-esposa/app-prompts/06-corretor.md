# App-prompt 06 — Validador / Corretor (v2 Final)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v2 — PROMPT FINAL VALIDADOR** recebida em 2026-05-01 (substitui v1 "Corretor
> anti-erro do modelo").
>
> 🎯 **Não é um módulo de geração de documento.** É um **metaprompt** — roda DEPOIS de
> qualquer dos PROMPTs 1-5, 7, 8 para auditar e corrigir o output.
>
> Versão **enxuta** alinhada ao padrão das outras v3 finais.

---

## 1. Prompt original (v2 — Final)

```
Revisar conteúdo:

- Estrutura correta?
- Nada inventado?
- Linguagem pedagógica?
- Aplicável?

Se houver erro:
Corrigir automaticamente.

Não explicar.
Entregar versão final.
```

---

## 2. Os 4 critérios de validação

### Critério 1 — Estrutura correta?
**Cobre 3 itens da v1** (consolidados):
- Todas as seções obrigatórias presentes?
- A ordem foi respeitada?
- Algum título foi alterado?

Validador determinístico checa lista canônica de seções/títulos por tipo de documento
(PTD = 8 seções, Avaliação = depende do sub-botão, Aula = 8 blocos, etc.).

### Critério 2 — Nada inventado?
Reforça as REGRAS-FINAIS:
- Conteúdo só do material informado
- Descritores só do catálogo oficial
- Habilidades só da BNCC + capítulo

LLM check é forte aqui — ponto onde o validador determinístico não alcança.

### Critério 3 — Linguagem pedagógica?
- Tom formal, objetivo, ético
- Sem termos proibidos (lista do PROMPT MESTRE)
- Verbos no infinitivo onde aplicável
- Sem floreio / sem dramatização

### 🆕 Critério 4 — Aplicável?
**Novo na v2.** Reflete o princípio guia "praticidade da professora" do PROMPT MESTRE:

- Aula cabe em 50 minutos?
- Materiais acessíveis (existem na escola)?
- Linguagem adequada ao ano?
- Não-utópico (realista para 32 alunos heterogêneos)?
- Não sobrecarrega a professora?

> **Significado:** o corretor agora também faz "sanity check de viabilidade". Documento
> com estrutura e conteúdo certos mas inviável de aplicar (ex.: pede 5 materiais
> escassos, exige preparação de 3h pra 1 aula) é **rejeitado**.

---

## 3. Mudanças vs v1

### 🔻 Simplificações
- Header curto ("Revisar conteúdo:") — era "Revise o conteúdo gerado e verifique:"
- 5 perguntas → 4 (consolidou estrutura/ordem/títulos)
- Ações de correção: "Corrigir automaticamente" (era 3 itens)
- Saída: "Entregar versão final" (era "Versão final corrigida e validada")
- Diretrizes finais: 2 frases (era lista com emojis)

### 🆕 Adição importante
**Critério "Aplicável?"** — sanity check de viabilidade prática

### 🔧 Mantido
- Função: validador LLM pós-geração (Generator + Critic)
- Saída: documento corrigido **sem comentários**
- Padrão arquitetural: roda DEPOIS de qualquer outro prompt

---

## 4. Pipeline arquitetural (atualizado)

```
┌──────────────────────────┐
│  PROMPT 1-5, 7, 8        │
│  (gerador)               │ → v1 (rascunho)
└──────────────────────────┘
              │
              ▼
┌──────────────────────────┐
│  PROMPT 6 v2 (validador) │
│  4 critérios:            │
│  1. Estrutura correta?   │
│  2. Nada inventado?      │
│  3. Linguagem pedagógica?│
│  4. Aplicável? ← novo    │
└──────────────────────────┘ → v2 (auditado/corrigido)
              │
              ▼
┌──────────────────────────┐
│  Validador determinístico│
│  (CHECKLIST-VALIDACAO.md)│
│  18+ checks em 6 cat.    │
└──────────────────────────┘
              │
              ▼
       .docx final
```

---

## 5. Tradeoffs (continuam como v1)

| Aspecto | Validador determinístico | Validador LLM v2 (este) |
|---|---|---|
| Pega "seção faltando" | ✅ trivial | ✅ |
| Pega "ordem errada" | ✅ trivial | ✅ |
| Pega "conteúdo inventado" | ❌ heurística difícil | ✅ ponto forte |
| Pega "linguagem ruim" | ❌ heurística difícil | ✅ ponto forte |
| Pega **"aplicável?"** | ❌ impossível | ✅ exclusivo do LLM |
| Custo | ~zero | 2x tokens |

> O critério "Aplicável?" é **exclusivamente LLM** — não dá pra validar deterministicamente
> se "este plano de aula é viável em sala". Justifica o custo extra.

### Recomendação de implementação
Híbrido escalonado (Estratégia recomendada Orion):
1. Determinístico primeiro (rápido, barato) — checa estrutura
2. Se passou → LLM v2 (este) — checa conteúdo + viabilidade
3. Se falhar → regenera com PROMPT N original (max 3 retries)

---

## 6. Validador estrutural sobre o próprio validador

| Item | Como verificar |
|---|---|
| Output v2 não contém comentários | Determinístico — heurística (sem "Aqui está", "Para corrigir...", etc.) |
| Output v2 não contém explicações | Determinístico |
| Output v2 mantém estrutura do tipo de doc | Determinístico (re-aplicar checklist) |

Se o LLM v2 não respeitar "não explicar", regenerar com instrução adicional reforçando.

---

## 7. Histórico evolutivo do PROMPT 6

| Versão | Data | Características |
|---|---|---|
| v1 | 2026-04-29 | "PROMPT 6 — CORRETOR (ANTI-ERRO DO MODELO)". 5 critérios, ações detalhadas |
| **v2 (Final)** | **2026-05-01** | **Definitiva.** 4 critérios consolidados (estrutura/invenção/linguagem/**aplicável** — novo). Enxuto. Filosofia uniforme das outras v3 |
