import { getDb } from './db-sql'
import bcrypt from 'bcryptjs'

export type Role = 'ADMIN' | 'USER'

export interface User {
  id: string
  name: string
  phone: string | null
  password: string
  role: Role
  createdAt: string
  updatedAt: string
}

/**
 * 根据手机号查找用户
 */
export async function findUserByPhone(phone: string): Promise<User | null> {
  const db = getDb()
  const result = await db.execute({
    sql: 'SELECT * FROM User WHERE phone = ?',
    args: [phone]
  })

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as unknown as User
}

/**
 * 根据 ID 查找用户
 */
export async function findUserById(id: string): Promise<User | null> {
  const db = getDb()
  const result = await db.execute({
    sql: 'SELECT * FROM User WHERE id = ?',
    args: [id]
  })

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as unknown as User
}

/**
 * 创建用户
 */
export async function createUser(data: {
  name: string
  phone: string
  password: string
  role?: Role
}): Promise<User> {
  const db = getDb()
  const id = generateId()
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const now = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO User (id, name, phone, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.name, data.phone, hashedPassword, data.role || 'USER', now, now]
  })

  const user = await findUserById(id)
  if (!user) {
    throw new Error('创建用户失败')
  }

  return user
}

/**
 * 验证密码
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * 生成 CUID 格式的 ID
 */
function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}${random}`
}
