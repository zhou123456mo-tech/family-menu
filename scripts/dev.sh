#!/bin/bash

# 获取脚本所在目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 生成 .env.development
cat > "$PROJECT_DIR/.env.development" << EOF
# ========================================
# 开发环境配置 - 自动生成
# ========================================

# 数据库 - SQLite (绝对路径)
DATABASE_URL="file:$PROJECT_DIR/prisma/dev.db"

# NextAuth.js 密钥 (开发环境)
NEXTAUTH_SECRET="dev-secret-key-do-not-use-in-production"

# 开发服务器地址
NEXTAUTH_URL="http://localhost:3000"
EOF

echo "✅ .env.development 已生成"
echo "📁 DATABASE_URL: file:$PROJECT_DIR/prisma/dev.db"

# 启动开发服务器
cd "$PROJECT_DIR"
pnpm dev
