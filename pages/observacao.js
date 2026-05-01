/**
 * Tela 6 — Observação de Aluno (NOVA)
 * Story: US-009
 *
 * Form rápido: Aluno + descrição livre. App gera observação pedagógica formal
 * (4 eixos + final interativo). Botão de follow-up encaminha pra /atividade.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LoginGate from '../components/LoginGate';
import AssetWarningBanner from '../components/AssetWarningBanner';

export default function ObservacaoPage() {
  const { data: session, status } = useSession();
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [alunoNome, setAlunoNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/alunos')
      .then(r => r.json())
      .then(d => setAlunos(d.alunos || []))
      .catch(() => {});
  }, [status]);

  if (status === 'loading') return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;

  const canGenerate = (alunoId || alunoNome.trim()) && descricao.trim();

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    const aluno = alunos.find(a => a.id === alunoId);
    const nome = aluno?.nome || alunoNome.trim();
    const obsNee = aluno?.obs_nee;

    try {
      const promptText = `Gere uma OBSERVAÇÃO pedagógica formal no padrão SESI v3.

Aluno: ${nome}${obsNee ? ` (NEE: ${obsNee})` : ''}

Descrição da professora (evidência rápida):
${descricao}

Estrutura obrigatória — 4 eixos na ordem:
1. Desempenho (o que o aluno demonstra)
2. Dificuldade (gap específico — singular)
3. Estratégia usada pela professora (verbo no passado)
4. Resposta do aluno (como reagiu)

Regras:
- Começar com aspecto positivo (se não houver, usar linguagem de leveza)
- Linguagem ética e pedagógica (NÃO usar: "desinteressado", "lento", "atrasado")
- Sem julgamentos
- Final fixo: "Deseja sugestão de atividade para trabalhar com o aluno?"`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          tipo_de_saida: 'observacao',
          meta: { tipo: 'observacao', titulo: `Observação ${nome}` },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Erro ao gerar.');
        return;
      }

      setResult({
        text: data.result, custo: data.custo_estimado, passed: data.pipeline_passed,
        warnings: data.warnings, alunoId, nome,
      });

      try {
        await fetch('/api/planejamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'observacao',
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
      <Head><title>Observação — ProntoProfe!</title></Head>
      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>👁 Observação de Aluno</h1>
        </header>

        <main style={mainStyle}>
          <AssetWarningBanner tipo="observacao" />

          <section style={cardStyle}>
            <Field label="Aluno">
              {alunos.length > 0 ? (
                <select value={alunoId} onChange={e => { setAlunoId(e.target.value); setAlunoNome(''); }} style={inp}>
                  <option value="">— Selecionar —</option>
                  {alunos.map(a => (
                    <option key={a.id} value={a.id}>{a.nome} ({a.turma})</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={alunoNome} onChange={e => setAlunoNome(e.target.value)} style={inp}
                  placeholder="Nome do aluno (cadastre alunos para selecionar)" />
              )}
            </Field>

            <Field label="Descrição rápida">
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                style={{ ...inp, minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Ex: Hoje teve dificuldade na soma com reserva. Ajudei mostrando material concreto e ele finalizou os exercícios." />
            </Field>

            <button onClick={handleGenerate} disabled={loading || !canGenerate}
              style={{ ...btnPri, marginTop: 12, opacity: (loading || !canGenerate) ? 0.5 : 1 }}>
              {loading ? '⏳ Gerando observação...' : '🚀 Gerar observação'}
            </button>
            {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
          </section>

          {result && (
            <section style={cardStyle}>
              <div style={resultHeader}>
                <strong>Observação — {result.nome}</strong>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {result.passed ? '✅' : '⚠'} · US$ {result.custo?.toFixed(4) || '0'}
                </span>
              </div>
              <pre style={preStyle}>{result.text}</pre>
              <div style={actionsStyle}>
                <button onClick={() => navigator.clipboard?.writeText(result.text)} style={btnSec}>
                  📋 Copiar
                </button>
                <Link
                  href={result.alunoId ? `/atividade?aluno=${encodeURIComponent(result.alunoId)}` : '/atividade'}
                  style={{ ...btnPri, textDecoration: 'none', display: 'inline-block' }}
                >
                  💡 Gerar atividade pra ajudar
                </Link>
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

const pageStyle = { minHeight: '100vh', background: '#F7F6F3', fontFamily: 'system-ui, -apple-system, sans-serif' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: '#fff', borderBottom: '0.5px solid #E0DDD5' };
const backLinkStyle = { color: '#003DA5', textDecoration: 'none', fontSize: 13 };
const titleStyle = { flex: 1, fontSize: 17, fontWeight: 700, color: '#1a1a18', margin: 0 };
const mainStyle = { maxWidth: 800, margin: '0 auto', padding: 16 };
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: 16, marginBottom: 12 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnSec = { padding: '8px 14px', background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, fontSize: 13, cursor: 'pointer' };
const errorStyle = { background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginTop: 10 };
const resultHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '0.5px solid #E0DDD5' };
const preStyle = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#FAFAF8', padding: 14, borderRadius: 7, border: '0.5px solid #E0DDD5' };
const actionsStyle = { display: 'flex', gap: 10, marginTop: 12 };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
