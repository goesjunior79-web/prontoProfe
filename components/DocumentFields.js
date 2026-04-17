import { DISCIPLINAS, SERIES } from '../lib/constants';
import { F, S, inp, secLabel } from './ui';

export default function DocumentFields({ tab, plano, prova, atividade, setPlano, setProva, setAtividade }) {
  const get = field => tab === 'plano' ? plano[field] : tab === 'prova' ? prova[field] : atividade[field];
  const set = (field, v) => {
    if (tab === 'plano') setPlano(p => ({ ...p, [field]: v }));
    else if (tab === 'prova') setProva(p => ({ ...p, [field]: v }));
    else setAtividade(p => ({ ...p, [field]: v }));
  };

  return (
    <div style={{ background: '#fff', border: '0.5px solid #E0DDD5', borderRadius: 12, padding: '1rem', marginBottom: 12 }}>
      <span style={secLabel}>Dados do documento</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
        <F label="Turma"><S value={get('turma')} onChange={v => set('turma', v)} opts={['A', 'B', 'C', 'D', 'E']} /></F>
        <F label="Série"><S value={get('serie')} onChange={v => set('serie', v)} opts={SERIES} /></F>
        <F label="Disciplina"><S value={get('disciplina')} onChange={v => set('disciplina', v)} opts={DISCIPLINAS} /></F>
        <F label="Etapa">
          <input style={inp} value={get('etapa')} onChange={e => set('etapa', e.target.value)} placeholder="Ex: 1ª Etapa" />
        </F>
      </div>
    </div>
  );
}
