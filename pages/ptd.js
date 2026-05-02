/**
 * Tela 2 — PTD (Plano de Trabalho Docente)
 *
 * Story: US-005 (FASE 2 Telas por capítulo)
 *
 * Form simples (3 campos) → POST /api/generate com tipo_de_saida='PTD' →
 * exibe output → permite baixar .docx + salvar planejamento → botão pra
 * "Gerar aula semanal" (US-006).
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DISCIPLINAS, SERIES } from '../lib/constants';
import LoginGate from '../components/LoginGate';
import AssetWarningBanner from '../components/AssetWarningBanner';

export default function PtdPage() {
  const { data: session, status } = useSession();

  const [ano, setAno] = useState('3º ano EF I');
  const [componente, setComponente] = useState('Língua Portuguesa');
  const [capitulo, setCapitulo] = useState('');
  const [vigencia, setVigencia] = useState(defaultVigencia());

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const [planejamentoId, setPlanejamentoId] = useState(null);

  if (status === 'loading') {
    return <div style={loadingStyle}>Carregando…</div>;
  }
  if (status !== 'authenticated') return <LoginGate />;

  const canGenerate = ano && componente && capitulo.trim();

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setPlanejamentoId(null);

    try {
      // 1. Gera o PTD via pipeline
      const promptText = buildPromptPtd({ ano, componente, capitulo, vigencia });
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          tipo_de_saida: 'PTD',
          meta: {
            tipo: 'plano',
            titulo: `PTD ${componente} ${ano} — ${capitulo}`,
            disciplina: componente,
            serie: ano,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'auth_required') {
          setErrorMsg('Sessão expirada. Recarregue a página.');
        } else if (data.error === 'limit_reached') {
          setErrorMsg(data.message || 'Limite de gerações atingido.');
        } else {
          setErrorMsg(data.message || 'Erro ao gerar PTD.');
        }
        return;
      }

      setResult({
        text: data.result,
        promptVersao: data.prompt_versao,
        custo: data.custo_estimado,
        passed: data.pipeline_passed,
        warnings: data.warnings,
      });

      // 2. Salva planejamento (auditoria + cache)
      try {
        const saveRes = await fetch('/api/planejamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'PTD',
            ano, componente, capitulo,
            conteudoGerado: data.result,
            promptVersao: data.prompt_versao,
            modeloLlm: data.model,
            custoEstimado: data.custo_estimado,
            pipelinePassed: data.pipeline_passed,
            pipelineAttempts: data.pipeline_attempts,
          }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          setPlanejamentoId(saved.planejamento?.id);
        }
      } catch {
        // Falha ao salvar não bloqueia exibição do output
      }
    } catch (e) {
      setErrorMsg(e.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!result?.text) return;
    try {
      const cfg = readCfg();
      const dadosProva = { disc: componente, serie: ano, etapa: '1ª Etapa', vigencia };
      const res = await fetch('/api/gerar-plano-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: result.text, cfg, dadosProva }),
      });
      if (!res.ok) throw new Error('Erro ao gerar Word');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PTD_${componente}_${ano}_${slug(capitulo)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setErrorMsg('Erro ao baixar Word: ' + e.message);
    }
  };

  return (
    <>
      <Head>
        <title>PTD — ProntoProfe!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>📋 Plano de Trabalho Docente</h1>
          <div style={{ fontSize: 12, color: '#888' }}>{session.user.name || session.user.email}</div>
        </header>

        <main style={mainStyle}>
          <AssetWarningBanner tipo="PTD" />

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

            <Field label="Capítulo (nome exato)">
              <input
                type="text" value={capitulo} onChange={e => setCapitulo(e.target.value)} style={inp}
                placeholder="Ex: Capítulo 2 — Relatos da memória"
              />
            </Field>

            <Field label="Vigência (opcional)">
              <input
                type="text" value={vigencia} onChange={e => setVigencia(e.target.value)} style={inp}
                placeholder="março 2026"
              />
            </Field>

            <button
              type="button" onClick={handleGenerate} disabled={loading || !canGenerate}
              style={{
                ...btnPri,
                marginTop: 12,
                opacity: (loading || !canGenerate) ? 0.5 : 1,
                cursor: (loading || !canGenerate) ? 'default' : 'pointer',
              }}
            >
              {loading ? '⏳ Gerando PTD...' : '🚀 Gerar PTD'}
            </button>

            {errorMsg && (
              <div style={errorStyle}>{errorMsg}</div>
            )}
          </section>

          {result && (
            <section style={cardStyle}>
              <div style={resultHeader}>
                <strong>PTD gerado</strong>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {result.passed ? '✅ Validado' : '⚠ Revisar'} ·
                  US$ {result.custo?.toFixed(4) || '0'} ·
                  {result.promptVersao}
                </span>
              </div>

              {result.warnings?.length > 0 && (
                <div style={warningStyle}>
                  <b>Avisos:</b>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w.message || JSON.stringify(w)}</li>
                    ))}
                  </ul>
                </div>
              )}

              <pre style={preStyle}>{result.text}</pre>

              <div style={actionsStyle}>
                <button onClick={handleDownloadDocx} style={btnPri}>📥 Baixar Word (.docx)</button>
                <Link
                  href={{ pathname: '/aula', query: { ano: form.ano, componente: form.componente, capitulo: form.capitulo } }}
                  style={{ ...btnSec, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  📅 Gerar aula semanal
                </Link>
              </div>

              {planejamentoId && (
                <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                  Salvo no histórico (id: {planejamentoId})
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────

function buildPromptPtd({ ano, componente, capitulo, vigencia }) {
  return `Gere um Plano de Trabalho Docente (PTD) com 8 seções no padrão SESI v3 (institucional definitivo).

Dados:
- Componente Curricular: ${componente}
- Turma/Ano: ${ano}
- Capítulo: ${capitulo}
- Vigência: ${vigencia || 'mês atual'}

Estrutura obrigatória:
1. COMPETÊNCIAS
2. HABILIDADES
3. CAPÍTULO DO MATERIAL
4. OBJETIVOS
5. EVIDÊNCIAS DE APRENDIZAGEM (com instrumentos, critérios, e os 4 tipos: diagnóstica, formativa, somativa, autoavaliação)
6. AÇÕES A DESENVOLVER (com Atividades, Estratégias/mediação, Espaços, Materiais, Recursos)
7. ALUNOS COM FLEXIBILIZAÇÃO (Nome, Estratégia, Avaliação por aluno se aplicável)
8. PLANEJAMENTO INTEGRADO

Não inventar — usar somente o capítulo informado. Linguagem pedagógica formal.`;
}

function readCfg() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('sesi_cfg') || '{}');
  } catch {
    return {};
  }
}

function defaultVigencia() {
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const d = new Date();
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
}

// ────────────────────────────────────────────────────────────────────────
// Components / styles
// ────────────────────────────────────────────────────────────────────────

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
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: 16, marginBottom: 12 };
const fieldRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnSec = { padding: '10px 16px', background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 8, fontSize: 14, cursor: 'pointer' };
const errorStyle = { background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginTop: 10 };
const warningStyle = { background: '#FEF3C7', border: '0.5px solid #FCD34D', color: '#92400E', padding: '10px 12px', borderRadius: 7, fontSize: 12, marginBottom: 10 };
const resultHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, paddingBottom: 8, borderBottom: '0.5px solid #E0DDD5' };
const preStyle = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#FAFAF8', padding: 14, borderRadius: 7, border: '0.5px solid #E0DDD5', maxHeight: 600, overflow: 'auto' };
const actionsStyle = { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
