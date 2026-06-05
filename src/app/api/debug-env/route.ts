import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? `${process.env.TURSO_DATABASE_URL.substring(0, 30)}...` : '未设置',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? '已设置' : '未设置',
    raw_turso_url: process.env.TURSO_DATABASE_URL,
    raw_turso_url_type: typeof process.env.TURSO_DATABASE_URL,
    raw_turso_url_length: process.env.TURSO_DATABASE_URL?.length,
  })
}
