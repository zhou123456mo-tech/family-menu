import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // 1. 验证登录和管理员权限
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 获取文件
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 })
    }

    // 3. 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPG、PNG、WebP、GIF 格式' }, { status: 400 })
    }

    // 4. 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过 5MB' }, { status: 400 })
    }

    // 5. 生成文件名并保存
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const dir = path.join(process.cwd(), 'public/images/dishes')

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    const filePath = path.join(dir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // 6. 返回可访问的路径
    return NextResponse.json({
      url: `/images/dishes/${fileName}`,
      fileName
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
