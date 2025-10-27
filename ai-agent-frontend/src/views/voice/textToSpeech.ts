/**
 * 文本转语音服务
 * 基于 Li-VoiceAss 后端服务的 TTS 功能
 */

import { endpoints } from '@/config/endpoints'

export interface TTSResult {
  status: 'completed' | 'failed' | 'processing'
  audio_path?: string
  error?: string
}

export interface TTSResponse {
  tts_status: string
  tts_result_id: string
}

export class TextToSpeechService {
  private baseUrl: string
  private maxRetries: number
  private pollInterval: number

  constructor(baseUrl: string = endpoints.voiceBackend.baseUrl, maxRetries: number = 30, pollInterval: number = 1000) {
    this.baseUrl = baseUrl
    this.maxRetries = maxRetries
    this.pollInterval = pollInterval
  }

  /**
   * 发送文本进行语音合成
   * @param text 要合成的文本
   * @returns Promise<TTSResponse>
   */
  async synthesizeText(text: string): Promise<TTSResponse> {
    const response = await fetch(`${this.baseUrl}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      throw new Error(`TTS请求失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.tts_status || !result.tts_result_id) {
      throw new Error('TTS响应格式错误')
    }

    return result
  }

  /**
   * 轮询检查TTS状态
   * @param resultId TTS结果ID
   * @returns Promise<TTSResult>
   */
  async pollTTSStatus(resultId: string): Promise<TTSResult> {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await fetch(`${this.baseUrl}/tts-status/${resultId}`)
          
          if (!response.ok) {
            throw new Error(`TTS状态查询失败: ${response.status} ${response.statusText}`)
          }

          const result: TTSResult = await response.json()

          if (result.status === 'completed') {
            resolve(result)
          } else if (result.status === 'failed') {
            resolve(result)
          } else if (result.status === 'processing') {
            attempts++
            if (attempts < this.maxRetries) {
              setTimeout(checkStatus, this.pollInterval)
            } else {
              resolve({
                status: 'failed',
                error: 'TTS处理超时'
              })
            }
          } else {
            resolve({
              status: 'failed',
              error: '未知状态'
            })
          }
        } catch (error) {
          reject(error)
        }
      }

      checkStatus()
    })
  }

  /**
   * 完整的TTS流程
   * @param text 要合成的文本
   * @returns Promise<TTSResult>
   */
  async processText(text: string): Promise<TTSResult> {
    try {
      // 发送文本进行合成
      const response = await this.synthesizeText(text)
      
      // 轮询检查合成状态
      const result = await this.pollTTSStatus(response.tts_result_id)
      
      return result
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'TTS处理失败'
      }
    }
  }

  /**
   * 播放音频文件
   * @param audioPath 音频文件路径
   * @returns Promise<void>
   */
  async playAudio(audioPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioPath)
      
      audio.onloadeddata = () => {
        audio.play().then(() => {
          resolve()
        }).catch(reject)
      }
      
      audio.onerror = () => {
        reject(new Error('音频播放失败'))
      }
      
      audio.onended = () => {
        resolve()
      }
    })
  }

  /**
   * 获取音频文件URL
   * @param audioPath 音频文件路径
   * @returns string
   */
  getAudioUrl(audioPath: string): string {
    // 如果路径是相对路径，添加baseUrl前缀
    if (audioPath.startsWith('/')) {
      return `${this.baseUrl}${audioPath}`
    }
    return audioPath
  }
}

// 创建默认实例
export const textToSpeechService = new TextToSpeechService()
