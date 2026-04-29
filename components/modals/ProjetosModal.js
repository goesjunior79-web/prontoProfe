import { useState, useRef } from 'react';

const PERIODOS = ['1º Semestre', '2º Semestre', 'Anual', 'Outro'];
const SERIES   = [
  'Todas as séries',
  '1º ano EF I','2º ano EF I','3º ano EF I','4º ano EF I','5º ano EF I',
  '6º ano EF II','7º ano EF II','8º ano EF II','9º ano EF II',
  '1º ano EM','2º ano EM','3º ano EM',
];

const KB = 1024;
const AVISO_KB  = 80;   // aviso amarelo acima de 80 KB por arquivo
const LIMITE_KB = 200;  // aviso vermelho acima de 200 KB total

const vazio = () => ({ id:'', nome:'', periodo:'1º Semestre', serieAlvo:'Todas as séries', diretrizes:'', arquivos:[], ativo:false });

// ── Extrai texto de arquivo ──────────────────────────────────────────────────
async function extrairTexto(file, pageRange) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const tipo = ext === 'pdf' ? 'pdf' : ['doc','docx'].includes(ext) ? 'word' : 'txt';

  if (tipo === 'txt') {
    const texto = await file.text();
    return { tipo, texto, totalPaginas: null, nota: '' };
  }

  if (tipo === 'word') {
    if (!window.mammoth) await new Promise(r => setTimeout(r, 1500));
    const buf = await file.arrayBuffer();
    const r   = await window.mammoth.extractRawText({ arrayBuffer: buf });
    return { tipo, texto: r.value, totalPaginas: null, nota: '' };
  }

  if (tipo === 'pdf') {
    if (!window.pdfjsLib) await new Promise(r => setTimeout(r, 1500));
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const total = pdf.numPages;

    if (!pageRange) return { tipo, texto: null, totalPaginas: total, nota: '' };

    const from = Math.max(1, pageRange.from || 1);
    const to   = Math.min(total, pageRange.to || total);
    let texto  = '';
    for (let p = from; p <= to; p++) {
      const pg = await pdf.getPage(p);
      const c  = await pg.getTextContent();
      texto   += c.items.map(i => i.str).join(' ') + '\n';
    }
    return { tipo, texto, totalPaginas: total, nota: `Páginas ${from}–${to} de ${total}` };
  }
}

export default function ProjetosModal({ projetos, onSave, onClose }) {
  const [lista, setLista]         = useState(projetos);
  const [form, setForm]           = useState(null);
  const [erro, setErro]           = useState('');
  const [arqStatus, setArqStatus] = useState({});   // { [tmpId]: 'lendo'|'range'|'ok'|'erro' }
  const [arqFiles,  setArqFiles]  = useState({});   // { [tmpId]: File }
  const [pageRanges, setPageRanges] = useState({});  // { [tmpId]: { from, to } }
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const abrirNovo    = () => { setForm(vazio()); setErro(''); setArqStatus({}); setArqFiles({}); setPageRanges({}); };
  const abrirEditar  = p  => { setForm({ ...p }); setErro(''); setArqStatus({}); setArqFiles({}); setPageRanges({}); };

  // ── Salvar projeto ───────────────────────────────────────────────────────────
  const salvarForm = () => {
    if (!form.nome.trim())       { setErro('Dê um nome ao projeto.'); return; }
    if (!form.diretrizes.trim()) { setErro('Adicione as diretrizes do projeto.'); return; }
    const pendentes = Object.values(arqStatus).filter(s => s === 'lendo' || s === 'range' || s === 'extraindo');
    if (pendentes.length > 0)    { setErro('Aguarde o processamento dos arquivos.'); return; }

    const projeto = { ...form, id: form.id || Date.now().toString(), ativo: form.ativo ?? false };
    const nova    = !form.id ? [...lista, projeto] : lista.map(p => p.id === projeto.id ? projeto : p);
    setLista(nova);
    onSave(nova);
    setForm(null);
  };

  const excluir    = id  => { const n = lista.filter(p => p.id !== id); setLista(n); onSave(n); };
  const toggleAtivo = id => { const n = lista.map(p => ({ ...p, ativo: p.id === id ? !p.ativo : false })); setLista(n); onSave(n); };

  // ── Upload de arquivo ────────────────────────────────────────────────────────
  const adicionarArquivo = async file => {
    const tmpId = 'tmp_' + Date.now();
    setArqFiles(p => ({ ...p, [tmpId]: file }));
    setArqStatus(p => ({ ...p, [tmpId]: 'lendo' }));

    try {
      const { tipo, texto, totalPaginas } = await extrairTexto(file, null);
      if (tipo === 'pdf' && texto === null) {
        // PDF precisa de range
        setArqStatus(p => ({ ...p, [tmpId]: 'range' }));
        setPageRanges(p => ({ ...p, [tmpId]: { from: 1, to: Math.min(totalPaginas, 50) } }));
        setArqFiles(p => ({ ...p, [tmpId]: { file, totalPaginas } }));
      } else {
        finalizarArquivo(tmpId, file.name, tipo, texto, null, '');
      }
    } catch (e) {
      setArqStatus(p => ({ ...p, [tmpId]: 'erro' }));
    }
  };

  const extrairPaginasPDF = async tmpId => {
    setArqStatus(p => ({ ...p, [tmpId]: 'extraindo' }));
    const { file, totalPaginas } = arqFiles[tmpId];
    const range = pageRanges[tmpId];
    try {
      const { texto, nota } = await extrairTexto(file, range);
      finalizarArquivo(tmpId, file.name, 'pdf', texto, totalPaginas, nota);
    } catch (e) {
      setArqStatus(p => ({ ...p, [tmpId]: 'erro' }));
    }
  };

  const finalizarArquivo = (tmpId, nome, tipo, texto, totalPaginas, nota) => {
    const arq = {
      id: Date.now().toString(),
      nome, tipo, texto,
      tamanhoTexto: new Blob([texto]).size,
      totalPaginas, nota,
    };
    setForm(f => ({ ...f, arquivos: [...(f.arquivos || []), arq] }));
    setArqStatus(p => { const n = { ...p }; delete n[tmpId]; return n; });
    setArqFiles(p  => { const n = { ...p }; delete n[tmpId]; return n; });
    setPageRanges(p => { const n = { ...p }; delete n[tmpId]; return n; });
  };

  const removerArquivo = id => setForm(f => ({ ...f, arquivos: f.arquivos.filter(a => a.id !== id) }));

  // ── Tamanho total dos arquivos ───────────────────────────────────────────────
  const totalBytes = (form?.arquivos || []).reduce((s, a) => s + (a.tamanhoTexto || 0), 0);

  // ── Estilos ──────────────────────────────────────────────────────────────────
  const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' };
  const box     = { background:'#fff', borderRadius:14, width:'100%', maxWidth:540, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.18)', fontFamily:'system-ui,-apple-system,sans-serif' };
  const hdr     = { padding:'18px 20px 14px', borderBottom:'0.5px solid #E0DDD5', display:'flex', alignItems:'center', justifyContent:'space-between' };
  const body    = { padding:'16px 20px 20px' };
  const lbl     = { fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:4 };
  const inp     = { width:'100%', padding:'9px 12px', border:'1px solid #D5D2CC', borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none', fontFamily:'inherit' };
  const btnPri  = { padding:'10px 20px', background:'#003DA5', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' };
  const btnSec  = { padding:'10px 16px', background:'#F1EFE8', color:'#333', border:'1px solid #D5D2CC', borderRadius:8, fontSize:14, cursor:'pointer' };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>

        {/* Header */}
        <div style={hdr}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {form && <button onClick={() => setForm(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#666', padding:0 }}>←</button>}
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#1a1a18' }}>
                {form ? (form.id ? 'Editar Projeto' : 'Novo Projeto') : '📁 Projetos'}
              </div>
              {!form && <div style={{ fontSize:11, color:'#888', marginTop:1 }}>Diretrizes e materiais por projeto</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#888', padding:0 }}>✕</button>
        </div>

        <div style={body}>

          {/* ── Listagem ── */}
          {!form && (<>
            {lista.length === 0 && (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#aaa', fontSize:13 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
                Nenhum projeto cadastrado ainda.
              </div>
            )}

            {lista.map(p => (
              <div key={p.id} style={{ border:'1px solid '+(p.ativo?'#003DA5':'#E0DDD5'), borderRadius:10, padding:'12px 14px', marginBottom:10, background:p.ativo?'#F0F4FF':'#fff' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <button onClick={() => toggleAtivo(p.id)} title={p.ativo?'Desativar':'Ativar'}
                    style={{ flexShrink:0, width:40, height:22, borderRadius:11, background:p.ativo?'#003DA5':'#D5D2CC', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', marginTop:2 }}>
                    <span style={{ position:'absolute', top:3, left:p.ativo?20:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s', display:'block' }} />
                  </button>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, fontSize:14, color:'#1a1a18' }}>{p.nome}</span>
                      {p.ativo && <span style={{ fontSize:10, padding:'1px 7px', background:'#003DA5', color:'#fff', borderRadius:20, fontWeight:600 }}>ATIVO</span>}
                    </div>
                    <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
                      {p.periodo}{p.serieAlvo && p.serieAlvo !== 'Todas as séries' ? ' · '+p.serieAlvo : ''}
                      {p.arquivos?.length > 0 && ` · 📎 ${p.arquivos.length} arquivo${p.arquivos.length>1?'s':''}`}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <button onClick={() => abrirEditar(p)} style={{ background:'none', border:'1px solid #D5D2CC', borderRadius:6, fontSize:12, padding:'3px 8px', cursor:'pointer', color:'#555' }}>✏️</button>
                    <button onClick={() => excluir(p.id)} style={{ background:'none', border:'1px solid #F5BABA', borderRadius:6, fontSize:12, padding:'3px 8px', cursor:'pointer', color:'#A32D2D' }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}

            <button style={{ ...btnPri, width:'100%', marginTop:8 }} onClick={abrirNovo}>+ Novo Projeto</button>
          </>)}

          {/* ── Formulário ── */}
          {form && (<>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Nome do projeto *</label>
              <input style={inp} placeholder="Ex: Avalia SESI 2026" value={form.nome} onChange={e => set('nome', e.target.value)} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={lbl}>Período</label>
                <select style={{ ...inp, background:'#fff' }} value={form.periodo} onChange={e => set('periodo', e.target.value)}>
                  {PERIODOS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Para qual série?</label>
                <select style={{ ...inp, background:'#fff' }} value={form.serieAlvo} onChange={e => set('serieAlvo', e.target.value)}>
                  {SERIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Diretrizes do projeto *</label>
              <textarea
                style={{ ...inp, minHeight:120, resize:'vertical', lineHeight:1.55 }}
                placeholder={'Ex:\n- Foco em interpretação de texto\n- Questões objetivas, 4 alternativas\n- Alinhado aos conteúdos do 6º ao 9º ano\n- Evitar temas polêmicos'}
                value={form.diretrizes}
                onChange={e => set('diretrizes', e.target.value)}
              />
            </div>

            {/* ── Arquivos do projeto ── */}
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Arquivos do projeto <span style={{ fontWeight:400, color:'#aaa' }}>(modelo, livro, referência...)</span></label>

              {/* Arquivos já salvos no projeto */}
              {(form.arquivos || []).map(arq => (
                <div key={arq.id} style={{ border:'1px solid #E0DDD5', borderRadius:8, padding:'10px 12px', marginBottom:8, background:'#FAFAF8' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>{arq.tipo === 'pdf' ? '📄' : arq.tipo === 'word' ? '📝' : '📃'}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{arq.nome}</div>
                      <div style={{ fontSize:11, color:'#888', marginTop:1 }}>
                        {arq.nota || ({ pdf: 'Documento PDF', word: 'Documento Word', txt: 'Arquivo de texto' }[arq.tipo] || arq.tipo)}
                      </div>
                    </div>
                    <button onClick={() => removerArquivo(arq.id)} style={{ fontSize:13, padding:'3px 7px', border:'1px solid #F5BABA', borderRadius:6, background:'none', cursor:'pointer', color:'#A32D2D' }}>🗑</button>
                  </div>
                </div>
              ))}

              {/* Arquivos sendo processados */}
              {Object.entries(arqStatus).map(([tmpId, status]) => {
                const info = arqFiles[tmpId];
                const nome = info?.file?.name || info?.name || 'Arquivo';
                return (
                  <div key={tmpId} style={{ border:'1px solid #E0DDD5', borderRadius:8, padding:'10px 12px', marginBottom:8, background:'#FAFAF8' }}>
                    {status === 'lendo' && (
                      <div style={{ fontSize:13, color:'#888' }}>⏳ Lendo {nome}…</div>
                    )}
                    {status === 'extraindo' && (
                      <div style={{ fontSize:13, color:'#888' }}>⏳ Lendo as páginas…</div>
                    )}
                    {status === 'range' && (
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, marginBottom:8 }}>📄 {nome} — {info.totalPaginas} páginas</div>
                        <div style={{ fontSize:12, color:'#666', marginBottom:8 }}>
                          Arquivo grande. Selecione quais páginas incluir no projeto:
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span style={{ fontSize:12 }}>Pág.</span>
                          <input type="number" min={1} max={info.totalPaginas} value={pageRanges[tmpId]?.from || 1}
                            onChange={e => setPageRanges(p => ({ ...p, [tmpId]: { ...p[tmpId], from: +e.target.value } }))}
                            style={{ width:60, padding:'4px 8px', border:'1px solid #D5D2CC', borderRadius:6, fontSize:13 }} />
                          <span style={{ fontSize:12 }}>até</span>
                          <input type="number" min={1} max={info.totalPaginas} value={pageRanges[tmpId]?.to || Math.min(info.totalPaginas,50)}
                            onChange={e => setPageRanges(p => ({ ...p, [tmpId]: { ...p[tmpId], to: +e.target.value } }))}
                            style={{ width:60, padding:'4px 8px', border:'1px solid #D5D2CC', borderRadius:6, fontSize:13 }} />
                          <span style={{ fontSize:11, color:'#aaa' }}>de {info.totalPaginas}</span>
                          <button onClick={() => extrairPaginasPDF(tmpId)} style={{ ...btnPri, padding:'5px 14px', fontSize:12 }}>Usar estas páginas</button>
                        </div>
                      </div>
                    )}
                    {status === 'erro' && (
                      <div style={{ fontSize:13, color:'#A32D2D' }}>❌ Não foi possível ler este arquivo. Tente um PDF menor ou Word.</div>
                    )}
                  </div>
                );
              })}

              {/* Aviso de volume de conteúdo */}
              {totalBytes > LIMITE_KB * KB && (
                <div style={{ fontSize:12, color:'#A32D2D', background:'#FCEBEB', border:'0.5px solid #E8AAAA', borderRadius:8, padding:'8px 12px', marginBottom:8 }}>
                  ⚠ Muitas páginas incluídas. Prefira enviar apenas os capítulos ou seções relevantes para melhores resultados.
                </div>
              )}

              {/* Botão adicionar arquivo */}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display:'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) adicionarArquivo(f); e.target.value=''; }} />
              <button onClick={() => fileRef.current.click()}
                style={{ width:'100%', padding:'10px', border:'1.5px dashed #C5C2BB', borderRadius:8, background:'#FAFAF8', fontSize:13, color:'#666', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>📎</span> Adicionar arquivo (PDF, Word, TXT)
              </button>
              <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>
                Para PDFs grandes, prefira enviar apenas o capítulo ou seção relevante.
              </div>
            </div>

            {erro && (
              <div style={{ background:'#FCEBEB', border:'0.5px solid #E8AAAA', borderRadius:8, padding:'8px 12px', marginBottom:12, fontSize:13, color:'#A32D2D' }}>{erro}</div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button style={{ ...btnSec, flex:1 }} onClick={() => setForm(null)}>Cancelar</button>
              <button style={{ ...btnPri, flex:2 }} onClick={salvarForm}>Salvar Projeto</button>
            </div>
          </>)}

        </div>
      </div>
    </div>
  );
}
