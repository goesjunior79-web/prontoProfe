/**
 * Estruturas canônicas de output por tipo de documento.
 *
 * Cada tipo (correspondente a TIPOS_DE_SAIDA em lib/prompts/master.js) define
 * sua estrutura obrigatória — seções, ordem, contagens.
 *
 * Origem: docs/specs/PROMPT-MESTRE.md + app-prompts v3 finais.
 *
 * Story: US-002 (FASE 0 Bedrock)
 * ADR: ADR-003 (validador determinístico próprio)
 */

/**
 * Estruturas por tipo. Cada entrada pode ter:
 *   - sections: array de strings que DEVEM aparecer no output (na ordem)
 *   - required_count: número de seções obrigatórias (caso seja só contagem)
 *   - description: usado em mensagens de erro
 */
export const STRUCTURES = {
  PTD: {
    description: 'Plano de Trabalho Docente — 8 seções',
    sections: [
      'COMPETÊNCIAS',
      'HABILIDADES',
      'CAPÍTULO DO MATERIAL',
      'OBJETIVOS',
      'EVIDÊNCIAS DE APRENDIZAGEM',
      'AÇÕES A DESENVOLVER',
      'ALUNOS COM FLEXIBILIZAÇÃO',
      'PLANEJAMENTO INTEGRADO',
    ],
    enforce_order: true,
  },

  aula: {
    description: 'Aula Diária / Semanário — 8 blocos por aula',
    sections: [
      'OBJETIVO',
      'HABILIDADE',
      'INÍCIO',
      'DESENVOLVIMENTO',
      'DIFERENCIAÇÃO',
      'FECHAMENTO',
      'EVIDÊNCIA',
      'AVALIAÇÃO FORMATIVA',
    ],
    enforce_order: true,
    levels_required: ['N1', 'N2', 'N3', 'N4'],
  },

  avaliacao_capitulo: {
    description: 'Avaliação do Capítulo — 10 questões + gabarito',
    sections: ['QUESTÃO', 'GABARITO'],
    enforce_order: false,
    expected_questions: 10,
    levels_required: ['N1', 'N2', 'N3', 'N4'],
  },

  simulado: {
    description: 'Simulado AVALIA — 24 questões + cartão-resposta + gabarito',
    sections: ['QUESTÃO', 'CARTÃO-RESPOSTA', 'GABARITO'],
    enforce_order: false,
    expected_questions: 24,
    levels_required: ['N1', 'N2', 'N3', 'N4'],
  },

  rubrica: {
    description: 'Rubrica — tabela Critérios × N1-N4',
    sections: [],
    levels_required: ['N1', 'N2', 'N3', 'N4'],
  },

  pauta_observacao: {
    description: 'Pauta de Observação — Nome / Habilidade / Nível / Observação',
    sections: ['Nome', 'Habilidade', 'Nível', 'Observação'],
    enforce_order: false,
  },

  plenaria: {
    description: 'Plenária — perguntas reflexivas',
    sections: [],
    min_questions: 3,
  },

  pauta_leitura: {
    description: 'Pauta de Leitura — fase × compreensão',
    sections: [],
    leitura_fases: ['Decodificação', 'Fluência', 'Fluente'],
    leitura_modificadores: ['Com compreensão', 'Sem compreensão'],
  },

  atividade: {
    description: 'Atividade — Objetivo / Habilidade / Enunciado / Contexto',
    sections: ['Objetivo', 'Habilidade', 'Enunciado', 'Contexto'],
    enforce_order: false,
  },

  observacao: {
    description: 'Observação de Aluno — 4 eixos + final interativo',
    sections: [
      'Desempenho',
      'Dificuldade',
      'Estratégia',
      'Resposta',
    ],
    enforce_order: false,
    requires_interactive_final: true,
  },

  relatorio: {
    description: 'Relatório Final de Etapa — 4 eixos + final positivo + assinatura',
    sections: [
      'Desenvolvimento',
      'Avanços',
      'Dificuldades',
      'Estratégias',
    ],
    enforce_order: false,
    requires_signature: 'Professora Sheila Goes',
    requires_third_person: true,
    max_pages: 1,
  },

  painel: {
    description: 'Painel N1-N4 — tabela Aluno × Nível × Observação × Intervenção',
    sections: ['Nome', 'Nível', 'Observação', 'Intervenção'],
    enforce_order: false,
    intervencao_catalogo: [
      'Atendimento individual + material concreto',
      'Mediação dirigida + leitura guiada',
      'Consolidação com prática',
      'Desafio / atividade avançada',
    ],
  },
};

/**
 * Verifica se um tipo tem estrutura definida.
 */
export function hasStructure(tipo) {
  return Object.prototype.hasOwnProperty.call(STRUCTURES, tipo);
}

/**
 * Retorna a estrutura de um tipo, ou null se não existir.
 */
export function getStructure(tipo) {
  return STRUCTURES[tipo] || null;
}

/**
 * Verifica se todas as seções obrigatórias estão presentes no output.
 * Retorna lista das seções faltantes (vazia se tudo OK).
 */
export function checkSectionsPresent(content, tipo) {
  const struct = getStructure(tipo);
  if (!struct?.sections?.length) return [];

  const upperContent = content.toUpperCase();
  return struct.sections.filter(section => {
    return !upperContent.includes(section.toUpperCase());
  });
}

/**
 * Verifica se a ordem das seções está correta no output.
 * Retorna { ok: boolean, expected, actual } — actual é a ordem detectada.
 * Se enforce_order for false, retorna sempre ok=true.
 */
export function checkSectionsOrder(content, tipo) {
  const struct = getStructure(tipo);
  if (!struct?.sections?.length || !struct.enforce_order) {
    return { ok: true };
  }

  const upperContent = content.toUpperCase();
  const positions = struct.sections.map(section => ({
    section,
    position: upperContent.indexOf(section.toUpperCase()),
  }));

  // Filtra os que existem (verificação separada de presence)
  const present = positions.filter(p => p.position >= 0);
  const sorted = [...present].sort((a, b) => a.position - b.position);

  const expectedOrder = present.map(p => p.section);
  const actualOrder = sorted.map(p => p.section);

  const ok = expectedOrder.every((s, i) => s === actualOrder[i]);
  return { ok, expected: expectedOrder, actual: actualOrder };
}

/**
 * Verifica se os níveis N1-N4 obrigatórios aparecem no output.
 * Retorna lista de níveis faltantes.
 */
export function checkLevelsPresent(content, tipo) {
  const struct = getStructure(tipo);
  if (!struct?.levels_required?.length) return [];

  return struct.levels_required.filter(nivel => !content.includes(nivel));
}
