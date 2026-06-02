#!/bin/bash
# Cloudflare Pages 一键部署脚本

set -e

echo "🚀 开始构建..."
pnpm build

echo "📦 构建 Cloudflare Pages 版本..."
npx @cloudflare/next-on-pages

echo "🚀 部署到 Cloudflare Pages..."
wrangler pages deploy .vercel/output/static --project-name=family-menu

echo "✅ 部署完成！"
echo "🌐 访问地址: https://family-menu.pages.dev"
