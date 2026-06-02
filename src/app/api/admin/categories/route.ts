import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  icon: z.string().optional(),
  sort: z.number().int().optional()
})

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { dishes: true }
      }
    },
    orderBy: { sort: 'asc' }
  })

  return NextResponse.json(categories)
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
        icon: data.icon,
        sort: data.sort ?? 0
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
