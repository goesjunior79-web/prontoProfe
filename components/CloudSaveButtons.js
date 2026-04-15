// components/CloudSaveButtons.js
// Salva o conteúdo gerado diretamente no Google Drive ou OneDrive.
// O professor escolhe o formato (PDF/Word/Excel) antes de salvar.

import { useState } from 'react';

const FORMATS = [
  { key: 'pdf',   label: 'PDF'   },
  { key: 'word',  label: 'Word'  },
  { key: 'excel', label: 'Excel' },
];

const PROVIDERS = [
  {
    key:   'google',
    label: 'Google Drive',
    icon:  (
      <svg width="16" height="16" viewBox="0 0 87.3 78" fill="none">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 51.5H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
        <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0 23.9 0 22.35.4 21 1.2l-7.25 4.2L27.5 27.5h16.15z" fill="#00ac47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60.1l5.55 10.35z" fill="#ea4335"/>
        <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35C32.8 0 31.25.4 29.9 1.2L43.65 25z" fill="#00832d"/>
        <path d="M60.1 51.5H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2z" fill="#2684fc"/>
        <path d="M73.4 25.5L59.65 1.2A9.4 9.4 0 0056.35 0H43.65L57.4 25.5 60.1 51.5h27.2z" fill="#ffba00"/>
      </svg>
    ),
    color:  '#1a73e8',
    bg:     '#e8f0fe',
    border: '#4285f4',
  },
  {
    key:   'onedrive',
    label: 'OneDrive',
    icon:  (
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path d="M12.06 3.83A5.5 5.5 0 0 0 1.5 7.5 3.5 3.5 0 0 0 3.5 14h13a3.5 3.5 0 0 0 .95-6.87A5.5 5.5 0 0 0 12.06 3.83z" fill="#0078d4"/>
      </svg>
    ),
    color:  '#0078d4',
    bg:     '#e6f2fb',
    border: '#0078d4',
  },
];

export default function CloudSaveButtons({ result, title, loading, provider: aiProvider, model }) {
  const [format,   setFormat]   = useState('pdf');
  const [status,   setStatus]   = useState({ key: null, phase: 'idle' }); // phase: idle|auth|uploading|success|error
  const [saveLink, setSaveLink] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!result) return null;

  const meta    = { provider: aiProvider, model };
  const busy    = status.phase !== 'idle' && status.phase !== 'success' && status.phase !== 'error';
  const disabled = busy || loading;

  async function getBlobForFormat() {
    if (format === 'pdf') {
      const { exportToPDF }   = await import('../lib/exporters/pdf');
      return exportToPDF(result, title, meta, { returnBlob: true });
    }
    if (format === 'word') {
      const { exportToWord }  = await import('../lib/exporters/word');
      return exportToWord(result, title, meta, { returnBlob: true });
    }
    const { exportToExcel } = await import('../lib/exporters/excel');
    return exportToExcel(result, title, meta, { returnBlob: true });
  }

  async function handleCloudSave(providerKey) {
    if (disabled) return;
    setErrorMsg('');
    setSaveLink(null);

    try {
      // Fase 1: autenticação
      setStatus({ key: providerKey, phase: 'auth' });
      let token;
      if (providerKey === 'google') {
        const { googleSignIn }  = await import('../lib/cloud/google-drive');
        token = await googleSignIn();
      } else {
        const { oneDriveSignIn } = await import('../lib/cloud/onedrive');
        token = await oneDriveSignIn();
      }

      // Fase 2: gerar blob
      setStatus({ key: providerKey, phase: 'uploading' });
      const blob = await getBlobForFormat();

      // Fase 3: upload
      let result;
      if (providerKey === 'google') {
        const { uploadToGoogleDrive } = await import('../lib/cloud/google-drive');
        result = await uploadToGoogleDrive(token, blob, format);
      } else {
        const { uploadToOneDrive } = await import('../lib/cloud/onedrive');
        result = await uploadToOneDrive(token, blob, format);
      }

      setSaveLink({ ...result, provider: providerKey });
      setStatus({ key: providerKey, phase: 'success' });

    } catch (err) {
      console.error(`Erro ao salvar em ${providerKey}:`, err);
      setErrorMsg(err.message || 'Erro desconhecido. Tente novamente.');
      setStatus({ key: providerKey, phase: 'error' });
    }
  }

  function reset() {
    setStatus({ key: null, phase: 'idle' });
    setSaveLink(null);
    setErrorMsg('');
  }

  const phaseLabel = {
    auth:      'Autenticando...',
    uploading: 'Enviando...',
  };

  return (
    <div style={s.wrapper}>
      {/* Linha de título */}
      <div style={s.header}>
        <span style={s.label}>Salvar na nuvem:</span>

        {/* Seletor de formato */}
        <div style={s.formatGroup}>
          {FORMATS.map(f => (
            <button
              key={f.key}
              style={{ ...s.fmtBtn, ...(format === f.key ? s.fmtBtnSel : {}) }}
              onClick={() => { setFormat(f.key); reset(); }}
              disabled={disabled}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Botões dos provedores */}
      <div style={s.providerRow}>
        {PROVIDERS.map(({ key, label, icon, color, bg, border }) => {
          const isActive   = status.key === key;
          const isSuccess  = isActive && status.phase === 'success';
          const isWorking  = isActive && (status.phase === 'auth' || status.phase === 'uploading');
          const btnDisabled = disabled && !isActive;

          return (
            <button
              key={key}
              style={{
                ...s.provBtn,
                color,
                borderColor: isSuccess ? '#1E8449' : border,
                background:  isSuccess ? '#EAFAF1' : isWorking ? bg : '#fff',
                opacity:     btnDisabled ? 0.5 : 1,
                cursor:      btnDisabled ? 'not-allowed' : 'pointer',
              }}
              onClick={() => handleCloudSave(key)}
              disabled={btnDisabled}
            >
              {isWorking ? (
                <span style={s.btnContent}>
                  <span style={s.spinner} />
                  {phaseLabel[status.phase]}
                </span>
              ) : isSuccess ? (
                <span style={{ ...s.btnContent, color: '#1E8449' }}>
                  ✓ Salvo no {label}
                </span>
              ) : (
                <span style={s.btnContent}>
                  {icon}
                  <span>{label}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sucesso — link direto para o arquivo */}
      {saveLink && (
        <div style={s.successBox}>
          <span style={s.successText}>
            ✓ Arquivo <strong>{saveLink.fileName}</strong> salvo em{' '}
            <strong>Pronto Profe /</strong>
          </span>
          <a href={saveLink.link} target="_blank" rel="noopener noreferrer" style={s.link}>
            Abrir arquivo ↗
          </a>
          <button style={s.resetBtn} onClick={reset}>Salvar outro</button>
        </div>
      )}

      {/* Erro */}
      {status.phase === 'error' && (
        <div style={s.errorBox}>
          <span>⚠ {errorMsg}</span>
          <button style={s.resetBtn} onClick={reset}>Tentar novamente</button>
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper: {
    marginTop:  12,
    paddingTop: 12,
    borderTop:  '1px dashed #D5D5D5',
  },
  header: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
    flexWrap:   'wrap',
    marginBottom: 10,
  },
  label: {
    fontSize:   12,
    color:      '#888',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  formatGroup: {
    display: 'flex',
    gap:     4,
  },
  fmtBtn: {
    padding:      '3px 10px',
    borderRadius: 6,
    border:       '1.5px solid #CCC',
    background:   '#F5F5F5',
    color:        '#555',
    fontSize:     12,
    fontWeight:   600,
    cursor:       'pointer',
  },
  fmtBtnSel: {
    background:  '#0C447C',
    borderColor: '#0C447C',
    color:       '#fff',
  },
  providerRow: {
    display:  'flex',
    gap:      10,
    flexWrap: 'wrap',
  },
  provBtn: {
    display:      'flex',
    alignItems:   'center',
    padding:      '7px 16px',
    borderRadius: 8,
    border:       '1.5px solid',
    fontSize:     13,
    fontWeight:   600,
    cursor:       'pointer',
    transition:   'all 0.15s',
    minWidth:     140,
    justifyContent: 'center',
  },
  btnContent: {
    display:    'flex',
    alignItems: 'center',
    gap:        7,
  },
  spinner: {
    display:        'inline-block',
    width:          11,
    height:         11,
    borderRadius:   '50%',
    border:         '2px solid rgba(0,0,0,0.15)',
    borderTopColor: 'currentColor',
    animation:      'spin 0.7s linear infinite',
  },
  successBox: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    marginTop:    10,
    padding:      '8px 12px',
    borderRadius: 8,
    background:   '#EAFAF1',
    fontSize:     13,
    flexWrap:     'wrap',
  },
  successText: {
    color: '#1E8449',
    flex:  1,
  },
  errorBox: {
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    marginTop:    10,
    padding:      '8px 12px',
    borderRadius: 8,
    background:   '#FDEAEA',
    fontSize:     13,
    color:        '#A32D2D',
    flexWrap:     'wrap',
  },
  link: {
    color:      '#1a73e8',
    fontSize:   13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  resetBtn: {
    padding:      '3px 10px',
    borderRadius: 6,
    border:       '1px solid #CCC',
    background:   '#fff',
    fontSize:     12,
    cursor:       'pointer',
    color:        '#555',
  },
};
