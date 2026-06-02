import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { authConfig } from './auth.config'
import type { Role } from '@/generated/prisma/client'
import type { DefaultSession } from 'next-auth'

// 扩展 next-auth 类型
declare module 'next-auth' {
  interface User {
    role: Role
  }
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      phone?: string | null
      role: Role
    } & DefaultSession['user']
  }
  interface JWT {
    id: string
    role: Role
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: '账号密码',
      credentials: {
        phone: { label: '手机号', type: 'text' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone as string }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    }
  }
})
