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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const dish = await prisma.dish.findUnique({
    where: { id },
    include: {
      category: true,
      methods: true
    }
  })

  if (!dish) {
    return NextResponse.json({ error: '菜品不存在' }, { status: 404 })
  }

  return NextResponse.json(dish)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const data = dishSchema.parse(body)

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        categoryId: data.categoryId,
        status: data.status
      },
      include: {
        category: true,
        methods: true
      }
    })

    return NextResponse.json(dish)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Failed to update dish:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // 删除关联的做法
  await prisma.dishMethod.deleteMany({
    where: { dishId: id }
  })

  // 删除菜品
  await prisma.dish.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
