import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { randomBytes } from 'crypto'

// 生成临时用户ID
function getOrCreateUserId(request: NextRequest): string {
  let userId = request.headers.get('x-user-id')

  if (!userId) {
    // 为游客生成临时ID
    userId = `guest_${randomBytes(8).toString('hex')}`
  }

  return userId
}

const cartItemSchema = z.object({
  dishId: z.string(),
  methodId: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  remark: z.string().optional()
})

export async function GET(request: NextRequest) {
  const userId = getOrCreateUserId(request)

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      dish: {
        include: { category: true }
      },
      method: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    items: cartItems,
    userId
  })
}

export async function POST(request: NextRequest) {
  const userId = getOrCreateUserId(request)

  try {
    const body = await request.json()
    const data = cartItemSchema.parse(body)

    // 检查是否已存在相同的购物车项
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        dishId: data.dishId,
        methodId: data.methodId || null
      }
    })

    if (existing) {
      // 更新数量
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + data.quantity,
          remark: data.remark || existing.remark
        },
        include: {
          dish: true,
          method: true
        }
      })
      return NextResponse.json(updated)
    }

    // 创建新的购物车项
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        dishId: data.dishId,
        methodId: data.methodId || null,
        quantity: data.quantity,
        remark: data.remark || null
      },
      include: {
        dish: true,
        method: true
      }
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
