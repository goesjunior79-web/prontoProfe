import { useState, useEffect } from 'react';
import { DISCIPLINAS, SERIES } from '../lib/constants';
import { F, S, inp, secLabel } from './ui';

function useAlunosNEE(turma, serie) {
  const [sugestao, setSugestao] = useState([]);

  useEffect(() => {
    if (!turma && !serie) { setSugestao([]); return; }
    try {
      const todos = JSON.parse(localStorage.getItem('sesi_alunos') || '[]');
      const filtrados = todos.filter(a =>
        a.obs?.trim() &&
        (!turma || a.turma === turma) &&
        (!serie  || a.serie  === serie)
      );
      setSugestao(filtrados);
    } catch { setSugestao([]); }
  }, [turma, serie]);

  return sugestao;
}

export default function DocumentFields({ tab, plano, prova, atividade, setPlano, setProva, setAtividade }) {
  const get = field => tab === 'plano' ? plano[field] : tab === 'prova' ? prova[field] : atividade[field];
  const set = (field, v) => {
    if (tab === 'plano') setPlano(p => ({ ...p, [field]: v }));
    else if (tab === 'prova') setProva(p => ({ ...p, [field]: v }));
    else setAtividade(p => ({ ...p, [field]: v }));
  };

  const alunosNEE = useAlunosNEE(
    tab === 'plano' ? plano.turma : null,
    tab === 'plano' ? plano.serie : null
  );

  const preencherAlunosNEE = () => {
    const linhas = alunosNEE.map(a => `${a.nome} (${a.obs})`).join('\n');
    const atual  = plano.alunosEspeciais?.trim();
    setPlano(p => ({ ...p, alunosEspeciais: atual ? atual + '\n' + linhas : linhas }));
  };

  return (
    <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '1rem', marginBottom: 12 }}>
      <span style={secLabel}>Dados do documento</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
        <F label="Turma"><S value={get('turma')} onChange={v => set('turma', v)} opts={['A', 'B', 'C', 'D', 'E']} /></F>
        <F label="Série"><S value={get('serie')} onChange={v => set('serie', v)} opts={SERIES} /></F>
        <F label="Disciplina"><S value={get('disciplina')} onChange={v => set('disciplina', v)} opts={DISCIPLINAS} /></F>
        <F label="Etapa"><S value={get('etapa')} onChange={v => set('etapa', v)} opts={['1ª Etapa','2ª Etapa','3ª Etapa','4ª Etapa']} /></F>
      </div>

      {/* Campos exclusivos do Plano de Aula */}
      {tab === 'plano' && (
        <div style={{ marginTop: 12, borderTop: '0.5px solid #E0DDD5', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Vigência */}
          <F label="Vigência">
            <input
              style={inp}
              value={plano.vigencia || ''}
              onChange={e => setPlano(p => ({ ...p, vigencia: e.target.value }))}
              placeholder="Ex: Fevereiro–Abril 2025"
            />
          </F>

          {/* Alunos com necessidades especiais */}
          <F label="Alunos com necessidades especiais">
            {/* Sugestão de alunos cadastrados com NEE */}
            {alunosNEE.length > 0 && (
              <div style={{ background: '#EAF3DE', border: '0.5px solid #B5D98A', borderRadius: 7, padding: '8px 11px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>👥</span>
                <div style={{ flex: 1, fontSize: 12, color: '#3B6D11' }}>
                  <b>{alunosNEE.length} aluno{alunosNEE.length > 1 ? 's' : ''} com NEE</b> encontrado{alunosNEE.length > 1 ? 's' : ''} nesta turma:
                  {' '}{alunosNEE.map(a => a.nome.split(' ')[0]).join(', ')}
                </div>
                <button
                  type="button"
                  onClick={preencherAlunosNEE}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, border: '0.5px solid #5A9E25', background: '#fff', color: '#3B6D11', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}
                >
                  Usar estes alunos
                </button>
              </div>
            )}

            <textarea
              style={{ ...inp, minHeight: 72, resize: 'vertical', fontSize: 13, lineHeight: 1.5 }}
              value={plano.alunosEspeciais || ''}
              onChange={e => setPlano(p => ({ ...p, alunosEspeciais: e.target.value }))}
              placeholder={'Um por linha: Nome (condição)\nEx: Alice Marques (dislexia)\nEx: João Silva (TDAH)'}
            />
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>A IA vai sugerir estratégias individualizadas para cada aluno.</div>
          </F>

          {/* Incluir Plano de Ação Avalia+ */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#333' }}>
            <input
              type="checkbox"
              checked={!!plano.incluirAvalia}
              onChange={e => setPlano(p => ({ ...p, incluirAvalia: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#003DA5' }}
            />
            <span><b>Incluir Plano de Ação Avalia+</b> — gera atividades diárias com descritores e matriz de proficiência</span>
          </label>

        </div>
      )}
    </div>
  );
}
