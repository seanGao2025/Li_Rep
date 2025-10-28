/**
 * Socket 模块服务端点配置
 * 为 socket-chat 视图提供 Socket.IO 服务配置
 */

export interface ServiceConfig {
  host: string
  port: number
  protocol: 'http' | 'https'
  socketPath?: string
  get baseUrl(): string
}

export interface SocketEndpointsConfig {
  // Socket 服务
  socket: ServiceConfig
}

/**
 * 默认配置
 */
const defaultConfig: SocketEndpointsConfig = {
  // Socket 服务配置
  socket: {
    host: '125.122.33.218',
    port: 8810,
    protocol: 'http',
    socketPath: '/api/status/push/chat_start',
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`
    }
  }
}

/**
 * 从环境变量加载配置
 */
function loadConfigFromEnv(): Partial<SocketEndpointsConfig> {
  const config: Partial<SocketEndpointsConfig> = {}
  
  // Socket 服务配置
  if (import.meta.env.VITE_SOCKET_HOST) {
    config.socket = {
      ...defaultConfig.socket,
      host: import.meta.env.VITE_SOCKET_HOST
    }
  }
  if (import.meta.env.VITE_SOCKET_PORT) {
    config.socket = {
      ...defaultConfig.socket,
      port: parseInt(import.meta.env.VITE_SOCKET_PORT)
    }
  }
  if (import.meta.env.VITE_SOCKET_PATH) {
    config.socket = {
      ...defaultConfig.socket,
      ...config.socket,
      socketPath: import.meta.env.VITE_SOCKET_PATH
    }
  }
  if (import.meta.env.VITE_SOCKET_URL) {
    const url = new URL(import.meta.env.VITE_SOCKET_URL)
    config.socket = {
      host: url.hostname,
      port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      socketPath: defaultConfig.socket.socketPath,
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    }
  }
  
  return config
}

/**
 * 合并配置
 */
function mergeConfig(): SocketEndpointsConfig {
  const envConfig = loadConfigFromEnv()
  return {
    ...defaultConfig,
    ...envConfig,
    socket: {
      ...defaultConfig.socket,
      ...envConfig.socket,
      // 保留 socketPath 属性
      socketPath: envConfig.socket?.socketPath || defaultConfig.socket.socketPath,
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    } as ServiceConfig
  }
}

/**
 * 导出的配置对象
 */
export const socketEndpoints = mergeConfig()

/**
 * 获取特定服务的配置
 */
export function getSocketServiceConfig(serviceName: keyof SocketEndpointsConfig): ServiceConfig {
  const config = socketEndpoints[serviceName]
  if (!config) {
    throw new Error(`Service configuration not found: ${serviceName}`)
  }
  return config
}

/**
 * 获取特定服务的 URL
 */
export function getSocketServiceUrl(serviceName: keyof SocketEndpointsConfig, path: string = ''): string {
  const config = getSocketServiceConfig(serviceName)
  return `${config.baseUrl}${path}`
}

/**
 * 打印当前配置
 */
export function printSocketConfig(): void {
  console.log('🔧 Socket 服务端点配置:')
  console.log(`  Socket 服务: ${socketEndpoints.socket.baseUrl}`)
  console.log(`  Socket 路径: ${socketEndpoints.socket.socketPath || 'default'}`)
}

// 开发环境下打印配置
if (import.meta.env.DEV) {
  printSocketConfig()
}

