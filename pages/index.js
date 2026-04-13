// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const PLAN_LIMITS = { free: 10, pro: 150, school: Infinity };

const PROVIDER_ACCESS = {
  claude:  ['free', 'pro', 'school'],
  openai:  ['pro', 'school'],
  gemini:  ['free', 'pro', 'school'],
  copilot: ['school'],
};

const PROVIDER_LABELS = {
  claude:  { name: 'Claude',  sub: 'Anthropic',     color: '#0C447C', bg: '#E6F1FB' },
  openai:  { name: 'ChatGPT', sub: 'OpenAI GPT-4o', color: '#3B6D11', bg: '#EAF3DE' },
  gemini:  { name: 'Gemini',  sub: 'Google',        color: '#633806', bg: '#FAEEDA' },
  copilot: { name: 'Copilot', sub: 'Microsoft',     color: '#3C3489', bg: '#EEEDFE' },
};

const PLAN_LABELS = {
  free:   { name: 'Gratuito', color: '#6B5B8A', limit: '10/mês',    bg: '#EDE6F7' },
  pro:    { name: 'Pro',      color: '#3D348B', limit: '150/mês',   bg: '#D9D0EE' },
  school: { name: 'Escola',   color: '#fff',    limit: 'Ilimitado', bg: '#FF7F50' },
};

// Quais provedores aceitam quais tipos de arquivo
const PROVIDER_FILE_SUPPORT = {
  claude:  { pdf: true,  image: true  },
  openai:  { pdf: false, image: true  },
  gemini:  { pdf: false, image: true  },
  copilot: { pdf: false, image: false },
};

const FILE_WARN = 2 * 1024 * 1024; // 2 MB — mostra botão otimizar
const FILE_MAX  = 5 * 1024 * 1024; // 5 MB — rejeita

export default function Home() {
  const [tab, setTab] = useState('plano');
  const [plan, setPlan] = useState('free');
  const [provider, setProvider] = useState('claude');
  const [usage, setUsage] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProviderUpgrade, setShowProviderUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [resultTitle, setResultTitle] = useState('');
  const [copied, setCopied] = useState(false);

  const [plano, setPlano] = useState({ disciplina: '', serie: '', duracao: '50 min', metodos: [], conteudo: '' });
  const [prova, setProva] = useState({ disciplina: '', serie: '', dificuldade: 'Intermediário', qtd: '10 questões', tipos: ['Múltipla escolha'], instrucoes: '', conteudo: '' });
  const [atividade, setAtividade] = useState({ disciplina: '', serie: '', tipo: ['Exercícios de fixação'], conteudo: '' });

  // Arquivos por aba
  const [tabFiles, setTabFiles] = useState({ plano: [], prova: [], atividade: [] });
  // Toolkit modal: qual arquivo está sendo otimizado
  const [toolkit, setToolkit] = useState(null); // { fileId, tab }

  useEffect(() => {
    const saved     = localStorage.getItem('sesi_usage');
    const savedPlan = localStorage.getItem('sesi_plan') || 'free';
    if (saved) setUsage(parseInt(saved) || 0);
    setPlan(savedPlan);
  }, []);

  const toggleChip = (arr, setArr, val) => {
    setArr(prev => {
      const next = { ...prev };
      next[arr]  = prev[arr].includes(val)
        ? prev[arr].filter(x => x !== val)
        : [...prev[arr], val];
      return next;
    });
  };

  const canUseProvider = (p) => PROVIDER_ACCESS[p]?.includes(plan);
  const limitReached   = plan !== 'school' && usage >= PLAN_LIMITS[plan];

  const handleProviderChange = (p) => {
    if (!canUseProvider(p)) { setShowProviderUpgrade(true); return; }
    setProvider(p);
    setShowProviderUpgrade(false);
  };

  // ── Gerenciamento de arquivos ───────────────────────────────────────────

  const getFiles = () => tabFiles[tab];

  const setFiles = (updater) => {
    setTabFiles(prev => ({
      ...prev,
      [tab]: typeof updater === 'function' ? updater(prev[tab]) : updater,
    }));
  };

  const handleFileAdd = async (rawFiles) => {
    const support = PROVIDER_FILE_SUPPORT[provider];
    for (const file of Array.from(rawFiles)) {
      const isPdf   = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isPdf && !isImage) continue;

      if (isPdf && !support.pdf) {
        alert(`${PROVIDER_LABELS[provider].name} não suporta PDF.\nTroque para Claude para enviar PDFs.`);
        continue;
      }
      if (isImage && !support.image) {
        alert(`${PROVIDER_LABELS[provider].name} não suporta imagens.`);
        continue;
      }
      if (file.size > FILE_MAX) {
        alert(`"${file.name}" excede 5 MB.\nUse a ferramenta de redução ou escolha um arquivo menor.`);
        continue;
      }

      const b64 = await toBase64(file);
      const fileObj = {
        id:            `${Date.now()}-${Math.random()}`,
        name:          file.name,
        size:          file.size,
        type:          isPdf ? 'pdf' : 'img',
        mediaType:     file.type,
        b64,
        preview:       isImage ? URL.createObjectURL(file) : null,
        pageCount:     null,
        needsOptimize: file.size > FILE_WARN,
      };

      if (isPdf) {
        try {
          const { PDFDocument } = await import('pdf-lib');
          const bytes       = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
          const doc         = await PDFDocument.load(bytes);
          fileObj.pageCount = doc.getPageCount();
        } catch (e) {
          console.warn('PDF parse:', e);
        }
      }

      setFiles(prev => [...prev, fileObj]);
    }
  };

  const handleFileRemove = (id) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleFileUpdate = (fileTab, id, updates) => {
    setTabFiles(prev => ({
      ...prev,
      [fileTab]: prev[fileTab].map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  };

  // ── Prompts ─────────────────────────────────────────────────────────────

  const buildPrompt = () => {
    if (tab === 'plano') {
      const { disciplina, serie, duracao, metodos, conteudo } = plano;
      return `Você é especialista em educação da rede SESI. Crie um plano de aula completo baseado no material abaixo.

Dados: Disciplina: ${disciplina||'não especificada'} | Série: ${serie||'não especificada'} | Duração: ${duracao}${metodos.length ? ' | Metodologias: '+metodos.join(', ') : ''}

Material de referência:
${conteudo}

Estrutura obrigatória:
1. IDENTIFICAÇÃO
2. OBJETIVOS DE APRENDIZAGEM (BNCC)
3. COMPETÊNCIAS SOCIOEMOCIONAIS
4. CONTEÚDOS (conceituais, procedimentais, atitudinais)
5. SEQUÊNCIA DIDÁTICA com tempos estimados (Inicial, Desenvolvimento, Consolidação, Fechamento)
6. RECURSOS DIDÁTICOS
7. AVALIAÇÃO
8. REFERÊNCIAS

Seja detalhado, prático, inclua perguntas para fazer à turma e dicas metodológicas.`;
    }

    if (tab === 'prova') {
      const { disciplina, serie, dificuldade, qtd, tipos, instrucoes, conteudo } = prova;
      return `Você é especialista em avaliação educacional da rede SESI. Crie uma prova completa e pronta para uso.

Dados: Disciplina: ${disciplina||'não especificada'} | Série: ${serie||'não especificada'} | Dificuldade: ${dificuldade} | ${qtd}${tipos.length ? ' | Tipos: '+tipos.join(', ') : ''}${instrucoes ? ' | Instruções: '+instrucoes : ''}

Conteúdo avaliado:
${conteudo}

Estrutura: CABEÇALHO (nome/turma/data/nota) > INSTRUÇÕES GERAIS > QUESTÕES numeradas > GABARITO COMENTADO.
Para múltipla escolha: 4 alternativas A-B-C-D. Para dissertativas: indicar valor e critérios.
Contextualize com situações reais e universo industrial/SESI.`;
    }

    const { disciplina, serie, tipo, conteudo } = atividade;
    return `Você é especialista em educação da rede SESI. Crie uma atividade pedagógica completa e pronta para aplicação.

Dados: Disciplina: ${disciplina||'não especificada'} | Série: ${serie||'não especificada'}${tipo.length ? ' | Tipo: '+tipo.join(', ') : ''}

Conteúdo e objetivos:
${conteudo}

Estrutura:
1. TÍTULO criativo
2. OBJETIVO(S)
3. MATERIAIS NECESSÁRIOS
4. TEMPO ESTIMADO
5. INSTRUÇÕES PARA O PROFESSOR (passo a passo)
6. ATIVIDADE PARA O ALUNO (pronto para imprimir)
7. CRITÉRIOS DE AVALIAÇÃO`;
  };

  const getConteudo = () => {
    if (tab === 'plano') return plano.conteudo;
    if (tab === 'prova') return prova.conteudo;
    return atividade.conteudo;
  };

  const handleGenerate = async () => {
    if (limitReached) { setShowUpgrade(true); return; }
    if (!canUseProvider(provider)) { setShowProviderUpgrade(true); return; }
    const conteudo = getConteudo();
    if (!conteudo.trim()) { alert('Adicione o conteúdo ou material de referência antes de gerar.'); return; }

    setLoading(true);
    setResult('');
    const tabLabels = { plano: 'Plano de Aula', prova: 'Prova', atividade: 'Atividade' };
    const disc = tab === 'plano' ? plano.disciplina : tab === 'prova' ? prova.disciplina : atividade.disciplina;
    setResultTitle(`${tabLabels[tab]}${disc ? ' — ' + disc : ''} · ${PROVIDER_LABELS[provider].name}`);

    const files = getFiles().map(({ name, type, b64, mediaType, text }) => ({ name, type, b64, mediaType, text }));

    try {
      const res = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: buildPrompt(), provider, plan, files }),
      });
      const data = await res.json();
      if (data.error === 'upgrade_required') { setShowUpgrade(true); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message || 'Erro desconhecido');
      setResult(data.result);

      const newUsage = usage + 1;
      setUsage(newUsage);
      localStorage.setItem('sesi_usage', newUsage.toString());
    } catch (e) {
      setResult('Erro ao gerar: ' + e.message);
    }
    setLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const usagePct   = plan === 'school' ? 5 : Math.min(100, (usage / PLAN_LIMITS[plan]) * 100);
  const usageColor = usagePct > 80 ? '#A32D2D' : usagePct > 50 ? '#BA7517' : '#3B6D11';

  const toolkitFile = toolkit
    ? tabFiles[toolkit.tab]?.find(f => f.id === toolkit.fileId) ?? null
    : null;

  return (
    <>
      <Head>
        <title>Pronto Profe — Assistente do Professor</title>
        <meta name="description" content="Gerador de planos de aula, provas e atividades com IA para professores" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerInner}>
            <div style={s.logo}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L4 7v10l8 4 8-4V7L12 3z" stroke="white" strokeWidth="1.5"/>
                <path d="M12 3v18M4 7l8 4 8-4" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <div style={s.appName}>Pronto Profe</div>
              <div style={s.appSub}>Assistente pedagógico com IA</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={s.usageBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ ...s.planBadge, background: PLAN_LABELS[plan].bg, color: PLAN_LABELS[plan].color }}>
                  {PLAN_LABELS[plan].name}
                </span>
                <span style={s.usageText}>
                  {plan === 'school' ? 'Ilimitado' : `${usage} / ${PLAN_LIMITS[plan]} gerações`}
                </span>
              </div>
              {plan !== 'school' && (
                <div style={s.progressTrack}>
                  <div style={{ ...s.progressFill, width: usagePct + '%', background: usageColor }} />
                </div>
              )}
            </div>
            {plan !== 'school' && (
              <button style={s.btnUpgrade} onClick={() => setShowUpgrade(true)}>
                Fazer upgrade
              </button>
            )}
          </div>
        </div>

        <div style={s.main}>
          {/* Seletor de IA */}
          <div style={s.aiSelector}>
            <div style={s.aiSelectorLabel}>IA escolhida:</div>
            <div style={s.aiButtons}>
              {Object.entries(PROVIDER_LABELS).map(([key, info]) => {
                const available = canUseProvider(key);
                const active    = provider === key;
                return (
                  <button
                    key={key}
                    style={{
                      ...s.aiBtn,
                      ...(active    ? { background: info.bg, color: info.color, borderColor: info.color } : {}),
                      ...(available ? {} : { opacity: 0.45 }),
                    }}
                    onClick={() => handleProviderChange(key)}
                    title={available ? info.sub : 'Disponível no plano Pro ou superior'}
                  >
                    {info.name}
                    {!available && <span style={s.lockIcon}>🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {[['plano', 'Plano de Aula'], ['prova', 'Prova / Avaliação'], ['atividade', 'Atividade']].map(([key, label]) => (
              <button key={key} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>

          {/* Formulário — Plano de Aula */}
          {tab === 'plano' && (
            <FormCard>
              <Row3>
                <Field label="Disciplina">
                  <Select value={plano.disciplina} onChange={v => setPlano(p => ({ ...p, disciplina: v }))} options={DISCIPLINAS} />
                </Field>
                <Field label="Série / Turma">
                  <Select value={plano.serie} onChange={v => setPlano(p => ({ ...p, serie: v }))} options={SERIES} />
                </Field>
                <Field label="Duração">
                  <Select value={plano.duracao} onChange={v => setPlano(p => ({ ...p, duracao: v }))} options={['50 min', '1h (2 tempos)', '1h30 (3 tempos)', '2h (4 tempos)']} />
                </Field>
              </Row3>
              <Field label="Metodologias ativas (opcional)" style={{ marginBottom: 12 }}>
                <ChipGroup
                  options={['Aula expositiva', 'Trabalho em grupo', 'Resolução de problemas', 'Gamificação', 'Sala invertida', 'Laboratório', 'Debate', 'Projeto integrador']}
                  selected={plano.metodos}
                  onToggle={v => setPlano(p => ({ ...p, metodos: p.metodos.includes(v) ? p.metodos.filter(x => x !== v) : [...p.metodos, v] }))}
                />
              </Field>
              <Field label="Conteúdo / material de referência" style={{ marginBottom: 12 }}>
                <Textarea value={plano.conteudo} onChange={v => setPlano(p => ({ ...p, conteudo: v }))}
                  placeholder="Descreva o tema, cole trechos do livro, resuma o conteúdo... Quanto mais detalhe, mais preciso o resultado." />
              </Field>
              <FileUploadZone
                files={tabFiles.plano}
                provider={provider}
                onAdd={handleFileAdd}
                onRemove={handleFileRemove}
                onOptimize={f => setToolkit({ fileId: f.id, tab: 'plano' })}
              />
            </FormCard>
          )}

          {/* Formulário — Prova */}
          {tab === 'prova' && (
            <FormCard>
              <Row3>
                <Field label="Disciplina">
                  <Select value={prova.disciplina} onChange={v => setProva(p => ({ ...p, disciplina: v }))} options={DISCIPLINAS} />
                </Field>
                <Field label="Série / Turma">
                  <Select value={prova.serie} onChange={v => setProva(p => ({ ...p, serie: v }))} options={SERIES_AGRUPADAS} />
                </Field>
                <Field label="Dificuldade">
                  <Select value={prova.dificuldade} onChange={v => setProva(p => ({ ...p, dificuldade: v }))} options={['Básico', 'Intermediário', 'Avançado', 'Misto']} />
                </Field>
              </Row3>
              <Row2 style={{ marginBottom: 12 }}>
                <Field label="Tipos de questões">
                  <ChipGroup
                    options={['Múltipla escolha', 'Verdadeiro/Falso', 'Dissertativa', 'Lacunas', 'Colunas']}
                    selected={prova.tipos}
                    onToggle={v => setProva(p => ({ ...p, tipos: p.tipos.includes(v) ? p.tipos.filter(x => x !== v) : [...p.tipos, v] }))}
                  />
                </Field>
                <Field label="Quantidade">
                  <Select value={prova.qtd} onChange={v => setProva(p => ({ ...p, qtd: v }))} options={['5 questões', '10 questões', '15 questões', '20 questões']} />
                </Field>
              </Row2>
              <Field label="Instruções especiais (opcional)" style={{ marginBottom: 12 }}>
                <input style={s.input} value={prova.instrucoes} onChange={e => setProva(p => ({ ...p, instrucoes: e.target.value }))}
                  placeholder="Ex: incluir gabarito, sem calculadora, contextualizar com indústria..." />
              </Field>
              <Field label="Conteúdo avaliado" style={{ marginBottom: 12 }}>
                <Textarea value={prova.conteudo} onChange={v => setProva(p => ({ ...p, conteudo: v }))}
                  placeholder="Descreva os tópicos avaliados, cole resumos ou trechos do material..." />
              </Field>
              <FileUploadZone
                files={tabFiles.prova}
                provider={provider}
                onAdd={handleFileAdd}
                onRemove={handleFileRemove}
                onOptimize={f => setToolkit({ fileId: f.id, tab: 'prova' })}
              />
            </FormCard>
          )}

          {/* Formulário — Atividade */}
          {tab === 'atividade' && (
            <FormCard>
              <Row2 style={{ marginBottom: 12 }}>
                <Field label="Disciplina">
                  <Select value={atividade.disciplina} onChange={v => setAtividade(p => ({ ...p, disciplina: v }))} options={DISCIPLINAS} />
                </Field>
                <Field label="Série / Turma">
                  <Select value={atividade.serie} onChange={v => setAtividade(p => ({ ...p, serie: v }))} options={SERIES_AGRUPADAS} />
                </Field>
              </Row2>
              <Field label="Tipo de atividade" style={{ marginBottom: 12 }}>
                <ChipGroup
                  options={['Exercícios de fixação', 'Atividade lúdica', 'Pesquisa e reflexão', 'Produção textual', 'Estudo de caso', 'Caça-palavras']}
                  selected={atividade.tipo}
                  onToggle={v => setAtividade(p => ({ ...p, tipo: p.tipo.includes(v) ? p.tipo.filter(x => x !== v) : [...p.tipo, v] }))}
                />
              </Field>
              <Field label="Conteúdo e objetivos" style={{ marginBottom: 12 }}>
                <Textarea value={atividade.conteudo} onChange={v => setAtividade(p => ({ ...p, conteudo: v }))}
                  placeholder="Descreva o conteúdo, objetivos e contexto da turma..." />
              </Field>
              <FileUploadZone
                files={tabFiles.atividade}
                provider={provider}
                onAdd={handleFileAdd}
                onRemove={handleFileRemove}
                onOptimize={f => setToolkit({ fileId: f.id, tab: 'atividade' })}
              />
            </FormCard>
          )}

          {/* Botão gerar */}
          <button
            style={{ ...s.btnGenerate, ...(loading || limitReached ? s.btnDisabled : {}) }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Spinner /> Gerando com {PROVIDER_LABELS[provider].name}...
              </span>
            ) : limitReached ? (
              '⚠ Limite atingido — faça upgrade para continuar'
            ) : (
              `✦ Gerar com ${PROVIDER_LABELS[provider].name}`
            )}
          </button>

          {/* Resultado */}
          {(result || loading) && (
            <div style={s.resultBox}>
              <div style={s.resultHeader}>
                <span style={s.resultTitle}>{resultTitle}</span>
                {result && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={s.btnSm} onClick={copyResult}>{copied ? 'Copiado!' : 'Copiar'}</button>
                    <button style={s.btnSm} onClick={() => setResult('')}>Limpar</button>
                  </div>
                )}
              </div>
              {loading && (
                <div style={s.loadingRow}>
                  <Spinner /><span style={{ color: '#888', fontSize: 14 }}>Aguarde, gerando material...</span>
                </div>
              )}
              {result && <pre style={s.resultText}>{result}</pre>}
            </div>
          )}
        </div>

        {/* Modal Upgrade */}
        {(showUpgrade || showProviderUpgrade) && (
          <div style={s.modalOverlay} onClick={() => { setShowUpgrade(false); setShowProviderUpgrade(false); }}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalTitle}>
                {showProviderUpgrade
                  ? `${PROVIDER_LABELS[provider]?.name || 'Esta IA'} está no plano Pro`
                  : 'Você atingiu o limite do plano gratuito'}
              </div>
              <div style={s.modalSub}>
                {showProviderUpgrade
                  ? 'Para usar ChatGPT e outros provedores, faça upgrade para o plano Pro.'
                  : 'Você usou todas as 10 gerações gratuitas do mês. Faça upgrade para continuar.'}
              </div>
              <div style={s.planCards}>
                {[
                  { key: 'pro',    price: 'R$ 29/mês',  desc: '150 gerações + escolha de IA',             color: '#003DA5' },
                  { key: 'school', price: 'R$ 149/mês', desc: 'Ilimitado + todas as IAs + 20 professores', color: '#534AB7' },
                ].map(p => (
                  <div key={p.key} style={{ ...s.planCard, borderColor: p.color }}>
                    <div style={{ ...s.planName, color: p.color }}>{PLAN_LABELS[p.key].name}</div>
                    <div style={s.planPrice}>{p.price}</div>
                    <div style={s.planDesc}>{p.desc}</div>
                    <button style={{ ...s.btnPlan, background: p.color }} onClick={() => {
                      setPlan(p.key);
                      localStorage.setItem('sesi_plan', p.key);
                      setShowUpgrade(false);
                      setShowProviderUpgrade(false);
                      alert(`Plano ${PLAN_LABELS[p.key].name} ativado! Em produção, aqui entraria o checkout do Stripe.`);
                    }}>
                      Assinar {PLAN_LABELS[p.key].name}
                    </button>
                  </div>
                ))}
              </div>
              <button style={s.modalClose} onClick={() => { setShowUpgrade(false); setShowProviderUpgrade(false); }}>
                Continuar no gratuito
              </button>
            </div>
          </div>
        )}

        {/* Ferramenta de Redução */}
        {toolkitFile && (
          <ToolkitModal
            file={toolkitFile}
            onClose={() => setToolkit(null)}
            onApply={(updates) => {
              handleFileUpdate(toolkit.tab, toolkit.fileId, updates);
              setToolkit(null);
            }}
          />
        )}
      </div>
    </>
  );
}

// ── Utilitários de arquivo ────────────────────────────────────────────────

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader   = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImageB64(b64, mediaType, quality) {
  return new Promise((resolve, reject) => {
    const img   = new Image();
    img.onerror = reject;
    img.onload  = () => {
      let { width, height } = img;
      const MAX = 1920;
      if (width > MAX || height > MAX) {
        const scale = MAX / Math.max(width, height);
        width  = Math.floor(width  * scale);
        height = Math.floor(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const newB64  = dataUrl.split(',')[1];
      resolve({ b64: newB64, size: Math.round(newB64.length * 0.75) });
    };
    img.src = `data:${mediaType};base64,${b64}`;
  });
}

async function extractPdfPages(b64, rangeStr, totalPages) {
  const { PDFDocument } = await import('pdf-lib');
  const indices = parsePageRange(rangeStr, totalPages || 9999);
  if (indices.length === 0) throw new Error('Nenhuma página válida no intervalo informado.');

  const srcBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const srcDoc   = await PDFDocument.load(srcBytes);
  const newDoc   = await PDFDocument.create();
  const copied   = await newDoc.copyPages(srcDoc, indices);
  copied.forEach(p => newDoc.addPage(p));

  const outBytes = await newDoc.save();
  // Converte em chunks para evitar stack overflow em arquivos grandes
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < outBytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, outBytes.subarray(i, Math.min(i + CHUNK, outBytes.length)));
  }
  return { b64: btoa(binary), size: outBytes.length, pageCount: indices.length };
}

function parsePageRange(str, total) {
  const idx = new Set();
  str.split(',').forEach(part => {
    part = part.trim();
    if (!part) return;
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = Math.max(1, a); i <= Math.min(total, b); i++) idx.add(i - 1);
      }
    } else {
      const n = parseInt(part);
      if (!isNaN(n) && n >= 1 && n <= total) idx.add(n - 1);
    }
  });
  return Array.from(idx).sort((a, b) => a - b);
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024)         return bytes + ' B';
  if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Componentes base ──────────────────────────────────────────────────────

function FormCard({ children }) {
  return <div style={s.card}>{children}</div>;
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function Row3({ children }) {
  return <div style={s.grid3}>{children}</div>;
}

function Row2({ children, style }) {
  return <div style={{ ...s.grid2, ...style }}>{children}</div>;
}

function Select({ value, onChange, options }) {
  return (
    <select style={s.select} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Selecione</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea style={s.textarea} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  );
}

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div style={s.chipGroup}>
      {options.map(o => (
        <button key={o} style={{ ...s.chip, ...(selected.includes(o) ? s.chipSel : {}) }} onClick={() => onToggle(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <span style={s.spinner}>
      {[0, 0.15, 0.3].map((d, i) => (
        <span key={i} style={{ ...s.dot, animationDelay: d + 's' }} />
      ))}
    </span>
  );
}

// ── Upload de arquivos ────────────────────────────────────────────────────

function FileUploadZone({ files, provider, onAdd, onRemove, onOptimize }) {
  const fileRef        = useRef(null);
  const [dragging, setDragging] = useState(false);
  const support        = PROVIDER_FILE_SUPPORT[provider];

  const accept = [
    ...(support.image ? ['image/jpeg', 'image/png', 'image/webp'] : []),
    ...(support.pdf   ? ['application/pdf'] : []),
  ].join(',');

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onAdd(e.dataTransfer.files);
  };

  if (!support.image && !support.pdf) return null;

  return (
    <div style={s.fileZone}>
      <label style={s.label}>Anexar material (opcional)</label>

      <div
        style={{ ...s.fileDropArea, ...(dragging ? s.fileDropDrag : {}) }}
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>📎</span>
        <div style={s.fileDropText}>
          Clique ou arraste aqui
          <span style={s.fileDropSub}>
            {[support.image && 'Imagens (JPG, PNG)', support.pdf && 'PDF'].filter(Boolean).join(' · ')}
            {' · máx. 5 MB por arquivo'}
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          multiple
          style={{ display: 'none' }}
          onChange={e => { onAdd(e.target.files); e.target.value = ''; }}
        />
      </div>

      {files.length > 0 && (
        <div style={s.fileList}>
          {files.map(f => (
            <FileItem key={f.id} file={f} onRemove={onRemove} onOptimize={onOptimize} />
          ))}
        </div>
      )}

      {!support.pdf && (
        <div style={s.fileNote}>
          💡 Para enviar PDFs, troque para <strong>Claude</strong>.
        </div>
      )}
    </div>
  );
}

function FileItem({ file, onRemove, onOptimize }) {
  return (
    <div style={s.fileItem}>
      {file.type === 'img' && file.preview
        ? <img src={file.preview} alt={file.name} style={s.fileThumb} />
        : <div style={s.filePdfIcon}>PDF</div>
      }
      <div style={s.fileInfo}>
        <div style={s.fileName} title={file.name}>{file.name}</div>
        <div style={s.fileMeta}>
          {formatBytes(file.size)}
          {file.pageCount ? ` · ${file.pageCount} páginas` : ''}
          {file.needsOptimize && <span style={s.fileWarnBadge}> · arquivo grande</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {file.needsOptimize && (
          <button style={s.btnFileOpt} onClick={() => onOptimize(file)} title="Reduzir arquivo">
            🔧
          </button>
        )}
        <button style={s.btnFileRm} onClick={() => onRemove(file.id)} title="Remover">
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Ferramenta de Redução ─────────────────────────────────────────────────

function ToolkitModal({ file, onClose, onApply }) {
  const [quality,    setQuality]    = useState(70);
  const [pageRange,  setPageRange]  = useState('');
  const [processing, setProcessing] = useState(false);

  const isImage = file.type === 'img';
  const estSize = isImage ? Math.round(file.size * (quality / 100) * 0.65) : null;

  const handleCompress = async () => {
    setProcessing(true);
    try {
      const res = await compressImageB64(file.b64, file.mediaType, quality / 100);
      onApply({ b64: res.b64, size: res.size, mediaType: 'image/jpeg', needsOptimize: res.size > FILE_WARN });
    } catch (e) {
      alert('Erro ao comprimir: ' + e.message);
      setProcessing(false);
    }
  };

  const handleExtract = async () => {
    if (!pageRange.trim()) { alert('Informe o intervalo de páginas.'); return; }
    setProcessing(true);
    try {
      const res = await extractPdfPages(file.b64, pageRange, file.pageCount);
      onApply({ b64: res.b64, size: res.size, pageCount: res.pageCount, needsOptimize: false });
    } catch (e) {
      alert('Erro ao extrair páginas: ' + e.message);
      setProcessing(false);
    }
  };

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={s.modalTitle}>🔧 Ferramenta de Redução</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#999', lineHeight: 1, padding: '0 4px' }}
          >✕</button>
        </div>

        <div style={s.toolkitFileInfo}>
          {isImage ? '🖼️' : '📄'} <strong>{file.name}</strong>
          <span style={{ color: '#999', fontWeight: 400 }}> · {formatBytes(file.size)}</span>
          {file.pageCount && <span style={{ color: '#999', fontWeight: 400 }}> · {file.pageCount} páginas</span>}
        </div>

        {/* Imagem — compressão por qualidade */}
        {isImage && (
          <>
            <label style={{ ...s.label, marginTop: 16 }}>Qualidade da imagem</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <input
                type="range" min="30" max="90" step="5" value={quality}
                onChange={e => setQuality(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, minWidth: 38 }}>{quality}%</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              Tamanho estimado após compressão: ~{formatBytes(estSize)}
            </div>
            <button
              style={{ ...s.btnGenerate, marginBottom: 0, ...(processing ? s.btnDisabled : {}) }}
              onClick={handleCompress}
              disabled={processing}
            >
              {processing ? 'Comprimindo...' : 'Comprimir e substituir'}
            </button>
          </>
        )}

        {/* PDF — seleção de páginas */}
        {!isImage && (
          <>
            <label style={{ ...s.label, marginTop: 16 }}>
              Páginas a manter{file.pageCount ? ` (total: ${file.pageCount} páginas)` : ''}
            </label>
            <input
              style={s.input}
              value={pageRange}
              onChange={e => setPageRange(e.target.value)}
              placeholder="Ex: 1-10  ou  1,3,5-8  ou  2"
            />
            <div style={{ fontSize: 12, color: '#888', margin: '6px 0 20px' }}>
              Use hífen para intervalos (1-5) e vírgula para páginas avulsas (1,3,7).
            </div>
            <button
              style={{ ...s.btnGenerate, marginBottom: 0, ...(processing ? s.btnDisabled : {}) }}
              onClick={handleExtract}
              disabled={processing}
            >
              {processing ? 'Extraindo...' : 'Extrair páginas selecionadas'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Dados ─────────────────────────────────────────────────────────────────

const DISCIPLINAS      = ['Matemática', 'Língua Portuguesa', 'Ciências', 'História', 'Geografia', 'Inglês', 'Educação Física', 'Artes', 'Física', 'Química', 'Biologia', 'Filosofia'];
const SERIES           = ['1º ano EF I', '2º ano EF I', '3º ano EF I', '4º ano EF I', '5º ano EF I', '6º ano EF II', '7º ano EF II', '8º ano EF II', '9º ano EF II', '1º ano EM', '2º ano EM', '3º ano EM'];
const SERIES_AGRUPADAS = ['EF I (1º ao 5º)', 'EF II (6º ao 9º)', '1º EM', '2º EM', '3º EM'];

// ── Estilos ───────────────────────────────────────────────────────────────

const s = {
  // ── Layout ──
  page:        { minHeight: '100vh', background: '#F8F8F8', fontFamily: "'Inter', 'Quicksand', sans-serif" },
  header:      { background: '#fff', borderBottom: '0.5px solid #E0D8F0', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 860, margin: '0 auto', padding: '12px 1rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  logo:        { width: 36, height: 36, borderRadius: 8, background: '#3D348B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  appName:     { fontSize: 15, fontWeight: 600, color: '#3D348B', lineHeight: 1.2 },
  appSub:      { fontSize: 11, color: '#9B8BB0' },
  usageBar:    { display: 'flex', flexDirection: 'column', minWidth: 140 },
  usageText:   { fontSize: 11, color: '#9B8BB0' },
  progressTrack: { height: 4, background: '#EDE6F7', borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  planBadge:   { fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20 },
  btnUpgrade:  { padding: '6px 14px', background: '#FF7F50', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },

  main: { maxWidth: 860, margin: '0 auto', padding: '1.25rem 1rem' },

  // ── Seletor de IA ──
  aiSelector:      { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  aiSelectorLabel: { fontSize: 12, fontWeight: 600, color: '#9B8BB0', textTransform: 'uppercase', letterSpacing: '0.04em' },
  aiButtons:       { display: 'flex', gap: 6, flexWrap: 'wrap' },
  aiBtn:           { padding: '6px 14px', borderRadius: 20, border: '0.5px solid #D8CEE8', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#6B5B8A', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 },
  lockIcon:        { fontSize: 11 },

  // ── Tabs ──
  tabs:      { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  tab:       { padding: '7px 16px', borderRadius: 20, border: '0.5px solid #D8CEE8', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#9B8BB0' },
  tabActive: { background: '#3D348B', color: '#fff', borderColor: '#3D348B' },

  // ── Formulário ──
  card:    { background: '#fff', border: '0.5px solid #E0D8F0', borderRadius: 12, padding: '1.25rem', marginBottom: 14 },
  grid3:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 },
  grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label:   { fontSize: 11, fontWeight: 600, color: '#9B8BB0', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' },
  select:  { width: '100%', padding: '8px 10px', border: '0.5px solid #D8CEE8', borderRadius: 8, fontSize: 14, background: '#fff', color: '#3D348B' },
  input:   { width: '100%', padding: '8px 10px', border: '0.5px solid #D8CEE8', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', color: '#3D348B' },
  textarea:  { width: '100%', minHeight: 100, padding: '10px 12px', border: '0.5px solid #D8CEE8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, color: '#3D348B' },
  chipGroup: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip:      { padding: '5px 12px', borderRadius: 20, border: '0.5px solid #D8CEE8', fontSize: 13, cursor: 'pointer', background: 'transparent', color: '#6B5B8A' },
  chipSel:   { background: '#EDE6F7', color: '#3D348B', borderColor: '#C3B1E1', fontWeight: 600 },

  // ── Botões ──
  btnGenerate: { width: '100%', padding: '13px', background: '#FF7F50', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 14, letterSpacing: '0.01em' },
  btnDisabled: { background: '#C8BFD4', cursor: 'default' },

  // ── Resultado ──
  resultBox:    { background: '#fff', border: '0.5px solid #E0D8F0', borderRadius: 12, padding: '1.25rem' },
  resultHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  resultTitle:  { fontSize: 14, fontWeight: 600, color: '#3D348B' },
  btnSm:        { padding: '5px 12px', fontSize: 12, borderRadius: 6, border: '0.5px solid #D8CEE8', background: '#fff', color: '#6B5B8A', cursor: 'pointer' },
  loadingRow:   { display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 0', color: '#9B8BB0' },
  resultText:   { fontSize: 14, color: '#3D348B', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: 'inherit' },

  spinner: { display: 'inline-flex', gap: 4, alignItems: 'center' },
  dot:     { width: 7, height: 7, borderRadius: '50%', background: '#FF7F50', display: 'inline-block', animation: 'bounce 0.8s infinite', animationFillMode: 'both' },

  // ── Upload de arquivos ──
  fileZone:     { marginTop: 4 },
  fileDropArea: { border: '1.5px dashed #D8CEE8', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: '#FDFCFF', transition: 'border-color 0.15s, background 0.15s', userSelect: 'none' },
  fileDropDrag: { borderColor: '#C3B1E1', background: '#EDE6F7' },
  fileDropText: { fontSize: 13, color: '#9B8BB0', display: 'flex', flexDirection: 'column', gap: 2 },
  fileDropSub:  { fontSize: 11, color: '#C3B1E1' },
  fileList:     { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  fileItem:     { display: 'flex', alignItems: 'center', gap: 10, background: '#F8F8F8', border: '0.5px solid #E0D8F0', borderRadius: 8, padding: '8px 10px' },
  fileThumb:    { width: 36, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 },
  filePdfIcon:  { width: 36, height: 36, background: '#FF7F50', color: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 },
  fileInfo:     { flex: 1, minWidth: 0 },
  fileName:     { fontSize: 13, fontWeight: 500, color: '#3D348B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileMeta:     { fontSize: 11, color: '#9B8BB0', marginTop: 1 },
  fileWarnBadge:{ color: '#FF7F50' },
  fileNote:     { fontSize: 11, color: '#9B8BB0', marginTop: 6 },
  btnFileOpt:   { padding: '4px 8px', background: '#EDE6F7', border: '0.5px solid #C3B1E1', borderRadius: 5, fontSize: 13, cursor: 'pointer' },
  btnFileRm:    { padding: '4px 8px', background: 'transparent', border: '0.5px solid #D8CEE8', borderRadius: 5, fontSize: 12, cursor: 'pointer', color: '#9B8BB0' },

  // ── Toolkit ──
  toolkitFileInfo: { background: '#F8F8F8', border: '0.5px solid #E0D8F0', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#3D348B' },

  // ── Modal ──
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(74,59,99,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:        { background: '#fff', borderRadius: 16, padding: '1.5rem', maxWidth: 480, width: '100%' },
  modalTitle:   { fontSize: 18, fontWeight: 600, color: '#3D348B', marginBottom: 8 },
  modalSub:     { fontSize: 14, color: '#6B5B8A', marginBottom: 20, lineHeight: 1.5 },
  planCards:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  planCard:     { border: '2px solid', borderRadius: 10, padding: '1rem' },
  planName:     { fontSize: 13, fontWeight: 600, marginBottom: 4 },
  planPrice:    { fontSize: 20, fontWeight: 600, color: '#3D348B', marginBottom: 4 },
  planDesc:     { fontSize: 12, color: '#6B5B8A', marginBottom: 12, lineHeight: 1.4 },
  btnPlan:      { width: '100%', padding: '8px', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  modalClose:   { width: '100%', padding: '8px', background: 'transparent', border: '0.5px solid #D8CEE8', borderRadius: 6, fontSize: 13, color: '#9B8BB0', cursor: 'pointer' },
};
