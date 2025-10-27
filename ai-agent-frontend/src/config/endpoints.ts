/**
 * 服务端点配置
 * 统一管理项目中所有服务的地址和端口
 */

export interface ServiceConfig {
  host: string
  port: number
  protocol: 'http' | 'https'
  path?: string
  baseUrl: string
}

export interface EndpointsConfig {
  // 前端服务
  frontend: ServiceConfig
  
  // 语音后端服务
  voiceBackend: ServiceConfig
  
  // LLM 服务
  llm: ServiceConfig
  
  // Socket 服务
  socket: ServiceConfig
  
  // 其他服务
  [key: string]: ServiceConfig
}

/**
 * 默认配置
 */
const defaultConfig: EndpointsConfig = {
  // 前端服务配置
  frontend: {
    host: 'localhost',
    port: 5174,
    protocol: 'http',
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`
    }
  },
  
  // 语音后端服务配置
  voiceBackend: {
    host: 'localhost',
    port: 1013,
    protocol: 'http',
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`
    }
  },
  
  // LLM 服务配置
  llm: {
    host: 'localhost',
    port: 1234,
    protocol: 'http',
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`
    }
  },
  
  // Socket 服务配置
  socket: {
    host: '192.168.3.8',
    port: 5110,
    protocol: 'http',
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`
    }
  }
}

/**
 * 从环境变量加载配置
 */
function loadConfigFromEnv(): Partial<EndpointsConfig> {
  const config: Partial<EndpointsConfig> = {}
  
  // 前端服务配置
  if (import.meta.env.VITE_FRONTEND_HOST) {
    config.frontend = {
      ...defaultConfig.frontend,
      host: import.meta.env.VITE_FRONTEND_HOST
    }
  }
  if (import.meta.env.VITE_FRONTEND_PORT) {
    config.frontend = {
      ...defaultConfig.frontend,
      port: parseInt(import.meta.env.VITE_FRONTEND_PORT)
    }
  }
  
  // 语音后端服务配置
  if (import.meta.env.VITE_VOICE_BACKEND_HOST) {
    config.voiceBackend = {
      ...defaultConfig.voiceBackend,
      host: import.meta.env.VITE_VOICE_BACKEND_HOST
    }
  }
  if (import.meta.env.VITE_VOICE_BACKEND_PORT) {
    config.voiceBackend = {
      ...defaultConfig.voiceBackend,
      port: parseInt(import.meta.env.VITE_VOICE_BACKEND_PORT)
    }
  }
  if (import.meta.env.VITE_VOICE_BACKEND_URL) {
    const url = new URL(import.meta.env.VITE_VOICE_BACKEND_URL)
    config.voiceBackend = {
      host: url.hostname,
      port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    }
  }
  
  // LLM 服务配置
  if (import.meta.env.VITE_LLM_HOST) {
    config.llm = {
      ...defaultConfig.llm,
      host: import.meta.env.VITE_LLM_HOST
    }
  }
  if (import.meta.env.VITE_LLM_PORT) {
    config.llm = {
      ...defaultConfig.llm,
      port: parseInt(import.meta.env.VITE_LLM_PORT)
    }
  }
  if (import.meta.env.VITE_LLM_URL) {
    const url = new URL(import.meta.env.VITE_LLM_URL)
    config.llm = {
      host: url.hostname,
      port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    }
  }
  
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
  if (import.meta.env.VITE_SOCKET_URL) {
    const url = new URL(import.meta.env.VITE_SOCKET_URL)
    config.socket = {
      host: url.hostname,
      port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
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
function mergeConfig(): EndpointsConfig {
  const envConfig = loadConfigFromEnv()
  return {
    ...defaultConfig,
    ...envConfig,
    // 确保 baseUrl 正确计算
    frontend: {
      ...defaultConfig.frontend,
      ...envConfig.frontend,
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    } as ServiceConfig,
    voiceBackend: {
      ...defaultConfig.voiceBackend,
      ...envConfig.voiceBackend,
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    } as ServiceConfig,
    llm: {
      ...defaultConfig.llm,
      ...envConfig.llm,
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    } as ServiceConfig,
    socket: {
      ...defaultConfig.socket,
      ...envConfig.socket,
      get baseUrl() {
        return `${this.protocol}://${this.host}:${this.port}`
      }
    } as ServiceConfig
  }
}

/**
 * 导出的配置对象
 */
export const endpoints = mergeConfig()

/**
 * 获取特定服务的配置
 */
export function getServiceConfig(serviceName: keyof EndpointsConfig): ServiceConfig {
  const config = endpoints[serviceName]
  if (!config) {
    throw new Error(`Service configuration not found: ${serviceName}`)
  }
  return config
}

/**
 * 获取特定服务的 URL
 */
export function getServiceUrl(serviceName: keyof EndpointsConfig, path: string = ''): string {
  const config = getServiceConfig(serviceName)
  return `${config.baseUrl}${path}`
}

/**
 * 获取 CORS 允许的源列表
 */
export function getCorsOrigins(): string[] {
  return [
    endpoints.frontend.baseUrl,
    endpoints.voiceBackend.baseUrl,
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'null'
  ]
}

/**
 * 打印当前配置
 */
export function printConfig(): void {
  console.log('🔧 服务端点配置:')
  console.log(`  前端服务: ${endpoints.frontend.baseUrl}`)
  console.log(`  语音后端: ${endpoints.voiceBackend.baseUrl}`)
  console.log(`  LLM 服务: ${endpoints.llm.baseUrl}`)
  console.log(`  Socket 服务: ${endpoints.socket.baseUrl}`)
}

// 开发环境下打印配置
if (import.meta.env.DEV) {
  printConfig()
}
