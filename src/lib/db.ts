import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

// 全局缓存
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined
}

let _prisma: PrismaClient | undefined

/**
 * 获取 Prisma 客户端实例（延迟初始化）
 */
function getPrisma(): PrismaClient {
  // 已经初始化过
  if (_prisma) return _prisma

  // 开发环境检查全局缓存
  if (process.env.NODE_ENV !== 'production' && globalThis.__prismaClient) {
    _prisma = globalThis.__prismaClient
    return _prisma
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('[DB-v3] 初始化 Prisma')
  console.log('[DB-v3] TURSO_DATABASE_URL:', tursoUrl ? '已设置' : '未设置')
  console.log('[DB-v3] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  // 优先使用 Turso
  if (tursoUrl && tursoUrl !== 'undefined' && tursoToken && tursoToken !== 'undefined') {
    console.log('[DB-v3] 使用 Turso adapter')

    // 方法1: 使用 createClient 创建客户端
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })

    // 传递客户端实例
    const adapter = new PrismaLibSQL(libsql as any)
    _prisma = new PrismaClient({ adapter } as any)
  } else {
    // 本地 SQLite
    console.log('[DB-v3] 使用本地 SQLite')
    _prisma = new PrismaClient({
      log: ['query', 'error', 'warn']
    })
  }

  // 开发环境缓存
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prismaClient = _prisma
  }

  return _prisma
}

// 使用 Proxy 延迟初始化
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrisma()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

export default prisma
