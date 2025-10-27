import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message } from '../types'
import { getServiceUrl } from '@/config/endpoints'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<Message[]>([])
  const systemPrompt = ref('')
  const streaming = ref(false)
  const controller = ref<AbortController | null>(null)

  // API基础地址 - 使用统一配置
  const API_BASE = getServiceUrl('llm', '/v1')

  // 计算属性
  const hasMessages = computed(() => messages.value.length > 0)

  // 方法
  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    messages.value.push({ role, content })
  }

  const updateLastMessage = (content: string) => {
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1] || { role: '', content: '' }
      if (lastMessage.role === 'assistant') {
        lastMessage.content += content
      }
    }
  }

  const setSystemPrompt = (prompt: string) => {
    systemPrompt.value = prompt
  }

  const clearMessages = () => {
    messages.value = []
  }

  const streamChat = async () => {
    if (streaming.value) return

    streaming.value = true
    controller.value = new AbortController()

    try {
      // 构建消息负载
      const payloadMessages = []
      if (systemPrompt.value) {
        payloadMessages.push({ role: 'system', content: systemPrompt.value })
      }
      payloadMessages.push(
        ...messages.value
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role,
            content: m.content
          }))
      )

      // 添加空的助手消息用于流式更新
      addMessage('assistant', '')

      // 发送请求到API
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-oss-20b',
          messages: payloadMessages,
          stream: true
        }),
        signal: controller.value.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedContent = ''
      let hasTriggeredAudio = false // 标记是否已触发语音生成

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split(/\r?\n\r?\n/)
        buffer = events.pop() || ''

        for (const event of events) {
          if (event.startsWith('data:')) {
            const data = event.slice(5).trim()
            if (data === '[DONE]') return

            try {
              const obj = JSON.parse(data)
              const content = obj?.choices?.[0]?.delta?.content ?? ''
              if (content) {
                updateLastMessage(content)
                accumulatedContent += content
                
                // 当累积内容超过100个字符且尚未触发音频时，立即触发音频生成
                if (accumulatedContent.length >= 100 && !hasTriggeredAudio) {
                  console.log('🎤 [chat.ts] AI生成超过100字，立即触发语音生成')
                  console.log('🎤 [chat.ts] 累积内容长度:', accumulatedContent.length)
                  console.log('🎤 [chat.ts] 累积内容前100字:', accumulatedContent.substring(0, 100))
                  hasTriggeredAudio = true
                  // 发出事件通知组件生成语音
                  const event = new CustomEvent('ai-content-100-characters', { 
                    detail: { content: accumulatedContent } 
                  })
                  console.log('🎤 [chat.ts] 发出事件:', event)
                  window.dispatchEvent(event)
                  console.log('🎤 [chat.ts] 事件已发出')
                }
              }
            } catch (e) {
              console.error('Error parsing stream data:', e)
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateLastMessage('[已暂停生成]')
        // 暂停生成不抛出错误，直接返回
        return
      } else {
        updateLastMessage(`[网络/后端异常] ${error}`)
        throw error
      }
    } finally {
      streaming.value = false
      controller.value = null
    }
  }

  const stopStreaming = () => {
    if (controller.value) {
      controller.value.abort()
      controller.value = null
    }
    streaming.value = false
  }

  const updateMessageProperty = (index: number, property: string, value: any) => {
    if (index >= 0 && index < messages.value.length) {
      const message = messages.value[index]
      if (message) {
        messages.value[index] = { ...message, [property]: value }
      }
    }
  }

  return {
    // 状态
    messages,
    systemPrompt,
    streaming,
    // 计算属性
    hasMessages,
    // 方法
    addMessage,
    updateLastMessage,
    updateMessageProperty,
    setSystemPrompt,
    clearMessages,
    streamChat,
    stopStreaming
  }
})
