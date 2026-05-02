// Smoke test — confirma que SUPABASE_SERVICE_KEY bypassa RLS.
// Roda: node --env-file=.env.local scripts/smoke-db.mjs

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const TEST_EMAIL = `smoke-${Date.now()}@test.local`;
const TEST_GOOGLE_ID = `smoke-${Date.now()}`;

async function main() {
  console.log('1. INSERT em usuarios (deve passar com service_role) ...');
  const { data: created, error: e1 } = await supabase
    .from('usuarios')
    .insert({ google_id: TEST_GOOGLE_ID, email: TEST_EMAIL, nome: 'Smoke Test' })
    .select('id, email, nome')
    .single();
  if (e1) { console.error('FAIL:', e1.message); process.exit(1); }
  console.log('   OK →', created);

  console.log('2. SELECT do mesmo registro ...');
  const { data: found, error: e2 } = await supabase
    .from('usuarios')
    .select('id, email')
    .eq('id', created.id)
    .maybeSingle();
  if (e2) { console.error('FAIL:', e2.message); process.exit(1); }
  console.log('   OK →', found);

  console.log('3. DELETE (cleanup) ...');
  const { error: e3 } = await supabase.from('usuarios').delete().eq('id', created.id);
  if (e3) { console.error('FAIL:', e3.message); process.exit(1); }
  console.log('   OK');

  console.log('\n✅ service_role key funcionando — RLS bypassada como esperado.');
}

main().catch(e => { console.error('ERRO:', e); process.exit(1); });
