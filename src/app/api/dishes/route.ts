import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const dishes = await prisma.dish.findMany({
    where: {
      status: 'AVAILABLE'
    },
    include: {
      category: {
        select: { id: true, name: true, icon: true, sort: true }
      },
      methods: true
    },
    orderBy: [
      { createdAt: 'desc' }
    ]
  })

  return NextResponse.json(dishes)
}
