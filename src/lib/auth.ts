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
          console.log('[Auth authorize] Login attempt for identifier:', rawIdentifier)

          if (!rawIdentifier || !password) {
            console.log('[Auth authorize] Missing identifier or password')
            return null
          }

          const key = rawIdentifier.toLowerCase()
          const phoneClean = rawIdentifier.replace(/[^\d+]/g, '')

          // Query user by email, username, or phone (case-insensitive)
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: key, mode: 'insensitive' } },
                { username: { equals: key, mode: 'insensitive' } },
                { phone: rawIdentifier },
                ...(phoneClean ? [{ phone: phoneClean }] : []),
              ],
            },
          })

          if (!user) {
            console.log(`[Auth authorize] User NOT found for identifier: ${rawIdentifier}`)
            return null
          }

          console.log(`[Auth authorize] User found: ${user.email || user.username || user.id} | Role: ${user.role}`)

          if (!user.passwordHash) {
            console.log(`[Auth authorize] User ${user.email} has no password hash set`)
            return null
          }

          if (user.isBanned) {
            console.log(`[Auth authorize] User ${user.email} is banned`)
            return null
          }

          let isPasswordValid = await bcrypt.compare(password, user.passwordHash)
          if (!isPasswordValid) {
            // Check plaintext fallback match (e.g. initial setup)
            if (password === user.passwordHash) {
              isPasswordValid = true
              console.log('[Auth authorize] Plaintext password match validated')
            }
          }

          console.log(`[Auth authorize] Password match result for ${user.email}: ${isPasswordValid ? 'MATCH' : 'MISMATCH'}`)

          if (!isPasswordValid) {
            return null
          }

          console.log(`[Auth authorize] Login SUCCESSFUL for ${user.email} (Role: ${user.role})`)

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            role: user.role,
            username: user.username,
            isPublic: user.isPublic,
          }
        } catch (error) {
          console.error("Login DB/Server Error:", error)
          return null
        }
      },
    }),
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
