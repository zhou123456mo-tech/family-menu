import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('[TEST] TURSO_DATABASE_URL:', tursoUrl)
  console.log('[TEST] TURSO_AUTH_TOKEN:', tursoToken ? '已设置' : '未设置')

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: '环境变量未设置' })
  }

  try {
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })

    const result = await client.execute('SELECT 1 as test')
    console.log('[TEST] 查询结果:', result)

    return NextResponse.json({
      success: true,
      message: 'Turso 连接成功',
      result: result.rows
    })
  } catch (error) {
    console.error('[TEST] 连接错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
