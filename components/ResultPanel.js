import { btnSec, secLabel } from './ui';

export default function ResultPanel({
  result, loading, resultTitle, loadingMsg,
  tab, gabaritos, prova,
  copied, gdLoading, gdStatus, odLoading, odStatus,
  onCopy, onClear, onExportPDF, onExportWord, onExportExcel,
  onSaveGoogleDrive, onSaveOneDrive, onDownloadGabarito,
}) {
  if (!result && !loading) return null;

  return (
    <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{resultTitle || 'Gerando...'}</span>
        {result && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <button style={btnSec} onClick={onCopy}>{copied ? '✓ Copiado' : 'Copiar'}</button>
            <button style={btnSec} onClick={onClear}>Limpar</button>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#003DA5', animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#5F5E5A', fontWeight: 500 }}>{loadingMsg || 'Gerando material...'}</div>
        </div>
      )}

      {result && <>
        <pre style={{ fontSize: 13, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginBottom: 14, maxHeight: 400, overflowY: 'auto', padding: '10px', background: '#F7F6F3', borderRadius: 8 }}>
          {result}
        </pre>

        {tab === 'prova' && gabaritos[0] && gabaritos[0].disciplina === (prova.disciplina || '') && (
          <div style={{ background: '#EAF3DE', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#27500A', flex: 1 }}>✅ Gabarito salvo automaticamente no app</span>
            <button style={{ ...btnSec, fontSize: 12 }} onClick={() => onDownloadGabarito(gabaritos[0])}>⬇ Baixar gabarito</button>
          </div>
        )}

        <div style={{ borderTop: '0.5px solid #E0DDD5', paddingTop: 12 }}>
          <span style={secLabel}>Exportar no padrão SESI</span>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
            <button style={{ padding: '8px 20px', background: '#cc0000', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={onExportPDF}>
              📄 PDF Padrão SESI
            </button>
            <button style={{ padding: '8px 14px', fontSize: 13, borderRadius: 6, border: '0.5px solid #D3D1C7', background: '#fff', color: '#5F5E5A', cursor: 'pointer' }} onClick={onExportWord}>
              📝 Word
            </button>
            <button style={{ padding: '8px 14px', fontSize: 13, borderRadius: 6, border: '0.5px solid #1E8449', background: '#fff', color: '#1E8449', cursor: 'pointer' }} onClick={onExportExcel}>
              📊 Excel
            </button>
          </div>
          <span style={{ ...secLabel, marginTop: 4 }}>Salvar na nuvem</span>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button style={{ padding: '8px 14px', fontSize: 13, borderRadius: 6, border: '0.5px solid #4285F4', background: '#fff', color: '#4285F4', cursor: 'pointer' }} onClick={onSaveGoogleDrive}>
              {gdLoading ? 'Salvando...' : '🔵 Google Drive'}
            </button>
            <button style={{ padding: '8px 14px', fontSize: 13, borderRadius: 6, border: '0.5px solid #0078d4', background: '#fff', color: '#0078d4', cursor: odLoading ? 'default' : 'pointer', opacity: odLoading ? 0.6 : 1 }} onClick={onSaveOneDrive}>
              {odLoading ? 'Salvando...' : '☁ OneDrive'}
            </button>
          </div>
          {gdStatus && <div style={{ marginTop: 7, fontSize: 12, color: gdStatus.includes('✓') ? '#3B6D11' : '#A32D2D' }}>{gdStatus}</div>}
          {odStatus && <div style={{ marginTop: 7, fontSize: 12, color: odStatus.includes('✓') ? '#3B6D11' : '#A32D2D' }}>{odStatus}</div>}
        </div>
      </>}
    </div>
  );
}
