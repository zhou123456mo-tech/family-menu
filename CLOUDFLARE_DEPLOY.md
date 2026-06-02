# Cloudflare Pages 部署指南

## 前置条件

1. Cloudflare 账号
2. 已安装 Wrangler CLI：`pnpm add -g wrangler`

## 部署步骤

### 1. 登录 Cloudflare
```bash
npx wrangler login
```

### 2. 创建 D1 数据库（替代 SQLite）
```bash
# 创建数据库
npx wrangler d1 create home-menu-db

# 记录返回的 database_id，更新到 wrangler.toml
```

### 3. 配置环境变量

在 Cloudflare Dashboard 中配置：
- `DATABASE_URL` - D1 数据库连接串
- `NEXTAUTH_SECRET` - JWT 密钥
- `NEXTAUTH_URL` - 应用地址

或使用命令行：
```bash
npx wrangler pages secret put NEXTAUTH_SECRET
npx wrangler pages secret put DATABASE_URL
```

### 4. 部署
```bash
# 本地构建并部署
pnpm pages:deploy

# 或分步执行
pnpm build
pnpm pages:build
npx wrangler pages deploy .vercel/output/static
```

## 注意事项

### 数据库兼容性
- **SQLite 不支持**：Cloudflare Workers 不支持 SQLite
- **解决方案**：使用 Cloudflare D1（SQLite 兼容）或外部数据库

### Prisma 适配
需要修改 Prisma schema 使用 D1：

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  # 添加 D1 支持
  relationMode = "prisma"
}
```

### 功能限制
| 功能 | 支持 | 说明 |
|------|------|------|
| ISR/SSR | ✅ | 通过 @cloudflare/next-on-pages |
| API Routes | ✅ | 转换为 Cloudflare Functions |
| Image Optimization | ❌ | 需使用外部图片服务 |
| SQLite | ❌ | 使用 D1 或其他云数据库 |

## 本地开发

```bash
# 使用 Cloudflare 本地模拟
pnpm pages:dev
```

## 项目结构

```
home-menu/
├── wrangler.toml      # Cloudflare 配置
├── .vercel/           # 构建输出目录
├── prisma/            # 数据库 schema
└── src/               # 源代码
```

## 常见问题

### 1. 数据库连接失败
确保 D1 数据库已创建并正确绑定到 Pages 项目。

### 2. 构建失败
检查 Node.js 版本是否为 18+。

### 3. API 路由 404
确保 `@cloudflare/next-on-pages` 已正确转换 API 路由。
