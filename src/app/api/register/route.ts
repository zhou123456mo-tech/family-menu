import { NextRequest, NextResponse } from 'next/server'
import { findUserByPhone, createUser } from '@/lib/users'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  password: z.string().min(6, '密码至少6个字符')
})

export async function POST(request: NextRequest) {
  try {
    console.log('[Register] 开始处理注册请求')
    const body = await request.json()
    console.log('[Register] 请求体:', { ...body, password: '***' })
    const data = registerSchema.parse(body)

    // 检查手机号是否已注册
    console.log('[Register] 检查手机号:', data.phone)
    const existingUser = await findUserByPhone(data.phone)

    if (existingUser) {
      return NextResponse.json({ error: '该手机号已注册' }, { status: 400 })
    }

    // 创建用户（默认为管理员）
    console.log('[Register] 创建用户')
    const user = await createUser({
      name: data.name,
      phone: data.phone,
      password: data.password,
      role: 'ADMIN'
    })

    console.log('[Register] 用户创建成功:', user.id)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role
    })
  } catch (error) {
    console.error('[Register] 错误:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        error: '注册失败，请重试',
        detail: errorMessage
      },
      { status: 500 }
    )
  }
}
