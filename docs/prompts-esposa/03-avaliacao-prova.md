# 03 — Avaliação (Prova) SESI

**Recebido em:** 2026-04-29
**Componentes:** Língua Portuguesa **OU** Matemática (uma disciplina por vez — diferente do simulado)
**Anos típicos:** 2º e 3º do Ensino Fundamental
**Tipo de output:** Prova + Gabarito + Gabarito Comentado + Critérios de Avaliação
**Origem:** Prompt oficial que a esposa cola no ChatGPT pago

---

## 1. Prompt original (texto exato que ela usa)

```
PROMPT OFICIAL – AVALIAÇÃO (PROVA SESI)

COPIE E COLE NO CLAUDE:

⸻

Elabore uma AVALIAÇÃO (PROVA) no padrão SESI, seguindo rigorosamente as orientações abaixo.

Utilize EXCLUSIVAMENTE os conteúdos do capítulo indicado, sem inventar ou misturar conteúdos.

⸻

📍 DADOS:

* Componente Curricular: [Língua Portuguesa ou Matemática]
* Ano: [2º ou 3º ano do Ensino Fundamental]
* Capítulo: [Nome EXATO do capítulo]
* Turma: 32 alunos (considerar heterogeneidade e 3 alunos de alta inclusão)

⸻

📍 ESTRUTURA DA AVALIAÇÃO:

* Total: 10 questões (ou ajustar conforme necessidade)
* Formato:
    * Múltipla escolha (A, B, C, D)
    * Podendo incluir 1 ou 2 questões abertas (se pertinente ao capítulo)

⸻

📍 EXIGÊNCIAS POR COMPONENTE:

📖 Língua Portuguesa:

* Texto base (curto e adequado à faixa etária)
* Questões que envolvam:
    * Leitura e interpretação
    * Informações explícitas e implícitas
    * Inferência
    * Vocabulário
    * Gênero textual

⸻

🔢 Matemática:

* Situações-problema contextualizadas
* Trabalhar conforme o capítulo:
    * Adição e subtração
    * Ideia de multiplicação (se aplicável)
    * Sequência numérica
    * Valor posicional
    * Estratégias de resolução

⸻

📍 DESCRITORES (OBRIGATÓRIO PARA LP E MATEMÁTICA):

* Indicar o descritor Avalia em cada questão
* Garantir coerência com a habilidade

⸻

📍 NÍVEIS DE PROFICIÊNCIA:

Classificar cada questão:

* N1 – Abaixo do básico
* N2 – Básico
* N3 – Adequado
* N4 – Avançado

Distribuir de forma equilibrada

⸻

📍 FORMATAÇÃO:

* Cabeçalho padrão SESI
* Linguagem clara e objetiva
* Questões organizadas e numeradas
* Adequada para impressão

⸻

📍 APÓS A PROVA, GERAR:

✔ GABARITO:

* Número da questão + alternativa correta

⸻

✔ GABARITO COMENTADO:

* Explicação breve e objetiva
* Indicar habilidade e nível de proficiência

⸻

✔ CRITÉRIOS DE AVALIAÇÃO:

* Objetivos escritos no verbo infinitivo e diretos
* Sem repetição
* Alinhados ao capítulo

⸻

📍 REGRAS FINAIS:

* Não inventar conteúdos
* Não fugir do nível do ano
* Não misturar capítulos
* Linguagem pedagógica e objetiva
* Avaliação coerente com o que foi ensinado

⸻

⚡ COMO USAR:

👉 AVALIAÇÃO 2º ANO – MATEMÁTICA – CAPÍTULO 5
👉 AVALIAÇÃO 2º ANO – LÍNGUA PORTUGUESA – CAPÍTULO 4

⸻

💡 Opinião profissional direta:
Esse prompt garante:
✔ prova coerente com o capítulo
✔ alinhamento com Avalia
✔ nível adequado dos alunos
✔ facilidade na correção
```

---

## 2. Como ela usa (a confirmar com a esposa)

> **PERGUNTAR:**
> - "10 questões (ou ajustar)" — você costuma pedir mais/menos? Em que casos?
> - Quando inclui questões abertas, quantas em média e em quais capítulos faz mais sentido?
> - Manda o capítulo em PDF/foto ou descreve em texto?

---

## 3. O que ela faz com o output (a confirmar)

> **PERGUNTAR:**
> - Quanto tempo leva da geração até a versão final entregue aos alunos?
> - Faz revisão pedagógica? O que mais ajusta?
> - Imprime e aplica em sala? Tem template Word SESI específico?

---

## 4. Análise estruturada

### Entradas (parametrizáveis)
- **Componente** — `Língua Portuguesa | Matemática` (uma por vez)
- **Ano** — `2º` ou `3º` EF (mesma faixa do simulado)
- **Capítulo** — nome exato
- **Quantidade de questões** — default 10, ajustável
- **Inclui questões abertas?** — 0, 1 ou 2 (condicional ao capítulo)
- **Material didático** — anexo do capítulo

### Restrições invariantes (já mapeadas no DNA SESI)
- Sem invenção fora do material
- Não misturar capítulos
- Não fugir do nível do ano
- Linguagem pedagógica em prosa
- Padrão Avalia/SARESP implícito ("alinhamento com Avalia")

### Estrutura do output (3 documentos)

#### Documento 1 — Prova
- Cabeçalho padrão SESI
- ~10 questões numeradas
- Múltipla escolha A/B/C/D + opcionalmente 1-2 abertas
- Adequada para impressão (formatação preserva quebras)

#### Documento 2 — Gabarito
- Lista numerada: questão → alternativa correta
- (Para questões abertas: descrição da resposta esperada — confirmar)

#### Documento 3 — Gabarito Comentado
- Por questão: explicação + habilidade avaliada + nível de proficiência

#### Documento 4 — Critérios de Avaliação
- Verbos no infinitivo, frases diretas
- Sem repetição entre critérios
- Alinhados ao capítulo

---

## 5. Diferenças vs Simulado AVALIA (`02-simulado-avalia.md`)

| Aspecto | Simulado AVALIA (#02) | Avaliação/Prova (#03) |
|---|---|---|
| Componentes | LP **+** Mat juntos (multidisciplinar) | LP **OU** Mat (uma disciplina) |
| Total de questões | 24 fixas (12+12) | 10 (ou ajustar) |
| Formato | Apenas múltipla escolha | MC + opcionalmente 1-2 abertas |
| Output adicional | Análise Pedagógica | Critérios de Avaliação |
| Foco | Diagnóstico amplo, padrão Avalia/SARESP | Avaliação de capítulo específico |
| Quando usar | Avaliações periódicas, simulação Avalia | Avaliação rotineira de bimestre/etapa |

> **Insight:** "Critérios de Avaliação" do prompt #03 já é parecido com o campo `prova.criterios` que o app tem hoje (`pages/index.js:268`). Não é feature nova — é formalização de um campo existente em prosa estruturada.

---

## 6. Mapeamento para o SESI Edu

### O que o app já atende
- ✅ Aba "prova" gera prova com Claude
- ✅ Múltipla escolha A/B/C/D suportada
- ✅ Suporte a questões dissertativas (com variantes — bug fix recente em commit 7fa6607)
- ✅ Campo `qtd` parametrizável (10 questões default já é a média)
- ✅ Campo `criterios` existe na aba prova
- ✅ Geração de gabarito após a prova

### Gaps específicos deste prompt
- ❌ Suporte a **prova mista** (múltipla escolha + 1-2 abertas no mesmo arquivo) — hoje os tipos são lista exclusiva
- ❌ Sem rotulagem de **Descritor AVALIA** por questão
- ❌ Sem distribuição N1-N4 equilibrada
- ❌ Sem seção "Gabarito Comentado" detalhada (hoje é só lista de respostas)
- ❌ "Critérios de Avaliação" formatado em prosa estruturada com regras (verbos infinitivo, sem repetição) não é reforçado no prompt do app

---

## 7. Padrão emergente: "Trinca de provas SESI"

Vendo os 3 prompts, fica claro que a esposa precisa de **três modalidades de prova**, não de uma:

| Modalidade | Quando | Estrutura |
|---|---|---|
| **Avaliação (Prova) regular** — `#03` | Fechamento de capítulo | 1 disciplina, 10 q., MC+abertas, critérios |
| **Simulado AVALIA** — `#02` | Diagnóstico/preparação Avalia | LP+Mat, 24 q. MC, análise pedagógica |
| **Prova dissertativa** — já parcialmente no app | Questões abertas com rubrica | Variável, foco em produção textual |

> O app hoje tem **uma aba "prova" genérica**. Pode-se modelar como **um modo + parâmetros** (modalidade=regular|simulado, mistura tipos) ou como **3 abas separadas**. Decisão pra Spec Pipeline.

---

## 8. Conteúdos LP/Mat — agora consolidados (cross-prompts)

Comparando o que LP e Mat exigem nos 3 prompts:

### 📖 LP — invariantes em todos os prompts
- Textos curtos adequados à faixa
- Leitura e interpretação
- Informações explícitas E implícitas
- Inferência
- Vocabulário
- Gênero textual

### 🔢 Mat — invariantes em todos os prompts
- Situações-problema contextualizadas
- Adição e subtração (com/sem reserva)
- Ideia de multiplicação (parcelas iguais)
- Sequência numérica
- Valor posicional
- Estratégias de resolução
- Sistema monetário (aparece no simulado, não no #03 — talvez condicional ao capítulo)

> **Sugestão arquitetural:** essas listas viram **bibliotecas de habilidades por disciplina/faixa** no app — o usuário marca quais o capítulo trabalha em vez de digitar texto livre. Reduz erro e padroniza output.
