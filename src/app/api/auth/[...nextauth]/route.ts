import { authOptions } from '@/lib/auth'
import NextAuth from 'next-auth'

/**
 * NextAuth App Router catch-all handler.
 * Mounted at /api/auth/* (signin, signout, session, callbacks, etc.).
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
