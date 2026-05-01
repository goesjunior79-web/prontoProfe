# Atalhos de Uso — UX da Tela Inicial

> **Origem:** mensagens da esposa em 2026-05-01: "COMO FUNCIONA (IDEIA SIMPLES)" + "ATALHOS
> PRONTOS". Define o paradigma de UX da Tela Inicial e dá exemplos concretos de cada
> botão.

---

## Filosofia de UX (regra de ouro do MVP)

> **Cada botão = um comando pronto. Você só clica (ou copia) e troca 3 coisas:**
> **• ano • componente • capítulo**

A esposa formalizou aqui a **filosofia de produto** do app: **mínimo input, máximo
output**. Cada botão da Tela Inicial leva a um formulário curtíssimo (3-4 campos),
populado automaticamente do contexto quando possível.

Isso casa com o princípio guia do PROMPT MESTRE:
**"Sempre pensar na PRATICIDADE da professora"**.

---

## Estrutura de cada Atalho

Cada botão da Tela Inicial corresponde a um "comando pronto" que tem:

```
GERAR [TIPO]

Ano: {ano}
Componente: {componente}
Capítulo: {capitulo}
[Outros campos quando necessário, ex: Horário semanal]

Tipo de saída: {tipo}
```

A usuária só troca os 3 valores e clica gerar. App injeta no PROMPT MESTRE.

---

## Atalhos recebidos (em ordem de envio)

### 🟥 Botão 1 — PTD

```
GERAR PTD

Ano: 3º ano
Componente: Matemática
Capítulo: Capítulo 5

Tipo de saída: PTD
```

**Campos:** ano, componente, capítulo
**Tipo de saída:** PTD

---

### 🟧 Botão 2 — Aula Semanal

```
GERAR AULA SEMANAL

Ano: 2º ano
Componente: Matemática
Capítulo: Capítulo 5
Horário semanal: seg 2, ter 2, qua 2, sex 1

Tipo de saída: Aula diária
```

**Campos:** ano, componente, capítulo, **horário semanal** (4º campo neste módulo)
**Tipo de saída:** Aula diária

> Confirma o formato do `{horario_semanal}`: texto livre estruturado tipo
> `seg 2, ter 2, qua 2, sex 1`. Quantidade de aulas por dia da semana.

---

### 🟨 Botão 3 — Avaliação

```
GERAR AVALIAÇÃO

Ano: 2º ano
Componente: Matemática
Capítulo: Capítulo 5

Tipo de saída: Avaliação do capítulo
```

**Campos:** ano, componente, capítulo
**Tipo de saída:** `Avaliação do capítulo`

> 🆕 **Detalhe importante:** o tipo de saída é **"Avaliação do capítulo"** (sub-modo
> capítulo, mix 7+3 objetiva/dissertativa). O sub-modo **"Simulado Avalia"** ainda não
> tem botão explicitado — pode vir como botão separado ou como toggle/seletor dentro da
> Tela Avaliação.

---

### 🟩 Botão 4 — Atividade

```
GERAR ATIVIDADE

Ano: 2º ano
Componente: Matemática
Capítulo: Capítulo 5

Tipo de saída: Atividade
```

**Campos:** ano, componente, capítulo
**Tipo de saída:** `Atividade` (singular — confirma "1 atividade principal", não múltiplas)

---

### 🟦 Botão 5 — Observação

```
GERAR OBSERVAÇÃO

Aluno: (nome)
Descrição: (o que aconteceu)

Tipo de saída: Observação
```

**Campos:** **aluno** (não tem ano/componente/capítulo!), **descrição** (texto livre)
**Tipo de saída:** `Observação`

> 🆕 **Padrão diferente:** primeiro botão da família "por aluno" (não "por capítulo").
> Não usa os 3 placeholders padrão (`{ano}, {componente}, {capitulo}`). Usa
> `{informacoes_do_aluno}` ou `{dados_dos_alunos}` (PROMPT 4 e 8 da família por aluno).
>
> A "Descrição" é o texto livre que a professora digita rapidinho ("João hoje teve
> dificuldade na soma com reserva, ajudei mostrando material concreto e ele finalizou")
> — o app transforma em observação pedagógica formal seguindo o PROMPT MESTRE
> (regra de ouro: positivo primeiro, estratégias realizadas, pergunta interativa final).

---

### 🟪 Botão 6 — Relatório Final

```
GERAR RELATÓRIO FINAL

Aluno: (nome)
Informações: (seu texto)

Tipo de saída: Relatório
```

**Campos:** aluno, **informações** (texto livre da professora)
**Tipo de saída:** `Relatório`

> ⚠ **Observação importante:** ela enviou Relatório como **Botão 6**, não como Botão 7.
> Isso reordena a Tela Inicial. Os 7 módulos do PROMPT MESTRE listavam Painel como 6º
> e Relatório como 7º. Pelos atalhos, **Relatório virou 6º e Painel ainda não tem
> atalho** — pode ser que Painel não seja um "atalho de geração" mas sim **uma tela
> diferente** (visualização, não geração).
>
> Faz sentido: o Painel não gera um documento como os outros — é uma tela de
> monitoramento/dashboard. Por isso pode não ter "comando pronto" igual aos outros.

---

### 🟫 Botão 7 — Painel N1-N4

```
GERAR PAINEL

Turma: (nomes ou dados)

Tipo de saída: Painel
```

**Campos:** **turma** (nomes ou dados dos alunos)
**Tipo de saída:** `Painel`

> 🆕 **Painel TEM atalho de geração** — não é só visualização. Recebe `{turma}` (nomes
> ou dados estruturados dos alunos) e gera a tabela classificatória (nível + observação
> + intervenção pra cada aluno). Conecta diretamente com o app-prompt 08
> (Classificador de alunos).

---

## Implicações para a UI do app

### Tela Inicial (atualização do `TELAS-MVP.md`)
- 7 botões/cards (já atualizado)
- Cada botão → leva à respectiva tela com **formulário curto** pré-formatado

### Cada tela específica
- **3-4 campos no máximo** (ano, componente, capítulo, +1 quando aplicável)
- Campos com **autopreenchimento** baseado no perfil da professora:
  - Ano padrão: o ano que ela leciona
  - Componente padrão: LP ou Mat
  - Capítulo: vazio (sempre digitar) ou pré-selecionar do projeto ativo
  - Horário semanal (Aula): pré-preenchido do perfil (`{quando necessário}`)
- Botão "Gerar" único, sem subtelas

### Output
- Documento gerado direto na tela
- Botões: "Baixar Word", "Editar", "Refazer"

---

## Conexão com o PROMPT MESTRE — TODOS OS 7 BOTÕES CONFIRMADOS

| Botão | `{tipo_de_saida}` | Família de campos |
|---|---|---|
| 1 — PTD | `PTD` | Por capítulo (ano + componente + capítulo) |
| 2 — Aula diária | `Aula diária` | Por capítulo + horário semanal |
| 3 — Avaliação | `Avaliação do capítulo` | Por capítulo |
| 4 — Atividade | `Atividade` | Por capítulo |
| 5 — Observação | `Observação` | Por aluno (aluno + descrição) |
| 6 — Relatório | `Relatório` | Por aluno (aluno + informações) |
| 7 — Painel | `Painel` | Por turma (nomes ou dados) |

### 3 famílias de placeholders identificadas

| Família | Campos | Botões |
|---|---|---|
| **Por capítulo** | ano + componente + capítulo (+ horário) | 1, 2, 3, 4 |
| **Por aluno** | nome do aluno + texto livre | 5, 6 |
| **Por turma** | dados dos alunos | 7 |

### Implementação simplificada

**Um único system prompt (PROMPT MESTRE) + 7 valores de `{tipo_de_saida}` + 3 conjuntos
de campos** = todo o sistema de geração do app.

---

## ⚠ Pendências menores que ficaram

1. **Sub-modo "Simulado Avalia"** não tem atalho próprio. O Botão 3 cobre só o sub-modo
   "Avaliação do capítulo". O Simulado pode ser:
   - Botão extra (8º) que ela ainda vai mandar
   - Toggle dentro da Tela Avaliação (o usuário escolhe o sub-modo após clicar no botão)
2. **Reordenação dos botões:** ela enviou Relatório como 6 e Painel como 7. O PROMPT
   MESTRE listava Painel=6 e Relatório=7. Vou usar a ordem dos atalhos como autoritativa:
   1. PTD / 2. Aula / 3. Avaliação / 4. Atividade / 5. Observação / 6. Relatório /
   7. Painel.
