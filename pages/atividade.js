/**
 * Tela 5 — Atividades (refactor com 1 principal + sob demanda)
 *
 * Story: US-008 (FASE 2)
 *
 * Geração padrão: 1 atividade principal alinhada ao PTD/capítulo.
 * Botão "Gerar nova" abre seletor de variante (nível, aluno, outro foco).
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DISCIPLINAS, SERIES } from '../lib/constants';
import LoginGate from '../components/LoginGate';
import AssetWarningBanner from '../components/AssetWarningBanner';

const VARIANTES = [
  { value: '', label: '— Sem variante (genérica) —' },
  { value: 'N1', label: 'Nível N1 (apoio integral)' },
  { value: 'N2', label: 'Nível N2 (apoio parcial)' },
  { value: 'N3', label: 'Nível N3 (esperado)' },
  { value: 'N4', label: 'Nível N4 (desafio)' },
  { value: 'leitura', label: 'Foco: leitura' },
  { value: 'producao', label: 'Foco: produção textual' },
  { value: 'situacoes', label: 'Foco: situações-problema' },
];

export default function AtividadePage() {
  const { data: session, status } = useSession();
  const [ano, setAno] = useState('3º ano EF I');
  const [componente, setComponente] = useState('Língua Portuguesa');
  const [capitulo, setCapitulo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [atividades, setAtividades] = useState([]);
  const [variante, setVariante] = useState('');

  if (status === 'loading') return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;

  const canGenerate = ano && componente && capitulo.trim();

  const generate = async (varianteAtual) => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const promptText = buildPromptAtividade({ ano, componente, capitulo, variante: varianteAtual });
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          tipo_de_saida: 'atividade',
          meta: {
            tipo: 'atividade',
            titulo: `Atividade ${componente} ${ano} — ${capitulo}${varianteAtual ? ` (${varianteAtual})` : ''}`,
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

      setAtividades(prev => [
        ...prev,
        {
          text: data.result,
          variante: varianteAtual,
          custo: data.custo_estimado,
          passed: data.pipeline_passed,
        },
      ]);

      try {
        await fetch('/api/planejamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'atividade',
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
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Atividades — ProntoProfe!</title></Head>

      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>✏️ Atividades</h1>
        </header>

        <main style={mainStyle}>
          <AssetWarningBanner tipo="atividade" />

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
                placeholder="Ex: Capítulo 5 — Sequência numérica" />
            </Field>

            <button type="button" onClick={() => generate('')} disabled={loading || !canGenerate}
              style={{ ...btnPri, marginTop: 12, opacity: (loading || !canGenerate) ? 0.5 : 1 }}>
              {loading ? '⏳ Gerando...' : '🚀 Gerar atividade principal'}
            </button>
            {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
          </section>

          {atividades.length > 0 && (
            <section style={cardStyle}>
              <div style={resultHeader}>
                <strong>{atividades.length} atividade(s) gerada(s)</strong>
              </div>

              {atividades.map((a, i) => (
                <div key={i} style={atvCard}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                    #{i + 1}
                    {a.variante && <span style={varianteBadge}> {a.variante}</span>}
                    {a.passed ? ' · ✅' : ' · ⚠'}
                    {' · US$ '} {a.custo?.toFixed(4) || '0'}
                  </div>
                  <pre style={preStyle}>{a.text}</pre>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: 12, background: '#FAFAF8', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                  ➕ Gerar nova atividade conforme necessidade
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select value={variante} onChange={e => setVariante(e.target.value)} style={{ ...inp, flex: 1 }}>
                    {VARIANTES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                  <button onClick={() => generate(variante)} disabled={loading} style={btnSec}>
                    {loading ? '⏳' : 'Gerar'}
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

function buildPromptAtividade({ ano, componente, capitulo, variante }) {
  const varianteHint = variante
    ? variante.startsWith('N')
      ? `\n\nVariante específica: gere atividade adaptada para nível ${variante} (${
          { N1: 'apoio integral', N2: 'apoio parcial', N3: 'esperado', N4: 'desafio' }[variante]
        }).`
      : `\n\nVariante específica: foco em "${variante}".`
    : '';

  return `Gere uma ATIVIDADE no padrão SESI v3.

Dados:
- Ano: ${ano}
- Componente: ${componente}
- Capítulo: ${capitulo}${varianteHint}

Estrutura obrigatória (4 itens):
1. OBJETIVO (verbo no infinitivo)
2. HABILIDADE (alinhada ao capítulo)
3. ENUNCIADO claro (texto pra o aluno)
4. CONTEXTO real (situação aplicável)

Não inventar — usar apenas o capítulo. Linguagem adequada à idade.
Não fragmentar em N1-N4 automaticamente — diferenciação só sob demanda explícita acima.`;
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
const fieldRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnSec = { padding: '8px 14px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer' };
const errorStyle = { background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginTop: 10 };
const resultHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '0.5px solid #E0DDD5' };
const atvCard = { borderTop: '0.5px solid #E0DDD5', paddingTop: 12, marginTop: 12 };
const varianteBadge = { background: '#0C447C', color: '#fff', padding: '1px 6px', borderRadius: 8, fontSize: 10, marginLeft: 6 };
const preStyle = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#FAFAF8', padding: 12, borderRadius: 7, border: '0.5px solid #E0DDD5' };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
