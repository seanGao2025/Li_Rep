# 服务端点配置

本项目使用模块化的配置管理，将不同模块的服务端点配置分别管理。

## 配置文件

### `endpoints.ts` (已弃用)

**已废弃** - 原先的统一配置文件，保留用于向后兼容。

### `endpoints-chat.ts` - Chat 模块配置

为 `views/chat` 模块提供 LLM 和对话服务配置。

**导出的配置：**

- `frontend` - 前端服务配置
- `llm` - LLM 服务配置
- `chat` - HTTP API 对话服务配置

**导出的函数：**

- `chatEndpoints` - 配置对象
- `getChatServiceConfig(name)` - 获取特定服务配置
- `getChatServiceUrl(name, path)` - 获取服务 URL
- `printChatConfig()` - 打印当前配置

**使用示例：**

```typescript
import { chatEndpoints, getChatServiceUrl } from '@/config/endpoints-chat'

// 获取 chat 服务 URL
const chatUrl = chatEndpoints.chat.baseUrl + chatEndpoints.chat.path

// 或使用便捷函数
const url = getChatServiceUrl('chat', '/query')
```

### `endpoints-socket-chat.ts` - Socket-Chat 模块配置

为 `views/socket-chat` 模块提供 Socket.IO 服务配置。

**导出的配置：**

- `socket` - Socket 服务配置

**导出的函数：**

- `socketChatEndpoints` - 配置对象
- `getSocketChatServiceConfig(name)` - 获取特定服务配置
- `getSocketChatServiceUrl(name, path)` - 获取服务 URL
- `printSocketChatConfig()` - 打印当前配置

**使用示例：**

```typescript
import { socketChatEndpoints } from '@/config/endpoints-socket-chat'

// 连接到 Socket 服务
socket.value = io(`${socketChatEndpoints.socket.baseUrl}/chat`, options)

// 获取 Socket 路径
const socketPath = socketChatEndpoints.socket.socketPath
```

## 环境变量

### Chat 模块

- `VITE_FRONTEND_HOST` - 前端服务主机
- `VITE_FRONTEND_PORT` - 前端服务端口
- `VITE_LLM_HOST` - LLM 服务主机
- `VITE_LLM_PORT` - LLM 服务端口
- `VITE_LLM_URL` - LLM 服务完整 URL

### Socket-Chat 模块

- `VITE_SOCKET_HOST` - Socket 服务主机
- `VITE_SOCKET_PORT` - Socket 服务端口
- `VITE_SOCKET_PATH` - Socket 路径
- `VITE_SOCKET_URL` - Socket 服务完整 URL

## 默认配置

### Chat 模块

```typescript
{
  frontend: {
    host: 'localhost',
    port: 5174,
    protocol: 'http'
  },
  llm: {
    host: 'localhost',
    port: 1234,
    protocol: 'http'
  },
  chat: {
    host: '125.122.33.218',
    port: 8810,
    protocol: 'http',
    path: '/chat'
  }
}
```

### Socket-Chat 模块

```typescript
{
  socket: {
    host: '125.122.33.218',
    port: 8810,
    protocol: 'http',
    socketPath: '/api/status/push/chat_start'
  }
}
```

## 迁移指南

如果您的代码仍在使用旧的 `endpoints.ts`，请按以下方式迁移：

### 从 `endpoints.ts` 迁移到 `endpoints-chat.ts`

```typescript
// 旧代码
import { endpoints } from '@/config/endpoints'
const url = endpoints.chat.baseUrl

// 新代码
import { chatEndpoints } from '@/config/endpoints-chat'
const url = chatEndpoints.chat.baseUrl
```

### 从 `endpoints.ts` 迁移到 `endpoints-socket-chat.ts`

```typescript
// 旧代码
import { endpoints } from '@/config/endpoints'
const socketUrl = endpoints.socket.baseUrl

// 新代码
import { socketChatEndpoints } from '@/config/endpoints-socket-chat'
const socketUrl = socketChatEndpoints.socket.baseUrl
```

## 注意事项

1. **模块独立性**: 每个模块使用独立的配置文件，避免配置混乱
2. **向后兼容**: 旧的 `endpoints.ts` 仍保留，但建议迁移到新配置
3. **类型安全**: 所有配置都有完整的 TypeScript 类型定义
4. **环境变量**: 支持通过环境变量覆盖默认配置
