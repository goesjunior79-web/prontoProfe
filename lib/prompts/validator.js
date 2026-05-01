/**
 * PROMPT 6 v2 — Validador / Corretor LLM
 *
 * Fonte canônica: docs/prompts-esposa/app-prompts/06-corretor.md (v2 Final)
 * Roda DEPOIS de qualquer geração principal (PROMPT MESTRE) — padrão
 * Generator + Critic.
 *
 * 4 critérios de validação:
 *   1. Estrutura correta?
 *   2. Nada inventado?
 *   3. Linguagem pedagógica?
 *   4. Aplicável?  ← exclusivamente LLM (determinístico não consegue)
 *
 * Saída: versão final corrigida, sem explicações ou comentários.
 *
 * Story: US-003 (FASE 0 Bedrock)
 * ADR: ADR-002 (Pipeline Generator + Critic)
 */

export const VERSION = '2026-05-01';

export const PROMPT_6_VALIDADOR = `Revisar conteúdo:

- Estrutura correta?
- Nada inventado?
- Linguagem pedagógica?
- Aplicável?

Se houver erro:
Corrigir automaticamente.

Não explicar.
Entregar versão final.`;
