/**
 * 语音服务统一入口
 * 整合语音录制、识别和合成功能
 */

import { VoiceRecorder, voiceRecorder } from './voiceRecorder'
import { SpeechRecognitionService, speechRecognitionService } from './speechRecognition'
import { TextToSpeechService, textToSpeechService } from './textToSpeech'

export interface VoiceServiceOptions {
  baseUrl?: string
  maxRetries?: number
  pollInterval?: number
}

export interface VoiceServiceCallbacks {
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  onRecognitionStart?: () => void
  onRecognitionComplete?: (text: string) => void
  onRecognitionError?: (error: string) => void
  onTTSStart?: () => void
  onTTSComplete?: (audioUrl: string) => void
  onTTSError?: (error: string) => void
  onSilenceDetected?: () => void // 静音检测回调
  onVolumeChange?: (volume: number) => void // 音量变化回调
  isAudioPlaying?: () => boolean // 检查音频是否正在播放
  isAIStreaming?: () => boolean // 检查AI是否正在生成
  onUserStartSpeaking?: () => void // 用户开始说话的回调
}

export class VoiceService {
  private recorder: VoiceRecorder
  private speechRecognition: SpeechRecognitionService
  private textToSpeech: TextToSpeechService
  private callbacks: VoiceServiceCallbacks = {}
  private isContinuousMode: boolean = false

  constructor(options: VoiceServiceOptions = {}) {
    this.recorder = new VoiceRecorder()
    this.speechRecognition = new SpeechRecognitionService(options.baseUrl, options.maxRetries, options.pollInterval)
    this.textToSpeech = new TextToSpeechService(options.baseUrl, options.maxRetries, options.pollInterval)
  }

  /**
   * 设置回调函数
   * @param callbacks 回调函数对象
   */
  setCallbacks(callbacks: VoiceServiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
    // 将 isAudioPlaying, isAIStreaming 和 onUserStartSpeaking 传递给 recorder
    const recorderCallbacks: any = {}
    if (callbacks.isAudioPlaying) {
      recorderCallbacks.isAudioPlaying = callbacks.isAudioPlaying
    }
    if (callbacks.isAIStreaming) {
      recorderCallbacks.isAIStreaming = callbacks.isAIStreaming
    }
    if (callbacks.onUserStartSpeaking) {
      recorderCallbacks.onUserStartSpeaking = callbacks.onUserStartSpeaking
    }
    if (Object.keys(recorderCallbacks).length > 0) {
      this.recorder.setCallbacks(recorderCallbacks)
    }
  }

  /**
   * 设置持续模式状态
   * @param continuousMode 是否为持续模式
   */
  setContinuousMode(continuousMode: boolean): void {
    this.isContinuousMode = continuousMode
    this.recorder.isContinuousMode = continuousMode  // 同步 voiceRecorder 的状态
    console.log('🎤 VoiceService 设置持续模式状态:', continuousMode)
  }

  /**
   * 开始语音录制和识别
   * @param continuousMode 是否为持续模式
   * @returns Promise<void>
   */
  async startVoiceInput(continuousMode: boolean = false): Promise<void> {
    try {
      console.log('🎤 VoiceService.startVoiceInput 调用，持续模式:', continuousMode)
      this.isContinuousMode = continuousMode
      
      // 设置录音回调
      this.recorder.setCallbacks({
        onStart: () => {
          this.callbacks.onRecordingStart?.()
        },
        onStop: () => {
          this.callbacks.onRecordingStop?.()
        },
        onDataAvailable: async (audioBlob) => {
          await this.processVoiceInput(audioBlob)
        },
        onError: (error) => {
          this.callbacks.onRecognitionError?.(error.message)
        },
        onSilenceDetected: () => {
          this.callbacks.onSilenceDetected?.()
        },
        onVolumeChange: (volume) => {
          this.callbacks.onVolumeChange?.(volume)
        },
        onUserStartSpeaking: this.callbacks.onUserStartSpeaking,
        isAudioPlaying: this.callbacks.isAudioPlaying,
        isAIStreaming: this.callbacks.isAIStreaming
      })

      // 开始录音
      await this.recorder.startRecording(continuousMode)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '语音录制启动失败'
      this.callbacks.onRecognitionError?.(errorMessage)
      throw error
    }
  }

  /**
   * 停止语音录制
   */
  stopVoiceInput(): void {
    this.recorder.stopRecording()
  }

  /**
   * 强制停止语音录制（不触发识别流程）
   */
  forceStopVoiceInput(): void {
    console.log('🎤 强制停止语音录制，不触发识别流程')
    // 注意：不在这里设置 isContinuousMode = false，保持持续模式状态
    this.recorder.stopRecording()
  }

  /**
   * 重新开始语音录制（持续模式）
   */
  async restartVoiceInput(): Promise<void> {
    console.log('🎤 VoiceService.restartVoiceInput 调用，持续模式:', this.isContinuousMode)
    
    // 重新设置录音回调
    this.recorder.setCallbacks({
      onStart: () => {
        this.callbacks.onRecordingStart?.()
      },
      onStop: () => {
        this.callbacks.onRecordingStop?.()
      },
      onDataAvailable: async (audioBlob) => {
        await this.processVoiceInput(audioBlob)
      },
      onError: (error) => {
        this.callbacks.onRecognitionError?.(error.message)
      },
      onSilenceDetected: () => {
        this.callbacks.onSilenceDetected?.()
      },
      onVolumeChange: (volume) => {
        this.callbacks.onVolumeChange?.(volume)
      },
      onUserStartSpeaking: this.callbacks.onUserStartSpeaking,
      isAudioPlaying: this.callbacks.isAudioPlaying,
      isAIStreaming: this.callbacks.isAIStreaming
    })
    
    await this.recorder.restartRecording()
  }

  /**
   * 检查是否正在录音
   * @returns boolean
   */
  isRecording(): boolean {
    return this.recorder.isRecording()
  }

  /**
   * 处理语音输入
   * @param audioBlob 音频文件
   */
  private async processVoiceInput(audioBlob: Blob): Promise<void> {
    // 只有在持续模式下才进行语音识别
    if (!this.isContinuousMode) {
      console.log('🎤 非持续模式，跳过语音识别')
      return
    }

    try {
      console.log('🎤 开始处理语音输入，持续模式:', this.isContinuousMode)
      console.log('🎤 音频文件信息:', {
        size: audioBlob.size,
        type: audioBlob.type
      })

      // 验证音频文件
      if (audioBlob.size === 0) {
        throw new Error('音频文件为空')
      }

      if (audioBlob.size < 2000) {
        console.warn('🎤 音频文件过小，可能无法识别:', audioBlob.size, 'bytes')
        // 如果文件太小，直接跳过识别
        this.callbacks.onRecognitionError?.('录音时间太短，请重新说话')
        return
      }

      this.callbacks.onRecognitionStart?.()

      // 进行语音识别
      const result = await this.speechRecognition.processAudio(audioBlob)

      if (result.status === 'completed' && result.user_text) {
        this.callbacks.onRecognitionComplete?.(result.user_text)
      } else if (result.status === 'failed') {
        this.callbacks.onRecognitionError?.(result.error || '语音识别失败')
      }
    } catch (error) {
      console.error('🎤 语音处理失败:', error)
      const errorMessage = error instanceof Error ? error.message : '语音处理失败'
      this.callbacks.onRecognitionError?.(errorMessage)
    }
  }

  /**
   * 文本转语音
   * @param text 要合成的文本
   * @returns Promise<string | null> 返回音频URL或null
   */
  async speakText(text: string): Promise<string | null> {
    try {
      this.callbacks.onTTSStart?.()

      // 进行文本转语音
      const result = await this.textToSpeech.processText(text)

      if (result.status === 'completed' && result.audio_path) {
        const audioUrl = this.textToSpeech.getAudioUrl(result.audio_path)
        this.callbacks.onTTSComplete?.(audioUrl)
        return audioUrl
      } else if (result.status === 'failed') {
        this.callbacks.onTTSError?.(result.error || 'TTS处理失败')
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'TTS处理失败'
      this.callbacks.onTTSError?.(errorMessage)
    }

    return null
  }

  /**
   * 播放音频
   * @param audioUrl 音频URL
   * @returns Promise<void>
   */
  async playAudio(audioUrl: string): Promise<void> {
    try {
      await this.textToSpeech.playAudio(audioUrl)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '音频播放失败'
      this.callbacks.onTTSError?.(errorMessage)
      throw error
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.recorder.cleanup()
  }
}

// 创建默认实例
export const voiceService = new VoiceService()

// 导出所有服务
export {
  VoiceRecorder,
  voiceRecorder,
  SpeechRecognitionService,
  speechRecognitionService,
  TextToSpeechService,
  textToSpeechService
}

// 导出后端服务
export { BackendService, backendService } from './backendService'
export { default as BackendManager } from './components/BackendManager.vue'

