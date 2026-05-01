/**
 * Constantes do schema do banco — usadas pelos endpoints e validators.
 *
 * Mantida em sincronia com supabase/migrations/001_init.sql.
 *
 * Story: US-004 (FASE 1 DB+Auth)
 */

export const TABLES = Object.freeze({
  USUARIOS: 'usuarios',
  ALUNOS: 'alunos',
  AVALIACOES: 'avaliacoes',
  PLANEJAMENTOS: 'planejamentos',
  ACESSOS_DADOS: 'acessos_dados',
});

export const NIVEIS = Object.freeze(['N1', 'N2', 'N3', 'N4']);

/**
 * Tipos de planejamento — espelha o CHECK constraint da tabela `planejamentos`
 * e os TIPOS_DE_SAIDA de lib/prompts/master.js.
 */
export const TIPOS_PLANEJAMENTO = Object.freeze([
  'PTD',
  'aula',
  'avaliacao_capitulo',
  'simulado',
  'rubrica',
  'pauta_observacao',
  'plenaria',
  'pauta_leitura',
  'atividade',
  'observacao',
  'relatorio',
  'painel',
]);

export const FONTES_AVALIACAO = Object.freeze([
  'manual',
  'classificador_llm',
  'avaliacao',
]);

export const ACOES_AUDIT = Object.freeze([
  'VIEW',
  'CREATE',
  'UPDATE',
  'DELETE',
  'EXPORT',
]);

export const BUCKETS = Object.freeze({
  INSTITUTIONAL: 'institutional-assets',
  USER: 'user-assets',
});

export const RECURSOS_AUDIT = Object.freeze([
  'usuarios',
  'alunos',
  'avaliacoes',
  'planejamentos',
]);

/**
 * Helpers de validação client-side (antes de enviar pro Supabase).
 * Lança erro se valor inválido.
 */
export function validateNivel(nivel) {
  if (!NIVEIS.includes(nivel)) {
    throw new Error(`Nível inválido: "${nivel}". Esperado: ${NIVEIS.join(', ')}`);
  }
}

export function validateTipoPlanejamento(tipo) {
  if (!TIPOS_PLANEJAMENTO.includes(tipo)) {
    throw new Error(
      `Tipo de planejamento inválido: "${tipo}". Esperado: ${TIPOS_PLANEJAMENTO.join(', ')}`
    );
  }
}

export function validateAcaoAudit(acao) {
  if (!ACOES_AUDIT.includes(acao)) {
    throw new Error(`Ação inválida: "${acao}". Esperado: ${ACOES_AUDIT.join(', ')}`);
  }
}

export function validateFonte(fonte) {
  if (fonte === null || fonte === undefined) return; // nullable
  if (!FONTES_AVALIACAO.includes(fonte)) {
    throw new Error(
      `Fonte inválida: "${fonte}". Esperado: ${FONTES_AVALIACAO.join(', ')}`
    );
  }
}
