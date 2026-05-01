# 02 — Simulado AVALIA (SESI)

**Recebido em:** 2026-04-29
**Componentes:** Língua Portuguesa **+** Matemática (sempre os DOIS juntos)
**Anos típicos:** 2º e 3º do Ensino Fundamental
**Tipo de output:** Prova multidisciplinar + Gabarito + Gabarito Comentado + Análise Pedagógica
**Origem:** Prompt oficial que a esposa cola no ChatGPT pago

---

## 1. Prompt original (texto exato que ela usa)

```
PROMPT OFICIAL – SIMULADO AVALIA (SESI)

COPIE E COLE NO CLAUDE:

⸻

Elabore um SIMULADO AVALIA no padrão SESI, seguindo rigorosamente as orientações abaixo.

Não inventar conteúdos fora do material didático. Utilizar habilidades coerentes com os capítulos indicados.

⸻

📍 DADOS:

* Ano: [2º ou 3º ano do Ensino Fundamental]
* Componentes: Língua Portuguesa e Matemática
* Conteúdo: [Capítulos que já foram trabalhados – informar]
* Turma: 32 alunos (níveis heterogêneos)

⸻

📍 ESTRUTURA DA PROVA:

* Total: 24 questões
    * 12 de Língua Portuguesa
    * 12 de Matemática
* Formato:
    * Múltipla escolha
    * 4 alternativas (A, B, C, D)
    * Apenas 1 correta

⸻

📍 LÍNGUA PORTUGUESA – EXIGÊNCIAS:

* Textos curtos e adequados à faixa etária
* Trabalhar:
    * Leitura
    * Interpretação
    * Informações explícitas e implícitas
    * Inferência
    * Vocabulário
    * Gênero textual

⸻

📍 MATEMÁTICA – EXIGÊNCIAS:

* Situações-problema contextualizadas
* Trabalhar:
    * Adição e subtração (com e sem reserva)
    * Ideia de multiplicação (parcelas iguais)
    * Sequência numérica
    * Valor posicional
    * Sistema monetário
    * Leitura e interpretação de problemas

⸻

📍 DESCRITORES (OBRIGATÓRIO):

* Indicar o descritor Avalia em cada questão
* Garantir coerência com a habilidade trabalhada

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
* Organização por número de questões
* Texto adequado ao aluno

⸻

📍 APÓS A PROVA, GERAR:

✔ GABARITO:

* Número da questão + alternativa correta

⸻

✔ GABARITO COMENTADO:

* Explicação breve e objetiva
* Indicar:
    * Habilidade avaliada
    * Nível de proficiência

⸻

✔ ANÁLISE PEDAGÓGICA:

* Indicar:
    * O que a prova avalia
    * Habilidades priorizadas
    * Possíveis dificuldades dos alunos

⸻

📍 REGRAS FINAIS:

* Não inventar conteúdos
* Não fugir do nível do ano
* Não criar questões fora do contexto escolar
* Manter padrão Avalia/SARESP
* Linguagem pedagógica e objetiva

⸻

⚡ COMO USAR:

Exemplo:

👉 SIMULADO 2º ANO – CAPÍTULO 1 AO 4
👉 SIMULADO 3º ANO – FOCO AVALIA MATEMÁTICA

⸻

💡 Resultado esperado:
✔ Prova pronta
✔ Gabarito pronto
✔ Comentários pedagógicos
✔ Níveis de proficiência
✔ Alinhamento com Avalia
```

---

## 2. Como ela usa (a confirmar com a esposa)

> **PERGUNTAR:**
> - Manda o material didático junto (PDF/foto), ou descreve o conteúdo dos capítulos no texto?
> - O ChatGPT consegue gerar 24 questões coerentes de uma só vez ou ela precisa pedir em partes?
> - Quanto tempo leva para chegar no resultado final aceitável?
> - "Foco AVALIA Matemática" do exemplo — como ela ajusta a distribuição (12+12 vira algo diferente)?

---

## 3. O que ela faz com o output (a confirmar)

> **PERGUNTAR:**
> - Como entrega o simulado pros alunos? Imprime? Aplica online?
> - O cabeçalho padrão SESI tem brasão, código da escola, espaço pra nome do aluno? Tem template Word?
> - Como aplica os 4 documentos (prova + gabarito + comentado + análise)? Análise pedagógica é só pra ela e coordenação?
> - Já recebeu retorno do coordenador sobre os simulados gerados?

---

## 4. Análise estruturada

### Entradas (parametrizáveis)
- **Ano** — `2º` ou `3º` do EF (e provavelmente outros — confirmar)
- **Capítulos trabalhados** — texto livre ou múltipla seleção sobre material do projeto
- **Material didático** — anexo do conteúdo dos capítulos
- **Foco opcional** — ex.: "FOCO AVALIA MATEMÁTICA" altera distribuição padrão 12/12

### Restrições invariantes (vão pro system prompt SESI)
- **Sem invenção** fora do material didático (mesma regra do PTD)
- **Padrão Avalia/SARESP** — benchmark externo paulista, define estilo das questões
- **Descritores AVALIA por questão** — obrigatório, todo item rotulado
- **N1-N4 distribuídos equilibradamente** — não pode todas as questões serem do mesmo nível
- **Não fugir do nível do ano** — questão de 2º EF não pode exigir leitura de 5º EF
- **Contexto escolar** — situações-problema realistas para a faixa
- **Apenas 1 alternativa correta** — sem pegadinhas com múltiplas respostas

### Estrutura do output (4 documentos sequenciais)

#### Documento 1 — Prova (24 questões)
- Cabeçalho padrão SESI
- 12 questões LP + 12 Matemática (a menos que "FOCO" altere)
- Múltipla escolha A/B/C/D, 1 correta

#### Documento 2 — Gabarito
- Lista numerada: questão → alternativa correta

#### Documento 3 — Gabarito Comentado
- Por questão: explicação + habilidade avaliada + nível de proficiência

#### Documento 4 — Análise Pedagógica
- O que a prova avalia globalmente
- Habilidades priorizadas
- Possíveis dificuldades dos alunos

### Conteúdos esperados por componente

#### 📖 Língua Portuguesa
- Textos curtos adequados à faixa etária
- Leitura, interpretação
- Informações explícitas E implícitas (separação importante)
- Inferência, vocabulário, gênero textual

#### 🔢 Matemática
- Situações-problema contextualizadas (não exercício seco)
- Operações: adição/subtração com e sem reserva, multiplicação por parcelas iguais
- Numéricos: sequência numérica, valor posicional
- Aplicação: sistema monetário
- Transversal: leitura e interpretação de problemas

---

## 5. Mapeamento para o SESI Edu

### O que o app já atende (parcial)
- ✅ Aba "prova" gera prova com Claude
- ✅ Suporte a múltipla escolha 4 alternativas (já no app — confirmado em `pages/index.js:268`)
- ✅ Já gera gabarito após a prova
- ✅ Modal Projetos pode anexar capítulos

### Gaps confirmados
- ❌ **Modo "Simulado" multidisciplinar** não existe — hoje prova é por uma disciplina só
- ❌ Sem distribuição equilibrada por níveis de proficiência (N1-N4)
- ❌ Sem rotulagem de **Descritor AVALIA** por questão
- ❌ Sem **Análise Pedagógica** automática como output adicional
- ❌ Sem template "Cabeçalho padrão SESI" (precisa investigar se a escola exige Word específico)
- ❌ Não distingue entre "Gabarito" (curto) e "Gabarito Comentado" (longo)
- ❌ Composição "12 LP + 12 Mat" hardcoded não é parametrizável no app

### Decisões pendentes para Spec Pipeline
- **Simulado AVALIA** vira **modo da aba "prova"** (toggle "É simulado AVALIA") ou **aba nova**?
- 4 documentos viram **um Word com 4 seções** ou **4 arquivos baixáveis**?
- Distribuição N1-N4 é livre ("equilibrada") ou parametrizada (ex.: usuário escolhe 6/6/6/6)?
- Descritores AVALIA — temos uma base/lista oficial, ou Claude gera com base no material? **Investigar se SESI publica catálogo oficial de descritores**.
- Cabeçalho SESI — extrair de docs oficiais ou pedir template do colégio dela?

---

## 6. Padrões emergentes entre prompts (cross-prompt)

Comparando com `01-ptd-sesi.md`, ficam claras as **invariantes do DNA SESI** (vão pro `SESI_SYSTEM_PROMPT`):

| Invariante | PTD | Simulado | Conclusão |
|---|---|---|---|
| Não inventar — só material didático | ✅ | ✅ | **Invariante absoluta** — reforçar no system prompt e no UI |
| Descritores AVALIA | ✅ (seção própria, condicional LP/Mat) | ✅ (por questão) | Catálogo de descritores precisa ser conhecido pelo app |
| Níveis de Proficiência N1–N4 | ✅ (seção própria) | ✅ (rotulagem por questão) | Conceito precisa ser modelado |
| Inclusão / heterogeneidade | ✅ "3 de alta inclusão" | ✅ "níveis heterogêneos" | Sempre considerar |
| Linguagem profissional/pedagógica | ✅ | ✅ | Tom padrão SESI |
| Padrão Avalia/SARESP | implícito | explícito | Benchmark de qualidade |

### Variantes (vão pra prompts específicos por tipo)
- **Estrutura PTD** — 14 seções rígidas
- **Estrutura Simulado** — 24 questões + 4 documentos sequenciais
- **Conteúdos esperados** — listas específicas LP/Mat por tipo
- **Anos suportados** — Simulado limita 2º-3º EF; PTD genérico

---

## 7. Implicação arquitetural sugerida

Conforme acumulamos prompts, fica nítido que precisaremos de:

1. **Camada de "DNA SESI"** — system prompt central com invariantes (No Invention, AVALIA, N1-N4, inclusão)
2. **Camada de "Tipo de material"** — system prompt específico por tipo (PTD, Simulado, Prova comum, Atividade...)
3. **Camada de "Contexto do projeto"** — material didático anexado via `ProjetosModal`
4. **Camada de "Contexto da turma"** — `AlunosModal` injetando alunos com laudos

Hoje o app tem apenas (3) e (4) parciais. (1) e (2) precisam ser modelados.

> Não decidir isso agora — registrar para o Spec Pipeline ler.
