import { ref, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import { getServiceUrl } from '@/config/endpoints'

/**
 * 语音输出服务
 * 基于 Li-VoiceAss 的 TTS 功能
 */
export function useVoiceOutput() {
  const isPlaying = ref(false)
  const isProcessing = ref(false)
  const currentText = ref('')
  const progress = ref({ current: 0, total: 100 })

  /**
   * 播放文本语音
   */
  const speak = async (text: string): Promise<void> => {
    if (!text.trim()) {
      console.warn('语音输出：文本为空')
      return
    }

    if (isPlaying.value) {
      console.warn('语音输出：正在播放中')
      return
    }

    try {
      isProcessing.value = true
      currentText.value = text
      progress.value = { current: 0, total: 100 }

      console.log('🔊 开始语音输出:', text.substring(0, 50) + '...')

      // 调用 Li-VoiceAss 的 TTS 服务
      const response = await fetch(`${getServiceUrl('voiceBackend')}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'zh_CN-huayan-medium', // 使用中文语音模型
          speed: 1.0,
          pitch: 1.0
        })
      })

      if (!response.ok) {
        throw new Error(`TTS 请求失败: ${response.status}`)
      }

      // 获取音频数据
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // 创建音频对象并播放
      const audio = new Audio(audioUrl)
      
      audio.onloadstart = () => {
        console.log('🔊 音频开始加载')
        progress.value = { current: 20, total: 100 }
      }
      
      audio.oncanplay = () => {
        console.log('🔊 音频可以播放')
        progress.value = { current: 50, total: 100 }
      }
      
      audio.onplay = () => {
        console.log('🔊 开始播放语音')
        isPlaying.value = true
        isProcessing.value = false
        progress.value = { current: 80, total: 100 }
      }
      
      audio.onended = () => {
        console.log('🔊 语音播放完成')
        isPlaying.value = false
        currentText.value = ''
        progress.value = { current: 100, total: 100 }
        
        // 清理音频 URL
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = (error) => {
        console.error('🔊 语音播放错误:', error)
        isPlaying.value = false
        isProcessing.value = false
        ElMessage.error('语音播放失败')
      }

      // 开始播放
      await audio.play()

    } catch (error) {
      console.error('🔊 语音输出失败:', error)
      isProcessing.value = false
      isPlaying.value = false
      currentText.value = ''
      
      // 显示错误提示
      if (error instanceof Error) {
        ElMessage.error(`语音输出失败: ${error.message}`)
      } else {
        ElMessage.error('语音输出失败，请检查网络连接')
      }
    }
  }

  /**
   * 停止语音播放
   */
  const stop = (): void => {
    if (isPlaying.value) {
      // 停止当前播放的音频
      const audioElements = document.querySelectorAll('audio')
      audioElements.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
      
      isPlaying.value = false
      isProcessing.value = false
      currentText.value = ''
      progress.value = { current: 0, total: 100 }
      
      console.log('🔊 语音播放已停止')
    }
  }

  /**
   * 检查语音服务是否可用
   */
  const checkService = async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${getServiceUrl('voiceBackend')}/health`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.warn('语音服务检查失败:', error)
      return false
    }
  }

  /**
   * 获取支持的语音列表
   */
  const getVoices = async (): Promise<string[]> => {
    try {
      const response = await fetch(`${getServiceUrl('voiceBackend')}/voices`)
      if (response.ok) {
        const data = await response.json()
        return data.voices || []
      }
      return []
    } catch (error) {
      console.warn('获取语音列表失败:', error)
      return []
    }
  }

  return {
    // 状态
    isPlaying: readonly(isPlaying),
    isProcessing: readonly(isProcessing),
    currentText: readonly(currentText),
    progress: readonly(progress),
    
    // 方法
    speak,
    stop,
    checkService,
    getVoices
  }
}

// 导出单例
export const voiceOutput = useVoiceOutput()
