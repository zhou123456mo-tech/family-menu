import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('[DB] 创建 PrismaClient')
  console.log('[DB] NODE_ENV:', process.env.NODE_ENV)
  console.log('[DB] VERCEL_ENV:', process.env.VERCEL_ENV)
  console.log('[DB] TURSO_DATABASE_URL:', tursoUrl ? `${tursoUrl.substring(0, 40)}...` : '未设置')
  console.log('[DB] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  // 如果有 Turso 配置，使用 Turso（适用于生产和开发环境）
  if (tursoUrl && tursoUrl !== 'undefined' && tursoToken && tursoToken !== 'undefined') {
    console.log('[DB] 使用 Turso 连接')
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSQL(libsql as any)
    return new PrismaClient({ adapter } as any)
  }

  // 否则使用本地 SQLite
  console.log('[DB] 使用本地 SQLite')
  return new PrismaClient({
    log: ['query', 'error', 'warn']
  })
}

// 开发环境缓存，生产环境每次都创建新实例
export const prisma = process.env.NODE_ENV !== 'production'
  ? (globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient()))
  : createPrismaClient()

export default prisma
