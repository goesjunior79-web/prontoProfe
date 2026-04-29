import { useRef } from 'react';
import { btnSec } from './ui';

export default function ModeloUpload({ modelo, modeloLoading, onLoad, onRemove }) {
  const inputRef = useRef(null);

  return (
    <div style={{ background: '#fff', border: '1.5px solid ' + (modelo ? '#3B6D11' : '#E0DDD5'), borderRadius: 12, padding: '1rem', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Usar minha prova anterior como modelo <span style={{ fontSize: 11, fontWeight: 400, color: '#888' }}>(opcional)</span></div>
          <div style={{ fontSize: 11, color: '#aaa' }}>A IA vai seguir o mesmo estilo e formato da prova enviada</div>
        </div>
        {modelo && <button style={{ ...btnSec, color: '#A32D2D', fontSize: 11 }} onClick={onRemove}>Remover</button>}
      </div>
      <input ref={inputRef} type="file" accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt" style={{ display: 'none' }} onChange={e => e.target.files[0] && onLoad(e.target.files[0])} />
      {!modelo
        ? <button type="button" style={{ width: '100%', padding: '9px', border: '1.5px dashed #D3D1C7', borderRadius: 8, background: 'transparent', fontSize: 13, color: '#888', cursor: 'pointer' }} onClick={() => inputRef.current?.click()}>
            {modeloLoading ? 'Lendo...' : 'Selecionar modelo (Word, PDF ou imagem)'}
          </button>
        : <div style={{ background: '#EAF3DE', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#27500A', fontWeight: 500 }}>{modelo.name} ✓</div>
      }
    </div>
  );
}
