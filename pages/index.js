import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { PLAN_LIMITS, PROVIDER_LABELS, MESES, LOADING_MSGS } from '../lib/constants';
import { stripMarkdown, extrairGabarito, extrairRubrica, getFileName } from '../lib/utils';
import { buildDocHTML } from '../lib/docBuilder';
import { buildPlanoHTML } from '../lib/planoBuilder';

import LoginGate       from '../components/LoginGate';
import AppHeader       from '../components/AppHeader';
import BottomNav       from '../components/BottomNav';
import ProviderSelector from '../components/ProviderSelector';
import TabSelector     from '../components/TabSelector';
import DocumentFields  from '../components/DocumentFields';
import ContentSection  from '../components/ContentSection';
import ModeloUpload    from '../components/ModeloUpload';
import FileUploader    from '../components/FileUploader';
import ResultPanel     from '../components/ResultPanel';
import SetupModal      from '../components/modals/SetupModal';
import ConfigModal     from '../components/modals/ConfigModal';
import UpgradeModal    from '../components/modals/UpgradeModal';
import TurmaModal      from '../components/modals/TurmaModal';
import ProjetosModal   from '../components/modals/ProjetosModal';
import AlunosModal     from '../components/modals/AlunosModal';
import TutorialModal   from '../components/modals/TutorialModal';
import HistoryPanel    from '../components/HistoryPanel';
import Toast           from '../components/Toast';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '693379917328-kmc6ahda2tj4hoemfm2j09bo7m7cs6ou.apps.googleusercontent.com';

export default function Home() {
  const { data: session, status } = useSession();

  const [tab, setTab]       = useState('prova');
  const [plan, setPlan]     = useState('free');
  const [provider, setProvider] = useState('claude');
  const [usage, setUsage]   = useState(0);

  const [showUpgrade, setShowUpgrade]               = useState(false);
  const [showProviderUpgrade, setShowProviderUpgrade] = useState(false);
  const [showSetup, setShowSetup]                   = useState(false);
  const [showConfig, setShowConfig]                 = useState(false);
  const [showTurma, setShowTurma]                   = useState(false);
  const [showProjetos, setShowProjetos]             = useState(false);
  const [showAlunos, setShowAlunos]                 = useState(false);
  const [showTutorial, setShowTutorial]             = useState(false);
  const [projetos, setProjetos]                     = useState([]);

  const [loading, setLoading]           = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [errorMsg, setErrorMsg]         = useState('');
  const [result, setResult]             = useState('');
  const [resultTitle, setResultTitle]   = useState('');
  const [copied, setCopied]             = useState(false);
  const [historico, setHistorico]       = useState([]);

  const [files, setFiles]               = useState([]);
  const [pageRanges, setPageRanges]     = useState({});
  const [modelo, setModelo]             = useState(null);
  const [modeloLoading, setModeloLoading] = useState(false);

  const [gdLoading, setGdLoading] = useState(false);
  const [gdStatus, setGdStatus]   = useState('');
  const [odLoading, setOdLoading] = useState(false);
  const [odStatus, setOdStatus]   = useState('');
  const [setupStep, setSetupStep] = useState(0);
  const [toast, setToast]         = useState(null);

  const handleGenerateRef = useRef(null);

  const [cfg, setCfg] = useState({ nomeProfessora: '', cidade: 'BOTUCATU', docCode: 'CE-228', tipoDoc: 'Prova Objetiva' });

  const [plano, setPlano]       = useState({ disciplina: '', serie: '', turma: '', etapa: '1ª Etapa', vigencia: '', duracao: '2 aulas/semana', metodos: [], conteudo: '', alunosEspeciais: '', incluirAvalia: false });
  const [prova, setProva]       = useState({ disciplina: '', serie: '', turma: '', etapa: '1ª Etapa', dificuldade: 'Intermediário', qtd: '10 questões', tipos: ['Múltipla escolha'], instrucoes: '', conteudo: '', criterios: '', valorInstrumento: '10,0' });
  const [atividade, setAtividade] = useState({ disciplina: '', serie: '', turma: '', etapa: '1ª Etapa', tipos: ['Exercícios de fixação'], conteudo: '' });

  const [gabaritos, setGabaritos]       = useState([]);
  const [gabSelecionado, setGabSelecionado] = useState(null);
  const [turmaAlunos, setTurmaAlunos]   = useState([]);
  const [turmaAlunoNome, setTurmaAlunoNome] = useState('');
  const [turmaFoto, setTurmaFoto]       = useState(null);
  const [turmaCorrigindo, setTurmaCorrigindo] = useState(false);

  // Persist state (cfg e gabaritos continuam em localStorage; uso e histórico vêm do servidor)
  useEffect(() => {
    const saved = localStorage.getItem('sesi_cfg');
    if (saved) { try { setCfg(JSON.parse(saved)); } catch (e) {} }
    else setShowSetup(true);
    const gabs = localStorage.getItem('sesi_gabaritos');
    if (gabs) { try { setGabaritos(JSON.parse(gabs)); } catch (e) {} }
    const prjs = localStorage.getItem('sesi_projetos');
    if (prjs) { try { setProjetos(JSON.parse(prjs)); } catch (e) {} }
  }, []);

  useEffect(() => {
    const handler = e => { if (result) { e.preventDefault(); e.returnValue = ''; return ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [result]);

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); return; }
    const id = setInterval(() => setLoadingMsgIdx(i => (i + 1) % LOADING_MSGS.length), 3500);
    return () => clearInterval(id);
  }, [loading]);

  const saveCfg      = c  => { setCfg(c);      localStorage.setItem('sesi_cfg',      JSON.stringify(c)); };
  const saveProjetos = ps => { setProjetos(ps); localStorage.setItem('sesi_projetos', JSON.stringify(ps)); };
  const limitReached = plan !== 'school' && usage >= PLAN_LIMITS[plan];

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) { const d = await res.json(); if (d.plan) setPlan(d.plan); if (d.usage !== undefined) setUsage(d.usage); }
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) { const d = await res.json(); if (d.items) setHistorico(d.items); }
    } catch {}
  };

  useEffect(() => {
    if (status === 'authenticated') { fetchProfile(); fetchHistory(); }
  }, [status]);

  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerateRef.current?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getDadosProva = () => ({
    disc:             tab === 'plano' ? plano.disciplina : tab === 'prova' ? prova.disciplina : atividade.disciplina,
    turma:            tab === 'plano' ? plano.turma      : tab === 'prova' ? prova.turma      : atividade.turma,
    etapa:            tab === 'plano' ? plano.etapa      : tab === 'prova' ? prova.etapa      : atividade.etapa,
    serie:            tab === 'plano' ? plano.serie      : tab === 'prova' ? prova.serie      : atividade.serie,
    vigencia:         tab === 'plano' ? plano.vigencia   : '',
    criterios:        tab === 'prova' ? prova.criterios  : '',
    valorInstrumento: tab === 'prova' ? prova.valorInstrumento : '10,0',
  });

  // ── File handling ──────────────────────────────────────────────────────────
  const updateFile = (idx, patch) => setFiles(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));

  const processFile = async (file, idx) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const type = ext === 'pdf' ? 'pdf' : ['doc', 'docx'].includes(ext) ? 'word' : ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? 'img' : 'txt';
    updateFile(idx, { status: 'reading' });
    try {
      if (type === 'pdf') {
        if (!window.pdfjsLib) await new Promise(r => setTimeout(r, 1500));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buf = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
        updateFile(idx, { status: 'range', totalPages: pdf.numPages, rawFile: file });
        setPageRanges(prev => ({ ...prev, [idx]: { from: 1, to: Math.min(pdf.numPages, 50) } }));
      } else if (type === 'word') {
        if (!window.mammoth) await new Promise(r => setTimeout(r, 1500));
        const buf = await file.arrayBuffer();
        const r = await window.mammoth.extractRawText({ arrayBuffer: buf });
        updateFile(idx, { status: 'ok', text: r.value });
      } else if (type === 'img') {
        const b64 = await new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result.split(',')[1]); r.readAsDataURL(file); });
        updateFile(idx, { status: 'ok', imgB64: b64, imgType: file.type });
      } else {
        const text = await file.text();
        updateFile(idx, { status: 'ok', text });
      }
    } catch (e) { updateFile(idx, { status: 'err', err: e.message }); }
  };

  const extractPages = async idx => {
    const f = files[idx];
    const range = pageRanges[idx] || {};
    updateFile(idx, { status: 'extracting' });
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const buf = await f.rawFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      const from = Math.max(1, range.from || 1);
      const to   = Math.min(pdf.numPages, range.to || pdf.numPages);
      let text = '';
      for (let p = from; p <= to; p++) {
        const pg = await pdf.getPage(p);
        const c = await pg.getTextContent();
        text += c.items.map(i => i.str).join(' ') + '\n';
      }
      updateFile(idx, { status: 'ok', text, note: `Páginas ${from}–${to} de ${pdf.numPages}` });
    } catch (e) { updateFile(idx, { status: 'err', err: e.message }); }
  };

  const addFiles = fileList => {
    const nf = [...fileList].map(file => ({
      name: file.name, size: file.size,
      type: (() => { const e = file.name.split('.').pop().toLowerCase(); return e === 'pdf' ? 'pdf' : ['doc', 'docx'].includes(e) ? 'word' : ['jpg', 'jpeg', 'png', 'webp'].includes(e) ? 'img' : 'txt'; })(),
      status: 'reading', rawFile: file,
    }));
    setFiles(prev => {
      const si = prev.length;
      nf.forEach((_, i) => setTimeout(() => processFile(fileList[i], si + i), 0));
      return [...prev, ...nf];
    });
  };

  const removeFile = idx => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPageRanges(prev => { const n = { ...prev }; delete n[idx]; return n; });
  };

  const loadModelo = async file => {
    setModeloLoading(true);
    const ext = file.name.split('.').pop().toLowerCase();
    const type = ext === 'pdf' ? 'pdf' : ['doc', 'docx'].includes(ext) ? 'word' : ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? 'img' : 'txt';
    try {
      if (type === 'pdf') {
        if (!window.pdfjsLib) await new Promise(r => setTimeout(r, 1500));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buf = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
        let text = '';
        for (let p = 1; p <= pdf.numPages; p++) { const pg = await pdf.getPage(p); const c = await pg.getTextContent(); text += c.items.map(i => i.str).join(' ') + '\n'; }
        setModelo({ name: file.name, text, type: 'pdf' });
      } else if (type === 'word') {
        if (!window.mammoth) await new Promise(r => setTimeout(r, 1500));
        const buf = await file.arrayBuffer();
        const r = await window.mammoth.extractRawText({ arrayBuffer: buf });
        setModelo({ name: file.name, text: r.value, type: 'word' });
      } else if (type === 'img') {
        const b64 = await new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result.split(',')[1]); r.readAsDataURL(file); });
        setModelo({ name: file.name, imgB64: b64, imgType: file.type, type: 'img' });
      } else {
        const text = await file.text();
        setModelo({ name: file.name, text, type: 'txt' });
      }
    } catch (e) { alert('Erro ao ler modelo: ' + e.message); }
    setModeloLoading(false);
  };

  // ── Prompt builder ─────────────────────────────────────────────────────────
  const buildPrompt = () => {
    const projetoAtivo = projetos.find(p => p.ativo);
    const arquivosCtx = projetoAtivo?.arquivos?.length
      ? projetoAtivo.arquivos
          .filter(a => a.texto)
          .map(a => `\n--- Material do projeto: "${a.nome}"${a.nota ? ' ('+a.nota+')' : ''} ---\n${a.texto.slice(0, 40000)}`)
          .join('\n')
      : '';
    const projetoCtx   = projetoAtivo
      ? `\n\nDIRETRIZES DO PROJETO "${projetoAtivo.nome}" (${projetoAtivo.periodo}${projetoAtivo.serieAlvo !== 'Todas as séries' ? ' · ' + projetoAtivo.serieAlvo : ''}):\n${projetoAtivo.diretrizes}${arquivosCtx}\n`
      : '';
    let ctx = '';
    files.filter(f => f.status === 'ok' && f.text).forEach(f => { ctx += `\n\n--- Conteúdo de "${f.name}"${f.note ? ' (' + f.note + ')' : ''} ---\n${f.text.slice(0, 80000)}`; });
    const modeloCtx = modelo?.text ? `\n\nMODELO DE REFERÊNCIA:\n"""\n${modelo.text.slice(0, 8000)}\n"""\n` : modelo?.imgB64 ? '[Imagem do modelo]' : '';
    const fmtQ = `\n\nFORMATO OBRIGATÓRIO — gere APENAS o corpo da prova, sem introdução:\n\nQUESTÃO 01 (X PONTOS)\nENUNCIADO EM MAIÚSCULAS\nA) (    ) OPÇÃO\nB) (    ) OPÇÃO\nC) (    ) OPÇÃO\nD) (    ) OPÇÃO\n\n[demais questões...]\n\nGABARITO:\n01 - A\n02 - B\n[etc]\n\nIMPORTANTE: Use maiúsculas. Inclua GABARITO ao final.`;
    if (tab === 'plano') {
      const { disciplina, serie, turma, etapa, duracao, vigencia, metodos, conteudo, alunosEspeciais, incluirAvalia } = plano;
      const alunosCtx = alunosEspeciais?.trim()
        ? `\n\nALUNOS COM NECESSIDADES ESPECIAIS:\n${alunosEspeciais}\nNa seção FLEXIBILIZAÇÃO DE ESTRATÉGIAS, gere estratégias individualizadas para cada aluno listado acima, mencionando o nome e a condição.`
        : '';
      const avaliaSection = incluirAvalia
        ? `\nPLANO DE AÇÃO AVALIA+:\n[Gere atividades para 5 dias letivos. Para cada dia: Leitura do dia (texto curto), Questão objetiva com descritor Avalia+ vinculado, Nivelamento por matriz de proficiência N1/N2/N3/N4]\n`
        : '';
      return `Você é especialista em educação da rede SESI. Crie um Plano de Trabalho Docente (PTD) completo no formato SESI.${modeloCtx}${projetoCtx}${alunosCtx}
${cfg.nomeProfessora ? 'Professora: ' + cfg.nomeProfessora + (cfg.cidade ? ' — SESI ' + cfg.cidade : '') + '\n' : ''}Disciplina: ${disciplina || '?'} | Série: ${serie || '?'} | Turma: ${turma || '?'} | Etapa: ${etapa || '1ª Etapa'}${vigencia ? ' | Vigência: ' + vigencia : ''}${duracao ? ' | Carga horária: ' + duracao : ''}${metodos.length ? ' | Metodologias: ' + metodos.join(', ') : ''}
Conteúdo/Contexto:
${conteudo}${ctx}

FORMATO OBRIGATÓRIO — use exatamente estas seções em MAIÚSCULAS seguidas de dois-pontos:

HABILIDADES:
• [código BNCC] – [descrição]

UNIDADES DO MATERIAL:
• [capítulo/livro/recurso]

OBJETIVOS:
• [objetivo]

EVIDÊNCIAS DE APRENDIZAGEM:
[instrumentos, descritores e critérios de avaliação]

AÇÕES A DESENVOLVER:
[estratégias, estações de aprendizagem, organização da aula por níveis N1/N2/N3/N4]

ESTRATÉGIA DE AVANÇO POR NÍVEL:
N1 → N2
• [ação]
N2 → N3
• [ação]
N3 → N4
• [ação]

PLANEJAMENTO INTEGRADO:
[disciplinas, tema, ações integradas]

RECURSOS DIDÁTICOS:
• [recurso]

FLEXIBILIZAÇÃO DE ESTRATÉGIAS:
${alunosEspeciais?.trim() ? '[Estratégias individualizadas por aluno conforme lista acima]' : '[estratégias para estudantes com necessidades específicas, se aplicável]'}
${avaliaSection}
IMPORTANTE: Use bullet points (•) para listas. Seja completo e detalhado em cada seção.`;
    }
    if (tab === 'prova') {
      const { disciplina, serie, dificuldade, qtd, tipos, instrucoes, conteudo } = prova;
      const temDisser = tipos.includes('Dissertativa');
      const fmtDisser = `\n\nFORMATO OBRIGATÓRIO — prova dissertativa:\n\nQUESTÃO 01 (X PONTOS)\nENUNCIADO COMPLETO EM MAIÚSCULAS — pergunta aberta sem alternativas\n\n[demais questões...]\n\nRUBRICA DE CORREÇÃO:\nQuestão 01 (X pontos)\n- Conteúdo e conhecimento (40%): critério detalhado do que se espera na resposta\n- Argumentação e desenvolvimento (40%): critério de profundidade e coerência\n- Linguagem e coerência (20%): critério gramatical e organizacional\n\n[demais questões na rubrica...]\n\nIMPORTANTE: Inclua SEMPRE a seção "RUBRICA DE CORREÇÃO" ao final, com critérios para cada questão.`;
      return `Você é especialista em avaliação educacional da rede SESI. Crie uma prova.${modeloCtx}${projetoCtx}\nDisciplina: ${disciplina || '?'} | Série: ${serie || '?'} | Dificuldade: ${dificuldade} | ${qtd}${tipos.length ? ' | Tipos: ' + tipos.join(', ') : ''}${instrucoes ? ' | Obs: ' + instrucoes : ''}\nConteúdo:\n${conteudo}${ctx}${temDisser ? fmtDisser : fmtQ}`;
    }
    const { disciplina, serie, tipos, conteudo } = atividade;
    return `Você é especialista em educação da rede SESI. Crie uma atividade pedagógica.${modeloCtx}${projetoCtx}\nDisciplina: ${disciplina || '?'} | Série: ${serie || '?'}${tipos.length ? ' | Tipo: ' + tipos.join(', ') : ''}\n${conteudo}${ctx}\nEstrutura: 1.TÍTULO 2.OBJETIVO 3.MATERIAIS 4.TEMPO 5.INSTRUÇÕES 6.ATIVIDADE 7.CRITÉRIOS`;
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (limitReached) { setShowUpgrade(true); return; }
    const conteudo = tab === 'plano' ? plano.conteudo : tab === 'prova' ? prova.conteudo : atividade.conteudo;
    const hasFile  = files.some(f => f.status === 'ok' && (f.text || f.imgB64));
    const dp0 = getDadosProva();
    if (!dp0.disc?.trim() || !dp0.serie?.trim()) { setErrorMsg('Preencha pelo menos Disciplina e Série antes de gerar.'); return; }
    if (!conteudo.trim() && !hasFile) { setErrorMsg('Adicione conteúdo ou envie um arquivo antes de gerar.'); return; }
    if (files.some(f => f.status === 'range')) { setErrorMsg('Extraia as páginas dos PDFs antes de gerar.'); return; }
    setLoading(true); setResult(''); setErrorMsg('');
    const dp = getDadosProva();
    const titulo = `${tab === 'plano' ? 'Plano de Aula' : tab === 'prova' ? 'Prova' : 'Atividade'}${dp.disc ? ' — ' + dp.disc : ''} · ${PROVIDER_LABELS[provider].name}`;
    setResultTitle(titulo);
    const apiFiles = files.filter(f => f.status === 'ok').map(f => {
      if (f.imgB64) return { type: 'img', b64: f.imgB64, mediaType: f.imgType, name: f.name };
      if (f.text)   return { type: 'txt', text: f.text, name: f.name };
      return null;
    }).filter(Boolean);
    if (modelo?.imgB64) apiFiles.unshift({ type: 'img', b64: modelo.imgB64, mediaType: modelo.imgType, name: 'modelo_' + modelo.name });
    try {
      const res  = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPrompt(), provider, files: apiFiles,
          meta: { tipo: tab, titulo, disciplina: dp.disc, serie: dp.serie, turma: dp.turma },
        }),
      });
      const data = await res.json();
      if (data.error === 'auth_required')  { setErrorMsg('Sessão expirada. Recarregue a página e faça login.'); setLoading(false); return; }
      if (data.error === 'upgrade_required' || data.error === 'limit_reached') { setShowUpgrade(true); setLoading(false); return; }
      if (!res.ok) {
        const detail = data.detail || '';
        const isServerNet = detail.includes('fetch') || detail.includes('network') || detail.includes('ENOTFOUND') || detail.includes('ECONNREFUSED');
        if (isServerNet) throw new Error('servidor_sem_conexao');
        throw new Error(detail || data.message || 'Erro na geração');
      }
      const gerado = stripMarkdown(data.result);
      setResult(gerado);
      if (data.usage !== undefined) setUsage(data.usage);
      if (data.plan)  setPlan(data.plan);
      setToast({ msg: 'Material gerado com sucesso!', type: 'success' });
      fetchHistory();
      if (tab === 'prova') {
        const tituloGab = `Prova ${dp.disc} — ${dp.turma || dp.serie} (${new Date().toLocaleDateString('pt-BR')})`;
        const temDisser = prova.tipos.includes('Dissertativa');
        if (temDisser) {
          const rubrica = extrairRubrica(data.result);
          if (rubrica.length > 0) salvarGabarito(tituloGab, {}, dp, rubrica);
        } else {
          const respostas = extrairGabarito(data.result);
          if (Object.keys(respostas).length > 0) salvarGabarito(tituloGab, respostas, dp);
        }
      }
    } catch (e) {
      const msg = e.message || 'Erro desconhecido';
      if (msg === 'servidor_sem_conexao') setErrorMsg('O servidor não conseguiu conectar à IA. Verifique as chaves de API no servidor e tente novamente.');
      else if (msg.includes('fetch') || msg.includes('network')) setErrorMsg('Sem conexão. Verifique sua internet e tente novamente.');
      else if (msg.includes('timeout') || msg.includes('504')) setErrorMsg('A IA demorou muito. Tente reduzir o conteúdo ou escolha outra IA.');
      else setErrorMsg('Erro ao gerar: ' + msg + '. Tente novamente ou mude de IA.');
    }
    setLoading(false);
  };

  // ── Gabarito ───────────────────────────────────────────────────────────────
  const salvarGabarito = (titulo, respostas, dadosProva, rubrica = null) => {
    const base = { id: Date.now().toString(), titulo, disciplina: dadosProva.disc || '', turma: dadosProva.turma || '', serie: dadosProva.serie || '', etapa: dadosProva.etapa || '', data: new Date().toLocaleDateString('pt-BR'), valorInstrumento: dadosProva.valorInstrumento || '10,0' };
    const novoGab = rubrica?.length
      ? { ...base, tipo: 'dissertativa', rubrica, qtd: rubrica.length, respostas: {} }
      : { ...base, tipo: 'objetiva', respostas, qtd: Object.keys(respostas).length };
    const lista = [novoGab, ...gabaritos].slice(0, 20);
    setGabaritos(lista);
    localStorage.setItem('sesi_gabaritos', JSON.stringify(lista));
    return novoGab;
  };

  const downloadGabarito = gab => {
    let linhas;
    if (gab.tipo === 'dissertativa' && gab.rubrica?.length) {
      linhas = [`RUBRICA — ${gab.titulo}`, `Disciplina: ${gab.disciplina} | Turma: ${gab.turma} | Data: ${gab.data}`, ''];
      gab.rubrica.forEach(q => {
        linhas.push(`Questão ${q.num} (${q.peso} pontos):`);
        q.criterios.forEach(c => linhas.push(`  - ${c.nome} (${c.pct}%): ${c.descricao}`));
        linhas.push('');
      });
    } else {
      linhas = [`GABARITO — ${gab.titulo}`, `Disciplina: ${gab.disciplina} | Turma: ${gab.turma} | Data: ${gab.data}`, '', ...Object.entries(gab.respostas).map(([q, r]) => `Questão ${q}: ${r}`)];
    }
    const blob = new Blob([linhas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${gab.tipo === 'dissertativa' ? 'Rubrica' : 'Gabarito'}_${gab.disciplina}_${gab.data.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ── Correção turma ─────────────────────────────────────────────────────────
  const corrigirFoto = async () => {
    if (!gabSelecionado || !turmaFoto || !turmaAlunoNome.trim()) return;
    setTurmaCorrigindo(true);
    try {
      // ── Dissertativa ──────────────────────────────────────────────────────
      if (gabSelecionado.tipo === 'dissertativa') {
        const valorTotal = parseFloat((gabSelecionado.valorInstrumento || '10,0').replace(',', '.'));
        const res  = await fetch('/api/corrigir-dissertativa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ foto: { b64: turmaFoto.b64, mediaType: turmaFoto.type }, rubrica: gabSelecionado.rubrica, valorTotal }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro na correção');
        const nota = data.total.toFixed(1).replace('.', ',');
        const aluno = { nome: turmaAlunoNome.trim(), nota, total: valorTotal, tipo: 'dissertativa', questoes: data.questoes, comentarioGeral: data.comentarioGeral, foto: turmaFoto.preview };
        setTurmaAlunos(prev => [...prev, aluno]);
        setTurmaAlunoNome(''); setTurmaFoto(null);
        setTurmaCorrigindo(false);
        return;
      }

      // ── Objetiva ──────────────────────────────────────────────────────────
      const respostasGab = Object.entries(gabSelecionado.respostas).map(([q, r]) => `Questão ${q}: ${r}`).join(', ');
      const prompt = `Você está corrigindo uma prova escolar. O gabarito correto é: ${respostasGab}.\n\nAnalise a imagem da prova respondida pelo aluno. Identifique as alternativas marcadas em cada questão.\n\nRetorne APENAS um JSON válido, sem texto adicional, no formato:\n{"01":"A","02":"B","03":"C",...}\n\nSe não conseguir identificar uma questão, use "?".`;
      const res  = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, provider: 'claude', files: [{ type: 'img', b64: turmaFoto.b64, mediaType: turmaFoto.type, name: 'prova.jpg' }] }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro');
      const jsonStr = data.result.replace(/```json|```/g, '').trim();
      const respostasAluno = JSON.parse(jsonStr);
      const totalQ  = Object.keys(gabSelecionado.respostas).length;
      const valorQ  = parseFloat((gabSelecionado.valorInstrumento || '10,0').replace(',', '.')) / totalQ;
      let acertos   = 0;
      const detalhes = {};
      for (const [q, r] of Object.entries(gabSelecionado.respostas)) {
        const marcou = respostasAluno[q] || '?';
        const acertou = marcou === r;
        if (acertou) acertos++;
        detalhes[q] = { gabarito: r, aluno: marcou, acertou };
      }
      const nota = (acertos * valorQ).toFixed(1).replace('.', ',');
      const aluno = { nome: turmaAlunoNome.trim(), acertos, total: totalQ, nota, detalhes, foto: turmaFoto.preview };
      setTurmaAlunos(prev => [...prev, aluno]);
      setTurmaAlunoNome(''); setTurmaFoto(null);
    } catch (e) { alert('Erro na correção: ' + e.message); }
    setTurmaCorrigindo(false);
  };

  const exportarTurmaCSV = () => {
    if (!gabSelecionado || turmaAlunos.length === 0) return;
    let header, rows;
    if (gabSelecionado.tipo === 'dissertativa') {
      const nums = gabSelecionado.rubrica.map(q => q.num);
      header = ['Aluno', 'Nota Total', ...nums.map(n => `Q${n}`), 'Comentário Geral'];
      rows   = turmaAlunos.map(a => [a.nome, a.nota, ...nums.map(n => { const q = a.questoes?.find(q => q.num === n); return q ? `${q.nota}/${q.max}` : '?'; }), a.comentarioGeral || '']);
    } else {
      const questoes = Object.keys(gabSelecionado.respostas);
      header = ['Aluno', 'Nota', ...questoes.map(q => `Q${q}`), 'Acertos', 'Total'];
      rows   = turmaAlunos.map(a => [a.nome, a.nota, ...questoes.map(q => a.detalhes[q]?.aluno || '?'), a.acertos, a.total]);
    }
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Notas_${gabSelecionado.disciplina}_${gabSelecionado.turma}_${gabSelecionado.data.replace(/\//g, '-')}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const carregarFoto = async file => {
    if (!file) { setTurmaFoto(null); return; }
    const b64 = await new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(file); });
    setTurmaFoto({ b64: b64.split(',')[1], type: file.type, preview: b64 });
  };

  // ── Exports ────────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const dp  = getDadosProva();
    // Para o plano, o builder faz a limpeza internamente (preserva **negrito**)
    const html = tab === 'plano'
      ? buildPlanoHTML(resultTitle, result, cfg, dp)
      : buildDocHTML(resultTitle, stripMarkdown(result), cfg, dp);
    const w = window.open('', '_blank');
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.addEventListener('load', () => setTimeout(() => w.print(), 300));
    setTimeout(() => { try { if (!w.closed) w.print(); } catch {} }, 3000);
    setToast({ msg: '✓ PDF aberto para impressão/download.', type: 'success' });
  };

  const exportWord = async () => {
    const dp = getDadosProva();
    const endpoint = tab === 'plano' ? '/api/gerar-plano-docx' : '/api/gerar-docx';
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conteudo: result, cfg, dadosProva: dp }) });
      if (!res.ok) throw new Error('Erro ao gerar documento');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = getFileName(tab, plano, prova, atividade) + '.docx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setToast({ msg: '✓ Documento Word baixado com sucesso.', type: 'success' });
    } catch (e) { setErrorMsg('Erro ao gerar Word: ' + e.message + '. Tente novamente.'); }
  };

  const saveGoogleDrive = async () => {
    setGdLoading(true); setGdStatus('');
    try {
      await new Promise((res, rej) => { if (window.google?.accounts) return res(); const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      const token = await new Promise((res, rej) => { window.google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: 'https://www.googleapis.com/auth/drive.file', callback: r => r.error ? rej(new Error(r.error)) : res(r.access_token) }).requestAccessToken({ prompt: 'consent' }); });
      const d   = new Date(); const ano = d.getFullYear().toString(); const mes = MESES[d.getMonth()];
      const foc = async (name, parent) => { const q = `name='${name}' and mimeType='application/vnd.google-apps.folder'${parent ? " and '" + parent + "' in parents" : ''} and trashed=false`; const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`, { headers: { Authorization: 'Bearer ' + token } }); const data = await r.json(); if (data.files?.length > 0) return data.files[0].id; const body = { name, mimeType: 'application/vnd.google-apps.folder' }; if (parent) body.parents = [parent]; return (await (await fetch('https://www.googleapis.com/drive/v3/files', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json()).id; };
      const rootId = await foc('ProntoProfe', null); const anoId = await foc(ano, rootId); const mesId = await foc(mes, anoId);
      const meta  = { name: getFileName(tab, plano, prova, atividade), mimeType: 'application/vnd.google-apps.document', parents: [mesId] };
      const form  = new FormData(); form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' })); form.append('file', new Blob([result], { type: 'text/plain' }));
      const saved = await (await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&convert=true', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form })).json();
      setGdStatus(saved.id ? `✓ Salvo em ProntoProfe / ${ano} / ${mes}` : 'Erro ao salvar.');
    } catch (e) { setGdStatus('Erro: ' + e.message); }
    setGdLoading(false);
  };

  const exportExcel = async () => {
    try {
      const { exportToExcel } = await import('../lib/exporters/excel');
      await exportToExcel(result, resultTitle, { provider, model: undefined });
      setToast({ msg: '✓ Planilha Excel baixada com sucesso.', type: 'success' });
    } catch (e) { setErrorMsg('Erro ao gerar Excel: ' + e.message); }
  };

  const saveOneDrive = async () => {
    if (!process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID) {
      setOdStatus('Configure NEXT_PUBLIC_ONEDRIVE_CLIENT_ID para habilitar o OneDrive.');
      return;
    }
    setOdLoading(true); setOdStatus('');
    try {
      const dp = getDadosProva();
      const docRes = await fetch('/api/gerar-docx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conteudo: result, cfg, dadosProva: dp }) });
      if (!docRes.ok) throw new Error('Erro ao gerar documento');
      const blob = await docRes.blob();
      const { oneDriveSignIn, uploadToOneDrive } = await import('../lib/cloud/onedrive');
      const token = await oneDriveSignIn();
      const saved = await uploadToOneDrive(token, blob, 'word');
      setOdStatus(saved.link ? `✓ Salvo no OneDrive` : 'Erro ao salvar.');
    } catch (e) { setOdStatus('Erro: ' + e.message); }
    setOdLoading(false);
  };

  handleGenerateRef.current = handleGenerate;

  const copyResult = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  // Mostrar tela de login se não autenticado
  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif', color: '#888', fontSize: 14 }}>
      Carregando...
    </div>
  );
  if (status === 'unauthenticated') return <LoginGate />;

  return (<>
    <Head>
      <title>ProntoProfe! — Assistente do Professor</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js" />
    </Head>

    <div className="sidenav-offset" style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      <AppHeader
        cfg={cfg} plan={plan} usage={usage} session={session}
        onUpgradeClick={() => setShowUpgrade(true)}
        onTutorialClick={() => setShowTutorial(true)}
      />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '1rem' }}>

        {cfg.nomeProfessora && (
          <div style={{ background: '#E6F1FB', borderRadius: 8, padding: '7px 14px', marginBottom: 12, fontSize: 13, color: '#0C447C', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👩‍🏫</span>
            <span><b>{cfg.nomeProfessora}</b> — {cfg.cidade || 'SESI'}{cfg.docCode ? ' · ' + cfg.docCode : ''}</span>
            <button style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', border: '0.5px solid #185FA5', borderRadius: 4, background: 'transparent', color: '#0C447C', cursor: 'pointer' }} onClick={() => setShowConfig(true)}>Editar</button>
          </div>
        )}

        {/* Indicador de projeto ativo */}
        {projetos.find(p => p.ativo) && (() => {
          const pa = projetos.find(p => p.ativo);
          return (
            <div style={{ background: '#FFF8E6', border: '1px solid #F0D080', borderRadius: 8, padding: '7px 14px', marginBottom: 12, fontSize: 13, color: '#7A5A00', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📁</span>
              <span><b>{pa.nome}</b> — {pa.periodo}{pa.serieAlvo !== 'Todas as séries' ? ' · ' + pa.serieAlvo : ''}</span>
              <span style={{ fontSize: 10, padding: '1px 6px', background: '#E8A800', color: '#fff', borderRadius: 20, fontWeight: 700 }}>ATIVO</span>
              <button style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', border: '0.5px solid #C89A00', borderRadius: 4, background: 'transparent', color: '#7A5A00', cursor: 'pointer' }} onClick={() => setShowProjetos(true)}>Gerenciar</button>
            </div>
          );
        })()}

        <ProviderSelector
          provider={provider} plan={plan}
          onProviderChange={setProvider}
          onUpgradeClick={() => setShowProviderUpgrade(true)}
        />

        <TabSelector tab={tab} onTabChange={setTab} />

        <DocumentFields tab={tab} plano={plano} prova={prova} atividade={atividade} setPlano={setPlano} setProva={setProva} setAtividade={setAtividade} />

        <ContentSection tab={tab} plano={plano} prova={prova} atividade={atividade} setPlano={setPlano} setProva={setProva} setAtividade={setAtividade} />

        {tab !== 'plano' && (
          <ModeloUpload modelo={modelo} modeloLoading={modeloLoading} onLoad={loadModelo} onRemove={() => setModelo(null)} />
        )}

        <FileUploader
          files={files} pageRanges={pageRanges}
          onAddFiles={addFiles} onRemoveFile={removeFile}
          onExtractPages={extractPages}
          onPageRangeChange={(idx, range) => setPageRanges(prev => ({ ...prev, [idx]: range }))}
          label={tab === 'plano' ? '📚 Livro / Material de apoio' : 'Arquivos de material'}
        />

        <button
          style={{ width: '100%', padding: 13, background: loading || limitReached ? '#B4B2A9' : '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading || limitReached ? 'default' : 'pointer', marginBottom: errorMsg ? 6 : 12, transition: 'background 0.2s' }}
          onClick={handleGenerate} disabled={loading}
        >
          {loading ? `⏳ ${LOADING_MSGS[loadingMsgIdx]}` : limitReached ? '⚠ Limite atingido' : `✦ Gerar com ${PROVIDER_LABELS[provider].name}`}
        </button>

        {errorMsg && (
          <div style={{ background: '#FCEBEB', border: '0.5px solid #E8AAAA', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠</span><span style={{ flex: 1 }}>{errorMsg}</span>
            <button style={{ background: 'transparent', border: 'none', color: '#A32D2D', cursor: 'pointer', fontSize: 14 }} onClick={() => setErrorMsg('')}>✕</button>
          </div>
        )}

        <HistoryPanel
          items={historico}
          onReload={item => { setResult(item.conteudo || ''); setResultTitle(item.titulo || ''); }}
        />

        <ResultPanel
          result={result} loading={loading} resultTitle={resultTitle}
          loadingMsg={LOADING_MSGS[loadingMsgIdx]}
          tab={tab} gabaritos={gabaritos} prova={prova}
          copied={copied}
          gdLoading={gdLoading} gdStatus={gdStatus}
          odLoading={odLoading} odStatus={odStatus}
          onCopy={copyResult} onClear={() => setResult('')}
          onExportPDF={exportPDF} onExportWord={exportWord} onExportExcel={exportExcel}
          onSaveGoogleDrive={saveGoogleDrive} onSaveOneDrive={saveOneDrive}
          onDownloadGabarito={downloadGabarito}
        />
      </div>

      {showTurma && (
        <TurmaModal
          gabaritos={gabaritos} gabSelecionado={gabSelecionado}
          turmaAlunos={turmaAlunos} turmaAlunoNome={turmaAlunoNome}
          turmaFoto={turmaFoto} turmaCorrigindo={turmaCorrigindo}
          onSelectGabarito={g => { setGabSelecionado(g); setTurmaAlunos([]); }}
          onAlunoNomeChange={setTurmaAlunoNome}
          onCarregarFoto={carregarFoto}
          onCorrigirFoto={corrigirFoto}
          onExportarCSV={exportarTurmaCSV}
          onDownloadGabarito={downloadGabarito}
          onClose={() => setShowTurma(false)}
        />
      )}

      {showSetup && (
        <SetupModal
          setupStep={setupStep} cfg={cfg}
          onCfgChange={(key, val) => setCfg(c => ({ ...c, [key]: val }))}
          onNext={() => { if (setupStep < 4) setSetupStep(s => s + 1); else { saveCfg(cfg); setShowSetup(false); setSetupStep(0); } }}
          onBack={() => setSetupStep(s => s - 1)}
          onSkip={() => { saveCfg(cfg); setShowSetup(false); }}
        />
      )}

      {showConfig && (
        <ConfigModal
          cfg={cfg}
          onCfgChange={(key, val) => setCfg(c => ({ ...c, [key]: val }))}
          onSave={() => { saveCfg(cfg); setShowConfig(false); }}
          onClose={() => setShowConfig(false)}
        />
      )}

      {(showUpgrade || showProviderUpgrade) && (
        <UpgradeModal
          showUpgrade={showUpgrade} showProviderUpgrade={showProviderUpgrade}
          onUpgrade={async planKey => {
            try {
              const res = await fetch('/api/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planKey }) });
              if (res.ok) {
                setPlan(planKey);
                setShowUpgrade(false);
                setShowProviderUpgrade(false);
                setToast({ msg: 'Plano atualizado! Aproveite os novos recursos.', type: 'success' });
              }
            } catch { setToast({ msg: 'Erro ao atualizar plano. Tente novamente.', type: 'error' }); }
          }}
          onClose={() => { setShowUpgrade(false); setShowProviderUpgrade(false); }}
        />
      )}

      {showAlunos && (
        <AlunosModal onClose={() => setShowAlunos(false)} />
      )}

      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {showProjetos && (
        <ProjetosModal
          projetos={projetos}
          onSave={saveProjetos}
          onClose={() => setShowProjetos(false)}
        />
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />

      <BottomNav
        onTurmaClick={() => setShowTurma(true)}
        onConfigClick={() => setShowConfig(true)}
        onProjetosClick={() => setShowProjetos(true)}
        onAlunosClick={() => setShowAlunos(true)}
      />
    </div>
  </>);
}
