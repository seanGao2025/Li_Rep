/**
 * 后端服务管理器
 * 提供后端服务的启动、停止、状态检查等功能
 */

import { endpoints } from '@/config/endpoints'

export interface BackendStatus {
  running: boolean
  port: number
  url: string
  pid?: number
}

export interface BackendLogs {
  lines: string[]
  total: number
}

export class BackendService {
  private baseUrl: string
  private managerPath: string

  constructor(baseUrl: string = endpoints.voiceBackend.baseUrl) {
    this.baseUrl = baseUrl
    // 使用相对路径，确保在不同环境下都能正常工作
    this.managerPath = './src/views/voice/backend'
  }

  /**
   * 检查后端服务状态
   */
  async checkStatus(): Promise<BackendStatus> {
    try {
      const response = await fetch(this.baseUrl, { 
        method: 'GET',
        mode: 'cors'
      })
      
      return {
        running: response.ok,
        port: 1013,
        url: this.baseUrl,
        pid: undefined
      }
    } catch (error) {
      return {
        running: false,
        port: 1013,
        url: this.baseUrl,
        pid: undefined
      }
    }
  }

  /**
   * 启动后端服务
   */
  async startBackend(): Promise<boolean> {
    try {
      // 这里可以通过 Node.js 子进程启动后端
      // 或者通过 API 调用启动脚本
      console.log('🚀 启动后端服务...')
      
      // 检查是否已经在运行
      const status = await this.checkStatus()
      if (status.running) {
        console.log('✅ 后端服务已在运行')
        return true
      }

      // 在实际应用中，这里应该调用启动脚本
      // 由于浏览器限制，这里只是模拟
      console.log('⚠️  请手动启动后端服务:')
      console.log(`cd ${this.managerPath}`)
      console.log('python3 backend_manager.py start')
      
      return false
    } catch (error) {
      console.error('❌ 启动后端服务失败:', error)
      return false
    }
  }

  /**
   * 停止后端服务
   */
  async stopBackend(): Promise<boolean> {
    try {
      console.log('🛑 停止后端服务...')
      
      // 检查是否在运行
      const status = await this.checkStatus()
      if (!status.running) {
        console.log('ℹ️  后端服务未运行')
        return true
      }

      // 在实际应用中，这里应该调用停止脚本
      console.log('⚠️  请手动停止后端服务:')
      console.log(`cd ${this.managerPath}`)
      console.log('python3 backend_manager.py stop')
      
      return false
    } catch (error) {
      console.error('❌ 停止后端服务失败:', error)
      return false
    }
  }

  /**
   * 重启后端服务
   */
  async restartBackend(): Promise<boolean> {
    try {
      console.log('🔄 重启后端服务...')
      
      // 先停止
      await this.stopBackend()
      
      // 等待一下
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 再启动
      return await this.startBackend()
    } catch (error) {
      console.error('❌ 重启后端服务失败:', error)
      return false
    }
  }

  /**
   * 获取后端服务信息
   */
  getBackendInfo() {
    return {
      name: '语音后端服务',
      description: '提供语音识别、文本转语音和LLM交互功能',
      port: 1013,
      url: this.baseUrl,
      managerPath: this.managerPath,
      commands: {
        start: 'python3 backend_manager.py start',
        stop: 'python3 backend_manager.py stop',
        restart: 'python3 backend_manager.py restart',
        status: 'python3 backend_manager.py status',
        logs: 'python3 backend_manager.py logs'
      }
    }
  }

  /**
   * 检查依赖
   */
  async checkDependencies(): Promise<{ installed: boolean; missing: string[] }> {
    try {
      // 检查关键API端点
      const endpoints = ['/speech', '/tts', '/call-llm']
      const results = await Promise.allSettled(
        endpoints.map(endpoint => fetch(`${this.baseUrl}${endpoint}`, { method: 'OPTIONS' }))
      )

      const missing: string[] = []
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const endpoint = endpoints[index]
          if (endpoint) {
            missing.push(endpoint)
          }
        }
      })

      return {
        installed: missing.length === 0,
        missing
      }
    } catch (error) {
      return {
        installed: false,
        missing: ['所有端点']
      }
    }
  }
}

// 创建默认实例
export const backendService = new BackendService()
