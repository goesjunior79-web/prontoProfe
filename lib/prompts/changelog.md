# Changelog dos Prompts

> Registro de mudanças nos prompts canônicos do SESI Edu.
> **Princípio:** prompts são imutáveis após release. Nova versão = novo VERSION.

## 2026-05-01 — `validador-2026-05-01` (v1.0.0)

**Story:** US-003 (FASE 0 Bedrock)
**Arquivo:** `lib/prompts/validator.js`

PROMPT 6 v2 — Validador / Corretor LLM. Roda DEPOIS do generator (PROMPT MESTRE)
no pipeline Generator + Critic (ADR-002).

### Conteúdo
4 critérios de validação consolidados:
1. Estrutura correta?
2. Nada inventado?
3. Linguagem pedagógica?
4. Aplicável? ← exclusivamente LLM (determinístico não consegue)

### Origem
[`docs/prompts-esposa/app-prompts/06-corretor.md`](../../docs/prompts-esposa/app-prompts/06-corretor.md) (v2 Final)

### Comportamento
- Recebe v1 do generator como input
- Corrige automaticamente se houver erro
- NÃO explica nem comenta — entrega só a versão final


## 2026-05-01 — `master-2026-05-01` (v1.0.0)

**Story:** US-001 (FASE 0 Bedrock)
**Commit:** TBD (em PR `feature/US-001-prompt-mestre`)

Primeira versão em produção do PROMPT MESTRE consolidado.

### Adicionado
- `lib/prompts/master.js` exporta:
  - `VERSION = '2026-05-01'`
  - `PROMPT_MESTRE` (string completa do system prompt)
  - `TIPOS_DE_SAIDA` (12 valores enum)
  - `isTipoDeSaidaValido(tipo)` helper
- Compatível com Anthropic Prompt Caching (`cache_control: ephemeral`)

### Mudanças vs `SESI_SYSTEM_PROMPT` antigo (em `pages/api/generate.js`)
- Substitui prompt curto/genérico por documento institucional completo
- Adiciona seção de regras gerais (NÃO inventar / NÃO criar descritores / etc)
- Adiciona perfil pedagógico
- Define níveis N1–N4 com semântica contextual
- Define regras de Observação/Relatório (regra de ouro)
- Detalhamento por módulo (PTD, Aula, Avaliação, Atividade, Observação, Relatório, Painel)
- Validação final obrigatória (4 critérios)

### Origem
Documento canônico: [`docs/specs/PROMPT-MESTRE.md`](../../docs/specs/PROMPT-MESTRE.md).
Resultado de 4+ rodadas de iteração com a esposa do Sidney (Profª Sheila Goes — alpha
tester) entre 2026-04-29 e 2026-05-01.
