#!/bin/bash

# Turso 数据库设置脚本

set -e

echo "=== Turso 数据库设置 ==="

# 检查是否有 turso CLI
if ! command -v turso &> /dev/null; then
  echo "错误: 未找到 turso CLI"
  echo "请先安装: curl -sSfL https://get.turso.tech/install.sh | bash"
  exit 1
fi

# 检查数据库是否存在
echo "检查 Turso 数据库..."
DB_NAME="menu-zhoumo"

# 获取数据库信息
echo ""
echo "请确保已登录 Turso: turso auth login"
echo ""
echo "执行以下命令推送 schema 到 Turso:"
echo ""
echo "  # 方法1: 直接执行 SQL"
echo "  sqlite3 prisma/dev.db .schema | turso db shell $DB_NAME"
echo ""
echo "  # 或者分步骤:"
echo "  sqlite3 prisma/dev.db .schema > /tmp/schema.sql"
echo "  turso db shell $DB_NAME < /tmp/schema.sql"
echo ""
