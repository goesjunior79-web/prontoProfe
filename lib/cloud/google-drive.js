// lib/cloud/google-drive.js
// Integração com Google Drive via Google Identity Services (GIS) + Drive REST API.
// Escopo: drive.file — acesso apenas aos arquivos criados pelo app.

import { FOLDER_ROOT, getMonthFolderName, getCloudFileName, MIME_TYPES, FILE_EXT } from './folder-structure';

const DRIVE_API  = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

// ── Carregamento do script GIS ──────────────────────────────────────────────

function loadGIS() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const script    = document.createElement('script');
    script.src      = 'https://accounts.google.com/gsi/client';
    script.onload   = resolve;
    script.onerror  = () => { throw new Error('Falha ao carregar Google Identity Services.'); };
    document.head.appendChild(script);
  });
}

// ── Autenticação ────────────────────────────────────────────────────────────

export async function googleSignIn() {
  await loadGIS();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope:     'https://www.googleapis.com/auth/drive.file',
      callback:  (resp) => {
        if (resp.error) reject(new Error(`Erro no login Google: ${resp.error}`));
        else resolve(resp.access_token);
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

// ── Gerenciamento de pastas ─────────────────────────────────────────────────

async function findFolder(token, name, parentId) {
  let q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) q += ` and '${parentId}' in parents`;

  const resp = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id)&spaces=drive`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!resp.ok) throw new Error(`Drive API error ${resp.status}`);
  const data = await resp.json();
  return data.files?.[0]?.id || null;
}

async function createFolder(token, name, parentId) {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  };
  const resp = await fetch(`${DRIVE_API}/files`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(metadata),
  });
  if (!resp.ok) throw new Error(`Erro ao criar pasta no Drive: ${resp.status}`);
  const data = await resp.json();
  return data.id;
}

async function getOrCreateFolder(token, name, parentId = null) {
  const existing = await findFolder(token, name, parentId);
  return existing ?? await createFolder(token, name, parentId);
}

// ── Upload ──────────────────────────────────────────────────────────────────

export async function uploadToGoogleDrive(token, blob, format) {
  const rootId    = await getOrCreateFolder(token, FOLDER_ROOT);
  const monthId   = await getOrCreateFolder(token, getMonthFolderName(), rootId);
  const fileName  = getCloudFileName(FILE_EXT[format]);
  const mimeType  = MIME_TYPES[format];

  const metadata  = { name: fileName, parents: [monthId] };
  const form      = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file',     new Blob([blob], { type: mimeType }));

  const resp = await fetch(
    `${UPLOAD_API}/files?uploadType=multipart&fields=id,webViewLink`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    form,
    },
  );
  if (!resp.ok) throw new Error(`Erro ao fazer upload para o Drive: ${resp.status}`);
  const data = await resp.json();
  return { fileName, link: data.webViewLink };
}
