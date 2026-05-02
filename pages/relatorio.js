/**
 * Tela 7 — Relatório Final de Etapa (NOVA)
 * Story: US-010
 *
 * Form: Aluno + Etapa + Informações livres → relatório 1 página, 3a pessoa,
 * acolhedor, com assinatura "Professora Sheila Goes".
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LoginGate from '../components/LoginGate';
import AssetWarningBanner from '../components/AssetWarningBanner';
import { useDirtyWarning } from '../lib/hooks/useDirtyWarning';

const ETAPAS = ['1ª Etapa', '2ª Etapa', '3ª Etapa', '4ª Etapa'];

export default function RelatorioPage() {
  const { data: session, status } = useSession();
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [alunoNome, setAlunoNome] = useState('');
  const [etapa, setEtapa] = useState(autoDetectEtapa());
  const [informacoes, setInformacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  useDirtyWarning(!!result);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/alunos').then(r => r.json()).then(d => setAlunos(d.alunos || [])).catch(() => {});
  }, [status]);

  if (status === 'loading') return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;

  const canGenerate = (alunoId || alunoNome.trim()) && informacoes.trim();
  const aluno = alunos.find(a => a.id === alunoId);
  const nome = aluno?.nome || alunoNome.trim();
  const profName = readCfg().nomeProfessora || 'Sheila Goes';

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const promptText = `Gere um RELATÓRIO FINAL DE ETAPA no padrão SESI v3.

Aluno: ${nome}
Etapa: ${etapa}
${aluno?.obs_nee ? `NEE: ${aluno.obs_nee}\n` : ''}
Informações fornecidas pela professora:
${informacoes}

Estrutura obrigatória (4 eixos):
1. Desenvolvimento
2. Avanços (sempre mencionar evolução, mesmo pequena)
3. Dificuldades
4. Estratégias

Regras:
- 1 página A4 (limite ~500 palavras)
- Terceira pessoa ("a professora observou…", NÃO "observei…")
- Linguagem acolhedora e profissional para a família
- Final positivo (último parágrafo propositivo)
- Evitar termos: "desinteressado", "lento", "atrasado", julgamentos

Assinatura: Professora ${profName}`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          tipo_de_saida: 'relatorio',
          meta: { tipo: 'relatorio', titulo: `Relatório ${etapa} — ${nome}` },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Erro ao gerar.');
        return;
      }

      setResult({
        text: data.result, custo: data.custo_estimado, passed: data.pipeline_passed,
        warnings: data.warnings, nome, etapa,
      });

      try {
        await fetch('/api/planejamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'relatorio',
            alunoId: alunoId || null,
            conteudoGerado: data.result,
            promptVersao: data.prompt_versao,
            modeloLlm: data.model,
            custoEstimado: data.custo_estimado,
            pipelinePassed: data.pipeline_passed,
            pipelineAttempts: data.pipeline_attempts,
          }),
        });
      } catch {}
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Relatório — ProntoProfe!</title></Head>
      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>📄 Relatório Final de Etapa</h1>
        </header>

        <main style={mainStyle}>
          <AssetWarningBanner tipo="relatorio" />

          <section style={cardStyle}>
            <div style={fieldRow}>
              <Field label="Aluno">
                {alunos.length > 0 ? (
                  <select value={alunoId} onChange={e => { setAlunoId(e.target.value); setAlunoNome(''); }} style={inp}>
                    <option value="">— Selecionar —</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.turma})</option>)}
                  </select>
                ) : (
                  <input type="text" value={alunoNome} onChange={e => setAlunoNome(e.target.value)} style={inp}
                    placeholder="Nome do aluno" />
                )}
              </Field>
              <Field label="Etapa">
                <select value={etapa} onChange={e => setEtapa(e.target.value)} style={inp}>
                  {ETAPAS.map(e => <option key={e}>{e}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Informações da etapa">
              <textarea value={informacoes} onChange={e => setInformacoes(e.target.value)}
                style={{ ...inp, minHeight: 140, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Resuma o que foi observado durante a etapa: avanços, dificuldades específicas, estratégias usadas, momentos marcantes…" />
            </Field>

            <button onClick={handleGenerate} disabled={loading || !canGenerate}
              style={{ ...btnPri, marginTop: 12, opacity: (loading || !canGenerate) ? 0.5 : 1 }}>
              {loading ? '⏳ Gerando relatório...' : '🚀 Gerar relatório'}
            </button>
            {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
          </section>

          {result && (
            <section style={cardStyle}>
              <div style={resultHeader}>
                <strong>Relatório — {result.nome} ({result.etapa})</strong>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {result.passed ? '✅' : '⚠'} · US$ {result.custo?.toFixed(4) || '0'}
                </span>
              </div>
              {result.warnings?.length > 0 && (
                <div style={warningStyle}>
                  Avisos: {result.warnings.map((w, i) => <span key={i}>{w.message || JSON.stringify(w)}; </span>)}
                </div>
              )}
              <pre style={preStyle}>{result.text}</pre>
              <div style={actionsStyle}>
                <button onClick={() => navigator.clipboard?.writeText(result.text)} style={btnSec}>
                  📋 Copiar
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</div>{children}</div>;
}

function autoDetectEtapa() {
  const m = new Date().getMonth() + 1; // 1-12
  if (m <= 3) return '1ª Etapa';
  if (m <= 6) return '2ª Etapa';
  if (m <= 9) return '3ª Etapa';
  return '4ª Etapa';
}

function readCfg() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('sesi_cfg') || '{}'); } catch { return {}; }
}

const pageStyle = { minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: '#fff', borderBottom: '0.5px solid #E0DDD5' };
const backLinkStyle = { color: '#003DA5', textDecoration: 'none', fontSize: 13 };
const titleStyle = { flex: 1, fontSize: 17, fontWeight: 700, color: '#1a1a18', margin: 0 };
const mainStyle = { maxWidth: 800, margin: '0 auto', padding: 16 };
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: 16, marginBottom: 12 };
const fieldRow = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnSec = { padding: '8px 14px', background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, fontSize: 13, cursor: 'pointer' };
const errorStyle = { background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginTop: 10 };
const warningStyle = { background: '#FEF3C7', border: '0.5px solid #FCD34D', color: '#92400E', padding: '8px 12px', borderRadius: 7, fontSize: 12, marginBottom: 10 };
const resultHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '0.5px solid #E0DDD5' };
const preStyle = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#FAFAF8', padding: 14, borderRadius: 7, border: '0.5px solid #E0DDD5', maxHeight: 600, overflow: 'auto' };
const actionsStyle = { display: 'flex', gap: 10, marginTop: 12 };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
