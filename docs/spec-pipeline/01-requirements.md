# SESI Edu — Requirements (Phase 1 — Gather)

> **Status:** Phase 1 do Spec Pipeline AIOX — concluída em 2026-05-01
> **Agente executor:** `@aiox-master` Orion atuando com persona `@pm` Morgan
> **Próxima fase:** Phase 2 — Assess (`@architect` Aria fará complexity scoring)
> **Fontes consolidadas:** docs/specs/* + docs/prompts-esposa/* + docs/assets-esposa/*

---

## 1. Project Info

| Campo | Valor |
|---|---|
| **Nome do produto** | SESI Edu / ProntoProfe! |
| **Tipo** | App Next.js — gerador de documentos pedagógicos com IA |
| **Domínio** | Educação — Anos Iniciais Ensino Fundamental (1º-5º) |
| **Cliente alpha** | Profª Sheila Goes (esposa do Sidney) — professora SESI Botucatu |
| **Owner / Dev** | Sidney Goes Junior |
| **Stack atual** | Next.js, NextAuth (Google), Anthropic Claude API, Supabase (preparado), Tailwind-like inline styles |
| **Branch atual** | master @ commit `7fa6607` (3 commits ahead origin) |

### 🎯 Norte do produto (princípio inegociável)
> **ZERAR o retrabalho da professora.** Especialmente o "copia e cola e formata
> manualmente no Word".

---

## 2. Stakeholders

| Persona | Papel | Acesso |
|---|---|---|
| **Sheila Goes** | Usuária alpha + fonte da verdade pedagógica | Login Google, plano School (∞) |
| **Sidney Goes Junior** | Founder, dev, PM | Acesso admin |
| **Outras professoras** (futuras) | Mercado pós-validação | Login Google, planos Free/Pro/School |
| **Coordenação SESI** (indireto) | Receptor do output | Não usa o app diretamente |
| **Famílias dos alunos** (indireto) | Receptor do Relatório de Etapa | Não usa o app |

---

## 3. CON — Constraints (Restrições Absolutas)

### 🔒 CON-001 — No Invention
**Origem:** REGRAS-FINAIS.md regra #1 + reforçada nos 8 prompts
**Definição:** Sistema NÃO pode inventar conteúdos. Só usa material informado (capítulo,
projeto, livro). Nunca suplementa com "conhecimento geral" do LLM.
**Validação:** PROMPT 6 (Validador LLM) + comparação com material extraído via `ProjetosModal`
**Severidade:** Bloqueante (output gerado com invenção é rejeitado e regenerado)

### 🔒 CON-002 — Não criar descritores
**Origem:** REGRAS-FINAIS.md regra #2 + PROMPT 2 v4
**Definição:** Descritores AVALIA (D01, D02…) só vêm do catálogo oficial. App não pode
inventar. Sem catálogo → omite a coluna/seção e avisa usuária.
**Validação:** Determinística (regex `D\d{2}` confrontada com catálogo carregado)
**Severidade:** Bloqueante

### 🔒 CON-003 — Estrutura fixa
**Origem:** REGRAS-FINAIS.md regra #3 + estruturas dos 8 prompts
**Definição:** PTD = 8 seções fixas, Avaliação = 6 sub-botões fixos, Aula = 8 blocos por
dia, etc. Não alterar títulos, não reorganizar, não omitir.
**Validação:** Determinística (lista canônica de títulos por tipo)
**Severidade:** Bloqueante

### 🔒 CON-004 — Seguir documentos enviados
**Origem:** REGRAS-FINAIS.md regra #4 + assets-esposa/*
**Definição:** Templates Word, logos, brasão, cartão-resposta, modelo de relatório,
catálogo de descritores — quando fornecidos — devem ser usados como estão.
**Validação:** Auditoria manual em pull request
**Severidade:** Bloqueante

### CON-005 — Anos atendidos
**Definição:** App é otimizado para Anos Iniciais EF (1º-5º ano). Outras faixas podem
funcionar mas não são prioridade.

### CON-006 — Privacidade de alunos
**Origem:** template `02b-template-word-sesi-plano.docx` contém dados pessoais de alunos
(LGPD)
**Definição:** Templates com nomes reais NÃO commitar literais no Git público. Usar
versão anonimizada ou `.gitignore` para `docs/assets-esposa/*.docx`.
**Severidade:** MUST

---

## 4. NFR — Non-Functional Requirements

### NFR-001 — Praticidade da professora (princípio guia)
**Origem:** PROMPT MESTRE
**Definição:** Em qualquer dúvida de design/implementação, escolher o caminho mais
prático para a usuária. Cada feature minimiza cliques, autopreenche quando possível,
educa a usuária sem sobrecarregar.
**Métrica:** validação subjetiva via Sheila (usuária alpha)

### NFR-002 — Saída pronta para impressão sem retrabalho
**Definição:** Output `.docx` em padrão SESI A4 (Arial 12pt, paisagem para PTD, retrato
para prova), pronto para entregar — sem precisar formatar manualmente.

### NFR-003 — Latência aceitável
**Definição:** Geração de qualquer documento em ≤ 60s no worst-case. Pipeline com
PROMPT 6 (corretor) duplica chamadas, mas precisa caber no orçamento de tempo.

### NFR-004 — Custo de API controlado
**Definição:** Pipeline Generator + Critic dobra tokens. Aceitar se justificado por
qualidade. Para plano Free (10/mês), monitorar.

### NFR-005 — Anti-floreio / objetividade
**Origem:** PROMPT 7 ("Aula simples, aplicável e sem excesso. Foco em aprendizagem
real, não enfeite.") + PROMPT MESTRE
**Definição:** Outputs concisos e diretos. Combater verbosidade do LLM.
**Validação:** PROMPT 6 v2 critério "Aplicável?"

### NFR-006 — Linguagem ética e pedagógica
**Origem:** PROMPT MESTRE seção "OBSERVAÇÃO E RELATÓRIO"
**Definição:** Termos proibidos: `desinteressado`, `lento`, `atrasado`, julgamentos.
Sempre começar observações/relatórios com aspecto positivo. Linguagem familiar
(relatório) ou técnica (observação) conforme audiência.
**Validação:** Determinística (lista de termos) + LLM (PROMPT 6)

### NFR-007 — Multi-tenancy futuro
**Definição:** Schema de DB já prever `user_id` para suportar múltiplas professoras
quando comercializar. Hoje só Sheila usa, mas evitar refatoração grande depois.

---

## 5. FR — Functional Requirements

### Telas (FR-T)

#### FR-T01 — Tela Inicial
**Origem:** TELAS-MVP.md + ATALHOS-USO.md
**Definição:** Tela com 7 botões/cards de entrada para os módulos:
1. PTD
2. Aula diária
3. Avaliação
4. Atividades
5. Observações
6. Relatório de etapa
7. Painel N1-N4
**Critério de aceite:** Cada botão leva a tela específica do módulo. Filosofia "comando
pronto, troca 3 valores e clica".

#### FR-T02 — Tela PTD (Módulo 1)
**Entrada:** Ano + Componente + Capítulo
**Saída:** PTD completo (8 seções) + botão "Gerar aula semanal"
**Estrutura do output:**
- Cabeçalho: Professora Sheila Goes / Componente / Turma/Ano / Vigência (mês/2026)
- 8 seções: COMPETÊNCIAS / HABILIDADES / CAPÍTULO DO MATERIAL / OBJETIVOS /
  EVIDÊNCIAS DE APRENDIZAGEM (4 tipos: diagnóstica, formativa, somativa, autoavaliação) /
  AÇÕES A DESENVOLVER (5 sub-itens: Atividades, Estratégias, Espaços, Materiais, Recursos) /
  ALUNOS COM FLEXIBILIZAÇÃO (Nome, Estratégia, Avaliação) / PLANEJAMENTO INTEGRADO
**Formato:** A4 paisagem, Arial 12pt
**Prompt:** `app-prompts/01-ptd.md` v3
**Critério de aceite:** Validador determinístico passa em todas as 8 seções; PROMPT 6
v2 aprova; usuária aceita visualmente

#### FR-T03 — Tela Aula Diária (Semanário) (Módulo 7)
**Entrada:** Capítulo + Horário semanal (pré-preenchido + ajustável)
**Saída:** Semana completa, aulas por dia (50 min cada)
**Estrutura por aula:** Objetivo / Habilidade / Início / Desenvolvimento / Diferenciação
(N1-N4) / Fechamento / Evidência / Avaliação Formativa
**Prompt:** `app-prompts/07-aula-diaria.md` v3
**Conexão:** Lê do PTD ativo (Aba 1)

#### FR-T04 — Tela Avaliação (Módulo 2)
**Estrutura:** 6 sub-botões dentro da tela
- Avaliação do Capítulo (10q: 7 obj + 3 diss + gabarito com nível)
- Simulado AVALIA (100% MC + cartão-resposta + gabarito com descritor + nível)
- Rubrica (tabela Critérios × N1-N4)
- Pauta de Observação (Nome + Habilidade + Nível + Observação)
- Plenária (perguntas reflexivas)
- Pauta de Leitura (Decodificação / Fluência / Fluente + Com/Sem compreensão)
**Prompt:** `app-prompts/02-avaliacao.md` v4
**Bloqueio:** Sub-botões 1 e 2 dependem do Catálogo Descritores AVALIA (asset #1
pendente)

#### FR-T05 — Tela Atividades (Módulo 3)
**Entrada:** Ano + Componente + Capítulo
**Saída:** 1 atividade principal alinhada ao PTD (Objetivo + Habilidade + Enunciado +
Contexto)
**Botão de expansão:** "Gerar nova atividade conforme necessidade" (parametrizável por
nível, aluno, foco)
**Prompt:** `app-prompts/03-atividades-complementares.md` v3

#### FR-T06 — Tela Observações (Módulo 4)
**Entrada:** Aluno (selecionar) + Descrição rápida (texto livre)
**Saída:** Observação pedagógica formal (4 eixos + final interativo)
**4 eixos:** Desempenho / Dificuldade / Estratégia usada pela professora / Resposta do aluno
**Final fixo:** "Deseja sugestão de atividade para trabalhar com o aluno?"
**Botão de follow-up:** "Gerar atividade pra ajudar este aluno" → Tela 5 parametrizada
**Prompt:** `app-prompts/04-observacao-aluno.md` v3
**Frequência:** flexível (durante aulas / semanal / fim de etapa obrigatório)

#### FR-T07 — Tela Relatório de Etapa (Módulo 5)
**Entrada:** Aluno + Informações (texto livre — pode ser auto-populado do histórico
longitudinal)
**Saída:** Relatório de 1 página em terceira pessoa, linguagem acolhedora, final positivo,
assinatura "Professora Sheila Goes"
**4 eixos:** Desenvolvimento / Avanços / Dificuldades / Estratégias
**Prompt:** `app-prompts/05-relatorio-final.md` v3

#### FR-T08 — Tela Painel N1-N4 (Feature 01)
**Entrada:** Turma (lista de alunos do cadastro)
**Saída:** Tabela classificatória (Nome / Nível / Observação / Intervenção)
**Cores:** N1🔵 N2🟢 N3🟡 N4🔴 (modo padrão) ou modo "semáforo" alternativo
**Catálogo de intervenções (fixo):**
- N1: Atendimento individual + material concreto
- N2: Mediação dirigida + leitura guiada
- N3: Consolidação com prática
- N4: Desafio / atividade avançada
**Prompt engine:** `app-prompts/08-classificador-alunos.md` v3
**Persistência:** Supabase (tabela `avaliacoes` — schema longitudinal)

### Pipeline de geração (FR-P)

#### FR-P01 — System prompt central
**Definição:** Implementar PROMPT MESTRE (`docs/specs/PROMPT-MESTRE.md`) como system
prompt em `pages/api/generate.js`. Substitui o `SESI_SYSTEM_PROMPT` atual.

#### FR-P02 — Validador determinístico
**Definição:** Implementar checklist de 18+ checks em 6 categorias
(`docs/specs/CHECKLIST-VALIDACAO.md`):
1. Estrutura (4 itens)
2. Conteúdo (4 itens)
3. Intencionalidade (4 itens)
4. Tempo (3 itens)
5. Avaliação (3 itens)
6. Padrão SESI (3 itens)

#### FR-P03 — Validador LLM (PROMPT 6 v2)
**Definição:** Após cada geração, rodar PROMPT 6 v2 com 4 critérios (Estrutura correta?
/ Nada inventado? / Linguagem pedagógica? / Aplicável?). Pipeline Generator + Critic.

#### FR-P04 — Modo conservador
**Definição:** Quando faltam assets institucionais (descritores, template Word, logo,
brasão, cartão-resposta), avisar a usuária na UI ("Sem catálogo oficial, descritores
não serão gerados. Importe nas Configurações") e operar em modo conservador — omitir
em vez de inventar.

#### FR-P05 — Pipeline de input do material
**Definição:** Material do capítulo via `ProjetosModal` (já implementado, commit
`7fa6607`):
- Modo principal: extração de texto (PDF/Word/TXT) com range de páginas
- Modo fallback: imagem (foto) — UI sugere preferência por digital
- Modo "só nome do capítulo": aviso de output em modo conservador

### Persistência (FR-D)

#### FR-D01 — Schema mínimo de banco
**Origem:** `docs/specs/SCHEMA-DB.md`
**Tabelas:**
1. **alunos** (id, nome, turma)
2. **avaliacoes** (id, aluno_id, componente, nivel, observacao, data) — histórico longitudinal
3. **planejamentos** (id, tipo, ano, componente, capitulo, conteudo_gerado)
**Stack:** Supabase (já presente em `lib/supabase.js`)

#### FR-D02 — Migração do localStorage
**Definição:** Migrar `sesi_alunos` (cadastro de alunos via `AlunosModal`) para tabela
`alunos`. Manter localStorage como cache opcional.

### Exportação (FR-E)

#### FR-E01 — Exportação .docx fiel ao padrão SESI
**Definição:** Refactor de `lib/exporters/word.js` + endpoints `/api/gerar-plano-docx`,
`/api/gerar-docx` para usar:
- Template oficial recebido (`02-template-word-sesi-prova.docx`,
  `02b-template-word-sesi-plano.docx`)
- Logo SESI (`03-logo-sesi.jpeg` ou `03-logo-sesi-simplificada.jpg`)
- Cabeçalho com Profª Sheila Goes / Componente / Turma/Ano / Vigência
- Faixa lateral docCode (CE-228 para prova) + cidade (BOTUCATU)
- A4 paisagem (PTD) ou retrato (prova)
- Arial 12pt

### UI / Configurações (FR-U)

#### FR-U01 — Perfil da professora
**Definição:** Configuração com nome (default "Sheila Goes"), cidade (BOTUCATU), horário
semanal padrão (auto-preenche tela Aula Diária), ano lecionado padrão.

#### FR-U02 — Tela de upload de assets
**Definição:** Configurações onde a usuária pode fazer upload do catálogo de Descritores
AVALIA, template Word custom, logo, brasão. Importa pra Supabase Storage.

#### FR-U03 — Modo cores N1-N4
**Definição:** Toggle nas configurações: padrão (azul/verde/amarelo/vermelho) vs
"semáforo" (vermelho/laranja/amarelo/verde).

---

## 6. Open Questions / TBDs

### TBD-001 — Catálogo Descritores AVALIA
**Bloqueia:** FR-T04 sub-botões 1 e 2 (Avaliação do Capítulo + Simulado)
**Status:** Esposa confirmou que tem o documento oficial. Aguardando envio.

### TBD-002 — Brasão da escola
**Bloqueia:** Cabeçalho dos documentos (parcial — logo SESI já temos)
**Status:** Aguardando envio.

### TBD-003 — Modelo cartão-resposta oficial
**Bloqueia:** FR-T04 sub-botão 2 (Simulado)
**Status:** Aguardando envio.

### TBD-004 — Modelo de relatório final aceito pela escola
**Bloqueia:** Validação visual do FR-T07 (Relatório)
**Status:** Aguardando envio.

### TBD-005 — Pauta de Leitura: 5 termos soltos ou 2 eixos?
**Pergunta:** "Decodificação / Fluência / Fluente / Com compreensão / Sem compreensão"
são 5 categorias soltas (escolhe 1) ou 2 eixos combináveis (fase × compreensão)?
**Hipótese de implementação:** 2 eixos combináveis. Confirmar com a esposa.

### TBD-006 — Pauta de Leitura aplica a Matemática?
**Pergunta:** Esse instrumento serve só para LP ou também para Matemática (avaliando
leitura de enunciados)?
**Hipótese de implementação:** Só LP. Confirmar.

---

## 7. Mapeamento de cobertura — App atual vs Requirements

| Requirement | App hoje (commit 7fa6607) | Esforço |
|---|---|---|
| FR-T01 (Tela inicial 7 botões) | Tela inicial existe com 6 abas — refatorar | Baixo |
| FR-T02 (PTD) | Aba "plano" existe com 14 seções antigas — refazer estrutura | **Alto** |
| FR-T03 (Aula Diária / Semanário) | Não existe | **Alto** |
| FR-T04 (Avaliação 6 sub-botões) | Aba "prova" existe — expandir | **Médio-Alto** |
| FR-T05 (Atividades) | Aba "atividade" existe — alinhar comportamento | Médio |
| FR-T06 (Observações) | Não existe | **Alto** |
| FR-T07 (Relatório) | Não existe | **Alto** |
| FR-T08 (Painel N1-N4) | Não existe | **Alto** |
| FR-P01 (System prompt PROMPT MESTRE) | `SESI_SYSTEM_PROMPT` genérico — substituir | Baixo |
| FR-P02 (Validador determinístico) | Não existe | Médio |
| FR-P03 (Validador LLM PROMPT 6) | Não existe | Médio |
| FR-P04 (Modo conservador) | Não existe | Baixo |
| FR-P05 (Input via ProjetosModal) | Existe (commit 7fa6607) | ✅ pronto |
| FR-D01 (Schema 3 tabelas) | Supabase presente, schema não criado | Médio |
| FR-D02 (Migração localStorage) | localStorage atual em `sesi_alunos` | Baixo |
| FR-E01 (Exportação .docx fiel) | `lib/docBuilder.js` ~80% alinhado, `lib/planoBuilder.js` precisa refazer | **Médio-Alto** |
| FR-U01 (Perfil professora) | Existe parcial em `cfg` | Baixo |
| FR-U02 (Upload de assets) | Não existe | Médio |
| FR-U03 (Modo cores) | Não existe | Baixo |

---

## 8. Critérios de Aceite Globais (DoD do MVP)

- [ ] Sheila consegue gerar PTD para 1 capítulo em < 2 min e aceita o output sem editar
- [ ] Sheila consegue gerar Avaliação do Capítulo (Tela 4 sub-botão 1) e a coordenação
      aceita
- [ ] Sheila consegue gerar Aula Diária (Semanário) baseada em PTD ativo
- [ ] Painel N1-N4 mostra alunos da turma com nível e intervenção sugerida
- [ ] Observação pedagógica gera texto ético sem termos proibidos
- [ ] Relatório de etapa em 1 página, terceira pessoa, com assinatura
- [ ] Validador (determinístico + LLM) bloqueia outputs com invenção/estrutura errada
- [ ] Modo conservador funciona quando faltam assets institucionais
- [ ] Export .docx fiel ao padrão SESI

---

## 9. Próximo passo — Phase 2 (Assess)

**Agente próximo:** `@architect` Aria
**Task:** Complexity scoring nas 5 dimensões (Scope, Integration, Infrastructure,
Knowledge, Risk) → produz `complexity.json` → decide caminho:
- ≤ 8: SIMPLE (3 fases)
- 9-15: STANDARD (6 fases)
- ≥ 16: COMPLEX (6 fases + revision cycle)

**Avaliação preliminar Orion:** este projeto provavelmente cai em **STANDARD-COMPLEX**:
- Scope: ALTO (8 telas + 8 prompts + Supabase + validador + multi-tenant futuro)
- Integration: MÉDIO (Anthropic API, Supabase, Google OAuth, Microsoft OneDrive
  opcional, Google Drive opcional)
- Infrastructure: MÉDIO (Supabase migrations, RLS, Storage para assets)
- Knowledge: MÉDIO (BNCC, AVALIA SESI — não documentado em código, só nos docs/)
- Risk: ALTO (LGPD nos dados de alunos com laudos, qualidade pedagógica)
**Score estimado: 13-16** → STANDARD ou COMPLEX

Phase 2 vai confirmar o score e direcionar.
