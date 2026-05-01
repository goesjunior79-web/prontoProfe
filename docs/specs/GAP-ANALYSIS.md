# GAP ANALYSIS — Spec da esposa vs App atual

**Gerado em:** 2026-04-29
**Base:** [`SPEC-OFICIAL-esposa.md`](./SPEC-OFICIAL-esposa.md) vs código no commit `7fa6607` (master).

> Verificação feita lendo arquivos reais. Linhas citadas são do código atual. Onde houver
> incerteza, está marcado como ⚠ a verificar.

---

## 🎯 Resumo executivo

| Pergunta | Resposta |
|---|---|
| O app atende a spec? | **Parcialmente — cerca de 35-40%** |
| Onde já está bem? | **Prova HTML** (`docBuilder.js`) tem template SESI bonito |
| Onde está superficial? | **PTD** — `planoBuilder.js` existe mas com seções **diferentes da spec** |
| O que falta inteiro? | **Módulo 4 (Observações de Alunos)** e **Módulo 5 (Relatórios de Final de Etapa)** |
| Maior risco arquitetural? | **`exportWord` chama APIs `/api/gerar-plano-docx` e `/api/gerar-docx`** — não verifiquei essas APIs (⚠) |
| Maior risco pedagógico? | Estrutura PTD do builder atual é antiga, **não bate com a spec nem com o prompt #01** — vai precisar refazer |

---

## ✅ Resolvido: estrutura final do PTD é 12 seções

A esposa enviou em 2026-04-29 a versão programática (`docs/prompts-esposa/app-prompts/01-ptd.md`)
que **confirma 12 seções** — idênticas às da spec. As 3 seções que estavam no prompt #01
mas sumiram (`RECURSOS PEDAGÓGICOS`, `DIFERENCIAÇÃO PEDAGÓGICA`, `NÍVEIS DE PROFICIÊNCIA`)
**não devem ser geradas**.

| Fonte | Quantas seções | Status |
|---|---|---|
| **Prompt #01** (versão ChatGPT humano que ela usa hoje) | 14 | Histórico — referência da evolução |
| **Spec oficial** + **app-prompts/01-ptd.md** | **12** | ✅ **Estrutura final confirmada** |
| **`lib/planoBuilder.js:5-20`** (app atual) | 14 outras | ❌ Estrutura SESI antiga — **vai ser refeita** |

**Lista canônica das 12 seções:**

1. IDENTIFICAÇÃO
2. COMPETÊNCIAS
3. HABILIDADES
4. DESCRITORES – AVALIA (condicional: só LP e Matemática)
5. EXPECTATIVAS DE ENSINO E APRENDIZAGEM
6. OBJETIVOS DE APRENDIZAGEM (verbos no infinitivo)
7. AÇÕES A DESENVOLVER
8. EVIDÊNCIAS DE APRENDIZAGEM
9. INSTRUMENTOS E CRITÉRIOS DE AVALIAÇÃO
10. INTEGRAÇÕES
11. ATIVIDADES DE APROFUNDAMENTO
12. TAREFAS PERSONALIZADAS / AVANÇAR

> 🚨 **App atual está antigo:** o `planoBuilder.js` tem seções de uma estrutura SESI antiga
> com "Avalia+" e "Estações" que **não aparecem na spec atual**. Provavelmente data de uma
> versão anterior do padrão SESI. **Refazer** a lista `SECOES` em `planoBuilder.js:5-20`
> para casar com a lista canônica acima.

---

## Módulo 1 — PTD

| Item da spec | Status | Onde | Observação |
|---|---|---|---|
| Aba/módulo PTD dedicado | 🟡 parcial | `pages/index.js` aba "plano" | Aba existe mas é "plano de aula" genérico, não PTD formal |
| 12 seções fixas | ❌ falta | `lib/planoBuilder.js:5-20` | Lista atual tem 14 outras seções (estrutura antiga) |
| "IDENTIFICAÇÃO" como seção | ❌ falta | — | App tem bloco de identificação no header (`planoBuilder:238-243`), mas não como seção |
| Verbos no infinitivo (Objetivos) | ❌ falta | — | Não validado pós-geração |
| Campo "Capítulo" | ❌ falta | `components/DocumentFields.js:46-52` | Hoje só tem turma/série/disciplina/etapa. Capítulo é parte do "conteúdo" textual livre |
| Campo "Componente Curricular" | ✅ ok | `DocumentFields:49` | Field "disciplina" |
| Campo "Ano escolar" | ✅ ok | `DocumentFields:48` | Field "serie" |
| Avaliação formativa + somativa | ❌ falta | — | Não há checkbox/seções específicas |
| 1 atividade principal do capítulo | ❌ falta | — | Não há campo dedicado, fica no "conteúdo" livre |
| Turma 32 alunos heterogênea (default) | ❌ falta | — | Não está hardcoded; turma é A/B/C/D/E |
| Validação pós-geração das 12 seções | ❌ falta | — | Inexistente |

**Arquivo crítico a refazer:** `lib/planoBuilder.js` (lista SECOES + ordem + nomes)

---

## Módulo 2 — Avaliações (Padrão Avalia)

> **App-prompt final recebido em 2026-04-29:** [`app-prompts/02-avaliacao.md`](../prompts-esposa/app-prompts/02-avaliacao.md).
> A esposa **consolidou** Simulado e Prova regular em **um único módulo parametrizável**
> (decisão de produto). Output passou de 4 docs para 3 (prova + cartão-resposta + gabarito
> comentado). Suporte a questões abertas saiu desse módulo.

| Item do app-prompt | Status | Onde | Observação |
|---|---|---|---|
| Aba "prova" / "avaliação" | ✅ ok | `pages/index.js` aba prova | Existe; renomear UI |
| N questões parametrizável (default 24) | 🟡 parcial | `pages/index.js:73` | Existe `qtd`, mas default 10. Mudar default ou modo Avaliação |
| Múltipla escolha A–D, 1 correta | ✅ ok | `lib/docBuilder.js:108-114` | Suportado |
| Distratores plausíveis | ❌ falta | — | Validador heurístico pós-geração |
| Modo multidisciplinar (LP+Mat) | ❌ falta | — | `{componente} = "Língua Portuguesa e Matemática"` precisa ser aceito |
| Descritores **D01, D02…** por questão | ❌ falta | — | Não há catálogo nem rotulagem. **Crítico — precisa catálogo oficial SESI** |
| Nível N1–N4 por questão | ❌ falta | — | Inexistente |
| **Cartão-resposta** | ❌ falta | — | Inexistente. Página separada do .docx |
| Gabarito **comentado** com nível | ❌ falta | `lib/utils.js:extrairGabarito` | Hoje só lista de respostas |
| Modo dissertativo (questões abertas) | 🟡 ⚠ | `pages/index.js:268` | App suporta hoje, mas **app-prompt 02 não menciona**. Confirmar com a esposa |
| Cabeçalho padrão SESI | ✅ ok | `lib/docBuilder.js:131-183` | Logo, cidade, docCode, Nome/Nº, Ensino, Etapa, Data, CC, Professora |
| Pronto para impressão | ✅ ok | `docBuilder.js:30` | A4 portrait Arial 10.5pt |

**Arquivo central:** `lib/docBuilder.js` (já avançado; adicionar cartão-resposta + descritores + N1-N4 por questão)

> ✅ **Resolvido em 2026-04-30 (resposta da esposa ao Bloco A.1):** dissertativas
> **continuam**, mas como sub-modo. O módulo Avaliação tem **2 sub-modos**:
>
> - **Simulado Avalia:** 24q múltipla escolha + cartão-resposta (modo já mapeado)
> - **Avaliação de capítulo:** 10q mix objetiva+dissertativa, app distribui o mix
>   automaticamente, entrega gabarito + correção para a professora
>
> Implicação: UI precisa de seletor de sub-modo. Modo capítulo precisa de algoritmo de
> distribuição automática objetiva/dissertativa e geração de rubrica de correção.

---

## Módulo 3 — Atividades Complementares

> **App-prompt final recebido em 2026-04-29:** [`app-prompts/03-atividades-complementares.md`](../prompts-esposa/app-prompts/03-atividades-complementares.md).
> Confirma diferenciação obrigatória por N1-N4 com **semântica nomeada** (apoio/básico/esperado/avançado),
> schema fixo por atividade (Objetivo + Descrição + Habilidade), e regra "atividade solta sem contexto" PROIBIDA.

| Item do app-prompt | Status | Onde | Observação |
|---|---|---|---|
| Aba "atividade" | ✅ ok | `pages/index.js` aba atividade | Existe |
| Baseada no capítulo | 🟡 parcial | — | Sem campo "Capítulo" específico (mesmo gap do PTD) |
| **Diferenciada por N1-N4** com semântica nomeada | ❌ falta | — | Não há geração por nível na aba atividade. `incluirAvalia` no plano (`DocumentFields:96-104`) faz algo parecido para 5 dias, **mas em outro fluxo** |
| Schema por atividade (Objetivo + Descrição + Habilidade) | ❌ falta | — | Não estruturado |
| Intencionalidade pedagógica explícita | ❌ falta | — | Validador heurístico pós-geração precisa checar |
| Não-solta-sem-contexto (regra explícita) | ❌ falta | — | Validador heurístico |

**Próximo passo:** decidir com `@architect` se a aba "atividade" **engloba** Atividades Complementares
ou se vira modo (toggle "Diferenciar por nível"). Considerar reaproveitar a lógica de
`incluirAvalia` que já existe no plano.

---

## Módulo 4 — Observações de Alunos

> **App-prompt final recebido em 2026-04-29:** [`app-prompts/04-observacao-aluno.md`](../prompts-esposa/app-prompts/04-observacao-aluno.md).
> **Mudança de padrão:** placeholder único `{informacoes_do_aluno}` (texto livre) em vez de
> placeholders estruturados. Schema fixo de output: 4 eixos (desempenho + dificuldades +
> estratégias + resposta). Regras éticas explícitas — sem julgamentos.

| Item do app-prompt | Status | Onde | Observação |
|---|---|---|---|
| Módulo de observações | ❌ **inexistente** | — | Construção do zero |
| Schema longitudinal por aluno | ❌ falta | `AlunosModal.js` | Schema atual só tem `obs` único (NEE). Precisa array `historico: [{data, tipo, texto}]` |
| UI de captura de evidência | ❌ falta | — | Formulário rápido: data + tipo + texto |
| Geração da observação a partir do histórico | ❌ falta | — | Pipeline novo: histórico → `{informacoes_do_aluno}` → LLM → observação formatada |
| Validador 4 eixos no output | ❌ falta | — | Cada observação cobre desempenho + dificuldade + estratégia + resposta |
| **Validador ético** (termos proibidos) | ❌ falta | — | Lista de palavras a evitar (`desinteressado`, `problemático`, `lento`, etc). **Pendente lista oficial da esposa** |
| Linguagem baseada em evidências | ❌ falta | — | Reforçar no system prompt + heurística de validador |
| Exportação para diário/relatório (.docx) | ❌ falta | — | Mesma observação serve para os dois usos |
| Cadastro de alunos | ✅ ok | `AlunosModal.js` | Já existe, **estender** com histórico |
| Hook auxiliar `useAlunosNEE` | ✅ ok | `DocumentFields.js:5-22` | Pode evoluir para `useAlunoHistorico` |

**Decisão arquitetural pra `@architect`:** persistir histórico em `localStorage`
(consistente com `sesi_alunos` atual) ou migrar para Supabase (já há `lib/supabase.js`).

---

## Módulo 5 — Relatórios de Final de Etapa

> **App-prompt final recebido em 2026-04-29:** [`app-prompts/05-relatorio-final.md`](../prompts-esposa/app-prompts/05-relatorio-final.md).
> **Mesma fonte de dados do Módulo 4** (`{informacoes_do_aluno}` do histórico longitudinal),
> mas **audiência família** (não interno). Schema fixo de output: 5 eixos
> (desenvolvimento + avanços + dificuldades + estratégias + considerações). Regras estritas
> de fechamento positivo e tom acolhedor.

| Item do app-prompt | Status | Onde | Observação |
|---|---|---|---|
| Módulo de relatórios | ❌ **inexistente** | — | Construção do zero, depende do Módulo 4 |
| Schema longitudinal por aluno | ❌ falta | (mesmo do Módulo 4) | Fonte de dados compartilhada |
| Geração da observação a partir do histórico | ❌ falta | — | Pipeline reaproveitado do Módulo 4 com prompt 5 |
| Validador 5 eixos no output | ❌ falta | — | Validador novo |
| **Validador de fechamento positivo** | ❌ falta | — | Heurística no último parágrafo |
| **Validador de termos negativos** | ❌ falta | — | Lista expandida do Módulo 4 (`dificuldade severa`, `incapaz`, `não consegue`, etc.) |
| Linguagem acolhedora p/ família | ❌ falta | — | Reforço no system prompt |
| Exportação .docx para família | ❌ falta | — | Cabeçalho/template potencialmente diferente do diário interno |
| Assinatura/rodapé com cargo da professora | ⏳ a definir | — | Confirmar com a esposa |

**Estratégia:** módulos 4 e 5 compartilham a fonte (histórico longitudinal) e podem
compartilhar o pipeline de exportação. Diferem no prompt e no schema do output.

---

## Formato de Saída (.docx)

| Item da spec | Status | Onde | Observação |
|---|---|---|---|
| Word .docx | 🟡 parcial | `lib/exporters/word.js` + APIs `/api/gerar-plano-docx` e `/api/gerar-docx` (⚠ não inspecionadas) | Há **DOIS exporters .docx** no app: o `lib/exporters/word.js` é genérico (cabeçalho "ProntoProfe — Assistente do Professor SESI"); o fluxo real usa endpoints API que **não inspecionei** |
| Fonte Arial | 🟡 parcial | `planoBuilder:151`, `docBuilder:34` | HTML usa Arial. Word genérico (`exporters/word.js`) usa default do `docx` |
| Tamanho 12pt (texto) | 🟡 parcial | `planoBuilder:152` (12pt) e `docBuilder:35` (10.5pt) | Inconsistência: prova usa 10.5pt, plano usa 12pt. Spec exige 12pt |
| A4 | 🟡 parcial | `planoBuilder:146` (**A4 LANDSCAPE**) e `docBuilder:30` (A4 portrait) | **Plano está em paisagem** — spec não especifica orientação, confirmar com a esposa |
| Pronto para impressão | ✅ ok | Builders HTML são bem estilizados | — |
| Sem retrabalho manual | 🟡 parcial | — | Depende do que `/api/gerar-*-docx` realmente entrega — **verificar** |

**⚠ A verificar:** ler `/api/gerar-plano-docx` e `/api/gerar-docx` para entender se já produzem .docx fiel ao HTML do builder ou se há perda na conversão.

---

## Cross-cutting (regras gerais)

| Item da spec | Status | Onde | Observação |
|---|---|---|---|
| Regra 1 — Proibido inventar | 🟡 parcial | `pages/api/generate.js:7-18` `SESI_SYSTEM_PROMPT` | Prompt sistema fala em BNCC/SESI mas **não tem cláusula explícita "no invention"** |
| Regra 2 — Estrutura fixa (validador) | ❌ falta | — | **Não há validador pós-geração** — risco alto, esposa confirmou que ChatGPT pula seções |
| Regra 3 — Padrão pedagógico | 🟡 parcial | `SESI_SYSTEM_PROMPT` | Já fala em linguagem clara, BNCC. Falta reforço em "ética" e "sem julgamentos" para Módulo 4 |
| Regra 4 — Sem retrabalho | 🟡 parcial | — | Depende dos itens anteriores estarem todos ok |
| Modo "só nome do capítulo" | ❌ falta | — | App não tem modo conservador/inferência |
| Foto do livro como input | ✅ ok | `components/FileUploader.js:15` | Aceita `.jpg,.jpeg,.png,.webp` |
| Catálogo de Descritores AVALIA | ❌ falta | — | **Pendente:** pedir pra esposa o documento oficial SESI |
| Logo SESI no Word | 🟡 parcial | `public/logo_sesi.jpg` (referenciado em `planoBuilder:230` e `docBuilder:138`) | ⚠ Precisa confirmar se o arquivo está em `public/` ou se é placeholder |
| Cabeçalho da escola/cidade | ✅ ok | `docBuilder:139` (cidade) + `cfg.docCode` (CE-228 default) | Já tem |

---

## ✅ O que o app já faz BEM (e devemos preservar)

1. **`docBuilder.js`** — template HTML de prova **muito completo**: faixa lateral, tabela de identificação, box de critérios + valor + nota, observações da professora, página numerada, A4 portrait Arial. **Manter como base do Módulo 2.**
2. **`planoBuilder.js`** — sistema de seções com bordas, títulos vermelhos, suporte a bullets/negrito/datas Avalia+. **Estrutura visual boa, lista de seções precisa ser refeita** para casar com a spec.
3. **`AlunosModal.js`** — cadastro com NEE persistente em `localStorage`, export CSV, busca. **Manter, estender** para o Módulo 4.
4. **`ProjetosModal.js`** (commit recente) — diretrizes + arquivos do capítulo. **Casa perfeitamente** com a regra "EXCLUSIVAMENTE do material".
5. **`useAlunosNEE` hook** em `DocumentFields.js:5-22` — já sugere alunos com NEE da turma para auto-preencher. Brilhante. **Manter.**
6. **FileUploader aceita imagens** — modo "foto do livro" já está suportado em entrada (falta o pipeline de OCR/multimodal pro Claude).

---

## 🎯 Recomendação de prioridade para Spec Pipeline

Quando o `@pm` (Morgan) iniciar Phase 1 (gather), proponho a seguinte ordem por **valor para
zerar retrabalho × esforço**:

### 🥇 P1 — Bedrock arquitetural (sem isso o resto vacila)
1. **Refatorar `SESI_SYSTEM_PROMPT`** com cláusula explícita "No Invention" + camadas (DNA SESI + tipo de material)
2. **Construir pipeline Generator + Critic** — usar PROMPT 6 (corretor LLM) recebido da esposa em 2026-04-29; complementar com validador determinístico para checks rápidos (regex/contagem)
3. **Modo "só nome do capítulo"** com aviso de output em modo conservador
4. **Pedir à esposa:** template Word oficial SESI + logo + catálogo de Descritores AVALIA + brasão da escola

> 📝 **Nota de produto (Sidney, 2026-04-29):** o pipeline atual de **extração de texto**
> em `ProjetosModal` (PDF/Word/TXT + range de páginas) é a estratégia principal de input
> do material, **não** "modo foto do livro". Foto é fallback. A UI deve educar a usuária
> a preferir PDF/Word. Pipeline multimodal/OCR para imagens fica rebaixado a P3+.

### 🥈 P2 — Módulo 1 (PTD) refeito
5. Nova lista de seções no `planoBuilder.js` casando com a spec (12 seções)
6. Campo "Capítulo" + integração com `ProjetosModal`
7. Validar verbos no infinitivo nos Objetivos
8. Confirmar com a esposa: 12 ou 14 seções? (divergência prompt vs spec)

### 🥉 P3 — Módulo 2 (Avaliações) completo
9. Modo Simulado Avalia (24 questões, LP+Mat, descritores, N1-N4 distribuído)
10. Cartão-resposta como página separada do .docx
11. Gabarito comentado (com habilidade + nível por questão)

### 4️⃣ P4 — Módulo 3 (Atividades Complementares)
12. Diferenciação por nível N1-N4 na aba atividade

### 5️⃣ P5 — Módulos 4 e 5 (Observações + Relatórios)
13. Schema de histórico de observações por aluno (extender `AlunosModal`)
14. Geração de observações com regras éticas (Módulo 4)
15. Geração de relatórios de etapa por aluno (Módulo 5)

### Cross-cutting contínuo
- Validador estrutural ativo em todos os módulos
- Exportação .docx fiel ao HTML do builder (verificar `/api/gerar-*-docx`)
- Padronização Arial 12pt A4 em todos os outputs

---

## ❓ Decisões pendentes — atualizado em 2026-04-30 após resposta da esposa

| # | Pergunta | Status |
|---|---|---|
| 1 | PTD: 12 ou 14 seções? | ✅ **12 seções** (2026-04-29) |
| 2 | PTD: orientação A4 paisagem ou retrato? | ✅ **Paisagem** (B.7 — 2026-04-30) |
| 3 | PTD: refazer planoBuilder antigo? | ✅ **Sim, refazer** |
| 4 | Catálogo Descritores AVALIA | ⏳ **Tem doc oficial — vai enviar** |
| 5 | Template Word SESI + logo + brasão | ⏳ **Tem — vai enviar** |
| 6 | Cartão-resposta — formato exato | ⏳ **Modelo será enviado** |
| 7 | Anos atendidos | ✅ **Só anos iniciais EF** (2026-04-29) |
| 8 | Observações: quantas por etapa? estrutura? | ✅ **Flexível: aulas/semanal/fim de etapa obrigatório** (A.5) |
| 9 | Relatório de etapa: páginas, assinatura | ⏳ Não respondido (D.14, D.15) |
| 10 | Dissertativas continuam? | ✅ **Sim, em sub-modo "Avaliação de capítulo"** (A.1) |
| 11 | Aula Diária x PTD: separado ou parte? | ✅ **2 abas conectadas** (A.2 + comando ajustado) |
| 12 | Painel: MVP ou fase 2? | ✅ **MVP com persistência estruturada** (A.3) |
| 13 | Atividades: quantas por nível? | ✅ **1 principal + sob demanda** (A.4) |
| 14 | Cores N1-N4 | ✅ **Pessoal, OK ter modo "semáforo" alternativo** (B.6) |
| 15 | Termos pedagógicos a evitar | ⏳ Não respondido explicitamente (C.12) |
| 16 | N1-N4: unificar ou contextual? | ⏳ Não respondido (D.13) |

### 🔓 Bloqueios destravados (já podem virar código)
Decisões 1, 2, 3, 7, 8, 10, 11, 12, 13, 14 — implementação pode iniciar.

### ⏳ Bloqueios remanescentes (atualizado 2026-05-01 após Módulo Avaliação Completo)

- **6 documentos institucionais** — `docs/assets-esposa/README.md` lista o que falta
- **Pequena pendência:** rótulo exato do N4 no Painel (a esposa listou os 3 outros mas
  não nomeou o N4 explicitamente — inferência razoável existe)

### ✅ CONFLITO PTD RESOLVIDO em 2026-05-01 (PROMPT 1 v3 — Institucional)

A esposa enviou a **versão definitiva** do PROMPT 1 (PTD): **8 seções + cabeçalho**.
Optou pelo caminho **enxuto** (não híbrido como Orion havia recomendado). Documento
canônico: `app-prompts/01-ptd.md` v3.

**Estrutura final (8 seções):**
1. COMPETÊNCIAS
2. HABILIDADES
3. CAPÍTULO DO MATERIAL
4. OBJETIVOS
5. EVIDÊNCIAS DE APRENDIZAGEM (Instrumentos + Critérios + 4 tipos de avaliação:
   diagnóstica, formativa, somativa, autoavaliação)
6. AÇÕES A DESENVOLVER (Atividades + Estratégias + Espaços + Materiais + Recursos)
7. ALUNOS COM FLEXIBILIZAÇÃO (Nome + Estratégia + Avaliação por aluno)
8. PLANEJAMENTO INTEGRADO

**Implicação:** as preciosidades do template real (Estratégias de Avanço por Nível,
Mini Simulados Avalia+, Estações Graduadas DUA, BNCC codes, Recursos Didáticos como
seção) **NÃO** vão ser geradas pelo app. A esposa optou por simplicidade — pode
adicioná-las manualmente caso precise.

**Refatoração crítica:** `lib/planoBuilder.js:5-20` precisa atualizar lista `SECOES`
para casar com as 8 da v3 (remover as 14 antigas como UNIDADES DO MATERIAL, INSERÇÃO
DE SIMULADOS, ESTRATÉGIA DE AVANÇO, etc).

### ✅ Resolvidas no Módulo Avaliação Completo (2026-05-01)

- **Sub-pendência Painel N1-N4:** RESOLVIDA → 4 níveis em TODOS os instrumentos
  ("Utilizar SEMPRE os 4 níveis... TODOS devem aparecer em TODOS os instrumentos")
- **Sub-modo Simulado AVALIA:** RESOLVIDA → sub-botão dentro da Tela 4 (não é botão
  extra na tela inicial nem fica fora do MVP)
- **Tela Avaliação reformulada** → 6 sub-botões/instrumentos (não 1 ou 2)
- **4 instrumentos novos mapeados** que não estavam previstos:
  - Rubrica (tabela genérica de critérios)
  - Pauta de Observação (planilha estruturada por aluno)
  - Plenária (roteiro de discussão coletiva)
  - Pauta de Leitura (classificação técnica obrigatória)
- **Terminologia obrigatória da Pauta de Leitura** mapeada (5 termos técnicos)
- **Diferencial pedagógico universal:** todo instrumento inclui "o que observar / como
  intervir / como avança"

### ✅ Resolvidas pelo PROMPT MESTRE (2026-05-01)
- **Pergunta 7** Relatório de etapa onde fica? → **Tela própria** (7º módulo, 7º botão
  na tela inicial)
- **Pergunta 8** Horário semanal? → **"Quando necessário"** (interpretação: app guarda
  fixo no perfil, professora ajusta só quando atípico)
- **C.12** Termos a evitar → Lista oficial: "desinteressado", "lento", "atrasado",
  julgamentos
- **Mudança em Atividades:** revisão da pergunta 6 — esposa agora explicita "**não
  separar por nível automaticamente**". Diferenciação só sob demanda. (Atualizei
  app-prompt 03)
- **Princípio guia novo:** "Praticidade da professora" como princípio orientador de
  todas as decisões

### ✅ Resolvidas em 2026-04-30 (segunda rodada)
- **C.12** Termos a evitar → **Diretriz estrutural rica:** abrir com positivo, estratégias
  realizadas (passado), final com pergunta interativa "quer sugestão de atividade?"
- **D.13** N1-N4 unificar ou contextual → **Manter contextual** (cada contexto usa o
  rótulo mais natural)
- **D.14** Relatório assinatura → **Terceira pessoa**, "Professora Sheila Goes" no rodapé
- **D.15** Relatório páginas → **1 página**
- **Mix Avaliação capítulo** → 7 objetivas + 3 dissertativas (default favorecendo
  praticidade da correção)
- **Atividade por nível** → 1 principal × 4 versões + botão "Gerar nova" parametrizável
