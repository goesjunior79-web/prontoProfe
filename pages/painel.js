/**
 * Tela 8 — Painel N1-N4 (NOVA)
 * Stories: US-011a (UI) + US-011b (engine JSON)
 *
 * Tabela de alunos × nível × observação × intervenção.
 * Cores: padrão (azul/verde/amarelo/vermelho) ou "semáforo".
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DISCIPLINAS } from '../lib/constants';
import LoginGate from '../components/LoginGate';

const TURMAS = ['A', 'B', 'C', 'D', 'E'];

const CORES_PADRAO = {
  N1: '#0C447C', // azul
  N2: '#3B6D11', // verde
  N3: '#BA7517', // amarelo escuro
  N4: '#A32D2D', // vermelho
};

const CORES_SEMAFORO = {
  N1: '#A32D2D', // vermelho
  N2: '#BA7517', // amarelo escuro
  N3: '#5A9E25', // verde claro
  N4: '#3B6D11', // verde escuro
};

const ROTULOS_PAINEL = {
  N1: 'não realiza com autonomia',
  N2: 'com mediação',
  N3: 'com autonomia',
  N4: 'autônomo + estratégia',
};

export default function PainelPage() {
  const { data: session, status } = useSession();
  const [turma, setTurma] = useState('A');
  const [componente, setComponente] = useState('Língua Portuguesa');
  const [tabela, setTabela] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [modoCores, setModoCores] = useState('padrao');
  const [meta, setMeta] = useState(null); // { custo, savedCount, total }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cfg = JSON.parse(localStorage.getItem('sesi_cfg') || '{}');
      if (cfg.modoCores) setModoCores(cfg.modoCores);
    }
  }, []);

  if (status === 'loading') return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;

  const cores = modoCores === 'semaforo' ? CORES_SEMAFORO : CORES_PADRAO;

  const handleClassificar = async () => {
    setLoading(true);
    setErrorMsg('');
    setTabela([]);
    setMeta(null);
    try {
      const res = await fetch('/api/painel/classificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turma, componente }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Erro ao classificar.');
        return;
      }
      setTabela(data.tabela || []);
      setMeta({ custo: data.custo, savedCount: data.savedCount, total: data.total });
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleModoCores = () => {
    const novo = modoCores === 'padrao' ? 'semaforo' : 'padrao';
    setModoCores(novo);
    if (typeof window !== 'undefined') {
      const cfg = JSON.parse(localStorage.getItem('sesi_cfg') || '{}');
      cfg.modoCores = novo;
      localStorage.setItem('sesi_cfg', JSON.stringify(cfg));
    }
  };

  return (
    <>
      <Head><title>Painel N1-N4 — ProntoProfe!</title></Head>
      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>📊 Painel N1-N4</h1>
          <button onClick={toggleModoCores} style={btnSec}>
            🎨 {modoCores === 'padrao' ? 'Padrão' : 'Semáforo'}
          </button>
        </header>

        <main style={mainStyle}>
          <section style={cardStyle}>
            <div style={fieldRow}>
              <Field label="Turma">
                <select value={turma} onChange={e => setTurma(e.target.value)} style={inp}>
                  {TURMAS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Componente">
                <select value={componente} onChange={e => setComponente(e.target.value)} style={inp}>
                  {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={handleClassificar} disabled={loading} style={{ ...btnPri, opacity: loading ? 0.5 : 1 }}>
                  {loading ? '⏳ Classificando...' : '🔄 Atualizar painel'}
                </button>
              </div>
            </div>
            {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
            {meta && (
              <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                ✓ {meta.total} alunos classificados · {meta.savedCount} salvos no histórico ·
                US$ {meta.custo?.toFixed(4) || '0'}
              </div>
            )}
          </section>

          {tabela.length > 0 ? (
            <section style={cardStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={thRowStyle}>
                    <th style={thStyle}>Aluno</th>
                    <th style={thStyle}>Nível</th>
                    <th style={thStyle}>Observação</th>
                    <th style={thStyle}>Intervenção</th>
                  </tr>
                </thead>
                <tbody>
                  {tabela.map((row, i) => (
                    <tr key={i} style={trStyle}>
                      <td style={tdStyle}><b>{row.nome}</b></td>
                      <td style={tdStyle}>
                        <span style={{
                          background: cores[row.nivel],
                          color: '#fff',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          {row.nivel}
                        </span>
                        <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>
                          {ROTULOS_PAINEL[row.nivel]}
                        </div>
                      </td>
                      <td style={tdStyle}>{row.observacao}</td>
                      <td style={tdStyle}><i>{row.intervencao}</i></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : !loading && (
            <section style={cardStyle}>
              <div style={emptyStyle}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                Nenhum aluno classificado ainda.<br />
                Clique em <b>Atualizar painel</b> para gerar classificação automática.
              </div>
            </section>
          )}

          <div style={{ fontSize: 11, color: '#888', textAlign: 'center', padding: 12 }}>
            Catálogo de intervenções:<br />
            N1 — Atendimento individual + material concreto<br />
            N2 — Mediação dirigida + leitura guiada<br />
            N3 — Consolidação com prática<br />
            N4 — Desafio / atividade avançada
          </div>
        </main>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return <div><div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</div>{children}</div>;
}

const pageStyle = { minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: '#fff', borderBottom: '0.5px solid #E0DDD5' };
const backLinkStyle = { color: '#003DA5', textDecoration: 'none', fontSize: 13 };
const titleStyle = { flex: 1, fontSize: 17, fontWeight: 700, color: '#1a1a18', margin: 0 };
const mainStyle = { maxWidth: 1100, margin: '0 auto', padding: 16 };
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: 16, marginBottom: 12 };
const fieldRow = { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'flex-end' };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' };
const btnSec = { padding: '6px 12px', background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, fontSize: 12, cursor: 'pointer' };
const errorStyle = { background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginTop: 10 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const thRowStyle = { background: '#F7F6F3' };
const thStyle = { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #E0DDD5', fontSize: 12, fontWeight: 600, color: '#555' };
const trStyle = { borderBottom: '0.5px solid #F0EDE6' };
const tdStyle = { padding: '12px', verticalAlign: 'top', fontSize: 12, lineHeight: 1.5 };
const emptyStyle = { textAlign: 'center', padding: 30, color: '#888', fontSize: 13 };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
