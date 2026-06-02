import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const dish = await prisma.dish.findUnique({
    where: {
      id,
      status: 'AVAILABLE'
    },
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
