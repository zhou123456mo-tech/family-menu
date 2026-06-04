import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  icon: z.string().optional().nullable(),
  sort: z.number().int().optional()
})

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { dishes: true }
        }
      },
      orderBy: { sort: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = categorySchema.parse(body)

    const category = await prisma.category.create({
      data: {
        name: data.name,
        icon: data.icon || null,
        sort: data.sort ?? 0
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: '分类创建成功',
      data: category 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(e => e.message).join(', ')
      return NextResponse.json({ error: messages }, { status: 400 })
    }
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: '创建分类失败，请重试' }, { status: 500 })
  }
}
