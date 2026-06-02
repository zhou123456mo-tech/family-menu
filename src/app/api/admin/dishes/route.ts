import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const dishSchema = z.object({
  name: z.string().min(1, '菜品名称不能为空'),
  description: z.string().optional(),
  price: z.number().positive('价格必须大于0'),
  image: z.string().optional(),
  categoryId: z.string().min(1, '请选择分类'),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional()
})

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
        description: data.description,
        price: data.price,
        image: data.image,
        categoryId: data.categoryId,
        status: data.status || 'AVAILABLE'
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(dish)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Failed to create dish:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
