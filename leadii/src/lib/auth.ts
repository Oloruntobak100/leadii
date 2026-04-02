import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * Placeholder NextAuth config until Supabase Auth replaces this.
 * Keeps API routes and middleware compiling; replace with real providers.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize() {
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; tenantId?: string };
        u.id = token.sub ?? '';
        u.tenantId = (token.tenantId as string) ?? token.sub ?? '';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
