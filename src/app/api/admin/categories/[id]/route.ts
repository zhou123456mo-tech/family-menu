import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  icon: z.string().optional(),
  sort: z.number().int().optional()
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

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { dishes: true }
      }
    }
  })

  if (!category) {
    return NextResponse.json({ error: '分类不存在' }, { status: 404 })
  }

  return NextResponse.json(category)
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
    const data = categorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        icon: data.icon,
        sort: data.sort
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
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

  const dishesCount = await prisma.dish.count({
    where: { categoryId: id }
  })

  if (dishesCount > 0) {
    return NextResponse.json(
      { error: '该分类下还有菜品，无法删除' },
      { status: 400 }
    )
  }

  await prisma.category.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
