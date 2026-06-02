# 直接从 Gitee 部署到 Cloudflare Pages

## 方案：使用 Cloudflare Pages Direct Upload

由于 Cloudflare Pages 不直接支持 Gitee，我们使用 **Direct Upload** 方式部署。

---

## 步骤 1：安装 Wrangler CLI

```bash
pnpm add -g wrangler
```

---

## 步骤 2：登录 Cloudflare

```bash
wrangler login
```

---

## 步骤 3：创建 Pages 项目

```bash
wrangler pages project create family-menu
```

---

## 步骤 4：部署

### 本地手动部署

```bash
# 构建
pnpm build
npx @cloudflare/next-on-pages

# 部署
wrangler pages deploy .vercel/output/static --project-name=family-menu
```

### 或使用一键脚本

我已为你创建部署脚本：
```bash
./scripts/deploy-cloudflare.sh
```

---

## 步骤 5：配置环境变量

在 Cloudflare Dashboard 配置：

1. 打开 https://dash.cloudflare.com → Pages → family-menu → Settings
2. 添加环境变量：
   - `DATABASE_URL` - 数据库连接
   - `NEXTAUTH_SECRET` - JWT 密钥
   - `NEXTAUTH_URL` - `https://family-menu.pages.dev`

---

## 步骤 6：绑定自定义域名（可选）

```bash
wrangler pages domain add family-menu.pages.dev --project-name=family-menu
```

---

## 自动化部署（可选）

可以创建 Gitee Go CI 流水线，或在本地使用 Git Hooks 自动部署。
