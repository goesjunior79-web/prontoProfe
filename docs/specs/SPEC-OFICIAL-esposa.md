# SPEC OFICIAL — Aplicativo Padronização Pedagógica (SESI)

> **Origem:** documento oficial da esposa do Sidney (professora SESI dos anos iniciais).
> **Recebido em:** 2026-04-29.
> **Status:** este é o **norte do produto**. Qualquer feature pedagógica daqui pra frente
> deve estar mapeada nesta spec ou validada com a esposa antes.

---

## 1. Objetivo do Sistema

Criar um sistema que gere automaticamente, **sem retrabalho**, os seguintes documentos
pedagógicos no padrão SESI:

- **PTD** (Plano de Trabalho Docente)
- **Avaliações** (modelo Avalia)
- **Atividades complementares** (a partir do material didático)
- **Observações de alunos** (diário e relatórios)
- **Relatórios finais de etapa**

O sistema deve garantir:

- Estrutura fixa (não pode alterar)
- Linguagem pedagógica clara, objetiva e ética
- Fidelidade ao material didático
- Pronto para exportação em Word (.docx)

---

## 2. Entradas do usuário

### 📚 Conteúdo base
- Nome do componente (LP ou Matemática)
- Ano escolar (2º, 3º, 4º ano)
- Capítulo (nome exato)

### 📎 Formato do capítulo
- Texto digitado
- PDF
- Foto
- Ou apenas o nome do capítulo

### ⚠️ Regra crítica
> Se não houver conteúdo completo, usar o nome do capítulo como referência **sem inventar
> conteúdo**.

---

## 3. Módulos do Sistema

### 🔹 Módulo 1 — PTD

Estrutura obrigatória (NÃO ALTERAR):

1. IDENTIFICAÇÃO
2. COMPETÊNCIAS
3. HABILIDADES
4. DESCRITORES – AVALIA (somente LP e Matemática)
5. EXPECTATIVAS DE ENSINO E APRENDIZAGEM
6. OBJETIVOS DE APRENDIZAGEM
7. AÇÕES A DESENVOLVER
8. EVIDÊNCIAS DE APRENDIZAGEM
9. INSTRUMENTOS E CRITÉRIOS DE AVALIAÇÃO
10. INTEGRAÇÕES
11. ATIVIDADES DE APROFUNDAMENTO
12. TAREFAS PERSONALIZADAS / AVANÇAR

Regras:
- Não mudar títulos
- Objetivos sempre com verbo no infinitivo
- Incluir avaliação formativa e somativa
- Descrever apenas 1 atividade principal do capítulo
- Considerar turma com 32 alunos (heterogênea)

---

### 🔹 Módulo 2 — Avaliações

Padrão Avalia SESI:
- 24 questões (12 LP + 12 Matemática) ou conforme solicitado
- Múltipla escolha (A–D)
- Com descritores (D01, D02…)
- Gabarito comentado
- Classificação por nível N1, N2, N3, N4

Formato:
- Cabeçalho padrão
- **Cartão-resposta**
- Pronto para impressão

---

### 🔹 Módulo 3 — Atividades Complementares

- Baseadas no capítulo
- **Diferenciadas por nível (N1–N4)**
- Contextualizadas (modelo SESI)
- Com intencionalidade pedagógica clara

---

### 🔹 Módulo 4 — Observações de Alunos

Gerar registros para:
- Diário de classe
- Avaliação formativa
- Devolutivas pedagógicas

Regras:
- Linguagem ética
- Objetiva
- Baseada em evidências
- Sem termos inadequados (julgamentos)

---

### 🔹 Módulo 5 — Relatórios de Final de Etapa

- Linguagem acolhedora e profissional
- Evolução do aluno
- Dificuldades pedagógicas
- Estratégias utilizadas
- Indicação de continuidade

Regras específicas:
- Sempre mencionar evolução
- Finalizar com aspecto positivo
- Linguagem clara para família

---

## 4. Regras Gerais do Sistema

### 🔒 Regra 1 — Proibido inventar
- Não criar habilidades fora do material
- Não inventar conteúdos
- Não misturar capítulos

### 🔒 Regra 2 — Estrutura fixa
- Não alterar títulos
- Não reorganizar ordem
- Não omitir seções

### 🔒 Regra 3 — Padrão pedagógico
- Linguagem clara e objetiva
- Escrita formal pedagógica
- Coerência com BNCC e Avalia

### 🔒 Regra 4 — Redução de retrabalho
O sistema deve entregar:
- Texto pronto
- Organizado
- Sem necessidade de edição manual

---

## 5. Formato de Saída

### 📄 Exportação
- Word (.docx)
- Fonte Arial
- Tamanho 12 (texto)
- Títulos destacados
- Formato A4

### 🎯 Layout
- Pronto para impressão
- Sem necessidade de ajustes

---

## 6. Fluxo do Usuário

1. Usuário escolhe tipo de documento (PTD, avaliação, etc.)
2. Informa: ano, componente, capítulo
3. (Opcional) envia PDF ou foto
4. Sistema gera automaticamente: documento completo no padrão correto

---

## Documentos relacionados

- [`00-dna-sesi.md`](../prompts-esposa/00-dna-sesi.md) — invariantes cross-prompt e arquitetura proposta
- [`GAP-ANALYSIS.md`](./GAP-ANALYSIS.md) — comparação módulo por módulo entre esta spec e o app atual
- Prompts originais: [`docs/prompts-esposa/`](../prompts-esposa/)
