import { useState } from 'react';

const SECOES = [
  { key: 'inicio',    icon: '🚀', label: 'Primeiros passos' },
  { key: 'plano',     icon: '📋', label: 'Plano de Aula (PTD)' },
  { key: 'prova',     icon: '📝', label: 'Provas' },
  { key: 'atividade', icon: '✏️', label: 'Atividades' },
  { key: 'corrigir',  icon: '📷', label: 'Corrigir Turma' },
  { key: 'alunos',    icon: '👥', label: 'Cadastro de Alunos' },
  { key: 'projetos',  icon: '📁', label: 'Projetos' },
  { key: 'exportar',  icon: '💾', label: 'Exportar' },
  { key: 'dicas',     icon: '💡', label: 'Dicas rápidas' },
];

const tip = (txt) => (
  <div style={{ background: '#EAF3DE', border: '0.5px solid #B5D98A', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#3B6D11', marginTop: 10 }}>
    💡 {txt}
  </div>
);

const warn = (txt) => (
  <div style={{ background: '#FFF8E6', border: '0.5px solid #F0D080', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#7A5A00', marginTop: 10 }}>
    ⚠️ {txt}
  </div>
);

const passo = (n, txt) => (
  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
    <div style={{ minWidth: 24, height: 24, borderRadius: '50%', background: '#003DA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{n}</div>
    <div style={{ fontSize: 13, color: '#333', lineHeight: 1.55, paddingTop: 2 }}>{txt}</div>
  </div>
);

const h2 = (txt) => <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 10, marginTop: 18 }}>{txt}</div>;
const h3 = (txt) => <div style={{ fontWeight: 600, fontSize: 13, color: '#003DA5', marginBottom: 6, marginTop: 14 }}>{txt}</div>;
const p  = (txt) => <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6, marginBottom: 8 }}>{txt}</div>;

const CONTEUDO = {
  inicio: (
    <>
      {h2('Bem-vinda ao ProntoProfe!')}
      {p('O ProntoProfe é seu assistente pedagógico digital. Com ele, você gera Planos de Trabalho Docente (PTD), provas e atividades em segundos, usando Inteligência Artificial, e corrige provas fotografando as folhas dos alunos.')}

      {h3('Configuração inicial')}
      {passo(1, 'No primeiro acesso, um assistente de configuração aparecerá automaticamente. Informe seu nome, cidade e código de documento (ex: CE-228).')}
      {passo(2, 'Para editar essas informações depois, clique em ⚙️ Configurar na barra lateral (ou rodapé no celular).')}
      {tip('Seu nome será inserido automaticamente no cabeçalho de todos os documentos gerados.')}

      {h3('Escolhendo a IA')}
      {p('O ProntoProfe funciona com diferentes inteligências artificiais. Escolha a disponível para o seu plano:')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {[
          ['Claude (Anthropic)', 'Plano gratuito e pago — melhor qualidade pedagógica', '#E8EFFC', '#003DA5'],
          ['ChatGPT (OpenAI)', 'Plano Pro e Escola', '#E8FCE8', '#1A5C1A'],
          ['Gemini (Google)', 'Plano Pro e Escola', '#FFF8E6', '#7A5A00'],
          ['Copilot (Azure)', 'Apenas Plano Escola', '#F3F0FF', '#4B35A8'],
        ].map(([nome, desc, bg, cor]) => (
          <div key={nome} style={{ background: bg, border: `0.5px solid ${cor}30`, borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: cor }}>{nome}</div>
            <div style={{ fontSize: 11, color: '#555' }}>{desc}</div>
          </div>
        ))}
      </div>
      {warn('Sem chave de API configurada no servidor, apenas Claude (padrão) funcionará. Fale com o administrador do sistema se precisar de outras IAs.')}

      {h3('Limites de uso')}
      {p('O plano gratuito permite até 10 gerações por mês. O plano Pro permite 150. O plano Escola é ilimitado. O contador aparece no canto superior direito.')}
    </>
  ),

  plano: (
    <>
      {h2('Gerando um Plano de Trabalho Docente (PTD)')}
      {p('O PTD é gerado automaticamente com todas as seções do modelo SESI: Habilidades, Objetivos, Evidências de Aprendizagem, Ações a Desenvolver, Recursos Didáticos e mais.')}

      {h3('Passo a passo')}
      {passo(1, 'Clique na aba Plano de Aula na parte superior da tela.')}
      {passo(2, 'Preencha os Dados do documento: Turma, Série, Disciplina, Etapa e Vigência (ex: Fevereiro–Abril 2025).')}
      {passo(3, 'Em Conteúdo da aula, informe as aulas por semana, as metodologias e descreva o conteúdo que será trabalhado — ou envie o livro didático em PDF.')}
      {passo(4, 'Clique em ✦ Gerar com [IA escolhida] e aguarde alguns segundos.')}
      {passo(5, 'O PTD completo aparecerá abaixo. Exporte em Word (📄), PDF (🖨️) ou salve no Google Drive.')}

      {h3('Enviando o livro didático')}
      {p('Clique em Selecionar arquivos na seção 📚 Livro / Material de apoio. Você pode enviar o PDF do livro, capítulos em Word, imagens de páginas ou textos em TXT.')}
      {p('Para PDFs grandes, o sistema pedirá quais páginas extrair. Escolha o intervalo e clique em Extrair.')}
      {tip('Quanto mais conteúdo do livro você enviar, mais rico e contextualizado será o PTD gerado.')}

      {h3('Alunos com Necessidades Educacionais Especiais (NEE)')}
      {p('Na seção Alunos com necessidades especiais, liste os alunos com suas condições (um por linha). A IA vai gerar estratégias individualizadas para cada aluno na seção FLEXIBILIZAÇÃO DE ESTRATÉGIAS.')}
      {p('Se você cadastrou alunos em 👥 Alunos com observações de NEE, eles aparecerão automaticamente ao selecionar a turma e série. Clique em Usar estes alunos para preencher o campo.')}

      {h3('Plano de Ação Avalia+')}
      {p('Marque a opção Incluir Plano de Ação Avalia+ para que a IA gere atividades diárias para 5 dias letivos, com leitura do dia, questão objetiva vinculada a descritor e nivelamento N1/N2/N3/N4.')}
    </>
  ),

  prova: (
    <>
      {h2('Gerando Provas')}
      {p('O ProntoProfe gera provas objetivas (múltipla escolha) e dissertativas (resposta aberta), salvando o gabarito ou a rubrica automaticamente para correção posterior.')}

      {h3('Prova Objetiva (Múltipla Escolha)')}
      {passo(1, 'Clique na aba Prova.')}
      {passo(2, 'Preencha Turma, Série, Disciplina e Etapa.')}
      {passo(3, 'Escolha dificuldade, quantidade de questões e tipos (Múltipla escolha, Verdadeiro/Falso, Lacunas).')}
      {passo(4, 'Descreva o conteúdo ou envie o material de apoio.')}
      {passo(5, 'Clique em Gerar. A prova é criada com gabarito ao final.')}
      {tip('O gabarito é salvo automaticamente. Acesse 📷 Corrigir para fotografar e corrigir as provas da turma.')}

      {h3('Prova Dissertativa')}
      {passo(1, 'Em Tipos de questões, selecione Dissertativa.')}
      {passo(2, 'Preencha os demais campos e clique em Gerar.')}
      {passo(3, 'A IA gera questões abertas (sem alternativas) e uma Rubrica de Correção ao final, com critérios e pesos para cada questão.')}
      {passo(4, 'A rubrica é salva automaticamente. Em 📷 Corrigir, fotografe a resposta do aluno e a IA avaliará critério por critério.')}
      {warn('Provas mistas (objetivas + dissertativas) geram gabarito no formato dissertativo. Recomendamos usar um tipo por vez para correção mais precisa.')}

      {h3('Critérios de avaliação')}
      {p('Use o campo O que será avaliado? para listar os critérios da prova (um por linha). A IA usará esses critérios para calibrar as questões.')}

      {h3('Valor do instrumento')}
      {p('Informe o valor total da prova (ex: 10,0) no campo Valor do instrumento. A nota de cada aluno será calculada proporcionalmente.')}
    </>
  ),

  atividade: (
    <>
      {h2('Gerando Atividades Pedagógicas')}
      {p('Gere atividades complementares de forma rápida: exercícios de fixação, atividades lúdicas, pesquisas, produções textuais e estudos de caso.')}

      {h3('Passo a passo')}
      {passo(1, 'Clique na aba Atividade.')}
      {passo(2, 'Preencha Turma, Série, Disciplina e Etapa.')}
      {passo(3, 'Em Tipos de atividade, selecione um ou mais tipos (Exercícios, Lúdica, Pesquisa, Produção textual, Estudo de caso).')}
      {passo(4, 'Descreva o conteúdo ou envie o material de apoio.')}
      {passo(5, 'Clique em Gerar. A atividade vem estruturada com: Título, Objetivo, Materiais, Tempo estimado, Instruções, Atividade e Critérios de avaliação.')}

      {tip('Você pode enviar imagens de páginas do livro como material de apoio — a IA lerá e usará o conteúdo visual para criar a atividade.')}
    </>
  ),

  corrigir: (
    <>
      {h2('Corrigindo Provas da Turma')}
      {p('Fotografe a folha de resposta de cada aluno e a IA corrige automaticamente, calcula a nota e gera uma planilha com os resultados da turma.')}

      {h3('Corrigindo prova objetiva (múltipla escolha)')}
      {passo(1, 'Clique em 📷 Corrigir na barra lateral.')}
      {passo(2, 'Selecione o gabarito salvo correspondente à prova aplicada.')}
      {passo(3, 'Digite o nome do aluno e fotografe (ou carregue da galeria) a folha de resposta.')}
      {passo(4, 'Clique em ✦ Corrigir esta prova. Em segundos, a nota aparece na lista.')}
      {passo(5, 'Repita para cada aluno. Ao final, clique em 📊 Exportar planilha para baixar o CSV com notas e detalhes.')}
      {tip('O sistema mostra média, maior e menor nota da turma automaticamente.')}

      {h3('Corrigindo prova dissertativa')}
      {passo(1, 'Selecione um gabarito do tipo Dissertativa (marcado com ✍️).')}
      {passo(2, 'A Rubrica de correção é exibida em destaque — revise os critérios e pesos.')}
      {passo(3, 'Fotografe a folha com a resposta escrita do aluno.')}
      {passo(4, 'A IA lê o texto manuscrito ou digitado e avalia cada critério (Conteúdo, Argumentação, Linguagem) atribuindo uma porcentagem atingida.')}
      {passo(5, 'O card do aluno é expansível — clique para ver a nota por questão, por critério e o comentário de feedback.')}
      {warn('Para melhor precisão na leitura de textos manuscritos, use boa iluminação e enquadre bem a folha na foto.')}

      {h3('Baixando o gabarito')}
      {p('Clique no botão ⬇ ao lado de qualquer gabarito para baixar um arquivo .txt com o gabarito (objetiva) ou a rubrica completa (dissertativa).')}
    </>
  ),

  alunos: (
    <>
      {h2('Cadastro de Alunos')}
      {p('Cadastre seus alunos para que o ProntoProfe reconheça automaticamente quem tem Necessidades Educacionais Especiais (NEE) ao gerar o PTD.')}

      {h3('Como cadastrar um aluno')}
      {passo(1, 'Clique em 👥 Alunos na barra lateral.')}
      {passo(2, 'Clique em Novo aluno ou no botão + Adicionar aluno.')}
      {passo(3, 'Preencha: Nome completo, Turma, Série, Disciplina.')}
      {passo(4, 'No campo Observação (NEE, condição, etc.), descreva a condição do aluno (ex: TDAH, dislexia, deficiência visual, aluno laudado).')}
      {passo(5, 'Clique em Cadastrar aluno.')}
      {tip('Apenas alunos com o campo Observação preenchido aparecem na sugestão de NEE do PTD.')}

      {h3('Sugestão automática no PTD')}
      {p('Ao preencher o Plano de Aula com Turma e Série, o sistema verifica automaticamente se há alunos cadastrados com NEE naquela turma. Um aviso verde aparece com os nomes encontrados.')}
      {p('Clique em Usar estes alunos para preencher automaticamente o campo de estratégias individualizadas. Você pode editar o texto depois.')}

      {h3('Exportar lista de alunos')}
      {p('Clique em Exportar CSV no topo do modal para baixar a lista completa de alunos em planilha.')}
    </>
  ),

  projetos: (
    <>
      {h2('Projetos Pedagógicos')}
      {p('Use Projetos para guardar diretrizes e materiais de um projeto pedagógico específico. Quando um projeto está ativo, a IA usa suas diretrizes em todos os documentos gerados.')}

      {h3('Criando um projeto')}
      {passo(1, 'Clique em 📁 Projetos na barra lateral.')}
      {passo(2, 'Clique em Novo projeto.')}
      {passo(3, 'Dê um nome ao projeto (ex: Projeto Sustentabilidade), defina o período e a série-alvo.')}
      {passo(4, 'Em Diretrizes, descreva os objetivos, temas transversais, competências e qualquer instrução específica do projeto.')}
      {passo(5, 'Você pode adicionar arquivos ao projeto (PDFs, Word, imagens) para que a IA use como referência.')}

      {h3('Ativando um projeto')}
      {p('Um projeto ativo aparece em destaque amarelo no topo da tela. A IA incluirá automaticamente as diretrizes do projeto em todos os PTDs, provas e atividades gerados enquanto o projeto estiver ativo.')}
      {tip('Para desativar um projeto, acesse 📁 Projetos e clique em Desativar.')}
    </>
  ),

  exportar: (
    <>
      {h2('Exportando Documentos')}
      {p('Após gerar qualquer material, você pode exportá-lo em diferentes formatos diretamente do painel de resultado.')}

      {h3('Formatos disponíveis')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {[
          ['📄 Word (.docx)', 'Documento editável no formato oficial SESI, com cabeçalho, logo e formatação correta. Ideal para entregar à coordenação.'],
          ['🖨️ PDF', 'Abre uma janela de impressão. Salve como PDF ou imprima diretamente. O PTD sai em paisagem (A4 horizontal).'],
          ['📊 Excel (.xlsx)', 'Disponível para exportar tabelas e gabaritos.'],
          ['☁️ Google Drive', 'Salva diretamente na sua conta Google, na pasta ProntoProfe / Ano / Mês. Requer autorização na primeira vez.'],
        ].map(([titulo, desc]) => (
          <div key={titulo} style={{ background: '#F7F6F3', border: '0.5px solid #E0DDD5', borderRadius: 8, padding: '9px 12px' }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#333', marginBottom: 2 }}>{titulo}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{desc}</div>
          </div>
        ))}
      </div>
      {tip('Um aviso de confirmação aparece após cada exportação. Se não aparecer, verifique se o download foi bloqueado pelo navegador.')}

      {h3('Histórico de documentos')}
      {p('Seus últimos documentos gerados ficam salvos no Histórico, logo abaixo do botão Gerar. Clique em qualquer item para recarregar o conteúdo no painel.')}
    </>
  ),

  dicas: (
    <>
      {h2('Dicas para melhores resultados')}

      {h3('Para PTDs mais completos')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
        {[
          'Sempre envie o livro didático em PDF ou Word — a IA usará o conteúdo real.',
          'Preencha todos os campos: Turma, Série, Disciplina, Etapa e Vigência.',
          'Use o campo de Conteúdo para orientar o foco da aula (ex: "Capítulo 3 — Frações").',
          'Se usar Avalia+, liste os descritores que deseja trabalhar no campo de conteúdo.',
        ].map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#333' }}>
            <span style={{ color: '#003DA5', fontWeight: 700 }}>✓</span> {d}
          </div>
        ))}
      </div>

      {h3('Para provas com melhor qualidade')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
        {[
          'Use o campo "O que será avaliado?" para orientar os critérios da prova.',
          'Envie trechos do livro ou slides como material de apoio.',
          'Para provas dissertativas, revise a rubrica antes de corrigir os alunos.',
          'Corrija logo após aplicar a prova — o gabarito é salvo localmente no navegador.',
        ].map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#333' }}>
            <span style={{ color: '#003DA5', fontWeight: 700 }}>✓</span> {d}
          </div>
        ))}
      </div>

      {h3('Atalhos e truques')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
        {[
          ['Ctrl + Enter', 'Gera o documento sem clicar no botão'],
          ['Botão Limpar', 'Limpa o resultado para gerar um novo sem recarregar a página'],
          ['Botão Copiar', 'Copia o texto gerado para a área de transferência'],
          ['Histórico', 'Seus últimos documentos ficam salvos — clique para recarregar'],
          ['Busca no cadastro', 'Com 4+ alunos, aparece campo de busca no modal de Alunos'],
        ].map(([cmd, desc]) => (
          <div key={cmd} style={{ display: 'flex', gap: 10, fontSize: 12, alignItems: 'flex-start' }}>
            <span style={{ background: '#E8EFFC', color: '#003DA5', fontWeight: 700, padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontSize: 11 }}>{cmd}</span>
            <span style={{ color: '#444', paddingTop: 2 }}>{desc}</span>
          </div>
        ))}
      </div>

      {warn('Os dados de alunos, gabaritos e configurações ficam salvos apenas neste navegador. Evite usar o modo anônimo ou limpar os dados do navegador.')}

      {h3('Precisa de ajuda?')}
      {p('Clique em ? Tutorial a qualquer momento para rever este guia. Para problemas técnicos, fale com o responsável pelo sistema em sua unidade SESI.')}
    </>
  ),
};

export default function TutorialModal({ onClose }) {
  const [secao, setSecao] = useState('inicio');

  const idxAtual = SECOES.findIndex(s => s.key === secao);
  const anterior = SECOES[idxAtual - 1];
  const proximo  = SECOES[idxAtual + 1];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #E0DDD5', gap: 10 }}>
          <span style={{ fontSize: 20 }}>📖</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Tutorial — ProntoProfe!</div>
            <div style={{ fontSize: 11, color: '#888' }}>Guia completo para professoras</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '0.5px solid #D3D1C7', background: '#F7F6F3', cursor: 'pointer', fontSize: 14, color: '#555' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Menu lateral */}
          <div style={{ width: 170, borderRight: '1px solid #E0DDD5', overflowY: 'auto', flexShrink: 0, padding: '8px 0' }}>
            {SECOES.map(s => (
              <button
                key={s.key}
                onClick={() => setSecao(s.key)}
                style={{ width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: secao === s.key ? '#E8EFFC' : 'transparent', color: secao === s.key ? '#003DA5' : '#444', fontSize: 12, fontWeight: secao === s.key ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, borderLeft: secao === s.key ? '3px solid #003DA5' : '3px solid transparent' }}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
            {CONTEUDO[secao]}

            {/* Navegação anterior/próximo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '0.5px solid #E0DDD5' }}>
              <button
                onClick={() => anterior && setSecao(anterior.key)}
                disabled={!anterior}
                style={{ padding: '7px 14px', borderRadius: 8, border: '0.5px solid #D3D1C7', background: anterior ? '#F7F6F3' : 'transparent', color: anterior ? '#333' : '#ccc', cursor: anterior ? 'pointer' : 'default', fontSize: 12 }}
              >
                ← {anterior ? anterior.icon + ' ' + anterior.label : ''}
              </button>
              <button
                onClick={() => proximo && setSecao(proximo.key)}
                disabled={!proximo}
                style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: proximo ? '#003DA5' : '#E0DDD5', color: proximo ? '#fff' : '#aaa', cursor: proximo ? 'pointer' : 'default', fontSize: 12, fontWeight: 600 }}
              >
                {proximo ? proximo.icon + ' ' + proximo.label : 'Fim do tutorial'} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
