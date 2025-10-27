/**
 * 语音功能 Vue 组合式函数
 * 简化在 Vue 组件中使用语音功能
 */

import { ref, onUnmounted } from 'vue'
// import { ElMessage } from 'element-plus' // 已移除，使用专门的提示条
import { voiceService, type VoiceServiceCallbacks } from './index'

export interface UseVoiceOptions {
  autoSend?: boolean
  smartSend?: boolean // 智能发送：根据AI状态决定是否发送
  showMessages?: boolean
  continuousMode?: boolean // 持续模式：开启后可以持续对话
  onTextRecognized?: (text: string) => void
  onError?: (error: string) => void
  isAIStreaming?: () => boolean // 检查AI是否正在回答的函数
  isAudioPlaying?: () => boolean // 检查音频是否正在播放的函数
  onUserStartSpeaking?: () => void // 用户开始说话的回调（用于打断AI）
}

export function useVoice(options: UseVoiceOptions = {}) {
  const {
    smartSend = false,
    continuousMode = false,
    onTextRecognized,
    onError,
    isAIStreaming,
    isAudioPlaying,
    onUserStartSpeaking
  } = options

  // 响应式状态
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const recognizedText = ref('')
  const isContinuousMode = ref(continuousMode)
  const currentVolume = ref(0)

  // 设置语音服务回调
  const callbacks: VoiceServiceCallbacks = {
    onRecordingStart: () => {
      console.log('🎤 onRecordingStart 回调被调用')
      isRecording.value = true
      console.log('🎤 isRecording 状态已设置为:', isRecording.value)
      // 录音开始，由专门的提示条显示状态
    },
    onRecordingStop: () => {
      isRecording.value = false
      console.log('🎤 录音停止，持续模式:', isContinuousMode.value)
      
      // 只有在持续模式下才处理录音停止后的逻辑
      if (!isContinuousMode.value) {
        console.log('🎤 非持续模式，录音停止后不进行任何处理')
        return
      }
      
      // 注意：不在这里重新开始录音，等待识别完成后再重新开始
    },
    onRecognitionStart: () => {
      isProcessing.value = true
    },
    onRecognitionComplete: async (text: string) => {
      isProcessing.value = false
      recognizedText.value = text
      
      console.log('🎤 语音识别完成:', text)
      
      // 检查识别结果是否为空
      if (!text || !text.trim()) {
        console.log('🎤 识别结果为空，不保存不发送，重新启动智能监听')
        
        // 在持续模式下，重新启动智能监听
        if (isContinuousMode.value) {
          try {
            console.log('🎤 持续模式：识别结果为空，重新开始智能监听')
            await resumeListeningAfterAIResponse()
          } catch (error) {
            console.error('🎤 重新启动智能监听失败:', error)
          }
        }
        return
      }
      
      // 在持续模式下，立即触发发送
      if (isContinuousMode.value && text.trim()) {
        console.log('🎤 持续模式：自动发送识别结果')
        onTextRecognized?.(text)
        recognizedText.value = '' // 清空文本，准备下一轮
        
        // 注意：不在这里重新开始录音，等待AI回答完成后再开始
        console.log('🎤 持续模式：等待AI回答完成后再继续监听')
        return
      }
      
      // 智能发送逻辑（非持续模式）
      if (smartSend && isAIStreaming) {
        const isAIAnswering = isAIStreaming()
        if (isAIAnswering) {
          console.log('🎤 AI正在回答中，等待回答完成')
        }
      }
      
      // 调用自定义回调
      onTextRecognized?.(text)
    },
    onRecognitionError: (error: string) => {
      isProcessing.value = false
      isRecording.value = false
      
      // 语音识别失败，由专门的提示条显示状态
      console.log('🎤 语音识别失败:', error)
      
      // 在持续模式下，识别失败后重新开始监听
      if (isContinuousMode.value) {
        console.log('🎤 持续模式：识别失败，重新开始监听')
        setTimeout(async () => {
          try {
            await resumeListeningAfterAIResponse()
          } catch (error) {
            console.error('持续模式重新开始监听失败:', error)
          }
        }, 1000) // 延迟1秒重新开始
      }
      
      // 调用自定义错误回调
      onError?.(error)
    },
    onTTSStart: () => {
      // 语音生成开始，由专门的提示条显示状态
    },
    onTTSComplete: () => {
      // 语音生成完成，由专门的提示条显示状态
    },
    onTTSError: (error: string) => {
      // 语音合成失败，由专门的提示条显示状态
      
      // 调用自定义错误回调
      onError?.(error)
    },
    onSilenceDetected: () => {
      // 静音检测回调（现在由录音停止回调处理重新开始逻辑）
      console.log('🎤 检测到静音，录音将自动停止')
    },
    onVolumeChange: (volume: number) => {
      currentVolume.value = volume
    },
    isAudioPlaying: isAudioPlaying || undefined, // 传递音频播放状态检查函数
    isAIStreaming: isAIStreaming || undefined, // 传递AI生成状态检查函数
    onUserStartSpeaking: onUserStartSpeaking || undefined // 传递用户开始说话的回调
  }

  // 设置回调
  voiceService.setCallbacks(callbacks)

  // 开始语音输入
  const startVoiceInput = async () => {
    try {
      console.log('🎤 开始语音输入，持续模式:', isContinuousMode.value)
      await voiceService.startVoiceInput(isContinuousMode.value)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '语音输入启动失败'
      onError?.(errorMessage)
    }
  }

  // 停止语音输入
  const stopVoiceInput = () => {
    voiceService.stopVoiceInput()
  }

  // 切换语音输入状态
  const toggleVoiceInput = async () => {
    if (isContinuousMode.value) {
      // 如果正在持续对话模式，关闭持续对话
      console.log('🎤 关闭持续对话模式')
      isContinuousMode.value = false  // 先关闭持续模式
      
      // 同步 VoiceService 的状态
      voiceService.setContinuousMode(false)
      
      // 强制停止录音，不触发识别流程
      voiceService.forceStopVoiceInput()
      isRecording.value = false
    } else {
      // 如果未开启持续对话，开启持续对话模式
      console.log('🎤 开启持续对话模式')
      isContinuousMode.value = true
      
      // 同步 VoiceService 的状态
      voiceService.setContinuousMode(true)
      
      await startVoiceInput()
    }
  }

  // 切换持续模式
  const toggleContinuousMode = () => {
    isContinuousMode.value = !isContinuousMode.value
    if (isRecording.value) {
      // 如果正在录音，重新启动以应用新模式
      stopVoiceInput()
      setTimeout(() => {
        startVoiceInput()
      }, 100)
    }
  }

  // 文本转语音
  const speakText = async (text: string): Promise<string | null> => {
    try {
      return await voiceService.speakText(text)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '语音合成失败'
      onError?.(errorMessage)
      return null
    }
  }

  // 播放音频
  const playAudio = async (audioUrl: string) => {
    try {
      await voiceService.playAudio(audioUrl)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '音频播放失败'
      onError?.(errorMessage)
    }
  }

  // 在AI回答完成后重新开始监听（持续模式）
  const resumeListeningAfterAIResponse = async () => {
    if (isContinuousMode.value && !isRecording.value) {
      try {
        console.log('🎤 持续模式：AI回答完成，重新开始监听')
        // 确保 VoiceService 的持续模式状态同步
        voiceService.setContinuousMode(true)
        await voiceService.restartVoiceInput()
      } catch (error) {
        console.error('持续模式重新开始监听失败:', error)
      }
    }
  }

  // 清理资源
  const cleanup = () => {
    voiceService.cleanup()
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 状态
    isRecording,
    isProcessing,
    recognizedText,
    isContinuousMode,
    currentVolume,
    
    // 方法
    startVoiceInput,
    stopVoiceInput,
    toggleVoiceInput,
    toggleContinuousMode,
    speakText,
    playAudio,
    resumeListeningAfterAIResponse,
    cleanup
  }
}
