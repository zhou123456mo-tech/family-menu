import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// 这个配置文件可以在 Edge Runtime 中运行
// 不包含数据库操作
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: '账号密码',
      credentials: {
        phone: { label: '手机号', type: 'text' },
        password: { label: '密码', type: 'password' }
      },
      authorize: async (credentials) => {
        // 这里返回 null，实际验证在 auth.ts 中进行
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isLoginPage = nextUrl.pathname === '/login'

      if (isAdminRoute && !isLoggedIn) {
        return false // 重定向到登录页
      }

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL('/admin', nextUrl))
      }

      return true
    }
  }
}
