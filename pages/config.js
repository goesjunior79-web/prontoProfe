/**
 * Tela 9 — Configurações (US-013)
 *
 * Perfil + horário fixo + modo cores + LGPD (exportar / excluir conta) +
 * upload assets institucionais.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LoginGate from '../components/LoginGate';
import { ASSET_DEFINITIONS } from '../lib/assets/definitions';

export default function ConfigPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ nome: '', cidade: '', escola: '' });
  const [prefs, setPrefs] = useState({ horarioSemanal: '', modoCores: 'padrao' });
  const [assetStatus, setAssetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [uploadingKey, setUploadingKey] = useState(null);
  const [modelos, setModelos] = useState([]);
  const [uploadingModelo, setUploadingModelo] = useState(false);
  const [modeloProgress, setModeloProgress] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated') return;
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/assets/status').then(r => r.json()),
      fetch('/api/modelos').then(r => r.json()).catch(() => ({ modelos: [] })),
    ]).then(([me, assets, mod]) => {
      if (me?.user) {
        setUser(me.user);
        setProfile({
          nome: me.user.nome || '',
          cidade: me.user.cidade || '',
          escola: me.user.escola || '',
        });
        setPrefs({
          horarioSemanal: me.user.preferencias?.horarioSemanal || '',
          modoCores: me.user.preferencias?.modoCores || 'padrao',
        });
      }
      setAssetStatus(assets);
      setModelos(mod?.modelos || []);
      setLoading(false);
    }).catch(e => {
      setErr(e.message);
      setLoading(false);
    });
  }, [status]);

  if (status === 'loading' || loading) return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;

  const handleSave = async () => {
    setSaving(true); setMsg(''); setErr('');
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, preferencias: prefs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar');

      // Sincroniza modo cores com localStorage
      if (typeof window !== 'undefined') {
        const cfg = JSON.parse(localStorage.getItem('sesi_cfg') || '{}');
        cfg.modoCores = prefs.modoCores;
        localStorage.setItem('sesi_cfg', JSON.stringify(cfg));
      }
      setMsg('✓ Configurações salvas');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    window.open('/api/me/export', '_blank');
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm('ATENÇÃO: Isso vai excluir TODOS os seus dados (alunos, planejamentos, avaliações). Não tem volta. Continuar?');
    if (!ok) return;
    const phrase = window.prompt('Digite EXCLUIR para confirmar:');
    if (phrase !== 'EXCLUIR') return;

    try {
      const res = await fetch('/api/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'EXCLUIR_MINHA_CONTA' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro');
      alert('Conta excluída. Você será deslogado.');
      signOut({ callbackUrl: '/' });
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleUpload = async (assetKey, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErr('Arquivo maior que 10 MB');
      return;
    }
    setUploadingKey(assetKey); setMsg(''); setErr('');
    try {
      const dataBase64 = await fileToBase64(file);
      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetKey,
          filename: file.name,
          mime: file.type || 'application/octet-stream',
          dataBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro upload');
      setMsg(`✓ ${ASSET_DEFINITIONS[assetKey].name} enviado`);
      // Refresh status
      const assets = await fetch('/api/assets/status').then(r => r.json());
      setAssetStatus(assets);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploadingKey(null);
    }
  };

  // ── Modelos persistentes (PDF/Word/Imagem grande via signed URL) ─────────
  const handleUploadModelo = async (file, descricao = '') => {
    if (!file) return;
    const MAX_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setErr(`Arquivo de ${(file.size / 1_000_000).toFixed(1)} MB excede limite de 50 MB.`);
      return;
    }
    setUploadingModelo(true); setMsg(''); setErr(''); setModeloProgress(0);
    try {
      // 1. Pede signed URL ao backend
      const sign = await fetch('/api/modelos/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mime: file.type, sizeBytes: file.size }),
      }).then(r => r.json());
      if (!sign.uploadUrl) throw new Error(sign.message || 'Não foi possível gerar URL de upload');

      // 2. PUT direto pro Supabase Storage (bypassa Vercel)
      const putRes = await fetch(sign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Falha no upload (status ${putRes.status})`);

      // 3. Registra metadata
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const tipo = ext === 'pdf' ? 'pdf' : ['doc','docx'].includes(ext) ? 'docx' : 'imagem';
      const reg = await fetch('/api/modelos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: file.name,
          descricao,
          tipo,
          storagePath: sign.path,
          sizeBytes: file.size,
          isDefault: modelos.length === 0, // primeiro modelo vira default
        }),
      }).then(r => r.json());
      if (!reg.modelo) throw new Error(reg.message || 'Falha ao registrar modelo');

      setModelos(prev => [reg.modelo, ...prev.map(m => ({ ...m, is_default: reg.modelo.is_default ? false : m.is_default }))]);
      setMsg(`✓ Modelo "${file.name}" salvo${reg.modelo.is_default ? ' como padrão' : ''}.`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploadingModelo(false); setModeloProgress(0);
    }
  };

  const handleSetDefault = async (modeloId) => {
    try {
      const r = await fetch(`/api/modelos/${modeloId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      }).then(r => r.json());
      if (!r.modelo) throw new Error(r.message || 'Erro');
      setModelos(prev => prev.map(m => ({ ...m, is_default: m.id === modeloId })));
    } catch (e) { setErr(e.message); }
  };

  const handleSetTipos = async (modeloId, tiposAplicaveis) => {
    try {
      const r = await fetch(`/api/modelos/${modeloId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiposAplicaveis }),
      }).then(r => r.json());
      if (!r.modelo) throw new Error(r.message || 'Erro');
      setModelos(prev => prev.map(m => m.id === modeloId ? { ...m, tipos_aplicaveis: r.modelo.tipos_aplicaveis } : m));
    } catch (e) { setErr(e.message); }
  };

  const handleDeleteModelo = async (modeloId, nome) => {
    if (!window.confirm(`Excluir modelo "${nome}"? Não tem volta.`)) return;
    try {
      const r = await fetch(`/api/modelos/${modeloId}`, { method: 'DELETE' });
      if (!r.ok && r.status !== 204) throw new Error('Erro ao excluir');
      setModelos(prev => prev.filter(m => m.id !== modeloId));
      setMsg('✓ Modelo excluído');
    } catch (e) { setErr(e.message); }
  };

  return (
    <>
      <Head><title>Configurações — ProntoProfe!</title></Head>
      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>⚙️ Configurações</h1>
        </header>

        <main style={mainStyle}>
          {msg && <div style={okStyle}>{msg}</div>}
          {err && <div style={errStyle}>{err}</div>}

          {/* Perfil */}
          <section style={cardStyle}>
            <h2 style={sectionTitle}>Perfil</h2>
            <Field label="Nome">
              <input style={inp} value={profile.nome} onChange={e => setProfile({...profile, nome: e.target.value})} />
            </Field>
            <Field label="Cidade / Unidade">
              <input style={inp} value={profile.cidade} onChange={e => setProfile({...profile, cidade: e.target.value})} placeholder="Ex: BOTUCATU" />
            </Field>
            <Field label="Escola (código)">
              <input style={inp} value={profile.escola} onChange={e => setProfile({...profile, escola: e.target.value})} placeholder="Ex: CE-228" />
            </Field>
          </section>

          {/* Modelos persistentes */}
          <section style={cardStyle}>
            <h2 style={sectionTitle}>📑 Meus modelos de referência</h2>
            <p style={helpText}>
              Suba PDFs ou Word de atividades/provas que servem de modelo. A IA usa
              o modelo <b>padrão</b> automaticamente em todas as gerações para imitar
              seu estilo. Limite por arquivo: 50 MB.
            </p>

            <label style={{...btnSec, display: 'inline-block', marginBottom: 10}}>
              {uploadingModelo ? '⏳ Enviando…' : '📎 Adicionar modelo (PDF, Word ou Imagem)'}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                style={{display: 'none'}}
                disabled={uploadingModelo}
                onChange={e => handleUploadModelo(e.target.files?.[0])}
              />
            </label>

            {modelos.length === 0 ? (
              <div style={{fontSize: 12, color: '#888', padding: '8px 0'}}>
                Nenhum modelo salvo ainda.
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {modelos.map(m => (
                  <ModeloCard
                    key={m.id}
                    modelo={m}
                    onSetDefault={() => handleSetDefault(m.id)}
                    onSetTipos={tipos => handleSetTipos(m.id, tipos)}
                    onDelete={() => handleDeleteModelo(m.id, m.nome)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Preferências pedagógicas */}
          <section style={cardStyle}>
            <h2 style={sectionTitle}>Preferências pedagógicas</h2>
            <Field label="Horário fixo da turma" hint='Ex: "seg 2, ter 2, qua 1, qui 2, sex 1" — nº de aulas por dia'>
              <input style={inp} value={prefs.horarioSemanal} onChange={e => setPrefs({...prefs, horarioSemanal: e.target.value})} placeholder="seg 2, ter 2, qua 1, qui 2, sex 1" />
            </Field>
            <Field label="Modo de cores N1-N4">
              <select style={inp} value={prefs.modoCores} onChange={e => setPrefs({...prefs, modoCores: e.target.value})}>
                <option value="padrao">Padrão (azul/verde/amarelo/vermelho)</option>
                <option value="semaforo">Semáforo (vermelho/amarelo/verde-claro/verde-escuro)</option>
              </select>
            </Field>
          </section>

          <button onClick={handleSave} disabled={saving} style={{...btnPri, opacity: saving ? 0.5 : 1, marginBottom: 14}}>
            {saving ? 'Salvando…' : '💾 Salvar configurações'}
          </button>

          {/* Assets institucionais */}
          <section style={cardStyle}>
            <h2 style={sectionTitle}>Documentos institucionais</h2>
            <p style={helpText}>
              Envie aqui os modelos oficiais do SESI (logo, brasão, template de prova, descritores).
              Sem isso, o app entra em modo conservador (gera com fallback genérico).
            </p>
            {Object.entries(ASSET_DEFINITIONS).map(([key, def]) => {
              const isAvailable = assetStatus?.availableItems?.some(i => i.asset === key);
              return (
                <div key={key} style={{...assetRowStyle, borderColor: isAvailable ? '#3B6D11' : '#E0DDD5'}}>
                  <div>
                    <div style={{fontSize: 13, fontWeight: 600}}>{def.name}</div>
                    <div style={{fontSize: 11, color: '#888', marginTop: 2}}>
                      Severidade: <b>{def.severity}</b> · Afeta: {def.affects.join(', ')}
                    </div>
                    {!isAvailable && <div style={{fontSize: 11, color: '#A32D2D', marginTop: 3}}>Fallback: {def.fallback}</div>}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    {isAvailable && <span style={{fontSize: 12, color: '#3B6D11', fontWeight: 600}}>✓ Disponível</span>}
                    <label style={btnSec}>
                      {uploadingKey === key ? '⏳' : '📎 Enviar'}
                      <input type="file" style={{display: 'none'}} onChange={e => handleUpload(key, e.target.files?.[0])} />
                    </label>
                  </div>
                </div>
              );
            })}
          </section>

          {/* LGPD */}
          <section style={{...cardStyle, borderColor: '#FCD34D'}}>
            <h2 style={sectionTitle}>🔒 Direitos LGPD</h2>
            <p style={helpText}>
              Você pode exportar todos os seus dados ou excluir sua conta a qualquer momento.
              <br/>Audit log (acessos_dados) é preservado por exigência legal.
            </p>
            <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
              <button onClick={handleExport} style={btnSec}>📥 Exportar meus dados (JSON)</button>
              <button onClick={handleDeleteAccount} style={btnDanger}>🗑️ Excluir minha conta</button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

const TIPOS_MODELO = [
  { value: 'atividade',          label: 'Atividade complementar' },
  { value: 'avaliacao_capitulo', label: 'Avaliação por capítulo' },
  { value: 'simulado',           label: 'Simulado' },
  { value: 'PTD',                label: 'PTD / Plano de aula' },
  { value: 'aula',               label: 'Aula diária' },
  { value: 'observacao',         label: 'Observação de aluno' },
  { value: 'relatorio',          label: 'Relatório de etapa' },
  { value: 'prova',              label: 'Prova (geral)' },
];

function ModeloCard({ modelo, onSetDefault, onSetTipos, onDelete }) {
  const [editing, setEditing] = useState(false);
  const tiposAtuais = Array.isArray(modelo.tipos_aplicaveis) ? modelo.tipos_aplicaveis : [];

  const toggle = (val) => {
    const next = tiposAtuais.includes(val)
      ? tiposAtuais.filter(t => t !== val)
      : [...tiposAtuais, val];
    onSetTipos(next);
  };

  const tiposLabel = tiposAtuais.length === 0
    ? 'Aplica em todas as gerações'
    : tiposAtuais.map(t => TIPOS_MODELO.find(x => x.value === t)?.label || t).join(', ');

  return (
    <div style={{
      padding: '10px 12px',
      border: modelo.is_default ? '1.5px solid #003DA5' : '1px solid #E0DDD5',
      borderRadius: 8,
      background: modelo.is_default ? '#F0F4FA' : '#fff',
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10}}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {modelo.is_default && <span style={{color:'#003DA5', marginRight: 6}}>★</span>}
            {modelo.nome}
          </div>
          <div style={{fontSize: 10, color: '#888', marginTop: 2}}>
            {modelo.tipo.toUpperCase()} · {(modelo.size_bytes / 1_000_000).toFixed(2)} MB ·
            {' '}{new Date(modelo.created_at).toLocaleDateString('pt-BR')}
          </div>
          <div style={{fontSize: 11, color: '#003DA5', marginTop: 4, fontWeight: 500}}>
            📌 {tiposLabel}
          </div>
        </div>
        <div style={{display: 'flex', gap: 6, flexShrink: 0}}>
          <button onClick={() => setEditing(v => !v)} style={{padding: '4px 8px', fontSize: 11, background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, cursor: 'pointer'}}>
            {editing ? 'Fechar' : 'Aplicar em…'}
          </button>
          {!modelo.is_default && (
            <button onClick={onSetDefault} style={{padding: '4px 8px', fontSize: 11, background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, cursor: 'pointer'}}>
              Marcar padrão
            </button>
          )}
          <button onClick={onDelete} style={{padding: '4px 8px', fontSize: 11, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 7, cursor: 'pointer'}}>
            Excluir
          </button>
        </div>
      </div>

      {editing && (
        <div style={{marginTop: 10, padding: '10px 12px', background: '#fff', border: '1px dashed #D3D1C7', borderRadius: 7}}>
          <div style={{fontSize: 11, color: '#555', marginBottom: 8, fontWeight: 600}}>
            Anexar este modelo automaticamente quando gerar:
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            {TIPOS_MODELO.map(t => {
              const ativo = tiposAtuais.includes(t.value);
              return (
                <label key={t.value} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', fontSize: 11.5, cursor: 'pointer',
                  border: ativo ? '1.5px solid #003DA5' : '1px solid #D3D1C7',
                  borderRadius: 16, background: ativo ? '#E8EFFC' : '#fff', color: ativo ? '#003DA5' : '#555',
                  fontWeight: ativo ? 600 : 400,
                }}>
                  <input type="checkbox" checked={ativo} onChange={() => toggle(t.value)} style={{margin: 0}} />
                  {t.label}
                </label>
              );
            })}
          </div>
          <div style={{fontSize: 10, color: '#888', marginTop: 8}}>
            Sem nada marcado: o modelo aplica em <b>todas</b> as gerações (modelo global).
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{marginBottom: 11}}>
      <label style={{display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4}}>{label}</label>
      {children}
      {hint && <div style={{fontSize: 10, color: '#888', marginTop: 3}}>{hint}</div>}
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const idx = typeof result === 'string' ? result.indexOf(',') : -1;
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const pageStyle = { minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: '#fff', borderBottom: '0.5px solid #E0DDD5' };
const backLinkStyle = { color: '#003DA5', textDecoration: 'none', fontSize: 13 };
const titleStyle = { flex: 1, fontSize: 17, fontWeight: 700, color: '#1a1a18', margin: 0 };
const mainStyle = { maxWidth: 760, margin: '0 auto', padding: 16 };
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: 16, marginBottom: 12 };
const sectionTitle = { fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#1a1a18' };
const helpText = { fontSize: 12, color: '#666', lineHeight: 1.5, marginTop: 0, marginBottom: 12 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnSec = { padding: '8px 14px', background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, fontSize: 12, cursor: 'pointer', display: 'inline-block' };
const btnDanger = { padding: '8px 14px', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 7, fontSize: 12, cursor: 'pointer' };
const assetRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #E0DDD5', borderRadius: 8, marginBottom: 8 };
const okStyle = { background: '#EAF3DE', border: '1px solid #B5D798', color: '#27500A', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginBottom: 12 };
const errStyle = { background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginBottom: 12 };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
