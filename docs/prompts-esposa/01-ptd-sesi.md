# 01 — PTD SESI (Plano de Trabalho Docente) — versão ChatGPT humano

**Recebido em:** 2026-04-29
**Componente:** Língua Portuguesa, Matemática (estrutura idêntica, com diferença na seção "DESCRITORES – AVALIA")
**Origem:** Prompt oficial que a esposa cola no ChatGPT pago

> **🔁 Existe uma versão FINAL deste prompt para uso programático no app:**
> [`app-prompts/01-ptd.md`](./app-prompts/01-ptd.md). A versão final tem **12 seções**
> (não 14) — a esposa simplificou removendo RECURSOS PEDAGÓGICOS, DIFERENCIAÇÃO
> PEDAGÓGICA e NÍVEIS DE PROFICIÊNCIA. Use a versão app como referência canônica para
> o produto; este arquivo é referência histórica do que ela usava no ChatGPT.

---

## 1. Prompt original (texto exato que ela usa)

```
PROMPT OFICIAL PARA CLAUDE (PTD SESI)

COPIE E COLE NO CLAUDE:

⸻

Elabore um Plano de Trabalho Docente (PTD) no padrão do SESI, seguindo rigorosamente a estrutura abaixo, sem alterar títulos, subtítulos ou ordem.

Utilize EXCLUSIVAMENTE as informações do capítulo indicado, sem inventar conteúdos, sem misturar capítulos e sem acrescentar informações externas.

⸻

📍 DADOS:

* Componente Curricular: [Língua Portuguesa ou Matemática]
* Ano: [2º ano do Ensino Fundamental]
* Capítulo: [Nome EXATO do capítulo]
* Turma: 32 alunos (considerar heterogeneidade e 3 alunos de alta inclusão)

⸻

📍 ESTRUTURA OBRIGATÓRIA:

IDENTIFICAÇÃO
COMPETÊNCIAS
HABILIDADES
DESCRITORES – AVALIA (somente para Língua Portuguesa e Matemática)
EXPECTATIVAS DE ENSINO E APRENDIZAGEM
OBJETIVOS DE APRENDIZAGEM (usar verbos no infinitivo)
AÇÕES A DESENVOLVER PARA ATINGIR OS OBJETIVOS
INTEGRAÇÃO
RECURSOS PEDAGÓGICOS
EVIDÊNCIAS DE APRENDIZAGEM – INSTRUMENTOS E CRITÉRIOS
ATIVIDADES DE APROFUNDAMENTO
TAREFAS PERSONALIZADAS / AVANÇAR
DIFERENCIAÇÃO PEDAGÓGICA
NÍVEIS DE PROFICIÊNCIA (N1, N2, N3, N4)

⸻

📍 ORIENTAÇÕES PEDAGÓGICAS (OBRIGATÓRIO):

* Descrever apenas 1 atividade principal do capítulo, obrigatoriamente retirada do material didático, com intencionalidade pedagógica clara
* Inserir atividades complementares baseadas no material didático
* Garantir integração intencional e prática
* Considerar a inclusão dos alunos com maior necessidade

⸻

📍 AVALIAÇÃO:

✔ Avaliação formativa:
Utilizar instrumentos como pauta de observação, rubrica, plenária e registros

✔ Avaliação somativa:
Inserir pelo menos 1 instrumento coerente com o capítulo (prova, produção, resolução de problemas ou rubrica)

⸻

📍 RECURSOS:

Selecionar apenas os que fizerem sentido pedagógico:

* Laboratório
* Espaço Maker
* Biblioteca
* LMT / Chromebook
* Espaço externo

⸻

📍 FOCO POR COMPONENTE:

📖 Língua Portuguesa → priorizar leitura, interpretação e compreensão
🔢 Matemática → priorizar jogos e estratégias (quando pertinente)

⸻

📍 REGRAS FINAIS:

* Não alterar a estrutura
* Não inventar habilidades ou competências
* Não misturar capítulos
* Ser objetivo, claro e pedagógico
* Escrever em linguagem profissional, em prosa

⸻

⚡ COMO USAR:

Exemplo:

👉 PTD – Língua Portuguesa – 3º ano – Capítulo 4: (colocar nome do capítulo)
👉 PTD – Matemática – 2º ano – Capítulo 5
```

---

## 2. Como ela usa (respostas — 2026-04-29)

### Como manda o capítulo (3 modos)
Depende do momento:
- **Foto das páginas do livro didático** — modo mais comum
- **PDF do material** do professor ou aluno
- **Apenas o nome do capítulo** (ex.: "Matemática 3º ano – Capítulo 4: Formas que se formam")

> **🚨 Implicação técnica:** o app precisa funcionar **mesmo sem o conteúdo completo**, usando o nome do capítulo como referência principal. Isso conflita parcialmente com "No Invention" — ver decisão arquitetural em `00-dna-sesi.md`.

### O ChatGPT entrega 100% das 14 seções?
**Não.** O ChatGPT frequentemente:
- Pula seções obrigatórias
- Altera nomes de títulos
- Reorganiza a ordem
- Acrescenta informações que não estão no material

> **🚨 Implicação técnica:** o app precisa de **validação pós-geração** que verifica todas as 14 seções, ordem exata e títulos sem alteração. Se faltar/alterar, regenerar a parte ou avisar a usuária. Não confiar cegamente na saída do LLM.

---

## 3. O que ela faz com o output (respostas — 2026-04-29)

### Sempre há retrabalho. Os 6 ajustes recorrentes:
1. Correção da estrutura → voltar pro padrão SESI
2. Reorganização dos títulos
3. Reescrita de trechos para linguagem pedagógica adequada
4. Inserção das habilidades **corretas** do material
5. Ajuste dos objetivos (verbo no infinitivo)
6. **Copiar e colar no Word e formatar manualmente** ← maior dor

### Norte do produto
> **Objetivo do aplicativo: ZERAR esse retrabalho.** Saída do app = documento já no padrão SESI, em Word A4, sem precisar formatar.

### Template SESI exigido
Existe padrão institucional com:
- Estrutura fixa de seções (não pode alterar)
- Linguagem pedagógica formal e objetiva
- Organização pronta para Word A4
- Em alguns casos: logo, cabeçalho e formatação específica

> **🚨 Implicação técnica:**
> - Gerar conteúdo **já no padrão correto** (não pedir ajustes pós-geração)
> - Exportar `.docx` formatado, com cabeçalho/logo SESI quando aplicável
> - Investigar com a esposa: ela tem o template oficial em Word? Logo SESI? Brasão da escola?

---

## 4. Análise estruturada

### Entradas (parametrizáveis)
- **Componente Curricular** — enum: `Língua Portuguesa | Matemática` (e provavelmente outros — confirmar)
- **Ano** — texto livre (ex.: "2º ano do Ensino Fundamental")
- **Capítulo** — nome exato (texto)
- **Material didático** — anexo obrigatório (PDF/imagem/Word do capítulo)

### Restrições invariantes (vão direto pro system prompt do app)
- **Sem invenção:** Article IV — No Invention. Só usar o que está no capítulo anexado.
- **Estrutura rígida:** 14 seções nesta ordem exata, sem alterar títulos/subtítulos
- **Verbos no infinitivo** em "Objetivos de Aprendizagem"
- **Linguagem profissional, em prosa** — nada de listas curtas onde se espera prosa
- **Inclusão obrigatória:** turma de 32 alunos, 3 de alta inclusão sempre considerados
- **Não misturar capítulos** (mesmo que o material tenha mais de um)

### Estrutura do output (14 seções fixas)
1. IDENTIFICAÇÃO
2. COMPETÊNCIAS
3. HABILIDADES
4. **DESCRITORES – AVALIA** (condicional: só LP e Matemática)
5. EXPECTATIVAS DE ENSINO E APRENDIZAGEM
6. OBJETIVOS DE APRENDIZAGEM (verbos no infinitivo)
7. AÇÕES A DESENVOLVER PARA ATINGIR OS OBJETIVOS
8. INTEGRAÇÃO
9. RECURSOS PEDAGÓGICOS
10. EVIDÊNCIAS DE APRENDIZAGEM – INSTRUMENTOS E CRITÉRIOS
11. ATIVIDADES DE APROFUNDAMENTO
12. TAREFAS PERSONALIZADAS / AVANÇAR
13. DIFERENCIAÇÃO PEDAGÓGICA
14. NÍVEIS DE PROFICIÊNCIA (N1, N2, N3, N4)

### Diretrizes pedagógicas embutidas
- **1 atividade principal** retirada do material didático, com intencionalidade pedagógica clara
- **Atividades complementares** baseadas no material
- **Avaliação formativa:** pauta de observação, rubrica, plenária, registros
- **Avaliação somativa:** ≥1 instrumento (prova, produção, resolução de problemas, rubrica)
- **Recursos opcionais (selecionar com critério):** Laboratório, Espaço Maker, Biblioteca, LMT/Chromebook, Espaço externo
- **Foco por componente:**
  - 📖 LP → leitura, interpretação, compreensão
  - 🔢 Matemática → jogos e estratégias

---

## 5. Mapeamento para o SESI Edu

### O que o app já atende (parcial)
- ✅ Aba "plano" gera plano de aula com Claude
- ✅ Modal **Projetos** (commit 7fa6607) já permite anexar material didático com diretrizes — combina perfeitamente com "usar EXCLUSIVAMENTE o material do capítulo"
- ✅ Modal **Alunos** já existe (cadastro com laudos) — pode alimentar a seção DIFERENCIAÇÃO PEDAGÓGICA automaticamente
- ✅ `SESI_SYSTEM_PROMPT` em `pages/api/generate.js` já fala em BNCC, padrões SESI

### O que está faltando (gaps confirmados)
- ❌ **Estrutura PTD não está modelada.** O app gera "plano de aula" genérico, não as 14 seções rígidas do PTD SESI
- ❌ **Seção DESCRITORES – AVALIA** não existe (condicional para LP/Mat)
- ❌ **NÍVEIS DE PROFICIÊNCIA N1-N4** não existem
- ❌ Campo "Capítulo" não existe — hoje só tem "conteúdo" (texto livre)
- ❌ "Foco por componente" (LP=leitura, Mat=jogos) não é injetado no system prompt automaticamente
- ❌ A obrigatoriedade de "atividade principal extraída do material didático" não é reforçada no prompt do app (depende do projeto ativo, mas não obriga)
- ❌ Integração com "Alunos com laudos" cadastrados não vira parágrafo automático na DIFERENCIAÇÃO PEDAGÓGICA

### Decisões pendentes para Spec Pipeline
- O PTD vira **uma aba nova** ("PTD") ou **um modo da aba "plano"** com toggle?
- As 14 seções viram **template fixo** no `lib/planoBuilder.js` ou são geradas livres pelo Claude e o builder só formata?
- Como capturar "Capítulo" — campo separado ou extrai do projeto ativo?
- Qual o formato de exportação? Word com template SESI? Markdown? PDF?

---

## 6. Próximos prompts esperados (a esposa enviar)

- [ ] Prompt de **Prova** (objetiva e dissertativa — provavelmente prompts separados)
- [ ] Prompt de **Atividade** / lista de exercícios
- [ ] Prompt de **Plano de aula** (diferente do PTD? aula avulsa?)
- [ ] Prompt de **Correção de redação / produção textual**
- [ ] Prompt de **Adaptação para alunos com laudos** (TEA, TDAH, dislexia)
- [ ] Prompt de **Plano de recuperação**
- [ ] Outros que ela usar
