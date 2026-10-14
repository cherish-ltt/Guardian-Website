<div align="center">
  <h1>Guardian-Website</h1>
  <h3>认证系统前端项目</h3>
  <p>
    <a href="https://github.com/cherish-ltt/Guardian">
      <img src="https://img.shields.io/badge/backend-Rust-orange.svg" alt="Backend"/>
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-16.1.1-black.svg" alt="Next.js"/>
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC.svg" alt="Tailwind CSS"/>
    </a>
    <a href="https://ui.shadcn.com/">
      <img src="https://img.shields.io/badge/shadcn/ui-v1.0-000000.svg" alt="shadcn/ui"/>
    </a>
  </p>
  <p>
  	<img src="https://github.com/cherish-ltt/Guardian-Website/blob/main/public/show-login.png" alt="show-png"/>
  </p>
</div>

**本项目是前端项目库，现[Guardian](https://github.com/cherish-ltt/Guardian)项目的前后端项目合并在一个仓库内，因此本项目归档不再更新，请直接使用[Guardian](https://github.com/cherish-ltt/Guardian)完整项目即可**

基于 Next.js 16、React 19、Tailwind CSS 和 shadcn/ui 构建的现代化前端应用，为  [Guardian](https://github.com/cherish-ltt/Guardian) 后端认证系统提供完整的 Web 界面。

## 📖 项目简介

Guardian-Website 是 Guardian 后端认证系统的配套前端项目，提供用户友好的 Web 界面来管理认证、授权和相关业务功能。该项目采用最新的前端技术栈，专注于提供优秀的用户体验和高性能的交互体验。

## ✨ 核心特性

### 🔐 完整的认证流程
- **用户登录** - 支持用户名密码登录
- **双因素认证 (2FA)** - TOTP 协议支持，二维码扫描
- **JWT 令牌管理** - 自动刷新和令牌存储
- **会话管理** - 自动登出和会话维护

### 🎨 现代化 UI 设计
- **shadcn/ui 组件** - 基于 Radix UI 的无障碍组件库
- **Tailwind CSS v4** - 最新版本的实用优先 CSS 框架
- **响应式布局** - 完美适配桌面和移动设备
- **暗色主题支持** - 支持浅色/深色模式切换

### 🚀 高性能架构
- **Next.js App Router** - 最新的文件系统路由
- **React Server Components** - 服务器端组件优化性能
- **TypeScript** - 类型安全的开发体验
- **Turbopack** - 极速开发服务器

### 🔌 完善的 API 集成
- **统一 API 客户端** - 封装的 API 请求管理
- **错误处理** - 统一的错误处理机制
- **Token 管理** - 自动处理认证令牌
- **类型安全** - 完整的 TypeScript 类型定义

## 🛠 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js** | 16.1.1 | React 框架 |
| **React** | 19.2.3 | UI 库 |
| **TypeScript** | 5 | 类型安全 |
| **Tailwind CSS** | 4 | CSS 框架 |
| **shadcn/ui** | Latest | UI 组件库 |
| **Radix UI** | Latest | 无障碍 UI 原语 |
| **Lucide React** | 0.562.0 | 图标库 |
| **pnpm** | Latest | 包管理器 |

## 📦 项目结构

```
guardian-website/
├── app/                   # Next.js App Router 页面
│   ├── dashboard/         # 仪表板页面
│   ├── 2fa/               # 双因素认证页面
│   ├── login/             # 登录页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/                # shadcn/ui 组件
│   ├── login-form.tsx     # 登录表单
│   └── step-2FA.tsx       # 2FA 步骤组件
├── lib/                   # 工具库
│   ├── api.ts             # API 客户端
│   ├── config.ts          # 配置文件
│   └── utils.ts           # 工具函数
├── public/                # 静态资源
│   ├── login-background*.png  # 登录背景图
│   └── *.svg              # 图标和图形
├── api-v1.0.md            # Guardian API 文档
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── next.config.ts         # Next.js 配置
└── components.json        # shadcn/ui 配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- pnpm 8+
- Guardian 后端服务运行在 `http://localhost:6123`

### 1. 克隆项目

```bash
git clone https://github.com/cherish-ltt/Guardian-Website.git
cd guardian-website
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:6123/guardian-auth/v1
```

### 4. 启动开发服务器

```bash
pnpm dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动

### 5. 构建生产版本

```bash
pnpm build
pnpm start
```

## 📚 API 集成

### API 基础配置

所有 API 请求都通过 `lib/api.ts` 中的封装函数进行，自动处理：

- 统一的响应格式
- 错误处理
- JWT 令牌管理
- TypeScript 类型安全

### 认证流程

1. **用户登录**
   ```typescript
   const { access_token, refresh_token } = await post<LoginResponse>(
     '/auth/login',
     { username, password }
   );
   ```

2. **设置 2FA**
   ```typescript
   const { secret, qr_code_url, backup_codes } = await postWithAuth<TwoFASetupResponse>(
     '/auth/2fa/setup'
   );
   ```

3. **访问受保护资源**
   ```typescript
   const data = await getWithAuth<ResourceType>('/protected-endpoint');
   ```

### API 文档

详细的 API 文档请参考 [api-v1.0.md](https://github.com/cherish-ltt/Guardian-Website/blob/main/api-v1.0.md)。

### 后端项目

 [Guardian 后端项目](https://github.com/cherish-ltt/Guardian)

## 🔧 开发指南

### 添加新页面

在 `app/` 目录下创建新文件夹和 `page.tsx`：

```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### 添加新 API 端点

在 `lib/config.ts` 中添加端点：

```typescript
export const API_ENDPOINTS = {
  // ...existing endpoints
  NEW_ENDPOINT: '/new-endpoint',
} as const;
```

在 `lib/api.ts` 中添加请求函数：

```typescript
export async function newEndpointApi(data: any): Promise<ResponseType> {
  return post<ResponseType>(API_ENDPOINTS.NEW_ENDPOINT, data);
}
```

### 添加 shadcn/ui 组件

```bash
npx shadcn@latest add [component-name]
```

### 代码规范

- 使用 TypeScript 类型
- 遵循 React Hooks 规则
- 使用组件化的思维编写代码
- 保持代码简洁和可读性

## 📦 可用脚本

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行 ESLint
pnpm lint
```

## 🔐 安全特性

### 前端安全

- **JWT 令牌存储** - 安全的 localStorage 管理
- **CSRF 保护** - 通过 SameSite Cookie（后端实现）
- **XSS 防护** - React 默认的 XSS 防护
- **HTTPS 推荐** - 生产环境建议使用 HTTPS

### 密码安全

- 密码在客户端通过 HTTPS 加密传输
- 后端使用 Argon2 进行哈希存储
- 支持 2FA 双因素认证

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📜 License

本项目采用 MIT 许可证 - 详见 [LICENSE](https://github.com/cherish-ltt/Guardian-Website/blob/main/LICENSE) 文件。

## 🔗 相关链接

- [Guardian 后端项目](https://github.com/cherish-ltt/Guardian)
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)

## 👥 作者

Guardian Team - @opencode - [opencode@opencode.ai](mailto:opencode@opencode.ai)

## 🙏 致谢

感谢本项目中所使用的所有开源项目和库

如果这个项目对你有帮助，请给一个 Star ⭐️

---

<div align="center">
Built with ❤️ by Guardian team
</div>
