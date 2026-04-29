import { useState } from 'react';

const SECOES = [
  { key: 'inicio',    icon: '🚀', label: 'Primeiros passos' },
  { key: 'plano',     icon: '📋', label: 'Plano de Aula' },
  { key: 'prova',     icon: '📝', label: 'Provas' },
  { key: 'atividade', icon: '✏️', label: 'Atividades' },
  { key: 'corrigir',  icon: '📷', label: 'Corrigir Turma' },
  { key: 'alunos',    icon: '👥', label: 'Cadastro de Alunos' },
  { key: 'projetos',  icon: '📁', label: 'Projetos' },
  { key: 'exportar',  icon: '💾', label: 'Exportar' },
  { key: 'dicas',     icon: '💡', label: 'Dicas rápidas' },
  { key: 'glossario', icon: '📖', label: 'Glossário' },
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
      {p('O ProntoProfe é seu gerador de materiais escolares com Inteligência Artificial. Com ele, você cria Planos de Aula, provas e atividades em segundos — e ainda corrige provas fotografando as folhas dos alunos.')}

      {h3('Configuração inicial')}
      {passo(1, 'No primeiro acesso, informe seu nome completo. Ele vai aparecer no cabeçalho de todos os documentos.')}
      {passo(2, 'Para completar outras informações (cidade, código da escola), clique em ⚙️ Meus dados na barra lateral.')}
      {tip('Seu nome é inserido automaticamente em todos os documentos gerados.')}

      {h3('Como funciona')}
      {p('Escolha o tipo de material (Plano de Aula, Prova ou Atividade), preencha os campos e clique em ✦ Gerar material. O resultado aparece em segundos e pode ser exportado em Word ou PDF.')}

      {h3('Limites de uso')}
      {p('O plano gratuito permite até 10 gerações por mês. O plano Pro permite 150. O plano Escola é ilimitado. O contador de uso aparece no cabeçalho quando você se aproximar do limite.')}
    </>
  ),

  plano: (
    <>
      {h2('Gerando um Plano de Aula')}
      {p('O Plano de Trabalho Docente (PTD) é gerado automaticamente com todas as seções do modelo SESI: Habilidades, Objetivos, Evidências de Aprendizagem, Ações a Desenvolver, Recursos Didáticos e mais.')}

      {h3('Passo a passo')}
      {passo(1, 'Clique na aba Plano de Aula na parte superior da tela.')}
      {passo(2, 'Preencha: Turma, Série, Disciplina, Período (1ª a 4ª Etapa) e Vigência (ex: Fevereiro–Abril 2025).')}
      {passo(3, 'Em Conteúdo da aula, informe as aulas por semana e descreva o conteúdo — ou envie o livro didático em PDF.')}
      {passo(4, 'Clique em ✦ Gerar material e aguarde alguns segundos.')}
      {passo(5, 'O plano completo aparecerá abaixo. Exporte em Word, PDF ou salve no Google Drive.')}

      {h3('Enviando o livro didático')}
      {p('Clique em Selecionar arquivos na seção 📚 Livro / Material de apoio. Você pode enviar o PDF do livro, capítulos em Word, imagens de páginas ou textos em TXT.')}
      {p('Para PDFs grandes, o sistema pedirá quais páginas usar. Escolha o intervalo e clique em Usar estas páginas.')}
      {tip('Quanto mais conteúdo do livro você enviar, mais rico e contextualizado será o plano gerado.')}

      {h3('Alunos com necessidades educacionais especiais')}
      {p('Na seção correspondente, liste os alunos com suas condições (um por linha). A IA vai gerar estratégias individualizadas para cada aluno.')}
      {p('Se você cadastrou alunos em 👥 Alunos, eles aparecerão automaticamente ao selecionar a turma e série. Clique em Usar estes alunos para preencher o campo.')}

      {h3('Atividades de nivelamento (Avalia+)')}
      {p('Marque a opção Incluir atividades de nivelamento para que a IA gere atividades diárias para 5 dias letivos, com questões por nível de aprendizagem (abaixo do esperado, em desenvolvimento, proficiente e avançado).')}
    </>
  ),

  prova: (
    <>
      {h2('Gerando Provas')}
      {p('O ProntoProfe gera provas objetivas (múltipla escolha) e dissertativas (resposta aberta), salvando o gabarito ou a rubrica automaticamente para correção posterior.')}

      {h3('Prova Objetiva (Múltipla Escolha)')}
      {passo(1, 'Clique na aba Prova.')}
      {passo(2, 'Preencha Turma, Série, Disciplina e Etapa.')}
      {passo(3, 'Escolha dificuldade, quantidade de questões e tipos (Múltipla escolha, Verdadeiro/Falso, Preencher lacunas).')}
      {passo(4, 'Descreva o conteúdo ou envie o material de apoio.')}
      {passo(5, 'Clique em ✦ Gerar material. A prova é criada com gabarito ao final.')}
      {tip('O gabarito é salvo automaticamente. Acesse 📷 Corrigir para fotografar e corrigir as provas da turma.')}

      {h3('Prova Dissertativa')}
      {passo(1, 'Em Tipos de questões, selecione Dissertativa.')}
      {passo(2, 'Preencha os demais campos e clique em Gerar.')}
      {passo(3, 'A IA gera questões abertas (sem alternativas) e uma Rubrica de Correção ao final, com critérios e pesos para cada questão.')}
      {passo(4, 'A rubrica é salva automaticamente. Em 📷 Corrigir, fotografe a resposta do aluno e a IA avaliará critério por critério.')}
      {warn('Provas mistas (objetivas + dissertativas) geram gabarito no formato dissertativo. Recomendamos usar um tipo por vez para correção mais precisa.')}

      {h3('Critérios de avaliação')}
      {p('Use o campo Especificar critérios de avaliação para listar os critérios da prova (um por linha). A IA usará esses critérios para calibrar as questões.')}

      {h3('Valor total da prova')}
      {p('Informe o valor total da prova (ex: 10,0) no campo Valor total da prova. A nota de cada aluno será calculada proporcionalmente.')}
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
      {passo(5, 'Repita para cada aluno. Ao final, clique em 📊 Exportar planilha para baixar a planilha com notas e detalhes.')}
      {tip('O sistema mostra média, maior e menor nota da turma automaticamente.')}

      {h3('Corrigindo prova dissertativa')}
      {passo(1, 'Selecione um gabarito do tipo Dissertativa (marcado com ✍️).')}
      {passo(2, 'Os critérios de correção (rubrica) são exibidos em destaque — revise os pontos por questão.')}
      {passo(3, 'Fotografe a folha com a resposta escrita do aluno.')}
      {passo(4, 'A IA lê o texto manuscrito ou digitado e avalia cada critério (Conteúdo, Argumentação, Linguagem) atribuindo uma porcentagem atingida.')}
      {passo(5, 'O card do aluno é expansível — clique para ver a nota por questão, por critério e o comentário de feedback.')}
      {warn('Para melhor precisão na leitura de textos manuscritos, use boa iluminação e enquadre bem a folha na foto.')}

      {h3('Baixando o gabarito')}
      {p('Clique no botão ⬇ ao lado de qualquer gabarito para baixar o gabarito em formato de texto (objetiva) ou os critérios de correção completos (dissertativa).')}
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
      {passo(4, 'No campo Necessidade educacional especial, descreva a condição do aluno (ex: TDAH, dislexia, deficiência visual, aluno laudado).')}
      {passo(5, 'Clique em Cadastrar aluno.')}
      {tip('Apenas alunos com necessidade educacional preenchida aparecem na sugestão automática do Plano de Aula.')}

      {h3('Sugestão automática no Plano de Aula')}
      {p('Ao preencher o Plano de Aula com Turma e Série, o sistema verifica automaticamente se há alunos com necessidades especiais cadastrados naquela turma. Um aviso verde aparece com os nomes encontrados.')}
      {p('Clique em Usar estes alunos para preencher automaticamente o campo de estratégias individualizadas. Você pode editar o texto depois.')}

      {h3('Exportar lista de alunos')}
      {p('Clique em Baixar lista no topo desta tela para baixar a lista completa de alunos em planilha.')}
    </>
  ),

  projetos: (
    <>
      {h2('Projetos Pedagógicos')}
      {p('Use Projetos para guardar diretrizes e materiais de um projeto pedagógico específico. Quando um projeto está ativo, a IA usa suas diretrizes em todos os documentos gerados.')}

      {h3('Criando um projeto')}
      {passo(1, 'Clique em 📁 Projetos na barra lateral.')}
      {passo(2, 'Clique em Novo projeto.')}
      {passo(3, 'Dê um nome ao projeto (ex: Projeto Sustentabilidade), defina o período e para qual série é destinado.')}
      {passo(4, 'Em Diretrizes, descreva os objetivos, temas e qualquer instrução específica do projeto.')}
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
          ['📄 Word', 'Documento editável no formato oficial SESI, com cabeçalho, logo e formatação correta. Ideal para entregar à coordenação.'],
          ['🖨️ PDF', 'Abre uma janela de impressão. Salve como PDF ou imprima diretamente. O PTD sai em paisagem (A4 horizontal).'],
          ['☁️ Google Drive', 'Salva diretamente na sua conta Google, na pasta ProntoProfe / Ano / Mês. Requer autorização na primeira vez.'],
        ].map(([titulo, desc]) => (
          <div key={titulo} style={{ background: '#F7F6F3', border: '0.5px solid #E0DDD5', borderRadius: 8, padding: '9px 12px' }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#333', marginBottom: 2 }}>{titulo}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{desc}</div>
          </div>
        ))}
      </div>
      {tip('Um aviso de confirmação aparece após cada exportação. Se não aparecer, verifique a pasta Downloads do seu computador.')}

      {h3('Histórico de documentos')}
      {p('Seus últimos documentos gerados ficam salvos no Histórico, logo abaixo do botão Gerar. Clique em qualquer item para recarregar o conteúdo no painel.')}
    </>
  ),

  dicas: (
    <>
      {h2('Dicas para melhores resultados')}

      {h3('Para planos de aula mais completos')}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
        {[
          'Sempre envie o livro didático em PDF ou Word — a IA usará o conteúdo real.',
          'Preencha todos os campos: Turma, Série, Disciplina, Período e Vigência.',
          'Use o campo de Conteúdo para orientar o foco da aula (ex: "Capítulo 3 — Frações").',
          'Para atividades de nivelamento, descreva no campo de conteúdo o que deseja trabalhar.',
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
          'Corrija logo após aplicar a prova — o gabarito fica salvo neste aplicativo.',
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
          ['Botão Descartar', 'Descarta o resultado atual para gerar um novo'],
          ['Botão Copiar', 'Copia o texto gerado para colar em outro documento'],
          ['Histórico', 'Seus últimos documentos ficam salvos — clique para recarregar'],
          ['Busca no cadastro', 'Com 4+ alunos, aparece campo de busca na tela de Alunos'],
        ].map(([cmd, desc]) => (
          <div key={cmd} style={{ display: 'flex', gap: 10, fontSize: 12, alignItems: 'flex-start' }}>
            <span style={{ background: '#E8EFFC', color: '#003DA5', fontWeight: 700, padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontSize: 11 }}>{cmd}</span>
            <span style={{ color: '#444', paddingTop: 2 }}>{desc}</span>
          </div>
        ))}
      </div>

      {warn('Os dados de alunos, gabaritos e configurações ficam salvos neste aplicativo. Evite abrir em aba anônima (modo privado do navegador) — os dados salvos não aparecem nesses acessos.')}

      {h3('Precisa de ajuda?')}
      {p('Clique em Tutorial a qualquer momento para rever este guia. Para problemas técnicos, fale com o responsável pelo sistema em sua unidade SESI.')}
    </>
  ),

  glossario: (
    <>
      {h2('Glossário de termos')}
      {p('Explicação dos termos pedagógicos usados no ProntoProfe:')}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['PTD — Plano de Trabalho Docente', 'O plano de aula no formato oficial SESI. Contém objetivos, conteúdos, estratégias de ensino e critérios de avaliação.'],
          ['Etapa / Período', 'Divisão do ano letivo (1ª, 2ª, 3ª ou 4ª Etapa). Equivale ao trimestre ou bimestre, dependendo da unidade.'],
          ['Vigência', 'O período de tempo coberto pelo plano. Ex: "Fevereiro–Abril 2025".'],
          ['Prova objetiva', 'Prova com alternativas para marcar (múltipla escolha, verdadeiro/falso). A correção é automática.'],
          ['Prova dissertativa', 'Prova com questões abertas, onde o aluno escreve a resposta. A correção usa critérios da rubrica.'],
          ['Rubrica de correção', 'Tabela com critérios e pesos usados para avaliar respostas dissertativas. Ex: Conteúdo (40%), Argumentação (30%), Linguagem (30%).'],
          ['Gabarito', 'Respostas corretas de uma prova objetiva (ex: "Questão 1: B").'],
          ['Necessidades educacionais especiais', 'Condições que requerem atenção individualizada: TDAH, dislexia, deficiência visual, auditiva, motora, transtorno do espectro autista (TEA), entre outros.'],
          ['Avalia+ / Atividades de nivelamento', 'Programa SESI de atividades por nível de aprendizagem: Abaixo do esperado (N1), Em desenvolvimento (N2), Proficiente (N3) e Avançado (N4).'],
          ['BNCC', 'Base Nacional Comum Curricular — documento do MEC que define as aprendizagens essenciais de cada etapa escolar.'],
          ['Metodologias ativas', 'Estratégias de ensino que colocam o aluno como protagonista: Gamificação (jogos), Sala invertida (aluno estuda em casa, pratica na aula), Estações de aprendizagem (grupos rotacionam entre atividades diferentes).'],
        ].map(([termo, def]) => (
          <div key={termo} style={{ background: '#F7F6F3', border: '0.5px solid #E0DDD5', borderRadius: 9, padding: '10px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#003DA5', marginBottom: 4 }}>{termo}</div>
            <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>{def}</div>
          </div>
        ))}
      </div>
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
