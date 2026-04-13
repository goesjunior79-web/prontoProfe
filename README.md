# SESI Edu — Assistente do Professor com IA

Gerador de planos de aula, provas e atividades com múltiplos provedores de IA.

## Provedores suportados

| IA | Plano | Chave necessária |
|---|---|---|
| Claude (Anthropic) | Gratuito, Pro, Escola | ANTHROPIC_API_KEY |
| ChatGPT (OpenAI) | Pro, Escola | OPENAI_API_KEY |
| Gemini (Google) | Pro, Escola | GEMINI_API_KEY |
| Copilot (Microsoft) | Escola | AZURE_OPENAI_KEY + AZURE_OPENAI_ENDPOINT |

## Deploy na Vercel (passo a passo)

### 1. Preparar o projeto

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 2. Criar arquivo de variáveis locais

Copie o arquivo de exemplo:

```bash
copy .env.example .env.local
```

Abra o `.env.local` e preencha pelo menos a chave do Claude:

```
ANTHROPIC_API_KEY=sk-ant-SUA-CHAVE-AQUI
```

### 3. Testar localmente

```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

### 4. Publicar na Vercel

```bash
npx vercel
```

Siga as instruções — quando perguntar se é um novo projeto, diga Sim.

### 5. Adicionar as chaves de API na Vercel

Acesse o painel da Vercel:
1. Abra seu projeto em vercel.com
2. Vá em **Settings > Environment Variables**
3. Adicione cada variável do arquivo `.env.example`
4. Clique em **Save**
5. Faça um novo deploy: `npx vercel --prod`

## Planos

| Plano | Preço sugerido | Limite | IAs |
|---|---|---|---|
| Gratuito | R$ 0 | 10 gerações/mês | Claude |
| Pro | R$ 29/mês | 150 gerações/mês | Claude + ChatGPT + Gemini |
| Escola | R$ 149/mês | Ilimitado | Todas |

## Próximos passos para monetizar

1. **Autenticação**: adicionar NextAuth.js com Google ou e-mail
2. **Banco de dados**: Supabase ou PlanetScale para controlar uso real por usuário
3. **Pagamentos**: Stripe (internacional) ou Pagar.me (Brasil) para cobrar assinaturas
4. **Dashboard**: painel do gestor para o plano Escola

## Estrutura do projeto

```
sesi-edu/
├── pages/
│   ├── index.js          # Interface principal (todo o app)
│   └── api/
│       └── generate.js   # Rota de servidor (chaves protegidas aqui)
├── .env.example          # Modelo das variáveis de ambiente
├── package.json
└── README.md
```
