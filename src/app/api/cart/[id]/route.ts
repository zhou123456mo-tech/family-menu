import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  quantity: z.number().int().positive().optional(),
  remark: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: data.quantity,
        remark: data.remark
      }
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.cartItem.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
