import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production'
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // 调试：输出环境变量实际值
  console.log('[DB] 创建 PrismaClient')
  console.log('[DB] NODE_ENV:', process.env.NODE_ENV)
  console.log('[DB] TURSO_DATABASE_URL:', tursoUrl ? `${tursoUrl.substring(0, 30)}...` : '未设置')
  console.log('[DB] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  // 生产环境必须使用 Turso
  if (isProduction) {
    if (!tursoUrl || tursoUrl === 'undefined' || !tursoToken || tursoToken === 'undefined') {
      throw new Error(
        `生产环境必须正确设置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN 环境变量`
      )
    }
    console.log('[DB] 使用 Turso 连接:', tursoUrl)
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

// 延迟初始化：只在真正使用时才创建客户端
let _prisma: PrismaClient | undefined

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!_prisma) {
      _prisma = createPrismaClient()
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = _prisma
      }
    }
    return (_prisma as any)[prop]
  }
})

export default prisma
