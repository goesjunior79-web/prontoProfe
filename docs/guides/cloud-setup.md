# Setup: Google Drive e OneDrive

Guia passo a passo para configurar as credenciais OAuth que permitem salvar arquivos diretamente na nuvem.

---

## Google Drive

### 1. Criar projeto no Google Cloud Console

1. Acesse https://console.cloud.google.com
2. Clique em **Selecionar projeto → Novo projeto**
3. Nome sugerido: `ProntoProfe`
4. Clique em **Criar**

### 2. Habilitar a API do Google Drive

1. No menu lateral: **APIs e serviços → Biblioteca**
2. Pesquise `Google Drive API`
3. Clique em **Ativar**

### 3. Criar credenciais OAuth2

1. Menu lateral: **APIs e serviços → Credenciais**
2. Clique em **+ Criar credenciais → ID do cliente OAuth**
3. Tipo de aplicativo: **Aplicativo da Web**
4. Nome: `ProntoProfe Web`
5. Em **Origens JavaScript autorizadas**, adicione:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seu-dominio.vercel.app` (produção)
6. Clique em **Criar**
7. Copie o **ID do cliente** (formato: `xxxx.apps.googleusercontent.com`)

### 4. Configurar tela de consentimento OAuth

1. Menu lateral: **APIs e serviços → Tela de consentimento OAuth**
2. Tipo de usuário: **Externo** (ou Interno se usar Google Workspace)
3. Preencha nome do app, e-mail de suporte
4. Em **Escopos**, adicione: `https://www.googleapis.com/auth/drive.file`
5. Salve e publique

### 5. Adicionar ao .env.local

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

---

## OneDrive (Microsoft 365 / Azure Entra ID)

### 1. Registrar aplicativo no Azure Portal

1. Acesse https://portal.azure.com
2. Pesquise **Microsoft Entra ID** (antigo Azure Active Directory)
3. Menu lateral: **Registros de aplicativo → + Novo registro**
4. Nome: `ProntoProfe`
5. Tipos de conta com suporte: **Contas em qualquer diretório organizacional e contas Microsoft pessoais** (para cobrir tanto Microsoft 365 institucional quanto contas pessoais)
6. URI de redirecionamento:
   - Tipo: **Aplicativo de página única (SPA)**
   - URI: `http://localhost:3000` (desenvolvimento)
   - Adicione também: `https://seu-dominio.vercel.app` (produção)
7. Clique em **Registrar**

### 2. Copiar o ID do aplicativo

Na página do app registrado, copie o **ID do aplicativo (cliente)** (formato UUID).

### 3. Configurar permissões de API

1. Menu lateral: **Permissões de API → + Adicionar uma permissão**
2. Selecione **Microsoft Graph**
3. Tipo: **Permissões delegadas**
4. Adicione:
   - `Files.ReadWrite`
   - `User.Read`
5. Clique em **Adicionar permissões**
6. (Opcional, se conta institucional) Clique em **Conceder consentimento do administrador**

### 4. Adicionar ao .env.local

```env
NEXT_PUBLIC_ONEDRIVE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Verificação

Após configurar ambas as variáveis, reinicie o servidor:

```bash
npm run dev
```

Gere um conteúdo na aplicação → os botões **Google Drive** e **OneDrive** aparecerão na seção "Salvar na nuvem". Clique em um deles — deverá abrir o popup de login.

---

## Estrutura de pastas criada automaticamente

```
Minha unidade (Google Drive) ou OneDrive
  └── Pronto Profe/
        └── Abril 2026/
              ├── pronto-profe-2026-04-15.pdf
              ├── pronto-profe-2026-04-15.docx
              └── pronto-profe-2026-04-15.xlsx
```

A pasta **Pronto Profe** é criada na primeira vez que o professor salva. A subpasta do mês é criada automaticamente a cada novo mês.
