/**
 * Configuração dos 6 sub-tipos da Tela Avaliação.
 *
 * Story: US-007a-f (FASE 2 — Avaliação 6-em-1)
 * Spec: docs/specs/TELAS-MVP.md §4
 *
 * Cada sub-tipo define:
 *   - tipo (chave em TIPOS_DE_SAIDA)
 *   - title, icon, descricao, cor (UI)
 *   - placeholderForm: campos extras além de ano/componente/capitulo
 *   - buildPrompt(params) — função que monta o prompt para o LLM
 */

const TIPO_SUBTIPO = {
  capitulo: 'avaliacao_capitulo',
  simulado: 'simulado',
  rubrica: 'rubrica',
  'pauta-observacao': 'pauta_observacao',
  plenaria: 'plenaria',
  'pauta-leitura': 'pauta_leitura',
};

export const SUBTIPOS = {
  capitulo: {
    slug: 'capitulo',
    tipo: 'avaliacao_capitulo',
    title: 'Avaliação do Capítulo',
    icon: '📝',
    descricao: '10 questões (mix 7 objetivas + 3 dissertativas) + gabarito',
    cor: '#0C447C',
    buildPrompt({ ano, componente, capitulo }) {
      return `Gere uma AVALIAÇÃO DO CAPÍTULO no padrão SESI v3.

Dados:
- Ano: ${ano}
- Componente: ${componente}
- Capítulo: ${capitulo}

Estrutura obrigatória:
- Cabeçalho institucional (Professora Sheila Goes, ano, componente, capítulo)
- 10 questões mix: 7 objetivas (A/B/C/D, 1 correta) + 3 dissertativas
- Cada questão com nível N1-N4 (distribuído equilibrado)
- Cada questão com descritor AVALIA (D01, D02...) se LP/Mat
- GABARITO ao final com nível e comentário breve por questão
- Critérios de avaliação para a professora

Não inventar — usar somente o capítulo informado.`;
    },
  },

  simulado: {
    slug: 'simulado',
    tipo: 'simulado',
    title: 'Simulado AVALIA',
    icon: '🧪',
    descricao: '24 questões 100% múltipla escolha + cartão-resposta + gabarito',
    cor: '#3B6D11',
    buildPrompt({ ano, componente, capitulo }) {
      return `Gere um SIMULADO AVALIA no padrão SESI v3.

Dados:
- Ano: ${ano}
- Componente: ${componente} (Simulado AVALIA aceita LP+Mat juntos: '${componente}')
- Capítulo: ${capitulo}

Estrutura obrigatória:
1. PROVA: 24 questões 100% múltipla escolha (A/B/C/D)
   - Distratores plausíveis (não triviais)
   - Distribuição equilibrada N1-N4
   - Cada questão com descritor AVALIA (D01, D02...)

2. CARTÃO-RESPOSTA: página separada com:
   - Cabeçalho (Nome / Nº / Turma)
   - 24 linhas com bolinhas A/B/C/D para marcar

3. GABARITO COMENTADO:
   - Nº questão | Resposta correta | Descritor | Nível N1-N4 | Comentário breve

Não inventar conteúdo nem descritores fora do material.`;
    },
  },

  rubrica: {
    slug: 'rubrica',
    tipo: 'rubrica',
    title: 'Rubrica',
    icon: '📊',
    descricao: 'Tabela Critérios × N1-N4 para qualquer atividade',
    cor: '#BA7517',
    buildPrompt({ ano, componente, capitulo }) {
      return `Gere uma RUBRICA no padrão SESI.

Dados:
- Ano: ${ano}
- Componente: ${componente}
- Capítulo: ${capitulo}

Saída obrigatória: tabela com pelo menos 3 critérios. Cada linha:
- Critério (descrição)
- N1 (apoio integral) — descrição do que o aluno demonstra
- N2 (apoio parcial) — descrição
- N3 (esperado) — descrição
- N4 (avançado) — descrição

Use linguagem objetiva e observável (sem termos vagos).`;
    },
  },

  'pauta-observacao': {
    slug: 'pauta-observacao',
    tipo: 'pauta_observacao',
    title: 'Pauta de Observação',
    icon: '👁',
    descricao: 'Planilha por aluno: Nome / Habilidade / Nível / Observação',
    cor: '#5F5E5A',
    buildPrompt({ ano, componente, capitulo, alunos = '' }) {
      return `Gere uma PAUTA DE OBSERVAÇÃO no padrão SESI.

Dados:
- Ano: ${ano}
- Componente: ${componente}
- Capítulo: ${capitulo}
${alunos ? `- Alunos: ${alunos}` : ''}

Saída: planilha estruturada com 4 colunas:
| Nome | Habilidade observada | Nível (N1-N4) | Observação pedagógica objetiva |

Liste 3 a 5 habilidades principais do capítulo como linhas-modelo (a professora
preenche os nomes e níveis específicos por aluno em sala).`;
    },
  },

  plenaria: {
    slug: 'plenaria',
    tipo: 'plenaria',
    title: 'Plenária',
    icon: '🗣',
    descricao: 'Roteiro de discussão coletiva com perguntas reflexivas',
    cor: '#A32D2D',
    buildPrompt({ ano, componente, capitulo }) {
      return `Gere um ROTEIRO DE PLENÁRIA (discussão coletiva) no padrão SESI.

Dados:
- Ano: ${ano}
- Componente: ${componente}
- Capítulo: ${capitulo}

Saída obrigatória:
- 5 a 7 PERGUNTAS REFLEXIVAS sobre o conteúdo (do simples ao complexo)
- Espaço para registro da fala dos alunos
- Tempo estimado: 20-30 minutos

Evitar perguntas com resposta sim/não. Estimular argumentação.`;
    },
  },

  'pauta-leitura': {
    slug: 'pauta-leitura',
    tipo: 'pauta_leitura',
    title: 'Pauta de Leitura',
    icon: '📖',
    descricao: 'Planilha de fase × compreensão (Decodificação/Fluência/Fluente × Com/Sem)',
    cor: '#0C447C',
    buildPrompt({ ano, componente, capitulo, alunos = '' }) {
      return `Gere uma PAUTA DE LEITURA no padrão SESI.

Dados:
- Ano: ${ano}
- Componente: ${componente}
- Capítulo: ${capitulo}
${alunos ? `- Alunos: ${alunos}` : ''}

Estrutura obrigatória — 2 EIXOS COMBINÁVEIS:

EIXO 1 — Fase de leitura:
- Decodificação
- Fluência (em desenvolvimento)
- Fluente

EIXO 2 — Compreensão (modificador):
- Com compreensão
- Sem compreensão

Saída: planilha por aluno com colunas:
| Nome | Fase | Compreensão | Observação técnica |

Use SOMENTE estes termos técnicos. Não use termos genéricos como "lê bem"/"lê mal".

Liste pelo menos 5 linhas-modelo (a professora preenche em sala).`;
    },
  },
};

/**
 * Lista todos os subtipos como array (para exibir grid).
 */
export function listSubtipos() {
  return Object.values(SUBTIPOS);
}

/**
 * Busca config por slug (URL param).
 */
export function getSubtipo(slug) {
  return SUBTIPOS[slug] || null;
}
