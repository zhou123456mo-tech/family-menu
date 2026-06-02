import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { randomBytes } from 'crypto'

function getOrCreateUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || `guest_${randomBytes(8).toString('hex')}`
}

const orderItemSchema = z.object({
  dishId: z.string(),
  methodId: z.string().optional().nullable(),
  quantity: z.number().int().positive(),
  remark: z.string().optional().nullable()
})

const orderSchema = z.object({
  tableNo: z.string().optional().nullable(),
  remark: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, '至少选择一个菜品')
})

export async function POST(request: NextRequest) {
  const userId = getOrCreateUserId(request)

  try {
    const body = await request.json()
    const data = orderSchema.parse(body)

    // 计算总价
    let totalAmount = 0
    const orderItems = []

    for (const item of data.items) {
      const dish = await prisma.dish.findUnique({
        where: { id: item.dishId }
      })

      if (!dish) {
        return NextResponse.json(
          { error: `菜品 ${item.dishId} 不存在` },
          { status: 400 }
        )
      }

      let methodPrice = 0
      if (item.methodId) {
        const method = await prisma.dishMethod.findUnique({
          where: { id: item.methodId }
        })
        methodPrice = method?.price || 0
      }

      const itemTotal = (dish.price + methodPrice) * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        dishId: item.dishId,
        methodId: item.methodId,
        quantity: item.quantity,
        price: dish.price + methodPrice,
        remark: item.remark
      })
    }

    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId,
        tableNo: data.tableNo,
        remark: data.remark,
        totalAmount,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            dish: true,
            method: true
          }
        }
      }
    })

    // 清空购物车
    await prisma.cartItem.deleteMany({
      where: { userId }
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
