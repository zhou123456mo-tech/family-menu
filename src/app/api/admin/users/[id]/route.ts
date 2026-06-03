import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // 不能修改自己的角色
    if (id === session.user.id) {
      return NextResponse.json({ error: '不能修改自己的角色' }, { status: 400 })
    }

    const { role } = await request.json()
    
    if (!['ADMIN', 'USER'].includes(role)) {
      return NextResponse.json({ error: '无效的角色' }, { status: 400 })
    }

    // 检查是否是最后一个管理员
    if (role === 'USER') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true }
      })
      if (targetUser?.role === 'ADMIN' && adminCount <= 1) {
        return NextResponse.json({ error: '不能移除最后一个管理员' }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // 不能删除自己
    if (id === session.user.id) {
      return NextResponse.json({ error: '不能删除自己' }, { status: 400 })
    }

    // 检查是否是最后一个管理员
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    })
    
    if (targetUser?.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })
      if (adminCount <= 1) {
        return NextResponse.json({ error: '不能删除最后一个管理员' }, { status: 400 })
      }
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 })
  }
}
