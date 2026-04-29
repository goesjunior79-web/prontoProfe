import { useRef, useState } from 'react';
import { btnPri, btnSec, secLabel, lbl, inp } from '../ui';
import { F } from '../ui';

function notaCor(n, max) {
  const pct = max ? n / max : n / 10;
  if (pct < 0.5) return '#A32D2D';
  if (pct < 0.7) return '#BA7517';
  return '#3B6D11';
}

function CardObjetiva({ a }) {
  const nota = parseFloat(a.nota.replace(',', '.'));
  return (
    <div style={{ border: '0.5px solid #E0DDD5', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{a.nome}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{a.acertos}/{a.total} questões certas</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: notaCor(nota, 10) }}>{a.nota}</div>
    </div>
  );
}

function CardDisser({ a }) {
  const [aberto, setAberto] = useState(false);
  const nota = parseFloat(a.nota.replace(',', '.'));
  return (
    <div style={{ border: '0.5px solid #E0DDD5', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setAberto(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{a.nome}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{a.questoes?.length || 0} questões dissertativas</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: notaCor(nota, parseFloat(String(a.total).replace(',', '.'))) }}>{a.nota}</div>
        <span style={{ fontSize: 11, color: '#aaa' }}>{aberto ? '▲' : '▼'}</span>
      </div>
      {aberto && (
        <div style={{ borderTop: '0.5px solid #E0DDD5', background: '#FAFAF8', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {a.questoes?.map((q, i) => (
            <div key={i} style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 7, padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 12 }}>Questão {q.num}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: notaCor(q.nota, q.max) }}>{String(q.nota).replace('.', ',')} / {q.max}</span>
              </div>
              {q.criterios && Object.entries(q.criterios).map(([nome, val]) => (
                <div key={nome} style={{ fontSize: 11, color: '#555', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span>{nome} ({val.pct}%)</span>
                  <span style={{ color: val.atingido >= 70 ? '#3B6D11' : val.atingido >= 50 ? '#BA7517' : '#A32D2D' }}>{val.atingido}%</span>
                </div>
              ))}
              {q.comentario && <div style={{ fontSize: 11, color: '#777', marginTop: 4, fontStyle: 'italic' }}>{q.comentario}</div>}
            </div>
          ))}
          {a.comentarioGeral && (
            <div style={{ fontSize: 12, color: '#555', background: '#EAF3DE', borderRadius: 7, padding: '7px 10px' }}>
              💬 {a.comentarioGeral}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TurmaModal({
  gabaritos, gabSelecionado, turmaAlunos,
  turmaAlunoNome, turmaFoto, turmaCorrigindo,
  onSelectGabarito, onAlunoNomeChange, onCarregarFoto,
  onCorrigirFoto, onExportarCSV, onDownloadGabarito, onClose,
}) {
  const cameraInputRef = useRef(null);
  const fotoInputRef   = useRef(null);
  const isDisser = gabSelecionado?.tipo === 'dissertativa';

  const notas = turmaAlunos.map(a => parseFloat(a.nota.replace(',', '.')));
  const media = notas.length ? (notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(1).replace('.', ',') : null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', maxWidth: 580, width: '100%', marginTop: '1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#1a1a18' }}>📷 Corrigir Turma</div>
            <div style={{ fontSize: 12, color: '#888' }}>Fotografe cada prova — a IA corrige automaticamente</div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: '0.5px solid #D3D1C7', background: '#fff', cursor: 'pointer', fontSize: 16 }} onClick={onClose}>✕</button>
        </div>

        {/* Seleção de gabarito */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Selecionar gabarito</label>
          {gabaritos.length === 0
            ? <div style={{ padding: '12px', background: '#F7F6F3', borderRadius: 8, fontSize: 13, color: '#888', textAlign: 'center' }}>Nenhum gabarito salvo. Gere uma prova primeiro.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {gabaritos.map(g => (
                  <div key={g.id} style={{ border: '1.5px solid ' + (gabSelecionado?.id === g.id ? '#003DA5' : '#E0DDD5'), borderRadius: 8, padding: '9px 12px', cursor: 'pointer', background: gabSelecionado?.id === g.id ? '#E6F1FB' : '#fff', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => onSelectGabarito(g)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{g.titulo}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {g.tipo === 'dissertativa' ? '✍️ Dissertativa' : '☑️ Objetiva'} · {g.qtd} questões · {g.data}
                      </div>
                    </div>
                    <button style={{ ...btnSec, fontSize: 11 }} onClick={e => { e.stopPropagation(); onDownloadGabarito(g); }}>⬇</button>
                    {gabSelecionado?.id === g.id && <span style={{ fontSize: 12, color: '#003DA5', fontWeight: 600 }}>✓</span>}
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Rubrica dissertativa */}
        {isDisser && gabSelecionado?.rubrica?.length > 0 && (
          <div style={{ background: '#FFF8E6', border: '0.5px solid #F0D080', borderRadius: 10, padding: '10px 13px', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#7A5A00', marginBottom: 7 }}>📋 Critérios de correção desta prova</div>
            {gabSelecionado.rubrica.map(q => (
              <div key={q.num} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>Q{q.num} — {q.peso} pts</div>
                {q.criterios.map(c => (
                  <div key={c.nome} style={{ fontSize: 11, color: '#666', paddingLeft: 10 }}>• {c.nome} ({c.pct}%): {c.descricao}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Fotografar + corrigir */}
        {gabSelecionado && (
          <div style={{ background: '#F7F6F3', borderRadius: 10, padding: '12px', marginBottom: 12 }}>
            <span style={secLabel}>{isDisser ? '✍️ Fotografar resposta dissertativa' : '📷 Fotografar prova do aluno'}</span>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files[0] && onCarregarFoto(e.target.files[0])} />
            <input ref={fotoInputRef}   type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && onCarregarFoto(e.target.files[0])} />
            <F label="Nome do aluno" style={{ marginBottom: 10 }}>
              <input style={inp} value={turmaAlunoNome} onChange={e => onAlunoNomeChange(e.target.value)} placeholder="Digite o nome do aluno..." />
            </F>
            {turmaFoto
              ? <div style={{ marginBottom: 10 }}>
                  <img src={turmaFoto.preview} style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, border: '0.5px solid #E0DDD5' }} alt="Prova" />
                  <button style={{ ...btnSec, marginTop: 6, fontSize: 12 }} onClick={() => onCarregarFoto(null)}>Trocar foto</button>
                </div>
              : <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button style={{ flex: 1, padding: '10px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }} onClick={() => cameraInputRef.current?.click()}>📷 Abrir câmera</button>
                  <button style={{ flex: 1, ...btnSec, padding: '10px', fontSize: 13 }} onClick={() => fotoInputRef.current?.click()}>🖼 Galeria</button>
                </div>
            }
            {isDisser && (
              <div style={{ fontSize: 11, color: '#7A5A00', background: '#FFF8E6', borderRadius: 6, padding: '6px 9px', marginBottom: 8 }}>
                💡 A IA irá ler a resposta escrita e avaliar cada critério da rubrica automaticamente.
              </div>
            )}
            <button
              style={{ width: '100%', padding: 10, background: turmaCorrigindo || !turmaFoto || !turmaAlunoNome.trim() ? '#B4B2A9' : '#cc0000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: turmaCorrigindo || !turmaFoto || !turmaAlunoNome.trim() ? 'default' : 'pointer' }}
              onClick={onCorrigirFoto}
              disabled={turmaCorrigindo || !turmaFoto || !turmaAlunoNome.trim()}
            >
              {turmaCorrigindo ? (isDisser ? '⏳ Lendo e avaliando respostas...' : '⏳ Corrigindo com IA...') : '✦ Corrigir esta prova'}
            </button>
          </div>
        )}

        {/* Resultados */}
        {turmaAlunos.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{turmaAlunos.length} aluno{turmaAlunos.length > 1 ? 's' : ''} corrigido{turmaAlunos.length > 1 ? 's' : ''}</div>
              <button style={{ ...btnPri, fontSize: 12, padding: '6px 14px' }} onClick={onExportarCSV}>📊 Exportar planilha</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
              {turmaAlunos.map((a, i) =>
                a.tipo === 'dissertativa'
                  ? <CardDisser key={i} a={a} />
                  : <CardObjetiva key={i} a={a} />
              )}
            </div>
            {media && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: '#F7F6F3', borderRadius: 8, fontSize: 12, color: '#5F5E5A' }}>
                Média: <b>{media}</b>
                &nbsp;·&nbsp;Maior: <b>{Math.max(...notas).toFixed(1).replace('.', ',')}</b>
                &nbsp;·&nbsp;Menor: <b>{Math.min(...notas).toFixed(1).replace('.', ',')}</b>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
