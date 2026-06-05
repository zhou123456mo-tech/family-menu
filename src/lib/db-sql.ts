import { createClient, type Client } from '@libsql/client'

// 全局缓存
declare global {
  // eslint-disable-next-line no-var
  var __tursoClient: Client | undefined
}

let _client: Client | undefined

/**
 * 获取 Turso/libsql 客户端
 */
export function getDb(): Client {
  if (_client) return _client

  // 开发环境检查全局缓存
  if (process.env.NODE_ENV !== 'production' && globalThis.__tursoClient) {
    _client = globalThis.__tursoClient
    return _client
  }

  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN

  console.log('[DB] 初始化 libsql 客户端')
  console.log('[DB] TURSO_DATABASE_URL:', url ? '已设置' : '未设置')
  console.log('[DB] TURSO_AUTH_TOKEN:', token ? '已设置' : '未设置')

  // 生产环境使用 Turso
  if (url && url !== 'undefined' && token && token !== 'undefined') {
    console.log('[DB] 连接 Turso:', url)
    _client = createClient({ url, authToken: token })
  } else {
    // 本地开发使用 SQLite 文件
    console.log('[DB] 使用本地 SQLite')
    _client = createClient({ url: 'file:./prisma/dev.db' })
  }

  // 开发环境缓存
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__tursoClient = _client
  }

  return _client
}

// 导出客户端实例（延迟初始化）
export const db = new Proxy({} as Client, {
  get(_, prop) {
    const client = getDb()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

export default db
