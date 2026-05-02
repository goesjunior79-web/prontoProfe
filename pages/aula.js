/**
 * Tela 3 — Aula Diária / Semanário
 *
 * Story: US-006 (FASE 2 Telas por capítulo)
 *
 * Form: ano + componente + capítulo + horário semanal.
 * Auto-pop do PTD ativo (ano/componente/capítulo via query params do botão
 * "Gerar aula semanal" da Tela PTD, ou via findLatestByCapitulo).
 *
 * Output: semanário gerado, organizado em tabs por dia da semana.
 */

import { useState, useEffect, useMemo } from 'react';
import { useDirtyWarning } from '../lib/hooks/useDirtyWarning';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { DISCIPLINAS, SERIES } from '../lib/constants';
import LoginGate from '../components/LoginGate';
import AssetWarningBanner from '../components/AssetWarningBanner';
import { parseHorarioSemanal, totalAulas } from '../lib/aula/parser';

export default function AulaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [ano, setAno] = useState('3º ano EF I');
  const [componente, setComponente] = useState('Língua Portuguesa');
  const [capitulo, setCapitulo] = useState('');
  const [horario, setHorario] = useState('seg 2, ter 2, qua 2, sex 1');
  const [ptdRef, setPtdRef] = useState(null); // planejamento PTD ativo (opcional)

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  useDirtyWarning(!!result);

  // Auto-pop dos query params (vindos do botão "Gerar aula semanal" da Tela PTD)
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.ano) setAno(String(router.query.ano));
    if (router.query.componente) setComponente(String(router.query.componente));
    if (router.query.capitulo) setCapitulo(String(router.query.capitulo));
  }, [router.isReady, router.query]);

  // Busca PTD ativo se ano/componente/capítulo preenchidos
  useEffect(() => {
    if (!ano || !componente || !capitulo) {
      setPtdRef(null);
      return;
    }
    const params = new URLSearchParams({
      tipo: 'PTD',
      ano,
      componente,
      capitulo,
      limit: '1',
    });
    fetch(`/api/planejamentos?${params}`)
      .then(r => r.json())
      .then(data => {
        const ptd = data.planejamentos?.[0] || null;
        setPtdRef(ptd);
      })
      .catch(() => setPtdRef(null));
  }, [ano, componente, capitulo]);

  const horarioParseado = useMemo(() => {
    try {
      return parseHorarioSemanal(horario);
    } catch {
      return null;
    }
  }, [horario]);

  if (status === 'loading') return <div style={loadingStyle}>Carregando…</div>;
  if (status !== 'authenticated') return <LoginGate />;

  const canGenerate = ano && componente && capitulo.trim() && horarioParseado;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setDiaSelecionado(null);

    try {
      const promptText = buildPromptAula({
        ano, componente, capitulo,
        horarioParseado,
        ptdSnippet: ptdRef?.conteudo_gerado?.slice(0, 4000) || null,
      });

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          tipo_de_saida: 'aula',
          meta: {
            tipo: 'aula',
            titulo: `Semanário ${componente} ${ano} — ${capitulo}`,
            disciplina: componente,
            serie: ano,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Erro ao gerar semanário.');
        return;
      }

      setResult({
        text: data.result,
        promptVersao: data.prompt_versao,
        custo: data.custo_estimado,
        passed: data.pipeline_passed,
        warnings: data.warnings,
      });

      // Default: primeiro dia da semana selecionado
      if (horarioParseado.length > 0) {
        setDiaSelecionado(horarioParseado[0].dia);
      }

      // Salva planejamento
      try {
        await fetch('/api/planejamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'aula',
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

  // Particiona o output por dia (heurística — divide por marcadores de dia)
  const partsByDay = useMemo(() => {
    if (!result?.text || !horarioParseado) return null;
    return splitByDay(result.text, horarioParseado);
  }, [result, horarioParseado]);

  return (
    <>
      <Head>
        <title>Aula Semanal — ProntoProfe!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={pageStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backLinkStyle}>← Início</Link>
          <h1 style={titleStyle}>📅 Aula Diária / Semanário</h1>
          <div style={{ fontSize: 12, color: '#888' }}>{session.user.name || session.user.email}</div>
        </header>

        <main style={mainStyle}>
          <AssetWarningBanner tipo="aula" />

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
              <input
                type="text" value={capitulo} onChange={e => setCapitulo(e.target.value)} style={inp}
                placeholder="Ex: Capítulo 2 — Relatos da memória"
              />
            </Field>

            <Field label="Horário semanal">
              <input
                type="text" value={horario} onChange={e => setHorario(e.target.value)} style={inp}
                placeholder="seg 2, ter 2, qua 2, sex 1"
              />
              {horarioParseado ? (
                <div style={{ fontSize: 11, color: '#3B6D11', marginTop: 4 }}>
                  ✓ {horarioParseado.length} dias / {totalAulas(horarioParseado)} aulas
                  ({horarioParseado.map(d => `${d.nome} (${d.aulas})`).join(', ')})
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 4 }}>
                  Formato inválido. Use "seg 2, ter 2, qua 2, sex 1"
                </div>
              )}
            </Field>

            {ptdRef && (
              <div style={ptdRefBoxStyle}>
                ✓ <b>PTD ativo encontrado</b> — semanário será alinhado ao PTD em cache
                <span style={{ fontSize: 10, color: '#888', marginLeft: 8 }}>
                  ({ptdRef.created_at?.slice(0, 10)})
                </span>
              </div>
            )}

            <button
              type="button" onClick={handleGenerate} disabled={loading || !canGenerate}
              style={{
                ...btnPri,
                marginTop: 12,
                opacity: (loading || !canGenerate) ? 0.5 : 1,
                cursor: (loading || !canGenerate) ? 'default' : 'pointer',
              }}
            >
              {loading ? '⏳ Gerando semanário...' : '🚀 Gerar semanário'}
            </button>

            {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
          </section>

          {result && horarioParseado && (
            <section style={cardStyle}>
              <div style={resultHeader}>
                <strong>Semanário gerado</strong>
                <span style={{ fontSize: 11, color: '#888' }}>
                  {result.passed ? '✅ Validado' : '⚠ Revisar'} ·
                  US$ {result.custo?.toFixed(4) || '0'}
                </span>
              </div>

              <div style={tabsStyle}>
                {horarioParseado.map(d => (
                  <button
                    key={d.dia}
                    onClick={() => setDiaSelecionado(d.dia)}
                    style={{
                      ...tabBtnStyle,
                      background: diaSelecionado === d.dia ? '#003DA5' : '#F1EFE8',
                      color: diaSelecionado === d.dia ? '#fff' : '#333',
                    }}
                  >
                    {d.nome.split('-')[0]}
                    <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>({d.aulas}h)</span>
                  </button>
                ))}
                <button
                  onClick={() => setDiaSelecionado('all')}
                  style={{
                    ...tabBtnStyle,
                    background: diaSelecionado === 'all' ? '#003DA5' : '#F1EFE8',
                    color: diaSelecionado === 'all' ? '#fff' : '#333',
                  }}
                >
                  Tudo
                </button>
              </div>

              <pre style={preStyle}>
                {diaSelecionado === 'all' || !partsByDay
                  ? result.text
                  : (partsByDay[diaSelecionado] || result.text)}
              </pre>

              <div style={actionsStyle}>
                <button onClick={() => copyToClipboard(result.text)} style={btnSec}>
                  📋 Copiar tudo
                </button>
              </div>
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

function buildPromptAula({ ano, componente, capitulo, horarioParseado, ptdSnippet }) {
  const horarioStr = horarioParseado.map(d => `${d.nome} (${d.aulas} aula${d.aulas > 1 ? 's' : ''})`).join(', ');
  const ptdContext = ptdSnippet
    ? `\n\nPTD de referência (excerto):\n${ptdSnippet}\n`
    : '\n\n(Sem PTD em cache — gere alinhado às práticas SESI mas não invente conteúdo.)\n';

  return `Gere um SEMANÁRIO (planejamento da semana com aulas diárias) no padrão SESI v3.

Dados:
- Ano: ${ano}
- Componente: ${componente}
- Capítulo: ${capitulo}
- Horário semanal: ${horarioStr}
${ptdContext}
Para CADA DIA da semana acima, gere uma aula com 8 blocos:
1. OBJETIVO (verbo no infinitivo)
2. HABILIDADE
3. INÍCIO (ativação de conhecimento prévio — leitura/interpretação)
4. DESENVOLVIMENTO (atividade do capítulo + mediação + intervenção)
5. DIFERENCIAÇÃO (N1 apoio integral / N2 apoio parcial / N3 esperado / N4 desafio)
6. FECHAMENTO (sistematização)
7. EVIDÊNCIA DE APRENDIZAGEM
8. AVALIAÇÃO FORMATIVA

Cada aula deve caber em 50 minutos. Garanta progressão pedagógica entre os dias.
Use cabeçalho claro tipo "═══ SEGUNDA-FEIRA ═══" no início de cada dia.`;
}

function splitByDay(text, horarioParseado) {
  const result = {};
  const dias = horarioParseado.map(d => d.dia);

  // Tenta dividir o texto pelos cabeçalhos dos dias
  for (let i = 0; i < dias.length; i++) {
    const dia = dias[i];
    const nomeRegex = new RegExp(
      `(?:^|\\n)[^\\w\\n]*(?:${getRegexParaDia(dia)})[^\\n]*\\n`,
      'gi'
    );
    const matches = [...text.matchAll(nomeRegex)];
    if (matches.length === 0) continue;

    const startIdx = matches[0].index;
    let endIdx = text.length;

    // Procura o início do próximo dia
    for (let j = i + 1; j < dias.length; j++) {
      const proxRegex = new RegExp(
        `(?:^|\\n)[^\\w\\n]*(?:${getRegexParaDia(dias[j])})[^\\n]*\\n`,
        'i'
      );
      const proxMatch = text.slice(startIdx + matches[0][0].length).search(proxRegex);
      if (proxMatch !== -1) {
        endIdx = startIdx + matches[0][0].length + proxMatch;
        break;
      }
    }

    result[dia] = text.slice(startIdx, endIdx).trim();
  }

  return result;
}

function getRegexParaDia(diaCanon) {
  const map = {
    segunda: 'segunda(?:-feira)?|seg\\b',
    terca: 'ter[çc]a(?:-feira)?|ter\\b',
    quarta: 'quarta(?:-feira)?|qua\\b',
    quinta: 'quinta(?:-feira)?|qui\\b',
    sexta: 'sexta(?:-feira)?|sex\\b',
    sabado: 's[áa]bado|sab\\b',
  };
  return map[diaCanon] || diaCanon;
}

function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
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
const mainStyle = { maxWidth: 880, margin: '0 auto', padding: 16 };
const cardStyle = { background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: 16, marginBottom: 12 };
const fieldRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const inp = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid #D3D1C7', fontSize: 13, background: '#fff', boxSizing: 'border-box' };
const btnPri = { padding: '10px 18px', background: '#003DA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnSec = { padding: '8px 14px', background: '#F1EFE8', color: '#333', border: '1px solid #D5D2CC', borderRadius: 7, fontSize: 13, cursor: 'pointer' };
const errorStyle = { background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 12px', borderRadius: 7, fontSize: 13, marginTop: 10 };
const ptdRefBoxStyle = { background: '#EAF3DE', border: '0.5px solid #B5D98A', color: '#365314', padding: '8px 12px', borderRadius: 7, fontSize: 12, marginTop: 4 };
const resultHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, paddingBottom: 8, borderBottom: '0.5px solid #E0DDD5' };
const tabsStyle = { display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' };
const tabBtnStyle = { padding: '6px 12px', borderRadius: 18, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const preStyle = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.6, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#FAFAF8', padding: 14, borderRadius: 7, border: '0.5px solid #E0DDD5', maxHeight: 600, overflow: 'auto' };
const actionsStyle = { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' };
const loadingStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3', color: '#888', fontSize: 14 };
