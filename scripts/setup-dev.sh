#!/bin/bash
# 初始化开发环境配置

cd "$(dirname "$0")/.."

# 获取项目根目录的绝对路径
PROJECT_ROOT=$(pwd)

# 创建 .env.development 文件
cat > .env.development << EOF
# ========================================
# 开发环境配置 (自动生成)
# ========================================

# 数据库 - SQLite 绝对路径
DATABASE_URL="file:${PROJECT_ROOT}/prisma/dev.db"

# NextAuth.js 密钥
NEXTAUTH_SECRET="dev-secret-key-do-not-use-in-production"

# 开发服务器地址
NEXTAUTH_URL="http://localhost:3000"
EOF

echo "✅ 已生成 .env.development"
echo "   数据库路径: ${PROJECT_ROOT}/prisma/dev.db"

# 检查数据库是否存在
if [ ! -f "prisma/dev.db" ]; then
  echo "📦 初始化数据库..."
  pnpm exec prisma migrate dev
  pnpm exec tsx prisma/seed.ts
fi

echo "🚀 运行 pnpm dev 启动开发服务器"
