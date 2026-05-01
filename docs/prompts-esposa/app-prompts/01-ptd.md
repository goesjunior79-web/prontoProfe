# App-prompt 01 — PTD (Versão Institucional Definitiva)

> **Versão final do prompt para uso programático no SESI Edu.**
> **v3 — Versão Institucional Definitiva** recebida em 2026-05-01 (substitui v2
> "Especialista" e v1 originais).
>
> Resolve o conflito spec (12 seções) vs template real (10 seções) que eu havia
> apontado. **A esposa optou por caminho enxuto** — versão refinada para **8 seções +
> cabeçalho**, não híbrida com as preciosidades do template antigo.

---

## 1. Prompt original (v3 — institucional definitivo)

```
Você é uma professora pedagoga especialista do SESI.

Elabore um PLANO DE TRABALHO DOCENTE seguindo EXATAMENTE a estrutura institucional.

REGRAS:
- Não inventar conteúdos
- Não alterar estrutura
- Linguagem pedagógica objetiva
- Objetivos e critérios no infinitivo
- Planejamento aplicável

OBRIGATÓRIO:
- Incluir COMPETÊNCIAS
- Incluir HABILIDADES

ESTRUTURA:

PLANO DE TRABALHO DOCENTE

Professor: Professora Sheila Goes
Componente Curricular: {componente}
Turma/Ano: {ano}
Vigência: {mês/2026}

COMPETÊNCIAS
HABILIDADES
CAPÍTULO DO MATERIAL

OBJETIVOS

EVIDÊNCIAS DE APRENDIZAGEM
- Instrumentos
- Critérios
(Incluir diagnóstica, formativa, somativa e autoavaliação)

AÇÕES A DESENVOLVER
- Atividades
- Estratégias (mediação da professora)
- Espaços
- Materiais
- Recursos

ALUNOS COM FLEXIBILIZAÇÃO
- Nome
- Estratégia
- Avaliação

PLANEJAMENTO INTEGRADO

Gerar completo.
```

---

## 2. Estrutura definitiva — 8 seções + cabeçalho

### Cabeçalho fixo (4 linhas)

| Campo | Valor |
|---|---|
| Professor | "Professora Sheila Goes" (literal — configurável via `cfg.nomeProfessora`) |
| Componente Curricular | `{componente}` |
| Turma/Ano | `{ano}` |
| Vigência | `{mês/2026}` (formato "março 2026") |

### 8 seções na ordem exata

| # | Seção | Sub-itens / Notas |
|---|---|---|
| 1 | COMPETÊNCIAS | obrigatório |
| 2 | HABILIDADES | obrigatório (com códigos BNCC quando aplicável) |
| 3 | **CAPÍTULO DO MATERIAL** | 🆕 nova seção explícita |
| 4 | OBJETIVOS | verbos no infinitivo |
| 5 | EVIDÊNCIAS DE APRENDIZAGEM | • Instrumentos • Critérios (incluir diagnóstica + formativa + somativa + **autoavaliação**) |
| 6 | AÇÕES A DESENVOLVER | • Atividades • Estratégias (mediação da professora) • Espaços • Materiais • Recursos |
| 7 | ALUNOS COM FLEXIBILIZAÇÃO | Para cada aluno: • Nome • Estratégia • Avaliação |
| 8 | PLANEJAMENTO INTEGRADO | (era "INTEGRAÇÕES" na spec antiga) |

---

## 3. Mudanças vs versões anteriores

### vs v1 (PROMPT 1 original 2026-04-29) — 14 seções
- **Removidas:** IDENTIFICAÇÃO (virou cabeçalho), DESCRITORES – AVALIA (não é mais
  seção própria), EXPECTATIVAS DE ENSINO E APRENDIZAGEM, ATIVIDADES DE APROFUNDAMENTO,
  TAREFAS PERSONALIZADAS / AVANÇAR, RECURSOS PEDAGÓGICOS (separada),
  DIFERENCIAÇÃO PEDAGÓGICA, NÍVEIS DE PROFICIÊNCIA
- **Renomeadas:** INTEGRAÇÃO → PLANEJAMENTO INTEGRADO; DIFERENCIAÇÃO PEDAGÓGICA →
  ALUNOS COM FLEXIBILIZAÇÃO
- **Adicionadas:** CAPÍTULO DO MATERIAL como seção própria
- **Combinadas:** EVIDÊNCIAS + INSTRUMENTOS + CRITÉRIOS numa só com 4 tipos de avaliação

### vs v2 ("Especialista" 2026-04-29) — 12 seções
- Removeu COMPETÊNCIAS como obrigatório? **Não**, na v3 está marcada como obrigatório
- Removeu DESCRITORES AVALIA como seção
- Removeu "DIFERENCIAL DE ESPECIALISTA" como bloco (mas mantém intencionalidade pedagógica
  como espírito)
- Adicionou autoavaliação às Evidências
- Detalhou AÇÕES com 5 sub-itens (antes estava só "AÇÕES A DESENVOLVER")

### vs Template real (`02b-template-word-sesi-plano.docx` analisado) — 10 seções
- **Não importou** as preciosidades do template real:
  - ❌ Estratégia de Avanço por Nível (N1→N2, N2→N3, N3→N4)
  - ❌ Inserção de Simulados Avalia+ (mini simulados semanais)
  - ❌ Estações de Aprendizagem com Complexidade Graduada (DUA)
  - ❌ Recursos Didáticos como seção própria (virou item dentro de Ações)
- **Importou:** PLANEJAMENTO INTEGRADO, FLEXIBILIZAÇÃO de estratégias com schema fixo

> 📝 **Decisão da esposa:** ela optou pelo **caminho enxuto** (a) — não híbrido (c) que
> Orion havia recomendado. As preciosidades do template real (Estratégia de Avanço,
> Mini Simulados, Estações Graduadas) **não vão ser geradas pelo app** automaticamente.
> Implicação: o app gera estrutura mais simples, e a esposa pode adicionar manualmente
> as preciosidades quando precisar (ou pedir via "Sob Demanda" se houver botão).

---

## 4. Novidades importantes nesta v3

### 🆕 4.1 CAPÍTULO DO MATERIAL como seção própria
Antes era implícito (`{capitulo}` parametrizava o prompt). Agora é **seção explícita**
do output, escrita na primeira página do PTD.

### 🆕 4.2 Autoavaliação como 4º tipo de evidência
A spec antes mencionava só "formativa + somativa". Agora são **4 tipos**:
1. Diagnóstica (no início)
2. Formativa (durante)
3. Somativa (ao final)
4. **Autoavaliação** (aluno reflete sobre próprio processo)

> **Implicação pra Módulo 2 (Avaliação):** quando o app gerar instrumentos avaliativos,
> deve oferecer também opção de **Autoavaliação** (não estava listada nos 6 sub-botões
> do PROMPT 2 v3 — pode virar 7º sub-botão ou ser parte da Pauta de Observação).

### 🆕 4.3 AÇÕES A DESENVOLVER com 5 sub-itens estruturados
Antes era só "AÇÕES A DESENVOLVER" texto livre. Agora são 5 categorias obrigatórias:
1. **Atividades** (o que fazer)
2. **Estratégias** (mediação da professora — como fazer)
3. **Espaços** (onde — sala, laboratório, biblioteca, externo)
4. **Materiais** (com o quê — concreto)
5. **Recursos** (apoio — Chromebooks, plataformas)

### 🆕 4.4 ALUNOS COM FLEXIBILIZAÇÃO com schema explícito
Para cada aluno laudado/com necessidade especial, o app gera:
- Nome
- Estratégia (que ela usa)
- Avaliação (como avaliar)

> Conecta com `AlunosModal` (cadastro de alunos com NEE). O app pode auto-popular esta
> seção a partir dos alunos da turma com `obs` preenchida.

### 🔻 4.5 DESCRITORES AVALIA não é mais seção própria
A v1 e v2 tinham "DESCRITORES – AVALIA (somente LP e Matemática)" como seção. Na v3
**sumiu**. Provável: descritores aparecem **dentro** de HABILIDADES ou EVIDÊNCIAS, não
isolados. Reduz redundância.

---

## 5. Placeholders interpolados pelo app

| Placeholder | Vem de | Validação |
|---|---|---|
| `{componente}` | Campo "Disciplina" em `DocumentFields.js:49` | Obrigatório |
| `{ano}` | Campo "Série" em `DocumentFields.js:48` | Obrigatório |
| `{mês/2026}` | Auto (pelo mês atual) ou campo configurável | Default: mês atual + 2026 |
| `{capitulo}` (implícito na seção CAPÍTULO DO MATERIAL) | Campo "Capítulo" | Obrigatório |

---

## 6. Validador estrutural

| Item | Tipo |
|---|---|
| **8 seções presentes** na ordem | Determinístico (lista de títulos) |
| **Verbos no infinitivo** em Objetivos | Determinístico (regex) |
| **5 sub-itens** em AÇÕES A DESENVOLVER | Determinístico |
| **4 tipos de avaliação** em EVIDÊNCIAS (diagnóstica/formativa/somativa/autoavaliação) | Determinístico (palavras-chave) |
| **Schema** Nome+Estratégia+Avaliação em FLEXIBILIZAÇÃO | Determinístico |
| Conteúdo do capítulo (não inventar) | LLM (PROMPT 6 — Corretor) |
| Linguagem pedagógica objetiva | LLM |

---

## 7. Mapeamento ao SESI Edu

### O que o app já tem
- ✅ Aba "plano" (`pages/index.js`) — vira a Tela PTD
- ✅ Campos: turma, série (=ano), disciplina (=componente), etapa, vigência
- ✅ Auto-preenchimento de alunos NEE via `useAlunosNEE` em `DocumentFields.js:5-22`
- ✅ Builder HTML do PTD em `lib/planoBuilder.js` (precisa refatorar lista de SECOES
  para casar com as 8 da v3)

### Gaps específicos
- ❌ Campo "Capítulo" (continuou pendente desde a v1)
- ❌ Campo "Mês/Ano" para vigência precisa formato `mês/2026` (hoje é texto livre)
- ❌ Lista `SECOES` em `planoBuilder.js:5-20` está com estrutura ANTIGA (UNIDADES,
  INSERÇÃO DE SIMULADOS, ESTRATÉGIA DE AVANÇO, etc) — precisa virar a v3 (8 seções)
- ❌ Schema 5 sub-itens em AÇÕES (Atividades/Estratégias/Espaços/Materiais/Recursos)
- ❌ Schema 3 sub-itens em FLEXIBILIZAÇÃO (Nome/Estratégia/Avaliação)
- ❌ Validador determinístico das 8 seções

### Refatoração crítica
`lib/planoBuilder.js:5-20` — atualizar lista `SECOES` para:

```js
const SECOES = [
  'COMPETÊNCIAS', 'COMPETENCIAS',
  'HABILIDADES',
  'CAPÍTULO DO MATERIAL', 'CAPITULO DO MATERIAL',
  'OBJETIVOS',
  'EVIDÊNCIAS DE APRENDIZAGEM', 'EVIDENCIAS DE APRENDIZAGEM',
  'AÇÕES A DESENVOLVER', 'ACOES A DESENVOLVER',
  'ALUNOS COM FLEXIBILIZAÇÃO', 'ALUNOS COM FLEXIBILIZACAO',
  'PLANEJAMENTO INTEGRADO',
];
```

(remover todas as seções antigas: HABILIDADES como única, UNIDADES DO MATERIAL, INSERÇÃO
DE SIMULADOS, ESTRATÉGIA DE AVANÇO, RECURSOS DIDÁTICOS isolada, FLEXIBILIZAÇÃO DE
ESTRATÉGIAS, OBSERVAÇÃO etc — não estão mais na v3)

---

## 8. Histórico evolutivo do PROMPT 1 (PTD)

| Versão | Data | Seções | Características |
|---|---|---|---|
| v1 | 2026-04-29 manhã | **14** | Versão completa do ChatGPT humano (com Recursos Pedagógicos, Diferenciação, Níveis de Proficiência) |
| v2 — Especialista | 2026-04-29 tarde | **12** | Spec inicial. Adicionou bloco "Diferencial de Especialista" e refinamentos |
| Template real (referência) | 2026-05-01 | **10** | Documento `.docx` que ela usa hoje. Incluía Estações Graduadas, Estratégia de Avanço, Mini Simulados, BNCC codes, Flexibilização |
| **v3 — Institucional** | **2026-05-01** | **8** | **Versão definitiva.** Enxugou ainda mais. Adicionou autoavaliação. Detalhou Ações com 5 sub-itens e Flexibilização com 3 sub-itens |
