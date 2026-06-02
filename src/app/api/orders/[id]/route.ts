import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          dish: {
            select: { name: true }
          },
          method: {
            select: { name: true }
          }
        }
      }
    }
  })

  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 })
  }

  return NextResponse.json({
    ...order,
    createdAt: order.createdAt.toISOString()
  })
}
