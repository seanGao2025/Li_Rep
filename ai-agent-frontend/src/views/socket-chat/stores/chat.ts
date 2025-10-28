import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message } from '../types'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<Message[]>([])
  const systemPrompt = ref('')
  const streaming = ref(false)
  const controller = ref<AbortController | null>(null)

  // API基础地址 - 使用 chat 配置
  // 注: streamChat 使用的 OpenAI 兼容接口
  const API_BASE = 'http://localhost:1234/v1'

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

  // 设置最后一条消息的内容（用于流式渲染）
  const setLastMessage = (content: string) => {
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1] || { role: '', content: '' }
      if (lastMessage.role === 'assistant') {
        lastMessage.content = content
      }
    }
  }

  // 处理并分离思考内容和答案内容
  const processContent = (content: string): { think: string; answer: string } => {
    // 提取 <think> 标签内的内容
    const thinkRegex = /<think>([\s\S]*?)<\/redacted_reasoning>/
    const match = content.match(thinkRegex)
    
    if (match) {
      const think = match[1] || ''
      const answer = content.replace(thinkRegex, '').trim()
      return { think, answer }
    }
    
    // 如果没有标签，直接返回原内容
    return { think: '', answer: content }
  }

  // 模拟流式更新效果
  const simulateStreamingUpdate = async (fullContent: string) => {
    // 分离思考内容和答案
    const { think, answer } = processContent(fullContent)
    
    let displayContent = ''
    let htmlContent = ''
    
    // 如果有思考内容，先显示思考（全显示）
    if (think && streaming.value) {
      // 清空并显示思考内容
      setLastMessage('')
      htmlContent = `<div class="think-block"><strong>思考过程：</strong><div class="think-content">${think.replace(/\n/g, '<br>')}</div></div>`
      setLastMessage(htmlContent)
      
      // 等待用户阅读思考内容
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 清空，准备显示答案
      setLastMessage('')
    }
    
    // 流式显示答案内容
    const chars = answer.split('')
    
    for (let i = 0; i < chars.length; i++) {
      // 检查是否被中断
      if (!streaming.value) {
        break
      }
      
      const char = chars[i]
      if (!char) continue
      
      displayContent += char
      
      // 重新组装HTML
      htmlContent = ''
      if (think) {
        htmlContent += `<div class="think-block"><strong>思考过程：</strong><div class="think-content">${think.replace(/\n/g, '<br>')}</div></div>`
      }
      htmlContent += `<div class="answer-content">${displayContent.replace(/\n/g, '<br>')}</div>`
      
      setLastMessage(htmlContent)
      
      // 添加可变延迟
      let delay = 20
      if (/[\u4e00-\u9fa5]/.test(char)) {
        delay = 15
      } else if (char === '\n') {
        delay = 30
      } else if (/[，。！？；]/.test(char)) {
        delay = 50
      }
      
      if (i % 10 === 0) {
        delay += Math.random() * 20
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
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

  // 使用 AI 对话服务器
  const streamChatViaSocket = async () => {
    if (streaming.value) return

    streaming.value = true
    controller.value = new AbortController()

    try {
      // 获取用户最后一条消息
      const userMessages = messages.value.filter(m => m.role === 'user')
      if (userMessages.length === 0) {
        throw new Error('没有用户消息可发送')
      }

      const lastUserMessage = userMessages[userMessages.length - 1]
      
      if (!lastUserMessage) {
        throw new Error('最后一条用户消息不存在')
      }
      
      // 添加空的助手消息用于流式更新
      addMessage('assistant', '')

      // 构建请求负载
      const payload = {
        query: lastUserMessage.content,
        context: {}
      }

      // 发送请求到API
      const { endpoints } = await import('@/config/endpoints')
      
      // 开发环境使用 /api 代理，生产环境使用完整 URL
      const isDev = import.meta.env.DEV
      const chatService = endpoints.chat || { path: '/chat', baseUrl: 'http://125.122.33.218:8810' }
      const url = isDev
        ? `/api${chatService.path || '/chat'}`  // /api/chat
        : `${chatService.baseUrl}${chatService.path || '/chat'}`  // http://125.122.33.218:8810/chat
      
      console.log('发送请求到:', url)
      console.log('请求负载:', payload)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.value.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('错误响应:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      // 检查是否是流式响应
      const contentType = response.headers.get('content-type')
      console.log('Content-Type:', contentType)
      
      const isStreaming = contentType?.includes('text/event-stream') || contentType?.includes('stream')
      
      if (isStreaming) {
        // 处理流式响应
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader available')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          
          // 尝试按行解析 JSON
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue

            try {
              const data = JSON.parse(trimmedLine)
              console.log('收到流式响应:', data)
              
              // 从 context.answer 或 response 字段提取内容
              const content = data?.response || data?.context?.answer || data?.content || ''
              if (content) {
                updateLastMessage(content)
              }
            } catch (e) {
              // 如果不是 JSON，可能是纯文本
              if (trimmedLine) {
                updateLastMessage(trimmedLine + '\n')
              }
            }
          }
        }
      } else {
        // 处理非流式响应（完整 JSON）- 模拟流式渲染效果
        const responseData = await response.json()
        console.log('收到完整响应:', responseData)
        
        // 从 response 或 context.answer 提取内容
        const fullContent = responseData?.response || responseData?.context?.answer || ''
        if (fullContent) {
          // 模拟流式渲染：逐字符显示
          await simulateStreamingUpdate(fullContent)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateLastMessage('[已暂停生成]')
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
    streamChatViaSocket,
    stopStreaming
  }
})
