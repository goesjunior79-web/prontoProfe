# App-prompt 03 — Atividade (v3 Final)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v3 — PROMPT FINAL** recebida em 2026-05-01 (substitui v1/v2 com diferenciação
> embutida).
>
> Versão **enxuta** alinhada ao padrão das outras v3 finais (PTD, Aula, Avaliação).
> Confirma definitivamente a separação: **1 atividade principal** + **diferenciação
> sob demanda** (separada do prompt principal).

---

## 1. Prompt original (v3 — Final)

```
Você é professora do SESI.

Gerar atividade alinhada ao capítulo.

INCLUIR:
- Objetivo
- Habilidade
- Enunciado claro
- Contexto real

REGRAS:
- Base no material didático
- Não atividade solta
- Linguagem adequada ao ano

OBS:
Diferenciação será solicitada separadamente.

Gerar pronta para sala.
```

---

## 2. Schema final do output (4 itens)

| # | Item | Notas |
|---|---|---|
| 1 | **Objetivo** | Verbo no infinitivo |
| 2 | **Habilidade** | Habilidade trabalhada (BNCC quando aplicável) |
| 3 | **Enunciado claro** | Texto da atividade (pra o aluno) |
| 4 | **Contexto real** | Situação contextualizada (não exercício seco) |

> **Mudança vs v1/v2:** o "Descrição" virou **"Enunciado claro" + "Contexto real"**
> separados. Reforça que toda atividade precisa de **enunciado próprio** + **contexto**
> aplicável à realidade do aluno.

---

## 3. Regras (3 itens)

1. **Base no material didático** (No Invention reforçado)
2. **Não atividade solta** (sempre com contexto/intencionalidade)
3. **Linguagem adequada ao ano** (nova ênfase — adaptar registro à faixa etária)

---

## 4. ⭐ Decisão importante explicitada

> **"OBS: Diferenciação será solicitada separadamente."**

Isso **confirma definitivamente** o que vinha sendo discutido:

- Geração padrão: **1 atividade principal genérica** alinhada ao PTD/capítulo
- Sem variantes automáticas N1-N4
- A diferenciação por nível é um **pedido SEPARADO** que a usuária faz quando precisa:
  - "Gerar versão pra N1 (apoio integral)"
  - "Gerar versão pra N4 (desafio)"
  - "Adaptar para aluno X (laudo Y)"

**Implementação na Tela 5 (Atividades):**
- Default: 1 atividade principal
- Botão: "Gerar nova atividade conforme necessidade" — abre seletor de variante
  (qual nível? qual aluno? qual foco?)

Histórico de interpretações:
- 2026-04-30 (Bloco A.4): "1 principal + sob demanda" — primeira menção
- 2026-04-30 (Bloco A.6 ambíguo): "Sim" — interpretado erroneamente como "sim, 4 versões"
- 2026-05-01 (PROMPT MESTRE): "Não separar por nível automaticamente" — confirmou texto
- **2026-05-01 (v3 atual): "Diferenciação será solicitada separadamente"** — explícito

---

## 5. Mudanças vs v1/v2

### 🔻 Removidos da v3
- Detalhamento da diferenciação N1-N4 dentro do prompt (saiu pra fluxo separado)
- Lista de níveis com semântica (apoio intensivo / parcial / esperado / avançado)
- "Intencionalidade pedagógica explícita" como item separado (fica implícito)
- Header longo "professora pedagoga especialista em metodologias ativas"

### 🆕 Adicionados / refinados
- "Enunciado claro" + "Contexto real" como itens separados (era "Descrição" único)
- "Linguagem adequada ao ano" como regra
- "OBS: Diferenciação será solicitada separadamente" — explícito

### 🔧 Mantido
- Não inventar / base no material didático
- Atividade contextualizada (não solta)
- Schema com Objetivo + Habilidade
- Output "pronto para sala"

---

## 6. Placeholders interpolados pelo app

| Placeholder | Vem de | Validação |
|---|---|---|
| `{ano}` | Campo "Série" | Obrigatório |
| `{componente}` | Campo "Disciplina" | Obrigatório |
| `{capitulo}` | Campo "Capítulo" | Obrigatório |

(Não listados explicitamente na v3 — delegados ao PROMPT MESTRE)

---

## 7. Validador estrutural

| Item | Tipo |
|---|---|
| 4 itens presentes (Objetivo / Habilidade / Enunciado / Contexto) | Determinístico |
| Verbo no infinitivo no Objetivo | Determinístico (regex) |
| Conteúdo do material (não inventar) | LLM (PROMPT 6) |
| Linguagem adequada ao ano | LLM |
| Contextualização (não solta) | Heurística — output cita situação realista |

---

## 8. Tela 5 (Atividades) — fluxo final no MVP

```
[Tela 5 — Atividades]

  Ano: ____  Componente: ____  Capítulo: ____

  [ Gerar atividade principal ]    ← gera 1 atividade default

  ─── output exibido ───
  • Objetivo: ...
  • Habilidade: ...
  • Enunciado: ...
  • Contexto: ...

  [ Gerar nova atividade conforme necessidade ▼ ]
       ├─ Para nível N1 (apoio integral)
       ├─ Para nível N2 (apoio parcial)
       ├─ Para nível N3 (esperado)
       ├─ Para nível N4 (desafio)
       ├─ Adaptada para aluno [select]
       └─ Outro foco / nova proposta
```

Cada variante reaciona o LLM com prompt adicional especificando o pedido.

---

## 9. Histórico evolutivo do PROMPT 3

| Versão | Data | Características |
|---|---|---|
| v1 (Atividades Complementares) | 2026-04-29 | Diferenciação N1-N4 obrigatória **dentro** do prompt + semântica nomeada |
| v2 (interpretação ambígua) | 2026-04-30 | "Sim" da pergunta A.6 interpretado como "1 principal × 4 versões" |
| v2 (corrigida 2026-05-01 manhã) | 2026-05-01 | PROMPT MESTRE: "Não separar por nível automaticamente" |
| **v3 (Final)** | **2026-05-01** | **Definitiva.** Diferenciação **explicitamente separada do prompt** ("solicitada separadamente"). Schema 4 itens (Objetivo/Habilidade/Enunciado/Contexto) |
