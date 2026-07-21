import { DefaultSession } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

/**
 * NextAuth type augmentations — exposes role / username / isPublic on the
 * session user and JWT so middleware and server components can read them.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      username?: string | null
      isPublic: boolean
    } & DefaultSession['user']
  }

  interface User {
    role?: string
    username?: string | null
    isPublic?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    role?: string
    username?: string | null
    isPublic?: boolean
  }
}
