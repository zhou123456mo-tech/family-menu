import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production'
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // 调试：输出环境变量状态
  console.log('[DB] NODE_ENV:', process.env.NODE_ENV)
  console.log('[DB] TURSO_DATABASE_URL:', tursoUrl ? '已设置' : '未设置')
  console.log('[DB] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  // 生产环境必须使用 Turso
  if (isProduction) {
    if (!tursoUrl || !tursoToken) {
      throw new Error(
        `生产环境必须设置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN 环境变量。当前: URL=${tursoUrl ? '有' : '无'}, TOKEN=${tursoToken ? '有' : '无'}`
      )
    }
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSQL(libsql as any)
    return new PrismaClient({ adapter } as any)
  }

  // 本地开发使用 SQLite
  console.log('[DB] 使用本地 SQLite')
  return new PrismaClient({
    log: ['query', 'error', 'warn']
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
