import { supabase } from '../supabase';

const currentMonth = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

export async function getOrCreateProfile(email, name, image) {
  const month = currentMonth();

  const { data: existing, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  // Criar perfil novo
  if (!existing) {
    const { data, error: createErr } = await supabase
      .from('profiles')
      .insert({ email, name, image, plan: 'free', usage: 0, usage_month: month })
      .select()
      .single();
    if (createErr) throw createErr;
    return data;
  }

  // Resetar uso se virou o mês
  if (existing.usage_month !== month) {
    const { data, error: resetErr } = await supabase
      .from('profiles')
      .update({ usage: 0, usage_month: month, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select()
      .single();
    if (resetErr) throw resetErr;
    return data;
  }

  return existing;
}

export async function incrementUsage(email) {
  const { data: p } = await supabase.from('profiles').select('usage').eq('email', email).single();
  await supabase.from('profiles').update({ usage: (p?.usage || 0) + 1, updated_at: new Date().toISOString() }).eq('email', email);
}
