/**
 * Termos proibidos em outputs do SESI Edu.
 *
 * Lista oficial mandada pela esposa em 2026-05-01 (PROMPT MESTRE seção
 * "OBSERVAÇÃO E RELATÓRIO — REGRA DE OURO" / "EVITAR").
 *
 * Aplicável a TODOS os outputs (não só Observação/Relatório). LLM pode usar
 * esses termos por inércia em outros contextos — validador rejeita
 * universalmente.
 *
 * Story: US-002 (FASE 0 Bedrock)
 * Origem: docs/specs/REGRAS-FINAIS.md + docs/specs/PROMPT-MESTRE.md
 */

export const TERMOS_PROIBIDOS = [
  'desinteressado',
  'lento',
  'atrasado',
];

/**
 * Verifica se o conteúdo contém termos proibidos.
 * Case-insensitive, busca palavra completa (não substring).
 *
 * Retorna array de matches: [{ termo, position, context }].
 * Vazio se nenhum termo proibido encontrado.
 */
export function findForbiddenTerms(content) {
  const matches = [];
  for (const termo of TERMOS_PROIBIDOS) {
    // \b = word boundary; case insensitive
    const regex = new RegExp(`\\b${escapeRegex(termo)}\\b`, 'gi');
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        termo: termo,
        position: match.index,
        // Contexto: 30 chars antes e depois
        context: content.slice(
          Math.max(0, match.index - 30),
          Math.min(content.length, match.index + termo.length + 30)
        ),
      });
    }
  }
  return matches;
}

/**
 * Versão simples: retorna true se contém algum termo proibido.
 */
export function hasForbiddenTerms(content) {
  return findForbiddenTerms(content).length > 0;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
