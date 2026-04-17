import { useRef } from 'react';
import { btnPri, btnSec, secLabel, lbl, inp } from '../ui';
import { F } from '../ui';

export default function TurmaModal({
  gabaritos, gabSelecionado, turmaAlunos,
  turmaAlunoNome, turmaFoto, turmaCorrigindo,
  onSelectGabarito, onAlunoNomeChange, onCarregarFoto,
  onCorrigirFoto, onExportarCSV, onDownloadGabarito, onClose,
}) {
  const cameraInputRef = useRef(null);
  const fotoInputRef = useRef(null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', maxWidth: 580, width: '100%', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#1a1a18' }}>📷 Corrigir Turma</div>
            <div style={{ fontSize: 12, color: '#888' }}>Fotografe cada prova — a IA corrige automaticamente</div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: '0.5px solid #D3D1C7', background: '#fff', cursor: 'pointer', fontSize: 16 }} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Selecionar gabarito</label>
          {gabaritos.length === 0
            ? <div style={{ padding: '12px', background: '#F7F6F3', borderRadius: 8, fontSize: 13, color: '#888', textAlign: 'center' }}>Nenhum gabarito salvo ainda. Gere uma prova primeiro.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {gabaritos.map(g => (
                  <div key={g.id} style={{ border: '1.5px solid ' + (gabSelecionado?.id === g.id ? '#003DA5' : '#E0DDD5'), borderRadius: 8, padding: '9px 12px', cursor: 'pointer', background: gabSelecionado?.id === g.id ? '#E6F1FB' : '#fff', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => onSelectGabarito(g)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{g.titulo}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{g.qtd} questões · Valor: {g.valorInstrumento} · {g.data}</div>
                    </div>
                    <button style={{ ...btnSec, fontSize: 11 }} onClick={e => { e.stopPropagation(); onDownloadGabarito(g); }}>⬇</button>
                    {gabSelecionado?.id === g.id && <span style={{ fontSize: 12, color: '#003DA5', fontWeight: 600 }}>✓</span>}
                  </div>
                ))}
              </div>
          }
        </div>

        {gabSelecionado && <>
          <div style={{ background: '#F7F6F3', borderRadius: 10, padding: '12px', marginBottom: 12 }}>
            <span style={secLabel}>Fotografar prova do aluno</span>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files[0] && onCarregarFoto(e.target.files[0])} />
            <input ref={fotoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && onCarregarFoto(e.target.files[0])} />
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
            <button
              style={{ width: '100%', padding: 10, background: turmaCorrigindo || !turmaFoto || !turmaAlunoNome.trim() ? '#B4B2A9' : '#cc0000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: turmaCorrigindo || !turmaFoto || !turmaAlunoNome.trim() ? 'default' : 'pointer' }}
              onClick={onCorrigirFoto}
              disabled={turmaCorrigindo || !turmaFoto || !turmaAlunoNome.trim()}
            >
              {turmaCorrigindo ? '⏳ Corrigindo com IA...' : '✦ Corrigir esta prova'}
            </button>
          </div>

          {turmaAlunos.length > 0 && <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{turmaAlunos.length} aluno{turmaAlunos.length > 1 ? 's' : ''} corrigido{turmaAlunos.length > 1 ? 's' : ''}</div>
              <button style={{ ...btnPri, fontSize: 12, padding: '6px 14px' }} onClick={onExportarCSV}>📊 Exportar planilha</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
              {turmaAlunos.map((a, i) => (
                <div key={i} style={{ border: '0.5px solid #E0DDD5', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.nome}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{a.acertos}/{a.total} questões certas</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: parseFloat(a.nota.replace(',', '.')) < 5 ? '#A32D2D' : parseFloat(a.nota.replace(',', '.')) < 7 ? '#BA7517' : '#3B6D11' }}>{a.nota}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, padding: '8px 10px', background: '#F7F6F3', borderRadius: 8, fontSize: 12, color: '#5F5E5A' }}>
              Média: <b>{(turmaAlunos.reduce((s, a) => s + parseFloat(a.nota.replace(',', '.')), 0) / turmaAlunos.length).toFixed(1).replace('.', ',')}</b>
              &nbsp;·&nbsp;Maior: <b>{Math.max(...turmaAlunos.map(a => parseFloat(a.nota.replace(',', '.'))))}</b>
              &nbsp;·&nbsp;Menor: <b>{Math.min(...turmaAlunos.map(a => parseFloat(a.nota.replace(',', '.'))))}</b>
            </div>
          </>}
        </>}
      </div>
    </div>
  );
}
