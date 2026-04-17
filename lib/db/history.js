import { supabase } from '../supabase';

export async function saveGeneration(email, { tipo, titulo, disciplina, serie, turma, provider, conteudo }) {
  const { error } = await supabase.from('generations').insert({
    email, tipo, titulo, disciplina, serie, turma, provider,
    conteudo: conteudo?.slice(0, 8000) ?? null,
  });
  if (error) console.error('Erro ao salvar geração:', error.message);
}

export async function getHistory(email, limit = 15) {
  const { data, error } = await supabase
    .from('generations')
    .select('id, tipo, titulo, disciplina, serie, turma, provider, conteudo, created_at')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data.map(g => ({
    ...g,
    data: new Date(g.created_at).toLocaleDateString('pt-BR'),
  }));
}
