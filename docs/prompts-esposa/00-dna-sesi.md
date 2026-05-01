# 00 — DNA SESI (Princípios e Invariantes)

> **Documento vivo.** Atualizado conforme novos prompts e respostas chegam.
> Última atualização: 2026-04-29 (após respostas das 4 perguntas sobre o PTD).

Este arquivo consolida o que é **invariante** entre todos os prompts da esposa — a base que vai
para a camada de system prompt central do SESI Edu, separada das regras específicas de cada
tipo de material (PTD, Simulado, Prova, etc.).

---

## 🎯 Norte do produto

> **Zerar o retrabalho da professora.**

Hoje ela usa o ChatGPT, recebe um output parcialmente bom, e gasta horas:
- Corrigindo estrutura
- Reorganizando títulos
- Reescrevendo em linguagem pedagógica
- Inserindo habilidades corretas
- Ajustando verbos
- **Copiando e colando no Word e formatando manualmente** ← dor maior

O SESI Edu existe para que ela receba **o documento final pronto**, no padrão SESI, em
Word A4, sem precisar mexer. Tudo o que **não** elimina retrabalho é detalhe; tudo o que
**reduz** retrabalho é prioritário.

---

## 🔒 Regras Finais (versão oficial 2026-04-30)

A esposa fechou em 2026-04-30 as **4 regras absolutas** que governam o sistema (ver
`docs/specs/REGRAS-FINAIS.md`):

1. **Não inventar conteúdos** (sempre usar capítulo/material informado)
2. **Não criar descritores** (só do catálogo oficial; se não houver, omitir)
3. **Não alterar estrutura** (12 seções PTD, 4 níveis N1-N4, etc são fixas)
4. **Seguir exatamente os documentos enviados** (template, logo, brasão)

Hierarquia: **estas 4 regras prevalecem sobre completude/qualidade**. Melhor entregar
incompleto e correto que completo e inventado.

Casa com Constituição AIOX, Artigo IV — **No Invention**.

### Tensão arquitetural confirmada

A esposa também disse: *"O sistema deve estar preparado para trabalhar mesmo sem o conteúdo
completo, utilizando o nome do capítulo como referência principal."*

Isso conflita parcialmente com "no invention". **Resolução proposta** (a validar no Spec
Pipeline com `@architect`):

| Modo | Quando | Comportamento |
|---|---|---|
| **Conservador (default)** | Capítulo enviado em foto/PDF/Word | Gera só com base no material anexado. Bloqueia trechos que precisariam de invenção. |
| **Inferência por nome** | Apenas nome do capítulo informado | Avisa a usuária ("⚠ Sem material — gerando com base no nome e em habilidades padrão SESI para a faixa"). Output rotulado como rascunho. |

A usuária decide o modo conscientemente. Sem material, o app não finge que tem.

---

## 🧬 Invariantes (DNA SESI presente em todos os prompts)

### Princípios pedagógicos
- **Não inventar** — usar exclusivamente o material indicado
- **Não misturar capítulos**
- **Não fugir do nível do ano** (questão de 2º EF não exige leitura de 5º EF)
- **Linguagem profissional, em prosa, pedagógica e objetiva**
- **Padrão Avalia/SARESP** como benchmark de qualidade

### Conceitos de domínio
- **Descritores AVALIA** — sempre presentes (seção dedicada no PTD; rotulagem por questão em
  provas/simulados). Catálogo oficial SESI precisa ser obtido pela esposa/coordenação.
- **Níveis de Proficiência N1-N4** — recorrentes em todos os módulos pedagógicos.
  **Decisão final 2026-04-30 (D.13):** manter rótulos **contextuais** (cada contexto
  usa o rótulo mais natural pra professora). **Atualização 2026-05-01:** esposa explicita
  *"Utilizar SEMPRE os 4 níveis... TODOS devem aparecer em TODOS os instrumentos"* — a
  sub-pendência do Painel (que tinha só 3 categorias listadas) está RESOLVIDA: era typo,
  Painel também tem 4 níveis.

  Tabela canônica final por contexto (versão definitiva 2026-05-01):

  | Nível | Avaliação | PTD | Atividades / Aula Diária | Painel (rubrica) |
  |---|---|---|---|---|
  | N1 | Abaixo do básico | apoio integral | apoio intensivo | Não realiza com autonomia |
  | N2 | Básico | apoio parcial | apoio parcial | Com mediação da professora |
  | N3 | Adequado | esperado | esperado | Com autonomia |
  | N4 | Avançado | desafio | desafio | **(autonomia + estratégia)** ← inferido |

  > **Pequena pendência:** o rótulo exato do N4 no Painel não foi explicitado pela esposa
  > (ela listou os 3 anteriores mas pulou o 4º). Inferência razoável: "autônomo + estratégia"
  > combinando a tabela de Avaliação com a rubrica observacional original. Confirmar com
  > ela quando possível.

  **Cores oficiais (Feature 01 parte B):** N1 🔵 azul, N2 🟢 verde, N3 🟡 amarelo,
  N4 🔴 vermelho. Configurável: app oferece **modo "semáforo"** alternativo opcional
  (verde=N4 melhor, vermelho=N1) para outras professoras (B.6 — 2026-04-30).
- **BNCC** + competências socioemocionais SESI — base curricular implícita
- **Habilidades por componente** — listas estáveis (ver § Bibliotecas de habilidades)

### Contexto de turma (sempre considerar)
- **32 alunos heterogêneos** (número padrão)
- **3 alunos de alta inclusão** — mencionado explicitamente no PTD; geral em simulado/prova
- Alunos com laudos (TEA, TDAH, dislexia, etc.) — adaptações esperadas

### Foco diferenciado por componente
- **📖 Língua Portuguesa** → leitura, interpretação e compreensão
- **🔢 Matemática** → jogos e estratégias (quando pertinente)

---

## 📚 Bibliotecas de habilidades por componente (anos iniciais EF)

Recorrentes em todos os prompts. Devem virar **listas selecionáveis no app**, não texto livre.

### 📖 Língua Portuguesa
- Leitura e interpretação
- Informações explícitas e implícitas
- Inferência
- Vocabulário
- Gênero textual
- Texto-base curto adequado à faixa etária

### 🔢 Matemática
- Situações-problema contextualizadas
- Adição e subtração (com e sem reserva)
- Ideia de multiplicação (parcelas iguais)
- Sequência numérica
- Valor posicional
- Sistema monetário
- Estratégias de resolução
- Leitura e interpretação de problemas

> **Pendente:** outros componentes (Ciências, História, Geografia, Arte, Educação Física,
> Ensino Religioso) — confirmar se a esposa também leciona ou é polivalente nas iniciais.

---

## 🚨 Comportamentos a combater do LLM

A esposa confirmou que o ChatGPT, quando recebe o prompt PTD direto, **não entrega 100% das
seções**. Os defeitos típicos:

| Defeito | Frequência | Mitigação no app |
|---|---|---|
| Pula seções obrigatórias | Comum | **Validador pós-geração** verifica presença de todas as seções obrigatórias por tipo |
| Altera nomes de títulos | Comum | Validador checa títulos exatos; corrige automaticamente ou reaviva trecho |
| Reorganiza ordem | Comum | Validador reordena ou regenera |
| Acrescenta info externa (inventa) | Comum | Prompt reforça "no invention" + validador detecta termos não presentes no material |
| Linguagem informal | Ocasional | System prompt impõe registro pedagógico formal |
| Verbos errados em "Objetivos" | Ocasional | Pós-processamento valida verbos no infinitivo |

> **Decisão arquitetural sugerida:** todo material gerado passa por uma camada de **validação
> estrutural** antes de chegar à usuária. Se algo está fora do padrão, o app **regenera só a
> parte com defeito** (não a coisa toda) ou marca claramente o problema. Pra isso, a estrutura
> esperada por tipo precisa estar codificada em uma "spec do output" (schema). Tema para
> `@architect` no Spec Pipeline.

---

## 📥 Modos de entrada do material didático

A esposa manda o capítulo de 3 formas no **fluxo dela com o ChatGPT hoje** (mais comum → menos comum):

1. **📷 Foto das páginas** do livro — modo dela mais frequente
2. **📄 PDF** do material do professor ou aluno
3. **📝 Apenas o nome do capítulo** — fallback

### Decisão de produto SESI Edu (Sidney, 2026-04-29)

No app **invertemos a prioridade** em relação ao fluxo dela atual, porque o pipeline de
extração de texto entrega resultado mais fiel:

| Prioridade | Modo | Status no app | Por quê |
|---|---|---|---|
| **🥇 Principal** | **📄 PDF / Word / TXT** com extração de texto | ✅ Implementado em `ProjetosModal` (pdf.js + mammoth + range de páginas) | Texto fiel, sem ruído, range de páginas evita inflar contexto, casa com "No Invention" |
| **🥈 Secundário** | **📝 Só nome do capítulo** | ❌ Falta — modo conservador com aviso | Para quando ela está sem o livro à mão |
| **🥉 Fallback** | **📷 Foto do livro** | 🟡 FileUploader aceita imagem; pipeline multimodal pendente | Último recurso. UI deve **recomendar PDF/Word** primeiro |

**Implicação na UX:**
- A interface deve **educar a usuária** a preferir PDF/Word ("para resultados melhores,
  envie o PDF do livro ou capítulo digitalizado em PDF — foto deve ser usada apenas se
  não houver outra opção")
- O `ProjetosModal` permanece como **fonte central** de material por projeto
- Persistência por capítulo dentro do projeto: uma turma usa muitos capítulos ao longo
  do ano — confirmar com a esposa se o projeto ativo deve poder ter "capítulo selecionado"
  separado do conjunto de arquivos

### Relação com regra "No Invention"

O fluxo de extração de texto **reforça** a regra "No Invention":
- Texto extraído = material em si, sem inferência
- Foto via OCR/multimodal = sujeita a erros de leitura, mais espaço para invenção
- Só nome = explicitamente em modo conservador, com aviso visível à usuária

---

## 📄 Padrão SESI de saída (template institucional)

A esposa confirmou que existe **padrão institucional com**:
- Estrutura fixa de seções (não pode alterar)
- Linguagem pedagógica formal e objetiva
- Organização pronta para Word A4
- Em alguns casos: **logo, cabeçalho e formatação específica**

> **Pendente — pedir pra esposa:**
> - Template Word oficial (.docx) de PTD, Prova, Simulado
> - Logo SESI em PNG/SVG
> - Cabeçalho/brasão da escola/unidade dela
> - Qualquer especificação tipográfica (fonte, margens, tamanho)
>
> Sem isso, o app gera em padrão "genérico SESI" e pode resvalar em retrabalho de formatação.

---

## 🏗 Implicação arquitetural — camadas de prompt + corretor

Conforme acumulamos prompts (incluindo o **PROMPT 6 — Corretor**, recebido em 2026-04-29),
fica nítido que o app vai precisar de:

```
┌─────────────────────────────────────────────────┐
│  (1) DNA SESI — system prompt central           │
│  No invention, AVALIA, N1-N4, inclusão,         │
│  linguagem, padrão Avalia/SARESP, anos iniciais │
└─────────────────────────────────────────────────┘
                       +
┌─────────────────────────────────────────────────┐
│  (2) Tipo de material — system específico       │
│  PTD (12 seções) | Avaliação | Atividades       │
│  Observação | Relatório (5 módulos da SPEC)     │
└─────────────────────────────────────────────────┘
                       +
┌─────────────────────────────────────────────────┐
│  (3) Contexto do projeto — material didático    │
│  Foto/PDF/Word do capítulo (via ProjetosModal)  │
│  + nome do capítulo + diretrizes do projeto     │
└─────────────────────────────────────────────────┘
                       +
┌─────────────────────────────────────────────────┐
│  (4) Contexto da turma/aluno                    │
│  AlunosModal (turma) + histórico longitudinal   │
│  por aluno (Módulos 4 e 5)                      │
└─────────────────────────────────────────────────┘
                       =
                 v1 (rascunho)
                       │
┌─────────────────────────────────────────────────┐
│  (5) PROMPT 6 — Corretor (Generator + Critic)   │
│  Auditoria LLM: 5 itens universais              │
│  → corrige automaticamente + reorganiza         │
└─────────────────────────────────────────────────┘
                       =
                 v2 (auditado)
                       │
                       ▼
       Validador determinístico (regex/lista) →  .docx no padrão SESI
```

### 5 invariantes universais auditáveis (do PROMPT 6)
Aplicáveis a **todo** material gerado — independente do módulo:

1. Todas as seções obrigatórias presentes?
2. A ordem foi respeitada?
3. Algum título foi alterado?
4. Há conteúdo inventado?
5. A linguagem está pedagógica e objetiva?

Hoje o app tem (3) e (4) parciais, e (1) genérico. (2), (5) [Corretor] e o **validador
estrutural** são as peças críticas que faltam para zerar o retrabalho.

---

## 📋 Próximos prompts pendentes

- [ ] Atividade / lista de exercícios
- [ ] Plano de aula avulso (diferente do PTD?)
- [ ] Correção de redação ou produção textual
- [ ] Adaptação para laudos (TEA, TDAH, dislexia)
- [ ] Plano de recuperação
- [ ] Outros que ela usar

Quando bater 5-6 prompts, ativar `@pm` (Morgan) para Phase 1 — gather/requirements — do
Spec Pipeline.
