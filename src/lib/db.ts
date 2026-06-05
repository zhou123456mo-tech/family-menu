import { PrismaClient } from '@/generated/prisma/client'

let prisma: PrismaClient

// 在运行时初始化，而不是模块加载时
function getPrismaClient(): PrismaClient {
  if (prisma) return prisma

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('[DB] 初始化 PrismaClient')
  console.log('[DB] TURSO_DATABASE_URL:', tursoUrl ? '已设置' : '未设置')
  console.log('[DB] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  // 如果有 Turso 配置，使用 Turso adapter
  if (tursoUrl && tursoUrl !== 'undefined' && tursoToken && tursoToken !== 'undefined') {
    console.log('[DB] 使用 Turso 连接')
    // 动态导入避免在构建时加载
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSQL(libsql)
    prisma = new PrismaClient({ adapter } as any)
    return prisma
  }

  // 否则使用本地 SQLite
  console.log('[DB] 使用本地 SQLite')
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  })
  return prisma
}

// 使用 getter 延迟初始化
const dbHandler = {
  get(target: any, prop: string) {
    const client = getPrismaClient()
    return client[prop as keyof PrismaClient]
  }
}

export const prisma = new Proxy({} as PrismaClient, dbHandler)

export default prisma
