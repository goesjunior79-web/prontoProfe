# Feature 01 — Painel de Acompanhamento N1-N4

> **Não é um prompt LLM.** É uma **spec de feature/UI** — um painel de monitoramento.
> Recebido em 2026-04-29 da esposa em **3 partes**:
> - Parte A: objetivo do painel
> - Parte B: estrutura visual (cores) + rubrica de classificação observável
> - Parte C: **Intervenção pedagógica por nível** (a parte mais importante segundo ela)
>
> Categorizado fora de `app-prompts/` porque o painel em si é UI. Um **app-prompt
> auxiliar** ([`app-prompts/08-classificacao-niveis.md`](./app-prompts/08-classificacao-niveis.md))
> faz a classificação automática que **alimenta** o painel.

---

## 1. Spec original

### Parte A — Objetivo

```
PAINEL DE ACOMPANHAMENTO N1–N4

🎯 OBJETIVO

Monitorar rapidamente:

* Nível de proficiência (N1–N4)
* Evolução por habilidade
* Intervenção necessária

👉 Sem burocracia. Só o essencial.
```

### Parte B — Estrutura visual + critério de classificação

```
ESTRUTURA DO PAINEL (PLANILHA)
PADRÃO DE NÍVEL (CORES)

* 🔵 N1 – Abaixo do básico
* 🟢 N2 – Básico
* 🟡 N3 – Adequado
* 🔴 N4 – Avançado

👉 (Você pode usar cores na planilha para visualizar rápido)

CRITÉRIO SIMPLES DE CLASSIFICAÇÃO

🔵 N1
* Não realiza sozinho
* Não compreende a proposta
* Precisa de mediação total

🟢 N2
* Realiza com ajuda
* Compreensão parcial
* Erros frequentes

🟡 N3
* Realiza sozinho
* Compreende a proposta
* Pequenos erros

🔴 N4
* Autônomo
* Explica o que fez
* Resolve com estratégia
```

---

## 1B. Cores e rubrica observacional

### Cores oficiais por nível

| Nível | Cor | Hex sugerido (ajustar conforme palette do app) |
|---|---|---|
| N1 | 🔵 azul | `#0C447C` (já usado no app) |
| N2 | 🟢 verde | `#3B6D11` (já usado em FILE_ICONS) |
| N3 | 🟡 amarelo | `#BA7517` ou `#FFC700` |
| N4 | 🔴 vermelho | `#A32D2D` (já usado em FILE_ICONS) |

> **Observação:** convenção contra-intuitiva para quem espera "semáforo" (vermelho = ruim,
> verde = bom). Aqui **vermelho é N4 (avançado/melhor)** e azul é N1 (precisa apoio). Pode
> gerar fricção visual. Registrar para análise final.

### Rubrica observacional (5ª semântica do N1-N4)

Esta é a **descrição comportamental** do aluno em cada nível — usada pela professora
para **classificar manualmente** com base em observação direta:

| Nível | O aluno demonstra |
|---|---|
| **N1** | Não realiza sozinho · Não compreende a proposta · Precisa de mediação total |
| **N2** | Realiza com ajuda · Compreensão parcial · Erros frequentes |
| **N3** | Realiza sozinho · Compreende a proposta · Pequenos erros |
| **N4** | Autônomo · Explica o que fez · Resolve com estratégia |

> **Implicação pedagógica:** o nível **não é só** consequência de avaliações automáticas
> (PROMPT 2). A professora também classifica diretamente com base em **observação em
> sala**, usando esta rubrica simples. O painel consome AMBAS as fontes (avaliação
> automática + classificação observacional).

### Implicação na UI do painel
- A planilha (grade) usa cores de fundo para indicar nível de cada aluno por habilidade
- Ao clicar/abrir um aluno, mostra a rubrica como guia de auto-avaliação rápida
  ("o aluno está em qual estágio?")
- A professora **escolhe N1/N2/N3/N4** olhando a rubrica

---

## 1C. Campo INTERVENÇÃO (Parte C — "o mais importante" segundo a esposa)

Para cada nível detectado, **ação pedagógica prescrita** que aparece no painel ao lado
ou abaixo do indicador de nível:

| Nível | Intervenção sugerida |
|---|---|
| 🔵 **N1** | Atendimento individual + material concreto |
| 🟢 **N2** | Mediação dirigida + leitura guiada |
| 🟡 **N3** | Consolidação com prática |
| 🔴 **N4** | Desafio / atividade avançada |

> **Importância destacada pela esposa:** este é "**o mais importante**" do painel. Não
> basta saber em que nível o aluno está — o painel deve **mostrar imediatamente o que
> fazer**. O fluxo de uso é: olhar painel → ver alunos em N1/N2 → executar intervenção
> sugerida.

### Tipo de informação
Diferente das partes B (rótulo descritivo) e B-rubrica (descrição comportamental), a
parte C é **ação prescrita** — o que a professora faz. Não é mais uma "5ª semântica"
para N1-N4, é uma camada complementar de **prescrição** ao lado da **descrição**.

### Implicação na UI do painel
- Cada aluno classificado mostra: cor do nível + (no hover/click) intervenção sugerida
- Pode haver "Lista de intervenções do dia" agrupando alunos pela ação a executar
  ("hoje você precisa atender individualmente: João, Maria, Pedro")

---

## 1C. Campo Intervenção (parte C — "O MAIS IMPORTANTE")

A esposa enfatizou em 2026-04-29 que **esta é a parte mais importante do painel**: não
é apenas mostrar quem está em qual nível, é **prescrever o que fazer**.

### Mapeamento Nível → Intervenção pedagógica

```
Spec original (parte C):

Nível    Intervenção
N1       Atendimento individual + material concreto
N2       Mediação dirigida + leitura guiada
N3       Consolidação com prática
N4       Desafio / atividade avançada
```

### Tabela consolidada por nível

| Nível | Cor | Rubrica observacional (parte B) | **Intervenção pedagógica (parte C)** |
|---|---|---|---|
| N1 | 🔵 | Não realiza sozinho · Não compreende · Mediação total | **Atendimento individual + material concreto** |
| N2 | 🟢 | Realiza com ajuda · Compreensão parcial · Erros frequentes | **Mediação dirigida + leitura guiada** |
| N3 | 🟡 | Realiza sozinho · Compreende · Pequenos erros | **Consolidação com prática** |
| N4 | 🔴 | Autônomo · Explica · Resolve com estratégia | **Desafio / atividade avançada** |

### Implicação na UI
- Quando o painel mostra um aluno em N2 (verde), próximo ao nível deve aparecer
  **automaticamente a intervenção sugerida** ("Mediação dirigida + leitura guiada")
- Botão de ação: "Gerar atividade de [intervenção]" → conecta com Módulo 3 (atividades
  diferenciadas) ou Módulo 7 (aula diária)
- A intervenção é **prescritiva e curta** — não é texto longo, é uma direção clara

### Conexão com app-prompt 08
O [`app-prompts/08-classificacao-niveis.md`](./app-prompts/08-classificacao-niveis.md)
gera automaticamente: **Nível + Observação objetiva + Intervenção pedagógica**. O campo
"Intervenção" gerado pelo LLM deve **respeitar o mapeamento desta parte C** (não inventar
intervenções fora desse padrão institucional).

> Implicação técnica: o sistema pode ter **biblioteca interna de intervenções** mapeada
> 1:1 com os níveis. O LLM escolhe a intervenção do catálogo, não inventa.

---

## 2. Análise

### O que é
Uma **camada de visualização/monitoramento** sobre os dados pedagógicos do app. Não é
geração de documento — é leitura/interpretação dos dados acumulados.

### Os 3 pilares do painel

| Pilar | O que monitora | Provável fonte de dados |
|---|---|---|
| **Nível de proficiência (N1-N4)** | Em qual nível cada aluno está | Resultado das avaliações (Módulo 2) + observações (Módulo 4) |
| **Evolução por habilidade** | Curva temporal de progresso por habilidade | Histórico longitudinal (a construir, vide PROMPT 4) |
| **Intervenção necessária** | Quem precisa de apoio agora | Cruzamento de nível atual + tendência + alerta |

### Filosofia de design — "Sem burocracia. Só o essencial."
Diretiva estilística da esposa para a feature. Implica:
- Tela enxuta, alta densidade de informação
- Sem cliques desnecessários
- Provavelmente uma **grade ou lista** com indicadores visuais
- **Sem formulários** — é só leitura
- Gráficos simples (cor por nível? linha por aluno?)

---

## 3. Posicionamento na arquitetura do app

Adiciona uma **camada nova** ao desenho que vinha sendo discutido:

```
Antes (camadas de geração):
(1) DNA SESI + (2) Tipo material + (3) Projeto + (4) Turma → v1 → Corretor → v2 → docx

Agora (acrescentando observação):
                    ┌──────────────────┐
                    │  PAINEL N1-N4    │  ← leitura dos dados
                    │  (este feature)  │
                    └────────┬─────────┘
                             │
   ┌────────────┬────────────┴─────────────┬──────────────┐
   ▼            ▼                          ▼              ▼
 Avaliações  Observações       Evoluções/Histórico    Intervenções
 (Módulo 2)  (Módulo 4)        (longitudinal)         sugeridas
```

> O Painel **consome** os dados que os módulos 2 e 4 produzem, agregados pelo histórico
> longitudinal (PROMPT 4 sugere `historico: [{data, tipo, texto}]`).

---

## 4. Conexão com módulos já mapeados

| Módulo | O que entrega ao painel |
|---|---|
| **Módulo 2 (Avaliação)** | Nível N1-N4 por aluno por aplicação | Cada aluno tem uma trilha de níveis ao longo das avaliações |
| **Módulo 4 (Observação)** | Evidências qualitativas de evolução | Histórico de observações por aluno |
| **Módulo 5 (Relatório)** | Síntese da etapa por aluno | Pode ser consumido no painel como "resumo da etapa" |
| **Módulo 7 (Aula Diária)** | Avaliação formativa por aula | Dados granulares contínuos |
| **AlunosModal** | Cadastro com NEE | Filtros/grupos no painel |

---

## 5. Mapeamento ao SESI Edu

### O que existe hoje
- ❌ **Nenhum painel/dashboard de acompanhamento** existe
- ✅ Aba/página existente `pages/dashboard.js` é só **dashboard de uso do app** (quantos
  documentos gerados), não pedagógico
- ✅ `AlunosModal` lista alunos cadastrados com NEE — fonte parcial

### Gaps específicos (todos)
- ❌ Estrutura de armazenamento de **nível N1-N4 por aluno por habilidade no tempo**
- ❌ Modelagem de **habilidades** como entidades com IDs (hoje só texto livre)
- ❌ Pipeline que **alimenta** o painel a partir das avaliações (hoje resultado de avaliação
  fica no .docx, não em estrutura consultável)
- ❌ Tela do painel
- ❌ Lógica de "intervenção necessária" (regra: se 3 avaliações consecutivas em N1, alerta?)

### Implicação arquitetural pesada
Para o painel funcionar bem, **as avaliações precisam armazenar dados estruturados**
(não só .docx). Isso é uma **mudança grande** no app:
- Hoje: gera .docx → .docx baixado → ponto.
- Precisa: gera .docx + estrutura JSON salva (questões, descritores, níveis) → painel
  consulta JSON.

> Decisão para `@architect` na análise final: schema de persistência (Supabase já
> disponível em `lib/supabase.js`).

---

## 6. Pendências registradas (sem decisão agora)

1. **Por aluno individual ou turma agregada?** — provavelmente ambos
2. **Granularidade temporal:** etapa, ano, customizado?
3. **Catálogo de habilidades** — precisa estar codificado (não pode ser texto livre).
   Conecta com a pendência sobre **catálogo oficial de Descritores AVALIA**
4. **Definição de "intervenção necessária"** — regras de alerta? exemplos:
   - 3 avaliações em N1 consecutivas → alerta
   - Aluno não evoluiu em 30 dias na habilidade X → alerta
   - Aluno em N1 com laudo → prioridade visual
5. **Layout** — grade aluno×habilidade? linha do tempo? heatmap?
6. **Persistência** — Supabase ou localStorage?
7. **Atualização** — em tempo real ou batch?

---

## 7. Painel é MVP — resolvido em 2026-04-30

A esposa decidiu (Bloco A.3 + reforço explícito):
> **"Implementar desde a primeira versão (MVP). O sistema deve já prever estrutura de
> dados (persistência)."**

### Implicação arquitetural confirmada
- **Módulos 2 (Avaliação) e 4 (Observação) precisam persistência estruturada desde o
  começo** — JSON em Supabase, não só .docx
- Schema mínimo definido em `docs/specs/SCHEMA-DB.md` (tabela `avaliacoes` cobre o
  histórico longitudinal)
- Tela 7 do MVP é a UI desta feature (`docs/specs/TELAS-MVP.md`)

### Componentes da Tela 7 (consolidados pela esposa)
- Lista de alunos
- Marcação por nível (N1🔵 N2🟢 N3🟡 N4🔴)
- Campo observação (texto livre por aluno)
- Campo intervenção (do catálogo oficial — Parte C deste documento)

### Engine de classificação automática
[`app-prompts/08-classificador-alunos.md`](./app-prompts/08-classificador-alunos.md)
permanece como engine LLM opcional para popular níveis a partir do histórico longitudinal.
