import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalDishes, todayOrders, pendingOrders, todayRevenueResult] = await Promise.all([
    prisma.dish.count({ where: { status: 'AVAILABLE' } }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    }),
    prisma.order.count({
      where: {
        status: 'PENDING'
      }
    }),
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: today
        },
        status: {
          not: 'CANCELLED'
        }
      },
      _sum: {
        totalAmount: true
      }
    })
  ])

  return NextResponse.json({
    totalDishes,
    todayOrders,
    pendingOrders,
    todayRevenue: todayRevenueResult._sum.totalAmount || 0
  })
}
