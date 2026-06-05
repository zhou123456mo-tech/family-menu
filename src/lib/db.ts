import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

let prismaInstance: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
  if (prismaInstance) return prismaInstance

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('[DB] 初始化 PrismaClient')
  console.log('[DB] TURSO_DATABASE_URL:', tursoUrl ? '已设置' : '未设置')
  console.log('[DB] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  // 如果有 Turso 配置，使用 Turso adapter
  if (tursoUrl && tursoUrl !== 'undefined' && tursoToken && tursoToken !== 'undefined') {
    console.log('[DB] 使用 Turso 连接:', tursoUrl)
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSQL(libsql as any)
    prismaInstance = new PrismaClient({ adapter } as any)
    return prismaInstance
  }

  // 否则使用本地 SQLite
  console.log('[DB] 使用本地 SQLite')
  prismaInstance = new PrismaClient({
    log: ['query', 'error', 'warn']
  })
  return prismaInstance
}

// 延迟初始化的 getter
let _prisma: PrismaClient | null = null

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!_prisma) {
      _prisma = getPrismaClient()
    }
    const value = (_prisma as any)[prop]
    if (typeof value === 'function') {
      return value.bind(_prisma)
    }
    return value
  }
})

export default prisma
