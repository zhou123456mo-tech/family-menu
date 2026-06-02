import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { OrderStatus } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '10')
  const page = parseInt(searchParams.get('page') || '1')

  const where = status ? { status: status as OrderStatus } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            dish: {
              select: {
                name: true
              }
            },
            method: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    }),
    prisma.order.count({ where })
  ])

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString()
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  })
}
