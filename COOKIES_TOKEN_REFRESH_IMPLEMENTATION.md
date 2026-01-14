# HttpOnly Cookies + Token Refresh 实施文档

## 实施完成情况

### ✅ 已完成的实现

#### 1. Cookie 工具函数
**文件**: `lib/cookies.ts`
- `setAuthCookies()` - 设置 access_token 和 refresh_token 到 HttpOnly cookies
- `clearAuthCookies()` - 清除所有认证 cookies
- `getRefreshToken()` - 从 cookie 获取 refresh_token (服务器端)

#### 2. API Routes
**文件**: 
- `app/api/auth/login/route.ts` - 处理登录，设置 cookies
- `app/api/auth/refresh/route.ts` - 处理 token 刷新
- `app/api/auth/logout/route.ts` - 处理登出，清除 cookies
- `app/api/auth/verify/route.ts` - 验证认证状态

#### 3. Token 刷新机制
**文件**: `lib/api.ts`
- `refreshAccessToken()` - 刷新 access_token 函数
- `fetchWithRetry()` - 自动处理 401 错误并重试
- 互斥锁机制 - 防止并发刷新请求
- `postWithAuth()` 和 `getWithAuth()` - 自动携带 cookies 发送认证请求

#### 4. 组件更新
**文件**: 
- `components/login-form.tsx` - 调用 `/api/auth/login` 设置 cookies
- `contexts/auth-context.tsx` - 通过 `/api/auth/verify` 检查认证状态

## 架构设计

### Cookie 存储策略
```
access_token (HttpOnly)
├── 有效期: 15 分钟 (900 秒)
├── 属性: httpOnly, secure, sameSite=lax
└── 路径: /

refresh_token (HttpOnly)
├── 有效期: 7 天
├── 属性: httpOnly, secure, sameSite=lax
└── 路径: /
```

### Token 刷新流程
```
1. 客户端发起 API 请求
   ↓
2. 浏览器自动发送 cookies (credentials: include)
   ↓
3. 服务器验证 access_token
   ↓
4. 如果 access_token 过期 → 返回 401
   ↓
5. 客户端检测 401，调用 fetchWithRetry
   ↓
6. 发起刷新请求到 /api/auth/refresh
   ↓
7. Server Route 读取 refresh_token cookie
   ↓
8. 调用 Guardian API /auth/refresh
   ↓
9. Guardian API 返回新 access_token
   ↓
10. Server Route 更新 access_token cookie
    ↓
11. 原始请求自动重试，成功返回
```

### 并发刷新处理
```
并发请求1 → 401 → 尝试刷新
并发请求2 → 401 → 等待刷新
并发请求3 → 401 → 等待刷新

刷新完成 → 所有请求自动重试
```

## 安全特性

### HttpOnly Cookies
✅ **防止 XSS 攻击** - JavaScript 无法访问 cookie 值
✅ **Secure 标志** - 仅 HTTPS 传输（生产环境）
✅ **SameSite=lax** - 防止 CSRF 攻击
✅ **自动过期** - access_token 15分钟，refresh_token 7天

### Token 刷新
✅ **无感刷新** - 用户无感知，自动处理
✅ **互斥锁** - 防止重复刷新请求
✅ **失败重定向** - refresh_token 失效时重定向到登录页

## 测试验证

### 测试 1: 登录后 Cookie 设置
**步骤**:
1. 打开浏览器 DevTools → Application → Cookies
2. 访问 `/login`
3. 输入用户名密码登录

**预期结果**:
- ✅ `access_token` cookie 存在
- ✅ `refresh_token` cookie 存在
- ✅ `httpOnly` 标记为 ✓
- ✅ 无 localStorage token

### 测试 2: Access Token 过期自动刷新
**步骤**:
1. 登录成功
2. 等待 15 分钟（或修改 access_token 过期时间）
3. 访问受保护页面

**预期结果**:
- ✅ 自动发起刷新请求
- ✅ access_token 更新
- ✅ 请求成功返回
- ✅ 用户无感知

### 测试 3: Refresh Token 过期重新登录
**步骤**:
1. 修改 refresh_token 为无效值或等待 7 天
2. 访问受保护页面
3. 触发刷新请求

**预期结果**:
- ✅ 刷新失败
- ✅ 自动重定向到 `/login`
- ✅ Cookies 被清除

### 测试 4: 多标签共享认证状态
**步骤**:
1. 标签 A 登录
2. 标签 B 打开 `/dashboard`

**预期结果**:
- ✅ 标签 B 显示仪表板（共享 cookies）
- ✅ 无需重新登录

### 测试 5: 登出功能
**步骤**:
1. 登录成功
2. 调用登出（通过 AuthContext.logout()）

**预期结果**:
- ✅ Cookies 被清除
- ✅ 重定向到 `/login`
- ✅ 所有标签认证失效

## API Routes 说明

### POST /api/auth/login
**请求**:
```json
{
  "username": "admin",
  "password": "123456",
  "two_fa_code": "123456" // 可选
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 900
  }
}
```

### POST /api/auth/refresh
**请求**: (使用 refresh_token cookie)

**响应**:
```json
{
  "success": true,
  "access_token": "..."
}
```

**错误**:
```json
{
  "error": "Refresh token expired"
}
```

### POST /api/auth/logout
**响应**:
```json
{
  "success": true
}
```

### GET /api/auth/verify
**响应**:
```json
{
  "authenticated": true/false
}
```

## 与旧版对比

| 特性 | 旧版 | 新版 |
|------|--------|------|
| Token 存储 | localStorage | HttpOnly cookies |
| 安全性 | ❌ 可被 XSS 获取 | ✅ JS 无法访问 |
| Token 刷新 | ❌ 无 | ✅ 自动刷新 |
| 并发控制 | ❌ 无 | ✅ 互斥锁 |
| 多标签同步 | ❌ 需手动处理 | ✅ 自动共享 |
| 失败处理 | ❌ 手动刷新 | ✅ 自动重试 |

## 文件变更汇总

**新建文件**:
- `lib/cookies.ts` - Cookie 工具函数
- `app/api/auth/login/route.ts` - 登录 API
- `app/api/auth/refresh/route.ts` - 刷新 API
- `app/api/auth/logout/route.ts` - 登出 API
- `app/api/auth/verify/route.ts` - 验证 API

**修改文件**:
- `lib/api.ts` - 实现自动刷新机制
- `components/login-form.tsx` - 使用 cookie API
- `contexts/auth-context.tsx` - 使用验证 API

**删除**:
- localStorage 相关代码（已从 lib/api.ts 移除）

## 后续优化建议

1. **Token 预刷新** - 在 access_token 过期前 30 秒主动刷新
2. **刷新失败重试** - 网络错误时指数退避重试
3. **审计日志** - 记录刷新操作和失败原因
4. **监控** - 添加刷新频率和失败率监控

## 构建验证

```bash
✅ npm run build - 编译成功
✅ TypeScript 类型检查通过
✅ 所有 API routes 正确生成
```

## 安全建议

### 生产环境配置
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.com/guardian-auth/v1
NODE_ENV=production
```

### 安全配置检查
- ✅ HTTPS 必需（secure cookies）
- ✅ API 端点必须验证 token
- ✅ CORS 配置正确
- ✅ 实施速率限制
- ✅ 审计所有认证操作

## 常见问题

### Q: 为什么改用 HttpOnly cookies?
A: localStorage 可被 JavaScript 访问，存在 XSS 风险。HttpOnly cookies 只能在服务器端设置和读取，更安全。

### Q: Access token 为什么有效期这么短?
A: 15 分钟有效期是最佳实践。即使泄露，攻击窗口也很小。refresh_token 周期长，用于无感刷新。

### Q: 如果多个请求同时 401 会怎样?
A: 互斥锁机制确保只有一个刷新请求，其他请求等待刷新完成后重试。

### Q: 如何测试 token 刷新?
A: 可以临时修改 Guardian API 的 token 过期时间为 30 秒，然后访问受保护页面。

## 总结

✅ **实施完成**: HttpOnly cookies + 无感 token 刷新
✅ **安全增强**: 防止 XSS，自动 token 刷新
✅ **用户体验**: 无感刷新，无需用户操作
✅ **代码质量**: 类型安全，错误处理完善
✅ **构建通过**: 所有代码编译成功
