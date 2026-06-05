import { getDb } from './db-sql'

export interface Category {
  id: string
  name: string
  icon: string | null
  sort: number
  createdAt: string
  updatedAt: string
}

export interface CategoryWithCount extends Category {
  _count: { dishes: number }
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<CategoryWithCount[]> {
  const db = getDb()

  const result = await db.execute(`
    SELECT
      c.*,
      COUNT(d.id) as dishCount
    FROM Category c
    LEFT JOIN Dish d ON c.id = d.categoryId AND d.status = 'AVAILABLE'
    GROUP BY c.id
    ORDER BY c.sort ASC
  `)

  return result.rows.map(row => ({
    id: row.id as string,
    name: row.name as string,
    icon: row.icon as string | null,
    sort: row.sort as number,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
    _count: { dishes: row.dishCount as number }
  }))
}

/**
 * 根据 ID 获取分类
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getDb()
  const result = await db.execute({
    sql: 'SELECT * FROM Category WHERE id = ?',
    args: [id]
  })

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0] as unknown as Category
}

/**
 * 创建分类
 */
export async function createCategory(data: {
  name: string
  icon?: string
  sort?: number
}): Promise<Category> {
  const db = getDb()
  const id = generateId()
  const now = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO Category (id, name, icon, sort, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, data.name, data.icon || null, data.sort || 0, now, now]
  })

  const category = await getCategoryById(id)
  if (!category) {
    throw new Error('创建分类失败')
  }

  return category
}

/**
 * 更新分类
 */
export async function updateCategory(id: string, data: {
  name?: string
  icon?: string
  sort?: number
}): Promise<Category | null> {
  const db = getDb()
  const now = new Date().toISOString()

  const sets: string[] = ['updatedAt = ?']
  const args: any[] = [now]

  if (data.name !== undefined) {
    sets.push('name = ?')
    args.push(data.name)
  }
  if (data.icon !== undefined) {
    sets.push('icon = ?')
    args.push(data.icon)
  }
  if (data.sort !== undefined) {
    sets.push('sort = ?')
    args.push(data.sort)
  }

  args.push(id)

  await db.execute({
    sql: `UPDATE Category SET ${sets.join(', ')} WHERE id = ?`,
    args
  })

  return getCategoryById(id)
}

/**
 * 删除分类
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const db = getDb()

  // 检查是否有菜品使用此分类
  const dishes = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM Dish WHERE categoryId = ?',
    args: [id]
  })

  if ((dishes.rows[0] as any).count > 0) {
    throw new Error('该分类下有菜品，无法删除')
  }

  await db.execute({
    sql: 'DELETE FROM Category WHERE id = ?',
    args: [id]
  })

  return true
}

function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}${random}`
}
