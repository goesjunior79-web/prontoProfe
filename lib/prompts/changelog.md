# Changelog dos Prompts

> Registro de mudanças nos prompts canônicos do SESI Edu.
> **Princípio:** prompts são imutáveis após release. Nova versão = novo VERSION.

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
