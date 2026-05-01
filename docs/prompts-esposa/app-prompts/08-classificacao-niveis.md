# App-prompt 08 — Classificação Automática N1-N4

> **Versão final do prompt para uso programático no SESI Edu.**
> Recebido em 2026-04-29 da esposa, identificado como
> "PROMPT PARA GERAR AUTOMÁTICO (SEU APP)".
>
> **Não é módulo de documento.** É um **prompt de inferência/classificação** — alimenta
> o Painel de Acompanhamento ([`../feature-01-painel-acompanhamento.md`](../feature-01-painel-acompanhamento.md))
> automaticamente, com base nos dados dos alunos.

---

## 1. Prompt original (versão app)

```
Você é uma professora pedagoga especialista.

Analise as informações dos alunos e classifique cada um em níveis de proficiência:

🔵 N1 – abaixo do básico
🟢 N2 – básico
🟡 N3 – adequado
🔴 N4 – avançado

📌 Critérios:
- Autonomia
- Compreensão
- Necessidade de ajuda

📌 Gere:
- Nível do aluno
- Observação objetiva
- Intervenção pedagógica

📥 DADOS:
{dados_dos_alunos}

Entregue em formato de tabela simples.
```

---

## 2. Posicionamento — Classificador, não Gerador

Diferente dos PROMPTs 1-5 e 7 (geradores de documentos) e do PROMPT 6 (corretor),
este é um **classificador**:

| Tipo | O que faz | Quando roda | Output |
|---|---|---|---|
| Geradores (1-5, 7) | Cria documentos a partir de capítulo | Sob demanda da usuária | .docx |
| Corretor (6) | Audita/corrige output de gerador | Após cada geração | output v2 |
| **Classificador (8)** | **Classifica alunos em níveis** | **Quando alimenta o painel** | **Tabela estruturada** |

---

## 3. Critérios de classificação — versão condensada

A esposa apresentou **3 critérios** condensando a rubrica observacional da Feature 01
parte B (que tinha 9-12 indicadores):

| Critério | Mapeia para indicadores da rubrica |
|---|---|
| **Autonomia** | "Não realiza sozinho" / "Realiza com ajuda" / "Realiza sozinho" / "Autônomo" |
| **Compreensão** | "Não compreende" / "Compreensão parcial" / "Compreende" / "Explica o que fez" |
| **Necessidade de ajuda** | "Mediação total" / "Erros frequentes" / "Pequenos erros" / "Resolve com estratégia" |

Os 3 critérios são as **dimensões síntese** das observações da professora. O LLM analisa
os dados dos alunos cruzando essas 3 dimensões para chegar no nível.

---

## 4. Estrutura obrigatória do output

Tabela simples com **3 colunas por aluno**:

| Coluna | Conteúdo |
|---|---|
| **Nível** | N1, N2, N3 ou N4 (com cor opcional) |
| **Observação objetiva** | Texto curto descritivo do desempenho atual (linguagem ética) |
| **Intervenção pedagógica** | Conforme mapeamento da Feature 01 parte C |

Exemplo provável:

| Aluno | Nível | Observação | Intervenção |
|---|---|---|---|
| Ana Paula | 🟡 N3 | Realiza as atividades sozinha com pequenos erros de pontuação | Consolidação com prática |
| João Silva | 🔵 N1 | Precisa de mediação contínua para iniciar a leitura | Atendimento individual + material concreto |

---

## 5. Composição com outros prompts/regras

### A intervenção deve respeitar o catálogo da Feature 01 parte C
| Nível | Intervenção institucional (não inventar) |
|---|---|
| N1 | Atendimento individual + material concreto |
| N2 | Mediação dirigida + leitura guiada |
| N3 | Consolidação com prática |
| N4 | Desafio / atividade avançada |

> **Implicação técnica:** o app deve **forçar** que o LLM escolha intervenção desse
> catálogo. Pode ser feito com:
> - Reforço no system prompt: "use exatamente uma das 4 intervenções abaixo"
> - Validador determinístico pós-geração que descarta intervenções fora do catálogo

### A "Observação objetiva" deve seguir as regras do PROMPT 4
- Linguagem ética e profissional
- Texto objetivo
- Baseado em evidências
- Sem julgamentos

> Reuso: a parte "Observação objetiva" deste prompt é uma **versão curta** da observação
> longa do PROMPT 4 (Módulo 4). Pode ser implementada como **chamada separada** ao Módulo 4
> em modo "summary" ou como prompt unificado.

---

## 6. Placeholder

| Placeholder | Vem de | Forma |
|---|---|---|
| `{dados_dos_alunos}` | Cadastro `AlunosModal` + histórico longitudinal (proposto pelo PROMPT 4) | Texto formatado: lista de alunos com observações, avaliações recentes, NEEs, evidências |

> **Construir o `{dados_dos_alunos}`** é parte do trabalho do app — concatenar/estruturar
> os dados dos alunos da turma em texto consumível pelo LLM. Mesmo padrão do PROMPT 4
> (`{informacoes_do_aluno}`), mas plural (vários alunos de uma vez).

---

## 7. Frequência e gatilho

Não está definido no prompt. Possibilidades:
- **(a)** Manual: professora clica "Atualizar painel" quando quer
- **(b)** Automático: roda no fim de cada semana / após cada avaliação
- **(c)** Sob demanda: ao abrir o painel, recalcula

> Sem decisão agora — registrar para análise final.

---

## 8. Mapeamento ao SESI Edu

### O que existe hoje
- ✅ `AlunosModal` com lista de alunos cadastrados (`localStorage` `sesi_alunos`)
- ❌ Histórico longitudinal por aluno (proposto no PROMPT 4 — não implementado)
- ❌ Painel de visualização (proposto na Feature 01 — não implementado)
- ❌ Pipeline de classificação automática

### Construção
Para o app-prompt 08 funcionar:
1. **Schema de dados estruturados** — alunos + histórico + avaliações
2. **Função que monta `{dados_dos_alunos}`** — concatena dados em texto
3. **Endpoint de classificação** — chama Claude com este prompt
4. **Persistência do resultado** — para popular o painel
5. **UI do painel** — para visualizar (Feature 01)

---

## 9. Custo e batching

Se a turma tem 32 alunos e o prompt processa todos de uma vez (`{dados_dos_alunos}`
plural), uma chamada gera classificação para 32 alunos. Eficiente em custo.

Alternativa: **batching de N alunos por chamada** se o contexto ficar muito grande.
Decidir no Spec Pipeline.
