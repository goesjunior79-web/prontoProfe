# App-prompt 04 — Observação de Aluno (v3 Final)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v3 — PROMPT FINAL** recebida em 2026-05-01 (substitui v2 mais extensa).
>
> Versão **enxuta** alinhada ao padrão das outras v3 finais. Mantém os 4 eixos do
> output e a regra de fechamento interativo. Confia no PROMPT MESTRE pra dar
> contexto ético.

---

## 1. Prompt original (v3 — Final)

```
Você é professora pedagoga.

Escreva observação pedagógica.

REGRAS:
- Começar com aspecto positivo
- Linguagem ética
- Sem julgamentos

INCLUIR:
- Desempenho
- Dificuldade
- Estratégia usada pela professora
- Resposta do aluno

FINAL:
Deseja sugestão de atividade para trabalhar com o aluno?

Gerar pronto.
```

---

## 2. Estrutura final do output

### 4 eixos obrigatórios (na ordem)
1. **Desempenho** — o que o aluno demonstra
2. **Dificuldade** — gap específico (singular — foco em uma por observação)
3. **Estratégia usada pela professora** — ação que ela já realizou (verbo passado)
4. **Resposta do aluno** — como o aluno reagiu à intervenção

### Regras (3 itens enxutos)
1. **Começar com aspecto positivo** (regra de ouro mantida)
2. **Linguagem ética** (sem rotular)
3. **Sem julgamentos** (descritivo, não avaliativo)

### Final obrigatório
> **"Deseja sugestão de atividade para trabalhar com o aluno?"**

Pergunta interativa fixa que aparece ao final de toda observação. Aciona o follow-up
para a Tela 5 (Atividades) já parametrizada.

---

## 3. Mudanças vs v2

### 🔻 Removidos da v3
- Header longo: "Você é uma professora pedagoga experiente" → simplificado para
  "Você é professora pedagoga"
- Bloco "ESTILO: Tom pedagógico / Clareza / Frases organizadas" — fica implícito
- "Texto objetivo" como regra explícita — fica implícito
- "Baseado em evidências" como regra explícita — fica implícito
- Lista de termos proibidos no prompt — mantida no DNA SESI / PROMPT MESTRE
- Especificação "Especialista em Ensino Fundamental 1" — fica no PROMPT MESTRE

### 🔧 Ajustes nominais (singulares)
- "Desempenho do aluno" → **"Desempenho"**
- "Dificuldades observadas" → **"Dificuldade"** (singular)
- "Estratégias utilizadas" → **"Estratégia usada pela professora"** (singular,
  destacando que é a professora quem age)
- "Resposta do aluno às intervenções" → **"Resposta do aluno"**

> **Interpretação:** o singular reforça **foco objetivo** — uma observação por vez,
> não diluir em listas longas. O LLM ainda pode descrever múltiplas se evidentes,
> mas o contrato é "uma coisa de cada".

### 🆕 Reforços
- **"Começar com aspecto positivo"** virou primeira regra (era diretriz auxiliar
  na v2)
- **"FINAL: Deseja sugestão de atividade..."** virou bloco próprio (era item de lista)

---

## 4. Lista de termos proibidos (mantida no DNA SESI / PROMPT MESTRE)

Ainda válida, codificada no validador determinístico:
```js
const TERMOS_PROIBIDOS = [
  'desinteressado',
  'lento',
  'atrasado',
  // + qualquer julgamento (verbos avaliativos sem evidência)
];
```

> Apesar de não estar mais no prompt v3, esses termos vêm do PROMPT MESTRE (seção
> "OBSERVAÇÃO E RELATÓRIO — REGRA DE OURO" / "EVITAR"). O validador
> determinístico bloqueia regenerando se aparecerem.

---

## 5. Implicação na Tela 6 (Observação)

Continua o fluxo:
```
Entrada:
  • Aluno: (nome do aluno)
  • Descrição: (texto livre da professora — evidência rápida)

Saída:
  • Observação pedagógica formal (4 eixos + final)

Botão de follow-up:
  [ 💡 Gerar atividade pra ajudar este aluno ]
     → encaminha pra Tela 5 já parametrizada com aluno + nível + dificuldade
```

---

## 6. Validador estrutural

| Item | Tipo |
|---|---|
| Abre com positivo (ou leveza) | LLM (heurística de tom) |
| 4 eixos presentes | Determinístico (palavras-chave) |
| Estratégia em verbo no passado | Determinístico (regex) |
| Termos proibidos ausentes | Determinístico (lista) |
| Pergunta interativa final | Determinístico (string match) |
| Não cita evidência inventada | LLM (PROMPT 6) |

---

## 7. Histórico evolutivo do PROMPT 4

| Versão | Data | Características |
|---|---|---|
| v1 | 2026-04-29 | "PROMPT 4 — OBSERVAÇÃO DE ALUNO". 4 eixos. Linguagem ética. Diretriz estrutural ainda implícita |
| v2 (refinada) | 2026-04-30 | Diretriz estrutural rica explicitada (positivo primeiro, estratégias realizadas, pergunta interativa final). Lista de termos proibidos oficializada |
| **v3 (Final)** | **2026-05-01** | **Definitiva.** Enxuta, 3 regras + 4 eixos + final fixo. Termos proibidos delegados ao PROMPT MESTRE. Singulares no schema |
