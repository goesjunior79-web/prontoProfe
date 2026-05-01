# Telas do App — MVP

> **Origem:** mensagem da esposa em 2026-04-30, identificada como "TELAS DO APP".
> Define o **wireframe canônico** das 7 telas do MVP do SESI Edu.

> Esse documento é a **fonte da verdade da UI**. O app atual (commit 7fa6607) tem
> abas diferentes — vai ser refatorado para casar com este wireframe.

---

## 1️⃣ Tela Inicial

```
┌────────────────────────────────────┐
│  ProntoProfe! / SESI Edu           │
├────────────────────────────────────┤
│                                    │
│  [ 📋 PTD                ]         │
│  [ 📅 Aula diária        ]         │
│  [ 📝 Avaliação          ]         │
│  [ ✏️ Atividades         ]         │
│  [ 👁  Observações       ]         │
│  [ 📄 Relatório de etapa ]         │
│  [ 📊 Painel N1-N4       ]         │
│                                    │
└────────────────────────────────────┘
```

**7 botões/cards** de entrada, um por funcionalidade. Ordem confirmada via "ATALHOS DE
USO" enviados em 2026-05-01.

**Filosofia da UX:** cada botão = comando pronto. Usuária só troca os 3 valores
(`ano`, `componente`, `capítulo`) e clica gerar. Ver `docs/specs/ATALHOS-USO.md`.

---

## 2️⃣ Tela PTD

### Entrada
- Ano
- Componente
- Capítulo

### Saída
- PTD completo (12 seções)
- **Botão: "Gerar aula semanal"** ← navega para a tela 3 já populada

> Conexão crítica: PTD → Aula diária. Confirma que **Aba 2 (Semanário) consome dados da
> Aba 1 (PTD)**.

---

## 3️⃣ Tela Aula Diária (Semanário)

### Entrada
- Capítulo
- **Horário semanal** (novo campo: ex. "segunda 2 aulas, terça 2 aulas, sexta 1 aula")

### Saída
- Semana completa organizada
- Aulas por dia (50 min cada)

> Quando vem da tela PTD via botão "Gerar aula semanal", os campos Capítulo já vêm
> pré-preenchidos. Só falta informar o horário.

---

## 4️⃣ Tela Avaliação (REFORMULADA 2026-05-01 — kit completo)

A esposa expandiu para um **kit de 6 instrumentos avaliativos** (não só "uma prova"):

```
┌────────────────────────────────────┐
│  📝 AVALIAÇÃO                       │
├────────────────────────────────────┤
│                                    │
│  [ 🔘 Avaliação do Capítulo ]       │
│  [ 🔘 Simulado AVALIA       ]       │
│  [ 🔘 Rubrica               ]       │
│  [ 🔘 Pauta de Observação   ]       │
│  [ 🔘 Plenária              ]       │
│  [ 🔘 Pauta de Leitura      ]       │
│                                    │
└────────────────────────────────────┘
```

### Sub-botão 1 — Avaliação do Capítulo
- Entrada: ano + componente + capítulo
- Saída: 10q (7 obj + 3 diss) + gabarito + nível por questão

### Sub-botão 2 — Simulado AVALIA
- Entrada: ano + componente + capítulo
- Saída: prova 100% MC + cartão-resposta + gabarito (resposta + descritor + nível)

### Sub-botão 3 — Rubrica
- Entrada: ano + componente + capítulo
- Saída: tabela "Critério × N1-N4" para qualquer atividade

### Sub-botão 4 — Pauta de Observação
- Entrada: ano + componente + capítulo + lista de alunos
- Saída: planilha estruturada por aluno (habilidade + nível + observação)

### Sub-botão 5 — Plenária
- Entrada: ano + componente + capítulo
- Saída: roteiro de discussão coletiva + espaço de registro

### Sub-botão 6 — Pauta de Leitura
- Entrada: ano + componente + capítulo
- Saída: planilha com classificação técnica (decodificação/fluência/compreensão)

> Detalhe completo de cada instrumento em
> [`app-prompts/02-avaliacao.md`](../prompts-esposa/app-prompts/02-avaliacao.md).

---

## 5️⃣ Tela Atividades

### Comportamento padrão
- 1 atividade principal (gerada automaticamente, alinhada ao PTD)

### Botão de expansão
- 👉 **"Gerar nova atividade conforme necessidade"**

> Mudança vs PROMPT 3 original (que sugeria múltiplas por nível): agora é **1 principal
> + sob demanda** quando a professora precisar mais.

---

## 6️⃣ Tela Observação

### Entrada
- Nome do aluno
- **Descrição rápida** (texto livre da professora)

### Saída
- **Texto pedagógico pronto** (estruturado, ético, baseado em evidências)

> Fluxo simples: ela digita uma observação rápida ("João hoje teve dificuldade na soma
> com reserva, ajudei mostrando material concreto e ele finalizou"), o app transforma em
> texto pedagógico formal pronto para diário ou relatório.

---

## 7️⃣ Tela Painel N1-N4

### Componentes
- **Lista de alunos** (da turma)
- **Marcação por nível** (N1🔵 N2🟢 N3🟡 N4🔴)
- **Campo observação** (texto livre por aluno)
- **Campo intervenção** (do catálogo oficial — Feature 01 parte C)

### Implementação
- MVP **obrigatório** (decisão da esposa em 2026-04-30)
- Persistência estruturada (3 tabelas — ver `SCHEMA-DB.md`)

---

## Mapeamento Telas × Módulos × App-prompts

| Tela | Módulo SPEC | App-prompts envolvidos |
|---|---|---|
| 1 | (nenhum — navegação) | — |
| 2 | Módulo 1 — PTD | `01-ptd.md` |
| 3 | Módulo 7 — Aula Diária + Semanário | `07-aula-diaria.md` |
| 4 | Módulo 2 — Avaliação | `02-avaliacao.md` (com 2 sub-modos) |
| 5 | Módulo 3 — Atividades | `03-atividades-complementares.md` |
| 6 | Módulo 4 — Observação | `04-observacao-aluno.md` |
| 7 | Feature 01 — Painel | `08-classificador-alunos.md` (engine LLM) |

## 8️⃣ Tela Relatório Final de Etapa (RESOLVIDO 2026-05-01)

A esposa confirmou no PROMPT MESTRE: Relatório é **módulo independente** (7º módulo),
com **tela própria** acessada da Tela Inicial.

### Entrada
- Aluno (selecionar do cadastro)
- Etapa (1ª, 2ª, 3ª, 4ª) — auto-detectado pela data
- (Opcional) Observações da etapa, se quiser revisar antes

### Saída
- Relatório de 1 página em terceira pessoa
- Assinatura: "Professora Sheila Goes" (configurável via `cfg.nomeProfessora`)
- Final positivo
- Pronto para Word (.docx)

### Fonte de dados
- Tabela `avaliacoes` (histórico longitudinal — `docs/specs/SCHEMA-DB.md`)
- Tabela `alunos`
- Filtro: aluno específico + período da etapa

---

## Implicação para o app atual (commit 7fa6607)

### Telas existentes hoje
- ✅ Aba "plano" → vira Tela 2 (PTD)
- ✅ Aba "prova" → vira Tela 4 (Avaliação) com seletor de tipo
- ✅ Aba "atividade" → vira Tela 5 (Atividades) — simplifica
- ✅ Modal Alunos → fonte da Tela 7 (Painel)
- ✅ Tela inicial → refatorar para 6 botões

### Telas a criar
- ❌ Tela 3 (Aula Diária / Semanário)
- ❌ Tela 6 (Observação)
- ❌ Tela 7 (Painel N1-N4) — mais complexa, exige persistência estruturada

### Componentes que provavelmente ficam fora do MVP
- Modal Projetos (atual): pode virar parte do fluxo de PTD (anexar capítulo)
- Modal Turma (correção de prova por foto): não é prioridade do MVP da esposa
- Modal Tutorial: pode permanecer
