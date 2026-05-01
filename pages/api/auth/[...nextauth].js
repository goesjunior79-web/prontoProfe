import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { upsertUser } from '../../../lib/db/users';

/**
 * Configuração NextAuth + sincronização com tabela `usuarios` no Supabase.
 *
 * Story: US-004a (FASE 1 DB+Auth)
 *
 * Fluxo de auth:
 *   1. signIn callback — autoriza login (não chama DB)
 *   2. jwt callback — primeira chamada (account populado): upsertUser →
 *      grava UUID Supabase em token.userId
 *   3. session callback — propaga token.userId para session.user.id
 *
 * Endpoints da API consomem session.user.id como user_id Supabase
 * em todas as queries.
 */
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn() {
      // Autoriza qualquer Google account. Validações de domínio/whitelist
      // poderiam entrar aqui no futuro.
      return true;
    },

    async jwt({ token, account, user, profile }) {
      // Primeira chamada após signIn: `account` está populado.
      // Aproveitamos pra fazer upsert e gravar UUID Supabase no token.
      if (account?.providerAccountId && user) {
        try {
          const dbUser = await upsertUser({
            googleId: account.providerAccountId,
            email: user.email,
            nome: user.name || profile?.name,
            imagemUrl: user.image || profile?.picture,
          });
          token.userId = dbUser.id;
          token.googleId = account.providerAccountId;
        } catch (e) {
          console.error('NextAuth jwt callback — upsertUser falhou:', e.message);
          // Não bloqueia login. App opera sem userId Supabase (modo legado).
          // Sidney pode pegar logs e investigar.
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Propaga UUID Supabase pra session.user.id
      if (token.userId) {
        session.user.id = token.userId;
        session.user.googleId = token.googleId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
