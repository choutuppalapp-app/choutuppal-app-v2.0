import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'

/**
 * Full NextAuth options (Node runtime).
 *
 * Implements the Supabase-Auth requirements from the master blueprint using
 * NextAuth v4 + Prisma:
 *   - Email/Phone + Password  -> CredentialsProvider (bcrypt-hashed passwords)
 *   - Google OAuth            -> GoogleProvider (account auto-linked via adapter)
 *   - Password reset          -> custom token flow (see auth-password-reset.ts)
 *
 * Sessions use JWT (required for the Credentials provider). The PrismaAdapter
 * is still wired up so OAuth accounts/users/sessions are persisted to the DB.
 */

const useSecure = process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https://')

export const authOptions: NextAuthOptions = {
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || 'ChoutuppalAppV2SecretKey2026StableAndPersistentValueX9m2k7p4q',
  adapter: PrismaAdapter(prisma),
  useSecureCookies: useSecure,
  cookies: {
    sessionToken: {
      name: useSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecure,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          redirect_uri: `${(process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/auth/callback/google`,
        },
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email or Phone',
      credentials: {
        identifier: {
          label: 'Email, Phone or Username',
          type: 'text',
          placeholder: 'you@example.com, phone, or username',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const identifier = credentials?.identifier?.trim()
          const password = credentials?.password
          console.log('[Auth authorize] Attempt identifier:', identifier)
          if (!identifier || !password) {
            console.log('[Auth authorize] Missing identifier or password')
            return null
          }

          const key = identifier.toLowerCase()
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: key },
                { phone: identifier },
                { username: key },
              ],
            },
          })

          console.log('[Auth authorize] DB user lookup:', user ? `Found user ${user.id} (${user.email})` : 'User not found')
          if (!user || !user.passwordHash) return null
          if (user.isBanned) {
            console.log('[Auth authorize] User is banned:', user.email)
            return null
          }

          const ok = await bcrypt.compare(password, user.passwordHash)
          console.log('[Auth authorize] Password match:', ok)
          if (!ok) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            role: user.role,
            username: user.username,
            isPublic: user.isPublic,
          }
        } catch (err) {
          console.error('[Auth authorize] Exception or DB timeout error:', err)
          return null
        }
      },
    }),
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
