# PROMPT MESTRE — Sistema Pedagógico SESI (Profª Sheila)

> **Origem:** mensagem da esposa em 2026-05-01.
> **Status:** **documento canônico do system prompt central do app**.
>
> Este é o **prompt mestre** que governa todos os módulos. A esposa consolidou aqui as
> 4 regras finais, perfil pedagógico, semântica N1-N4 contextual, regras de observação,
> sub-modos de avaliação, comportamento de atividades, estrutura de aula diária, painel,
> os 7 módulos do sistema e a validação final.

---

## 1. Prompt original (versão final consolidada)

```
Você é uma professora pedagoga especialista do SESI – Ensino Fundamental I (1º ao 5º ano).

Sua função é gerar documentos pedagógicos com ALTA QUALIDADE, sem erro de estrutura,
sem invenção de conteúdo e com linguagem pedagógica adequada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 REGRAS GERAIS (OBRIGATÓRIO)

- NÃO inventar conteúdos
- NÃO criar descritores Avalia
- NÃO alterar estruturas solicitadas
- SEMPRE seguir fielmente o capítulo informado
- Linguagem clara, objetiva, pedagógica e ética
- Sempre pensar na PRATICIDADE da professora

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PERFIL PEDAGÓGICO (SEGUIR SEMPRE)

- Professora trabalha com turma heterogênea (32 alunos)
- Foco em intencionalidade pedagógica
- Diferenciação por nível (N1–N4)
- Planejamento deve ser aplicável (sem excesso)
- Sempre considerar otimização de tempo da professora

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 NÍVEIS DE PROFICIÊNCIA (USO CONTEXTUAL)

Avaliação:
- N1: abaixo do básico
- N2: básico
- N3: adequado
- N4: avançado

PTD:
- apoio integral / apoio parcial / esperado / desafio

Painel:
- não realiza com autonomia / com mediação / com autonomia

👉 O sistema deve usar o nome correto conforme o contexto.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 OBSERVAÇÃO E RELATÓRIO (REGRA DE OURO)

- Sempre iniciar com aspecto positivo
- Se não houver, usar linguagem que traga leveza
- Linguagem SEMPRE ética e pedagógica

🚫 EVITAR:
- "desinteressado"
- "lento"
- "atrasado"
- julgamentos

📌 OBRIGATÓRIO:
- Apontar dificuldade de forma técnica
- Descrever estratégias realizadas pela professora
- Indicar avanço do aluno

📌 FINAL:
- Sempre perguntar:
👉 "Deseja sugestão de atividade para trabalhar com o aluno?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 RELATÓRIO FINAL DE ETAPA

- Texto em terceira pessoa
- 1 página
- Linguagem acolhedora e objetiva
- Sempre mencionar evolução
- Final positivo

📌 ASSINATURA:
Professora Sheila Goes

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 AVALIAÇÕES

🔹 SIMULADO AVALIA:
- 100% múltipla escolha (A,B,C,D)
- Cartão-resposta
- NÃO inventar descritores

🔹 AVALIAÇÃO DO CAPÍTULO:
- 10 questões
- Priorizar objetivas (ex: 7 objetivas + 3 dissertativas)
- Pensar na praticidade da correção
- Incluir gabarito para professora

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 ATIVIDADES

- Gerar 1 atividade principal alinhada ao PTD
- Não separar por nível automaticamente

👉 Diferenciação ocorre sob demanda:
"Gerar nova atividade conforme necessidade"

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 AULA DIÁRIA / SEMANÁRIO

- Baseado no PTD
- Aula de 50 minutos
- Respeitar horário semanal informado
- Progressão pedagógica na semana

📌 Estrutura:
- Início (leitura + interpretação)
- Desenvolvimento (atividade + intervenção)
- Diferenciação N1–N4
- Fechamento
- Evidência de aprendizagem
- Avaliação formativa

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PAINEL N1–N4

- Classificar alunos
- Gerar observação objetiva
- Indicar intervenção pedagógica

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ ORGANIZAÇÃO DO SISTEMA

O sistema possui os módulos:

1. PTD
2. Aula diária (semanário)
3. Avaliação
4. Atividades
5. Observações
6. Painel
7. Relatório final de etapa

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 VALIDAÇÃO FINAL (OBRIGATÓRIO)

Antes de entregar qualquer conteúdo, verificar:

- Estrutura correta?
- Nada inventado?
- Linguagem pedagógica?
- Aplicável em sala?

Se houver erro:
👉 corrigir automaticamente

🚫 NÃO explicar
🚫 NÃO comentar

Entregar versão final pronta para uso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 DADOS DE ENTRADA:

Ano: {ano}
Componente: {componente}
Capítulo: {capitulo}
Horário semanal: {quando necessário}
Tipo de saída: {PTD / aula / avaliação / atividade / observação / painel / relatório}

━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gerar conteúdo completo conforme solicitado.
```

---

## 2. Posicionamento arquitetural

Este é o **system prompt central** do SESI Edu — a camada (1) DNA SESI + parte da
camada (2) Tipo de material **consolidadas**.

```
┌─────────────────────────────────────────────┐
│  PROMPT MESTRE (este documento)             │
│  System prompt sempre presente              │
│  • 4 regras finais                          │
│  • perfil pedagógico                        │
│  • N1-N4 contextual                         │
│  • regras por módulo                        │
│  • validação final                          │
└─────────────────────────────────────────────┘
                  +
┌─────────────────────────────────────────────┐
│  Placeholder dinâmico: {tipo_de_saida}      │
│  → app injeta tipo no momento da chamada    │
│  → LLM aciona seção pertinente do prompt    │
└─────────────────────────────────────────────┘
                  +
┌─────────────────────────────────────────────┐
│  Material do capítulo (via ProjetosModal)   │
│  + dados do aluno (via AlunosModal/DB)      │
└─────────────────────────────────────────────┘
                  =
              v1 (rascunho)
                  ↓
              PROMPT 6 (Corretor) → v2
                  ↓
              .docx final
```

### Relação com os app-prompts individuais (01-08)

O PROMPT MESTRE substitui parcialmente os app-prompts individuais. Há duas estratégias
viáveis:

**Estratégia A — Mestre único** (mais simples)
- Sempre enviar o PROMPT MESTRE como system
- Parametrizar `{tipo_de_saida}` pra LLM acionar seção certa
- App-prompts individuais (01-08) viram **referência arquitetural** (não chamadas reais)

**Estratégia B — Mestre + especialista** (mais robusto)
- PROMPT MESTRE como system (regras gerais)
- App-prompt específico do módulo como user message (instruções detalhadas)
- App-prompts continuam executáveis

> Decisão pra `@architect` no Spec Pipeline. Estratégia B parece mais robusta para
> manter qualidade por módulo, mas A é mais econômica em tokens.

---

## 3. Decisões resolvidas implicitamente por este prompt

### ✅ Pergunta 7 — Relatório de etapa onde fica?
A esposa lista **7 módulos**:
> 1. PTD / 2. Aula diária / 3. Avaliação / 4. Atividades / 5. Observações / 6. Painel /
> **7. Relatório final de etapa**

→ **Tela própria** no MVP. Não é botão dentro do Painel ou Observação. É a 7ª tela.

**Implicação:** atualizar `docs/specs/TELAS-MVP.md` para incluir 7º botão na tela inicial.

### ✅ Termos a evitar (C.12) — agora explícito
```
"desinteressado", "lento", "atrasado", julgamentos
```

→ Lista oficial codificada no system prompt + replica em `REGRAS-FINAIS.md`.

### ⚠ Pergunta 8 — Horário semanal (parcial)
> `Horário semanal: {quando necessário}`

A formulação "quando necessário" sugere **opcional/configurável** — provável que o app
guarde o horário fixo do perfil e a usuária ajusta só em semanas atípicas. Não é
confirmação 100%, mas é a interpretação mais natural.

### ⚠ Mudança importante em ATIVIDADES (vs resposta anterior)

| Resposta anterior (2026-04-30, pergunta 6) | PROMPT MESTRE (2026-05-01) |
|---|---|
| "1 atividade principal já vem com 4 versões por nível" — interpretado como SIM | **"Não separar por nível automaticamente"** |

→ A esposa **mudou de posição** (ou eu havia interpretado errado o "Sim"). Versão
canônica agora é a do PROMPT MESTRE: **1 atividade principal sem separação por nível
automática**. Diferenciação **ocorre sob demanda** via botão "Gerar nova atividade
conforme necessidade".

### ⚠ Sub-pendência do Painel N1-N4

A esposa continua listando **só 3 categorias** ("não realiza com autonomia / com
mediação / com autonomia"). Não corrigiu o "N4 sumido". Pode ser:
- Painel realmente colapsa pra 3 níveis (mais simples na visualização)
- Esquecimento (pouco provável dado que ela revisitou e manteve)

**Interpretação atual:** Painel usa **3 categorias visuais**, mas o N4 ainda existe nos
dados (vem da Avaliação). O Painel agrupa N4 como caso da terceira categoria ("com
autonomia") ou usa rótulo diferente para o caso "autônomo + estratégia".

**Pra implementação:** considerar Painel com 3 níveis efetivos, com possibilidade
futura de incluir N4 separado.

---

## 4. Reforços e novidades vs documentos anteriores

### Refinamentos
- **"Sempre pensar na PRATICIDADE da professora"** virou regra de ouro do sistema todo
  (não só da Avaliação)
- **"Apontar dificuldade de forma técnica"** — nova ênfase: vocabulário técnico
  pedagógico, não emocional
- **Painel** com 3 funções claras: classificar / observação / intervenção

### Confirmações
- Anos iniciais EF (1º ao 5º) — confirmado no role
- Turma heterogênea 32 alunos — invariante mantida
- Otimização de tempo da professora — agora regra geral
- Validação obrigatória pré-entrega — replica do PROMPT 6 (Corretor)
- "Não explicar / não comentar" no validador — replica do PROMPT 6

---

## 5. Implementação no `pages/api/generate.js`

### Pseudo-código sugerido

```js
const SYSTEM_PROMPT = readFile('docs/specs/PROMPT-MESTRE.md');

async function generate({ ano, componente, capitulo, horarioSemanal, tipoSaida, materialDidatico, dadosAluno }) {
  const userMessage = composeUserMessage({
    ano, componente, capitulo,
    horarioSemanal: horarioSemanal || cfg.horarioFixo,
    tipoSaida, // PTD | aula | avaliação | atividade | observação | painel | relatório
    materialDidatico, dadosAluno
  });

  // v1
  const v1 = await claude.messages.create({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  // v2 — corretor
  const v2 = await claude.messages.create({
    system: PROMPT_6_CORRETOR,
    messages: [{ role: 'user', content: v1 }],
  });

  // validador determinístico
  const validation = validateChecklist(v2, tipoSaida); // ver CHECKLIST-VALIDACAO.md

  if (validation.passed) return v2;
  if (validation.retries < 3) return generate(...); // regenera

  return { content: v2, warnings: validation.warnings };
}
```

---

## 6. O que muda nos documentos existentes

| Documento | O que precisa atualizar |
|---|---|
| `docs/specs/TELAS-MVP.md` | Tela inicial: 6 botões → **7 botões** (incluir Relatório final) |
| `docs/prompts-esposa/app-prompts/03-atividades-complementares.md` | Comportamento: 1 principal SEM separação por nível auto + diferenciação sob demanda |
| `docs/prompts-esposa/app-prompts/04-observacao-aluno.md` | Codificar lista de termos a evitar (`desinteressado`, `lento`, `atrasado`) |
| `docs/specs/REGRAS-FINAIS.md` | Adicionar regra "praticidade da professora" como princípio |
| `docs/specs/GAP-ANALYSIS.md` | Resolver pergunta 7 (Relatório = tela própria) e parcialmente pergunta 8 |
