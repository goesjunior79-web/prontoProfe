// Sobe PDF direto pro bucket user-assets como modelo padrão da Sheila.
// Roda: node --env-file=.env.local scripts/upload-modelo-sheila.mjs <path-to-pdf>

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const PDF_PATH = process.argv[2];
if (!PDF_PATH || !fs.existsSync(PDF_PATH)) {
  console.error('Arquivo não encontrado:', PDF_PATH);
  process.exit(1);
}

const USER_ID = '98814838-0874-4251-a011-8f193f7f24c6'; // sheiladegoess@gmail.com
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const buf = fs.readFileSync(PDF_PATH);
  const sizeBytes = buf.length;
  const filename = path.basename(PDF_PATH);
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const stamp = Date.now();
  const storagePath = `${USER_ID}/modelos/${stamp}_${safeName}`;

  console.log(`Upload: ${filename} (${(sizeBytes / 1_000_000).toFixed(2)} MB)`);
  console.log(`→ ${storagePath}`);

  // 1. Upload pro bucket
  const { error: upErr } = await supabase.storage
    .from('user-assets')
    .upload(storagePath, buf, {
      contentType: 'application/pdf',
      upsert: true,
    });
  if (upErr) {
    console.error('FAIL upload:', upErr.message);
    process.exit(1);
  }
  console.log('   ✓ Upload OK');

  // 2. Desmarca outros defaults
  await supabase.from('modelos').update({ is_default: false }).eq('user_id', USER_ID);

  // 3. Insere registro
  const { data: modelo, error: regErr } = await supabase
    .from('modelos')
    .insert({
      user_id: USER_ID,
      nome: filename,
      descricao: 'Modelo de referência (atividade complementar 4º ano EF)',
      tipo: 'pdf',
      storage_path: storagePath,
      size_bytes: sizeBytes,
      is_default: true,
    })
    .select('id, nome, is_default, size_bytes')
    .single();

  if (regErr) {
    console.error('FAIL register:', regErr.message);
    process.exit(1);
  }

  console.log('   ✓ Registrado como modelo padrão:');
  console.log('     id:', modelo.id);
  console.log('     nome:', modelo.nome);
  console.log('     padrão:', modelo.is_default);
  console.log('\n✅ Modelo da Sheila configurado. Próxima geração vai anexar automaticamente.');
}

main().catch(e => {
  console.error('ERRO:', e);
  process.exit(1);
});
