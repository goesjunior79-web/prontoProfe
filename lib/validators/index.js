/**
 * API pública do validador determinístico.
 *
 * Uso típico:
 *   import { validateOutput } from '@/lib/validators';
 *   const result = validateOutput(generatedText, 'PTD');
 *   if (!result.passed) console.warn(result.errors);
 *
 * Story: US-002 (FASE 0 Bedrock)
 * ADR: ADR-003 (validador determinístico próprio)
 *
 * Comportamento:
 *   - Sempre verifica termos proibidos (universal)
 *   - Verifica estrutura conforme tipo (se tipo conhecido)
 *   - Aplica heurísticas específicas (interactive question, signature, etc)
 *
 * Retorno:
 *   {
 *     passed: boolean,            // true se zero errors
 *     errors: Issue[],            // bloqueiam a aceitação
 *     warnings: Issue[],          // não bloqueiam mas sinalizam
 *   }
 *
 * Issue:
 *   {
 *     code: string,               // identificador estável (ex: FORBIDDEN_TERM)
 *     severity: 'high' | 'medium' | 'low',
 *     message: string,            // legível por humano
 *     ...metadata extra (term, section, position, etc)
 *   }
 */

import {
  hasStructure,
  getStructure,
  checkSectionsPresent,
  checkSectionsOrder,
  checkLevelsPresent,
} from './structures.js';
import { findForbiddenTerms } from './forbiddenTerms.js';
import {
  hasInteractiveFinalQuestion,
  hasSignature,
  isThirdPerson,
  withinPageLimit,
  endsPositively,
  hasSection,
} from './heuristics.js';

export function validateOutput(content, tipo) {
  const errors = [];
  const warnings = [];

  // ── Universal: termos proibidos ─────────────────────────────────────────
  const forbidden = findForbiddenTerms(content);
  for (const f of forbidden) {
    errors.push({
      code: 'FORBIDDEN_TERM',
      severity: 'high',
      message: `Termo proibido encontrado: "${f.termo}"`,
      term: f.termo,
      position: f.position,
      context: f.context,
    });
  }

  // ── Estrutura por tipo ──────────────────────────────────────────────────
  if (!hasStructure(tipo)) {
    warnings.push({
      code: 'UNKNOWN_TYPE',
      severity: 'low',
      message: `Tipo desconhecido: "${tipo}". Validação estrutural ignorada.`,
    });
    return { passed: errors.length === 0, errors, warnings };
  }

  const struct = getStructure(tipo);

  // Seções presentes
  const missing = checkSectionsPresent(content, tipo);
  for (const section of missing) {
    errors.push({
      code: 'STRUCTURE_MISSING_SECTION',
      severity: 'high',
      message: `Seção obrigatória ausente: "${section}"`,
      section,
    });
  }

  // Ordem das seções
  const orderCheck = checkSectionsOrder(content, tipo);
  if (orderCheck.ok === false) {
    errors.push({
      code: 'STRUCTURE_OUT_OF_ORDER',
      severity: 'high',
      message: 'Seções fora da ordem esperada',
      expected: orderCheck.expected,
      actual: orderCheck.actual,
    });
  }

  // Níveis N1-N4 obrigatórios
  const missingLevels = checkLevelsPresent(content, tipo);
  for (const nivel of missingLevels) {
    errors.push({
      code: 'STRUCTURE_MISSING_LEVEL',
      severity: 'medium',
      message: `Nível obrigatório ausente: ${nivel}`,
      level: nivel,
    });
  }

  // ── Heurísticas específicas por tipo ────────────────────────────────────

  // Observação: pergunta interativa final
  if (struct.requires_interactive_final && !hasInteractiveFinalQuestion(content)) {
    errors.push({
      code: 'MISSING_INTERACTIVE_QUESTION',
      severity: 'high',
      message:
        'Falta pergunta final obrigatória ("Deseja sugestão de atividade para trabalhar com o aluno?")',
    });
  }

  // Relatório: terceira pessoa
  if (struct.requires_third_person && !isThirdPerson(content)) {
    warnings.push({
      code: 'NOT_THIRD_PERSON',
      severity: 'medium',
      message:
        'Relatório provavelmente está em primeira pessoa (detectados verbos como "observei", "verifiquei"). Esperado: terceira pessoa ("a professora observou…").',
    });
  }

  // Relatório: assinatura
  if (struct.requires_signature) {
    if (!hasSignature(content, struct.requires_signature)) {
      errors.push({
        code: 'MISSING_SIGNATURE',
        severity: 'high',
        message: `Falta assinatura: "${struct.requires_signature}"`,
        expected: struct.requires_signature,
      });
    }
  }

  // Relatório: limite de páginas
  if (struct.max_pages) {
    if (!withinPageLimit(content, struct.max_pages)) {
      warnings.push({
        code: 'EXCEEDS_PAGE_LIMIT',
        severity: 'medium',
        message: `Output excede ${struct.max_pages} página(s) (estimativa por word count)`,
        max_pages: struct.max_pages,
      });
    }
  }

  // Relatório: fechamento positivo
  if (tipo === 'relatorio' && !endsPositively(content)) {
    warnings.push({
      code: 'NOT_ENDING_POSITIVELY',
      severity: 'low',
      message: 'Final do relatório não detectou tom claramente positivo',
    });
  }

  // Simulado: cartão-resposta
  if (tipo === 'simulado' && !hasSection(content, 'CARTÃO-RESPOSTA')) {
    errors.push({
      code: 'MISSING_CARTAO_RESPOSTA',
      severity: 'high',
      message: 'Simulado AVALIA precisa incluir CARTÃO-RESPOSTA',
    });
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// Re-exports úteis
export { STRUCTURES, hasStructure, getStructure } from './structures.js';
export { TERMOS_PROIBIDOS, findForbiddenTerms, hasForbiddenTerms } from './forbiddenTerms.js';
export * as heuristics from './heuristics.js';
