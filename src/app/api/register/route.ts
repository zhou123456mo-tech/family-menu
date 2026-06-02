import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  password: z.string().min(6, '密码至少6个字符')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // 创建用户（默认为管理员）
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 })
  }
}
