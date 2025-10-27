# 配置管理说明

## 📁 配置文件结构

```
src/config/
├── endpoints.ts          # 服务端点配置
└── README.md            # 配置说明文档
```

## 🔧 配置说明

### 1. 服务端点配置 (endpoints.ts)

统一管理项目中所有服务的地址和端口配置。

#### 支持的服务

- **frontend**: 前端服务
- **voiceBackend**: 语音后端服务
- **llm**: LLM 服务

#### 配置结构

```typescript
interface ServiceConfig {
  host: string // 主机地址
  port: number // 端口号
  protocol: 'http' | 'https' // 协议
  baseUrl: string // 完整 URL
}
```

### 2. 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# 前端服务配置
VITE_FRONTEND_HOST=localhost
VITE_FRONTEND_PORT=5174

# 语音后端服务配置
VITE_VOICE_BACKEND_HOST=localhost
VITE_VOICE_BACKEND_PORT=1013
# 或者使用完整 URL
# VITE_VOICE_BACKEND_URL=http://localhost:1013

# LLM 服务配置
VITE_LLM_HOST=localhost
VITE_LLM_PORT=1234
# 或者使用完整 URL
# VITE_LLM_URL=http://localhost:1234
```

## 🚀 使用方法

### 1. 导入配置

```typescript
import { endpoints, getServiceUrl, getServiceConfig } from '@/config/endpoints'
```

### 2. 使用服务 URL

```typescript
// 获取语音后端服务 URL
const voiceBackendUrl = endpoints.voiceBackend.baseUrl

// 获取特定路径的 URL
const speechUrl = getServiceUrl('voiceBackend', '/speech')

// 获取服务配置
const llmConfig = getServiceConfig('llm')
```

### 3. 在组件中使用

```typescript
// 在 Vue 组件中
import { endpoints } from '@/config/endpoints'

const voiceBackendUrl = endpoints.voiceBackend.baseUrl
const llmUrl = endpoints.llm.baseUrl
```

## 🔄 配置更新

### 1. 修改默认配置

编辑 `src/config/endpoints.ts` 中的 `defaultConfig` 对象。

### 2. 使用环境变量

在 `.env` 文件中设置相应的环境变量。

### 3. 运行时配置

可以通过代码动态修改配置：

```typescript
import { endpoints } from '@/config/endpoints'

// 修改语音后端地址
endpoints.voiceBackend.host = '192.168.1.100'
endpoints.voiceBackend.port = 8080
```

## 📊 配置优先级

1. 环境变量配置 (最高优先级)
2. 默认配置 (最低优先级)

## 🎯 优势

1. **统一管理**: 所有服务地址集中配置
2. **环境适配**: 支持不同环境的配置
3. **类型安全**: 完整的 TypeScript 类型支持
4. **易于维护**: 修改配置只需更新一个地方
5. **开发友好**: 支持环境变量和默认值

## 📝 注意事项

1. 环境变量必须以 `VITE_` 开头才能在客户端使用
2. 修改配置后需要重启开发服务器
3. 生产环境建议使用环境变量配置
4. 确保所有服务地址都是可访问的
