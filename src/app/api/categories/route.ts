import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { dishes: { where: { status: 'AVAILABLE' } } }
      }
    },
    orderBy: { sort: 'asc' }
  })

  return NextResponse.json(categories)
}
