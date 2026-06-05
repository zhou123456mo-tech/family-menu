import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

// 全局缓存
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined
}

/**
 * 获取 Prisma 客户端实例
 */
export function getPrisma(): PrismaClient {
  // 开发环境使用全局缓存
  if (process.env.NODE_ENV !== 'production') {
    if (globalThis.__prismaClient) {
      return globalThis.__prismaClient
    }
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('[DB] 初始化 Prisma')
  console.log('[DB] TURSO_DATABASE_URL:', tursoUrl ? '已设置' : '未设置')
  console.log('[DB] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  let client: PrismaClient

  // 优先使用 Turso
  if (tursoUrl && tursoUrl !== 'undefined' && tursoToken && tursoToken !== 'undefined') {
    console.log('[DB] 使用 Turso adapter')

    // PrismaLibSQL 构造函数接受 Config 对象，不是 Client
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken,
    })

    client = new PrismaClient({ adapter } as any)
  } else {
    // 本地 SQLite
    console.log('[DB] 使用本地 SQLite')
    client = new PrismaClient({
      log: ['query', 'error', 'warn']
    })
  }

  // 缓存
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prismaClient = client
  }

  return client
}

// 导出
export const prisma = getPrisma()
export default prisma
