/**
 * Sub-tela dinâmica de Avaliação — renderiza form correto conforme subtipo.
 *
 * Stories: US-007a (capitulo) / US-007b (simulado) / US-007c (rubrica) /
 *          US-007d (pauta-observacao) / US-007e (plenaria) / US-007f (pauta-leitura)
 *
 * URL: /avaliacao/{slug}
 */

import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { DISCIPLINAS, SERIES } from '../../lib/constants';
import LoginGate from '../../components/LoginGate';
import AssetWarningBanner from '../../components/AssetWarningBanner';
import { getSubtipo } from '../../lib/avaliacao/subtipos';

export default function AvaliacaoSubtipo() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const subtipo = useMemo(() => getSubtipo(router.query.subtipo), [router.query.subtipo]);

  const [ano, setAno] = useState('3º ano EF I');
  const [componente, setComponente] = useState('Língua Portuguesa');
  const [capitulo, setCapitulo] = useState('');
  const [alunos, setAlunos] = useState(''); // só para pauta-observacao e pauta-leitura

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  if (status === 'loading') return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;
  if (!router.isReady) return <div style={loadingStyle}>Carregando…</div>;
  if (!subtipo) {
    return (
      <div style={loadingStyle}>
        Subtipo não encontrado.
        <Link href="/avaliacao" style={{ marginLeft: 12, color: '#003DA5' }}>← Voltar</Link>
      </div>
    );
  }

  const showAlunosField = ['pauta-observacao', 'pauta-leitura'].includes(subtipo.slug);
  const canGenerate = ano && componente && capitulo.trim();

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const promptText = subtipo.buildPrompt({ ano, componente, capitulo, alunos });
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          tipo_de_saida: subtipo.tipo,
          meta: {
            tipo: 'avaliacao',
            titulo: `${subtipo.title} ${componente} ${ano} — ${capitulo}`,
            disciplina: componente,
            serie: ano,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Erro ao gerar.');
        return;
      }

      setResult({
        text: data.result,
        passed: data.pipeline_passed,
        custo: data.custo_estimado,
        warnings: data.warnings,
      });

      // Salva planejamento
      try {
        await fetch('/api/planejamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: subtipo.tipo,
            ano, componente, capitulo,
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
      setErrorMsg(e.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{subtipo.title} — ProntoProfe!</title>
      </Head>

      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/avaliacao" style={backLinkStyle}>← Avaliação</Link>
          <h1 style={titleStyle}>{subtipo.icon} {subtipo.title}</h1>
        </header>

        <main style={mainStyle}>
          <AssetWarningBanner tipo={subtipo.tipo} />

          <div style={lead}>{subtipo.descricao}</div>

          <section style={cardStyle}>
            <div style={fieldRow}>
              <Field label="Ano">
                <select value={ano} onChange={e => setAno(e.target.value)} style={inp}>
                  {SERIES.filter(s => s.includes('EF I')).map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Componente">
                <select value={componente} onChange={e => setComponente(e.target.value)} style={inp}>
                  {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Capítulo">
              <input type="text" value={capitulo} onChange={e => setCapitulo(e.target.value)} style={inp}
                placeholder="Ex: Capítulo 2 — Relatos da memória" />
            </Field>

            {showAlunosField && (
              <Field label="Alunos (opcional, um por linha)">
                <textarea
                  value={alunos} onChange={e => setAlunos(e.target.value)}
                  style={{ ...inp, minHeight: 80, fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Ana Silva\nBento Maciel\nMaria Souza"
                />
              </Field>
            )}

            <button
              type="button" onClick={handleGenerate} disabled={loading || !canGenerate}
              style={{
                ...btnPri,
                marginTop: 12,
                background: subtipo.cor,
                opacity: (loading || !canGenerate) ? 0.5 : 1,
                cursor: (loading || !canGenerate) ? 'default' : 'pointer',
              }}
            >
              {loading ? '⏳ Gerando...' : `🚀 Gerar ${subtipo.title}`}
            </button>

            {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
          </section>

          {result && (
            <section style={cardStyle}>
              <div style={resultHeader}>
                <strong>{subtipo.title} gerado</strong>
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
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const pageStyle = { minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: '#fff', borderBottom: '0.5px solid #E0DDD5' };
const backLinkStyle = { color: '#003DA5', textDecoration: 'none', fontSize: 13 };
const titleStyle = { flex: 1, fontSize: 17, fontWeight: 700, color: '#1a1a18', margin: 0 };
const mainStyle = { maxWidth: 800, margin: '0 auto', padding: 16 };
const lead = { fontSize: 13, color: '#5F5E5A', marginBottom: 12, padding: '0 4px' };
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: 16, marginBottom: 12 };
const fieldRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 };
const btnSec = { padding: '8px 14px', background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, fontSize: 13, cursor: 'pointer' };
const errorStyle = { background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginTop: 10 };
const warningStyle = { background: '#FEF3C7', border: '0.5px solid #FCD34D', color: '#92400E', padding: '8px 12px', borderRadius: 7, fontSize: 12, marginBottom: 10 };
const resultHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '0.5px solid #E0DDD5' };
const preStyle = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#FAFAF8', padding: 14, borderRadius: 7, border: '0.5px solid #E0DDD5', maxHeight: 600, overflow: 'auto' };
const actionsStyle = { display: 'flex', gap: 10, marginTop: 12 };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
