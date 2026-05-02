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

  useEffect(() => {
    if (status !== 'authenticated') return;
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/assets/status').then(r => r.json()),
    ]).then(([me, assets]) => {
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
