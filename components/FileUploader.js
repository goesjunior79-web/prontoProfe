import { useState, useRef } from 'react';
import { FILE_ICONS } from '../lib/constants';
import { btnPri, secLabel } from './ui';

export default function FileUploader({ files, pageRanges, onAddFiles, onRemoveFile, onExtractPages, onPageRangeChange, label }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  return (
    <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '1rem', marginBottom: 12 }}>
      <span style={secLabel}>{label || 'Arquivos de material'}</span>
      <input
        ref={fileInputRef}
        type="file" multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={e => onAddFiles(e.target.files)}
      />
      <div
        style={{ border: '1.5px dashed ' + (dragOver ? '#003DA5' : '#D3D1C7'), borderRadius: 10, padding: '1.2rem', textAlign: 'center', background: dragOver ? '#E6F1FB22' : 'transparent' }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); onAddFiles(e.dataTransfer.files); }}
      >
        <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>Arraste arquivos ou clique para selecionar</div>
        <button type="button" style={btnPri} onClick={() => fileInputRef.current?.click()}>Selecionar arquivos</button>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>PDF · Word · Imagem · Texto</div>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {files.map((f, idx) => {
            const ic = FILE_ICONS[f.type] || FILE_ICONS.txt;
            const range = pageRanges[idx] || { from: 1, to: 50 };
            return (
              <div key={idx} style={{ background: '#F7F6F3', border: '0.5px solid #E0DDD5', borderRadius: 9, padding: '9px 11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: ic.bg, color: ic.color }}>{ic.label}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  </div>
                  {f.status === 'ok' && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: '#EAF3DE', color: '#3B6D11' }}>{f.note || '✓ Lido'}</span>}
                  {(f.status === 'reading' || f.status === 'extracting') && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: '#FAEEDA', color: '#633806' }}>{f.status === 'reading' ? 'Lendo...' : 'Lendo páginas...'}</span>}
                  {f.status === 'err' && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: '#FCEBEB', color: '#A32D2D' }}>Erro</span>}
                  <button style={{ width: 24, height: 24, borderRadius: 5, border: '0.5px solid #D3D1C7', background: '#fff', color: '#888', cursor: 'pointer', fontSize: 11 }} onClick={() => onRemoveFile(idx)}>✕</button>
                </div>

                {f.status === 'range' && (
                  <div style={{ marginTop: 9, background: '#FAEEDA', borderRadius: 7, padding: '9px 11px' }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#633806', marginBottom: 7 }}>PDF com {f.totalPages} páginas — escolha quais usar:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#633806' }}>Da</span>
                      <input type="number" min={1} max={f.totalPages} value={range.from} style={{ width: 55, padding: '3px 6px', borderRadius: 5, border: '0.5px solid #BA7517', fontSize: 12 }} onChange={e => onPageRangeChange(idx, { ...range, from: parseInt(e.target.value) || 1 })} />
                      <span style={{ fontSize: 11, color: '#633806' }}>até</span>
                      <input type="number" min={1} max={f.totalPages} value={range.to} style={{ width: 55, padding: '3px 6px', borderRadius: 5, border: '0.5px solid #BA7517', fontSize: 12 }} onChange={e => onPageRangeChange(idx, { ...range, to: parseInt(e.target.value) || f.totalPages })} />
                      <button style={btnPri} onClick={() => onExtractPages(idx)}>Usar estas páginas</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
