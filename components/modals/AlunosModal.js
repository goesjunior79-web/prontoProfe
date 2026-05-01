import { useState, useEffect, useRef } from 'react';
import { DISCIPLINAS, SERIES } from '../../lib/constants';

const TURMAS = ['A', 'B', 'C', 'D', 'E'];

const inp = {
  width: '100%', padding: '7px 10px', borderRadius: 7,
  border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

const sel = { ...inp };

function initAluno() {
  return { nome: '', turma: 'A', serie: '', disciplina: '', obs: '', consentido: false };
}

export default function AlunosModal({ onClose }) {
  const [alunos, setAlunos] = useState([]);
  const [form, setForm]     = useState(initAluno());
  const [busca, setBusca]   = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [tab, setTab]       = useState('lista');
  const [confirmarRemover, setConfirmarRemover] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sesi_alunos');
      if (saved) setAlunos(JSON.parse(saved));
    } catch {}
  }, []);

  const save = lista => {
    setAlunos(lista);
    localStorage.setItem('sesi_alunos', JSON.stringify(lista));
  };

  const addOrEdit = () => {
    if (!form.nome.trim()) return;
    // LGPD: novo cadastro exige consentimento explícito (US-012).
    // Edições não exigem (consent já dado anteriormente).
    if (editIdx === null && !form.consentido) {
      alert('Confirme que tem autorização dos pais/responsáveis (LGPD).');
      return;
    }
    let nova;
    if (editIdx !== null) {
      nova = alunos.map((a, i) => i === editIdx ? { ...form } : a);
      setEditIdx(null);
    } else {
      nova = [...alunos, { ...form, consent_at: new Date().toISOString() }];
    }
    save(nova);
    setForm(initAluno());
    setTab('lista');
  };

  const startEdit = idx => {
    setForm({ ...alunos[idx] });
    setEditIdx(idx);
    setTab('form');
  };

  const remove = idx => {
    save(alunos.filter((_, i) => i !== idx));
    setConfirmarRemover(null);
  };

  const cancelEdit = () => {
    setForm(initAluno());
    setEditIdx(null);
    setTab('lista');
  };

  const exportCSV = () => {
    const header = ['Nome', 'Turma', 'Série', 'Disciplina', 'Observação'];
    const rows   = alunos.map(a => [a.nome, a.turma, a.serie, a.disciplina, a.obs]);
    const csv    = [header, ...rows].map(r => r.map(v => `"${(v||'').replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob   = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url    = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Alunos_ProntoProfe.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const filtrados = busca.trim()
    ? alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()) || a.turma.includes(busca) || a.serie.toLowerCase().includes(busca.toLowerCase()))
    : alunos;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #E0DDD5', gap: 10 }}>
          <span style={{ fontSize: 20 }}>👥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Cadastro de Alunos</div>
            <div style={{ fontSize: 11, color: '#888' }}>{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}</div>
          </div>
          {alunos.length > 0 && (
            <button onClick={exportCSV} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid #D3D1C7', borderRadius: 6, background: '#F7F6F3', cursor: 'pointer', color: '#555' }}>
              📥 Baixar lista
            </button>
          )}
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '0.5px solid #D3D1C7', background: '#F7F6F3', cursor: 'pointer', fontSize: 14, color: '#555' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E0DDD5' }}>
          {[['lista', '📋 Lista'], ['form', editIdx !== null ? '✏️ Editar' : '➕ Novo aluno']].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); if (k === 'lista') cancelEdit(); }}
              style={{ flex: 1, padding: '9px 0', border: 'none', background: tab === k ? '#F7F6F3' : '#fff', borderBottom: tab === k ? '2px solid #003DA5' : '2px solid transparent', fontWeight: tab === k ? 700 : 400, fontSize: 13, color: tab === k ? '#003DA5' : '#666', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>

          {/* Lista */}
          {tab === 'lista' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alunos.length > 3 && (
                <input
                  placeholder="Buscar aluno, turma ou série..."
                  value={busca} onChange={e => setBusca(e.target.value)}
                  style={{ ...inp, marginBottom: 4 }}
                />
              )}

              {filtrados.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa', fontSize: 13 }}>
                  {alunos.length === 0 ? (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>👤</div>
                      <div>Nenhum aluno cadastrado.</div>
                      <div style={{ marginTop: 6, fontSize: 12 }}>Clique em <b>Novo aluno</b> para adicionar.</div>
                    </>
                  ) : 'Nenhum resultado para essa busca.'}
                </div>
              )}

              {filtrados.map((a, i) => {
                const realIdx = alunos.indexOf(a);
                return (
                  <div key={i} style={{ background: '#F7F6F3', border: '0.5px solid #E0DDD5', borderRadius: 9, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8EFFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {a.nome.trim().charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {[a.serie, a.turma && 'Turma ' + a.turma, a.disciplina].filter(Boolean).join(' · ')}
                      </div>
                      {a.obs && <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>{a.obs}</div>}
                    </div>
                    <button onClick={() => startEdit(realIdx)} style={{ padding: '3px 8px', borderRadius: 5, border: '0.5px solid #D3D1C7', background: '#fff', cursor: 'pointer', fontSize: 11, color: '#555' }}>Editar</button>
                    {confirmarRemover === realIdx
                      ? <>
                          <button onClick={() => remove(realIdx)} style={{ padding: '3px 8px', borderRadius: 5, border: '0.5px solid #E8AAAA', background: '#FFF0F0', cursor: 'pointer', fontSize: 11, color: '#A32D2D', fontWeight: 600 }}>Sim</button>
                          <button onClick={() => setConfirmarRemover(null)} style={{ padding: '3px 8px', borderRadius: 5, border: '0.5px solid #D3D1C7', background: '#fff', cursor: 'pointer', fontSize: 11, color: '#555' }}>Não</button>
                        </>
                      : <button onClick={() => setConfirmarRemover(realIdx)} style={{ padding: '3px 8px', borderRadius: 5, border: '0.5px solid #E8AAAA', background: '#FFF0F0', cursor: 'pointer', fontSize: 11, color: '#A32D2D' }}>✕</button>
                    }
                  </div>
                );
              })}

              <button
                onClick={() => setTab('form')}
                style={{ marginTop: 8, padding: '9px 0', border: '1.5px dashed #D3D1C7', borderRadius: 9, background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                + Adicionar aluno
              </button>
            </div>
          )}

          {/* Formulário */}
          {tab === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Nome completo *</div>
                <input style={inp} placeholder="Ex: Ana Paula Souza" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} autoFocus />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Turma</div>
                  <select style={sel} value={form.turma} onChange={e => setForm(f => ({ ...f, turma: e.target.value }))}>
                    {TURMAS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Série</div>
                  <select style={sel} value={form.serie} onChange={e => setForm(f => ({ ...f, serie: e.target.value }))}>
                    <option value="">Selecionar</option>
                    {SERIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Disciplina</div>
                <select style={sel} value={form.disciplina} onChange={e => setForm(f => ({ ...f, disciplina: e.target.value }))}>
                  <option value="">Selecionar</option>
                  {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Necessidade educacional especial (opcional)</div>
                <input style={inp} placeholder="Ex: TDAH, dislexia, deficiência visual, aluno laudado..." value={form.obs} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))} />
              </div>

              {/* Checkbox de consentimento LGPD — obrigatório em novos cadastros (US-012) */}
              {editIdx === null && (
                <div style={{ background: '#FEF3C7', border: '0.5px solid #FCD34D', borderRadius: 7, padding: '9px 11px', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 12, color: '#78350F' }}>
                    <input
                      type="checkbox"
                      checked={!!form.consentido}
                      onChange={e => setForm(f => ({ ...f, consentido: e.target.checked }))}
                      style={{ marginTop: 2, accentColor: '#92400E' }}
                    />
                    <span>
                      <b>Confirmo que tenho autorização dos pais/responsáveis</b> para
                      registrar dados pedagógicos deste aluno (incluindo eventuais
                      observações sobre necessidades educacionais especiais), conforme a
                      <b> LGPD (Lei 13.709/2018)</b>. Os dados ficam acessíveis apenas a mim.
                    </span>
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={cancelEdit} style={{ flex: 1, padding: 9, borderRadius: 8, border: '0.5px solid #D3D1C7', background: '#F7F6F3', fontSize: 13, cursor: 'pointer', color: '#555' }}>
                  Cancelar
                </button>
                <button
                  onClick={addOrEdit}
                  disabled={!form.nome.trim() || (editIdx === null && !form.consentido)}
                  style={{ flex: 2, padding: 9, borderRadius: 8, border: 'none', background: (form.nome.trim() && (editIdx !== null || form.consentido)) ? '#003DA5' : '#B4B2A9', color: '#fff', fontSize: 13, fontWeight: 600, cursor: (form.nome.trim() && (editIdx !== null || form.consentido)) ? 'pointer' : 'default' }}>
                  {editIdx !== null ? 'Salvar alterações' : 'Cadastrar aluno'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
