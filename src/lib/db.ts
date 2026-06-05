import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient, type Client } from '@libsql/client'

// 全局缓存
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var __libsqlClient: Client | undefined
}

/**
 * 创建 Turso libsql 客户端
 */
function createTursoClient(): Client {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN

  if (!url || url === 'undefined' || !token || token === 'undefined') {
    throw new Error('[DB] Turso 环境变量未设置')
  }

  console.log('[DB] 创建 Turso 客户端:', url)

  return createClient({ url, authToken: token })
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

    // 复用或创建 libsql 客户端
    const libsql = globalThis.__libsqlClient ?? createTursoClient()
    if (process.env.NODE_ENV !== 'production') {
      globalThis.__libsqlClient = libsql
    }

    const adapter = new PrismaLibSQL(libsql)
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

// 导出工厂函数
export const prisma = getPrisma()
export default prisma
