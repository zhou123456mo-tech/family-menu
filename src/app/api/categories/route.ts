import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/categories'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('[Categories] 错误:', error)
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    )
  }
}
