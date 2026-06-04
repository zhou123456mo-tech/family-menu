import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const dishSchema = z.object({
  name: z.string().min(1, '菜品名称不能为空'),
  description: z.string().optional(),
  price: z.number().positive('价格必须大于0'),
  image: z.string().optional().nullable(),
  categoryId: z.string().min(1, '请选择分类'),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional()
})

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')

    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status: status as 'AVAILABLE' | 'UNAVAILABLE' } : {})
    }

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        category: {
          select: { name: true, icon: true }
        },
        methods: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(dishes)
  } catch (error) {
    console.error('Failed to fetch dishes:', error)
    return NextResponse.json({ error: '获取菜品列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = dishSchema.parse(body)

    const dish = await prisma.dish.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        image: data.image || null,
        categoryId: data.categoryId,
        status: data.status || 'AVAILABLE'
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: '菜品创建成功',
      data: dish 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(e => e.message).join(', ')
      return NextResponse.json({ error: messages }, { status: 400 })
    }
    console.error('Failed to create dish:', error)
    return NextResponse.json({ error: '创建菜品失败，请重试' }, { status: 500 })
  }
}
