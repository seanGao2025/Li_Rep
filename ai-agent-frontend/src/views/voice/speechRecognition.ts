/**
 * 语音识别服务
 * 基于 Li-VoiceAss 后端服务的语音识别功能
 */

import { endpoints } from '@/config/endpoints'

export interface SpeechRecognitionResult {
  status: 'completed' | 'failed' | 'processing'
  user_text?: string
  error?: string
}

export interface SpeechRecognitionResponse {
  audio_status: string
  stt_result_id: string
}

export class SpeechRecognitionService {
  private baseUrl: string
  private maxRetries: number
  private pollInterval: number

  constructor(baseUrl: string = endpoints.voiceBackend.baseUrl, maxRetries: number = 30, pollInterval: number = 1000) {
    this.baseUrl = baseUrl
    this.maxRetries = maxRetries
    this.pollInterval = pollInterval
  }

  /**
   * 发送音频文件进行语音识别
   * @param audioBlob 音频文件
   * @returns Promise<SpeechRecognitionResponse>
   */
  async recognizeSpeech(audioBlob: Blob): Promise<SpeechRecognitionResponse> {
    const formData = new FormData()
    formData.append('audio', audioBlob)

    console.log('🎤 发送语音识别请求到:', `${this.baseUrl}/speech`)
    console.log('🎤 音频文件大小:', audioBlob.size, 'bytes')

    try {
      const response = await fetch(`${this.baseUrl}/speech`, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      })

      console.log('🎤 语音识别响应状态:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🎤 语音识别请求失败:', response.status, errorText)
        throw new Error(`语音识别请求失败: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('🎤 语音识别响应:', result)
      
      if (!result.audio_status || !result.stt_result_id) {
        throw new Error('语音识别响应格式错误')
      }

      return result
    } catch (error) {
      console.error('🎤 语音识别网络错误:', error)
      throw error
    }
  }

  /**
   * 轮询检查语音识别状态
   * @param resultId 识别结果ID
   * @returns Promise<SpeechRecognitionResult>
   */
  async pollRecognitionStatus(resultId: string): Promise<SpeechRecognitionResult> {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          console.log('🎤 查询语音识别状态:', `${this.baseUrl}/speech-status/${resultId}`)
          
          const response = await fetch(`${this.baseUrl}/speech-status/${resultId}`, {
            mode: 'cors'
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('🎤 状态查询失败:', response.status, errorText)
            throw new Error(`状态查询失败: ${response.status} ${response.statusText}`)
          }

          const result: SpeechRecognitionResult = await response.json()
          console.log('🎤 状态查询结果:', result)

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
                error: '语音识别超时'
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
   * 完整的语音识别流程
   * @param audioBlob 音频文件
   * @returns Promise<SpeechRecognitionResult>
   */
  async processAudio(audioBlob: Blob): Promise<SpeechRecognitionResult> {
    try {
      // 发送音频进行识别
      const response = await this.recognizeSpeech(audioBlob)
      
      // 轮询检查识别状态
      const result = await this.pollRecognitionStatus(response.stt_result_id)
      
      return result
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : '语音识别失败'
      }
    }
  }
}

// 创建默认实例
export const speechRecognitionService = new SpeechRecognitionService()
