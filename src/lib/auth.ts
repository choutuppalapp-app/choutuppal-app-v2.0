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
 * Implements credentials and OAuth authentication with Prisma adapter.
 * Sessions use JWT strategy.
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
          const rawIdentifier = credentials?.identifier?.trim()
          const password = credentials?.password
          if (!rawIdentifier || !password) {
            return null
          }

          const key = rawIdentifier.toLowerCase()
          const phoneClean = rawIdentifier.replace(/[^\d+]/g, '')

          // Query user by email, username, or phone
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: key },
                { username: key },
                { phone: rawIdentifier },
                ...(phoneClean ? [{ phone: phoneClean }] : []),
              ],
            },
          })

          if (!user || !user.passwordHash) {
            return null
          }

          if (user.isBanned) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
          if (!isPasswordValid) {
            return null
          }

          // Return full user metadata including role for JWT session token
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
          console.error('[Auth authorize] Database exception or connection timeout during login:', err)
          return null
        }
      },
    }),
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
