#!/bin/bash

# Turso 数据库迁移脚本
# 使用方法: ./scripts/migrate-turso.sh

set -e

echo "=== Turso 数据库迁移 ==="

# 检查环境变量
if [ -z "$TURSO_DATABASE_URL" ]; then
  echo "错误: 请设置 TURSO_DATABASE_URL 环境变量"
  echo "示例: export TURSO_DATABASE_URL='libsql://your-db.turso.io'"
  exit 1
fi

if [ -z "$TURSO_AUTH_TOKEN" ]; then
  echo "错误: 请设置 TURSO_AUTH_TOKEN 环境变量"
  echo "示例: export TURSO_AUTH_TOKEN='eyJhbGci...'"
  exit 1
fi

echo "TURSO_DATABASE_URL: $TURSO_DATABASE_URL"
echo "TURSO_AUTH_TOKEN: 已设置"

# 使用 libsql 连接需要特殊的 DATABASE_URL 格式
# Prisma 的 db push 会读取 DATABASE_URL
export DATABASE_URL="$TURSO_DATABASE_URL"

echo ""
echo "正在推送 schema 到 Turso..."
npx prisma db push --skip-generate --accept-data-loss

echo ""
echo "=== 迁移完成 ==="
echo "现在可以部署到 Vercel 了"
