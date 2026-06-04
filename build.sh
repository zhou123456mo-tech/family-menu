#!/bin/bash

# 设置默认 DATABASE_URL 用于构建
export DATABASE_URL="${DATABASE_URL:-file:./prisma/dev.db}"

# 运行 Prisma 命令
npx prisma generate
npx prisma migrate deploy

# 构建 Next.js
next build
