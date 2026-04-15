// lib/cloud/onedrive.js
// Integração com OneDrive via MSAL (@azure/msal-browser) + Microsoft Graph API.
// Escopo: Files.ReadWrite — cria pastas e faz upload de arquivos.

import { FOLDER_ROOT, getMonthFolderName, getCloudFileName, MIME_TYPES, FILE_EXT } from './folder-structure';

const GRAPH = 'https://graph.microsoft.com/v1.0';

// ── Instância MSAL (singleton) ──────────────────────────────────────────────

let _msal   = null;
let _account = null;

async function getMsal() {
  if (_msal) return _msal;

  const { PublicClientApplication } = await import('@azure/msal-browser');
  _msal = new PublicClientApplication({
    auth: {
      clientId:    process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID,
      authority:   'https://login.microsoftonline.com/common',
      redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
    },
    cache: { cacheLocation: 'sessionStorage', storeAuthStateInCookie: false },
  });
  await _msal.initialize();
  return _msal;
}

// ── Autenticação ────────────────────────────────────────────────────────────

export async function oneDriveSignIn() {
  const msal = await getMsal();
  const scopes = ['Files.ReadWrite', 'User.Read'];

  // Tenta adquirir token silenciosamente se já há conta na sessão
  if (_account) {
    try {
      const result = await msal.acquireTokenSilent({ scopes, account: _account });
      return result.accessToken;
    } catch {
      // token expirado — faz login interativo
    }
  }

  const result = await msal.loginPopup({ scopes });
  _account = result.account;
  return result.accessToken;
}

// ── Gerenciamento de pastas ─────────────────────────────────────────────────

async function ensureFolder(token, folderName, parentPath = '') {
  const parentEndpoint = parentPath
    ? `${GRAPH}/me/drive/root:/${parentPath}:/children`
    : `${GRAPH}/me/drive/root/children`;

  const body = {
    name:   folderName,
    folder: {},
    '@microsoft.graph.conflictBehavior': 'fail', // 409 se já existir — ignoramos
  };

  const resp = await fetch(parentEndpoint, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  // 409 = pasta já existe → OK
  if (!resp.ok && resp.status !== 409) {
    throw new Error(`Erro ao criar pasta no OneDrive: ${resp.status}`);
  }
}

// ── Upload ──────────────────────────────────────────────────────────────────

export async function uploadToOneDrive(token, blob, format) {
  const monthFolder = getMonthFolderName();
  const fileName    = getCloudFileName(FILE_EXT[format]);
  const mimeType    = MIME_TYPES[format];
  const folderPath  = `${FOLDER_ROOT}/${monthFolder}`;

  // Garante que as pastas existem
  await ensureFolder(token, FOLDER_ROOT);
  await ensureFolder(token, monthFolder, FOLDER_ROOT);

  // Upload do arquivo (até 4 MB — suficiente para documentos gerados por IA)
  const uploadUrl = `${GRAPH}/me/drive/root:/${folderPath}/${fileName}:/content`;
  const resp = await fetch(uploadUrl, {
    method:  'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimeType },
    body:    blob,
  });

  if (!resp.ok) throw new Error(`Erro ao fazer upload para o OneDrive: ${resp.status}`);
  const data = await resp.json();
  return { fileName, link: data.webUrl };
}
