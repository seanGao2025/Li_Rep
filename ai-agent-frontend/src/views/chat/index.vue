<template>
  <div class="ai-chat-app">
    <!-- 头部 -->

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="panel-left">
        <!-- 聊天区域 -->
        <div class="chat-container" ref="chatContainer" @scroll="handleLeftScroll">
          <div class="meta">中国南方电网【大理AIEPS智能体】</div>
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="getMessageClass(message.role)"
            :data-msg-id="index"
            v-memo="[message.content, message.role, streaming]"
          >
            <div
              v-if="message.role === 'assistant'"
              v-html="generateSummaryHtml(message.content, index, streaming)"
            ></div>
            <div
              v-else-if="message.role === 'system'"
              v-html="formatFullContent(message.content, index)"
            ></div>
            <div v-else>{{ message.content }}</div>
          </div>

          <!-- AI加载动画 -->
          <div v-if="showLoading" class="ai-loading">
            <div class="ai-loading-dot"></div>
            <div class="ai-loading-dot"></div>
            <div class="ai-loading-dot"></div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="composer">
          <div class="input-container">
            <textarea
              v-model="inputText"
              placeholder="请输入电力系统相关问题..."
              @keydown="handleEnterKey"
              ref="inputRef"
            ></textarea>
            <div class="btn-container">
              <button
                :class="['role-btn', { active: roleBtnActive, completed: roleBtnActive }]"
                @click="openRoleModal"
                title="角色设置"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </button>
              <button
                :class="['data-link-btn', { active: dataLinkActive }]"
                @click="openDataLinkModal"
                title="数据链接"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"
                  />
                </svg>
              </button>
              <button
                :class="['file-brow-btn', { active: fileBrowActive }]"
                @click="openFileBrowserModal"
                title="资料浏览"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                  />
                </svg>
              </button>
              <button
                :class="['model-btn', { active: modelActive }]"
                @click="openModelModal"
                title="打开模型"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
                  />
                </svg>
              </button>
              <div style="flex: 1"></div>
              <!-- 语音交流按钮 -->
              <el-button
                :type="isContinuousMode ? 'success' : 'primary'"
                @click="toggleVoiceInput"
                :loading="isProcessing"
                :title="isContinuousMode ? '点击关闭持续对话' : '点击开启持续对话'"
                style="border-radius: 8px; margin-right: 8px; position: relative"
              >
                <template #icon>
                  <svg v-if="!isRecording" viewBox="0 0 24 24" class="btn-svg">
                    <path
                      d="M12,14A3,3 0 0,0 15,11V5A3,3 0 0,0 9,5V11A3,3 0 0,0 12,14M19,11C19,15.42 15.64,19.25 11,19.92V22H13V20H15V18H13V16.29C16.89,15.16 19,12.83 19,11M11,5A1,1 0 0,1 12,6A1,1 0 0,1 11,7A1,1 0 0,1 10,6A1,1 0 0,1 11,5M12,16A5,5 0 0,1 7,11V5A5,5 0 0,1 17,5V11A5,5 0 0,1 12,16Z"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" class="btn-svg">
                    <path
                      d="M12,14A3,3 0 0,0 15,11V5A3,3 0 0,0 9,5V11A3,3 0 0,0 12,14M19,11C19,15.42 15.64,19.25 11,19.92V22H13V20H15V18H13V16.29C16.89,15.16 19,12.83 19,11M11,5A1,1 0 0,1 12,6A1,1 0 0,1 11,7A1,1 0 0,1 10,6A1,1 0 0,1 11,5M12,16A5,5 0 0,1 7,11V5A5,5 0 0,1 17,5V11A5,5 0 0,1 12,16Z"
                    />
                  </svg>
                </template>
                <span v-if="isContinuousMode" style="margin-left: 4px">持续对话中</span>
                <span v-else>开启持续对话</span>

                <!-- 音量指示器 -->
                <div
                  v-if="isRecording"
                  class="volume-indicator"
                  :style="{
                    width: `${Math.min(currentVolume * 100, 100)}%`,
                    backgroundColor: currentVolume > 0.15 ? '#67c23a' : '#f56c6c'
                  }"
                ></div>
                <!-- 音量数值显示（调试用） -->
                <div
                  v-if="isRecording"
                  style="position: absolute; top: -20px; right: 0; font-size: 10px; color: #666"
                >
                  {{ (currentVolume * 100).toFixed(1) }}%
                </div>
              </el-button>
              <!-- 发送按钮 -->
              <el-button
                :type="streaming ? 'danger' : 'primary'"
                @click="handleSendStop"
                title="发送/停止"
                style="border-radius: 8px"
              >
                <template #icon>
                  <svg v-if="!streaming" viewBox="0 0 24 24" class="btn-svg white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" class="btn-svg white">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                </template>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="panel-right">
        <div class="detail-panel">
          <div class="detail-content" ref="detailContent" @scroll="handleRightScroll">
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="getMessageClass(message.role)"
              :data-msg-id="index"
              v-memo="[message.content, message.role, message.audioUrl]"
            >
              <div v-html="formatFullContent(message.content, index)"></div>

              <!-- 语音输入后的音频播放条 - 显示在右侧AI回答内容之后 -->
              <AudioPlayer
                v-if="message.role === 'assistant' && message.audioUrl"
                :visible="true"
                :audio-url="message.audioUrl"
                :auto-play="true"
                @play="onAudioPlay"
                @pause="onAudioPause"
                @ended="onAudioEnded"
                @error="onAudioError"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer-note">Powered by 怀柔国家实验室 电力AI团队</div>

    <!-- 角色设置弹窗 -->
    <RoleModal ref="roleModalRef" @confirm="handleRoleConfirm" />

    <!-- 数据链接弹窗 -->
    <DataLinkModal
      ref="dataLinkModalRef"
      :connected="dataLinkConnected"
      @connect="handleDataLinkConnect"
      @disconnect="handleDataLinkDisconnect"
    />

    <!-- 文件浏览弹窗 -->
    <FileBrowserModal ref="fileBrowserModalRef" />

    <!-- 模型选择弹窗 -->
    <ModelModal ref="modelModalRef" @confirm="handleModelConfirm" />

    <!-- 语音处理提示条 -->
    <VoiceProcessingBar
      :visible="voiceProcessing.visible"
      :text="voiceProcessing.text"
      :current="voiceProcessing.current"
      :total="voiceProcessing.total"
      :show-progress="voiceProcessing.showProgress"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { ElButton, ElMessage } from 'element-plus'

import RoleModal from './components/RoleModal.vue'

import DataLinkModal from './components/DataLinkModal.vue'

import FileBrowserModal from './components/FileBrowserModal.vue'

import ModelModal from './components/ModelModal.vue'
import VoiceProcessingBar from './components/VoiceProcessingBar.vue'
import AudioPlayer from './components/AudioPlayer.vue'

import { useChatStore } from './stores/chat'

import { useSocketStore } from './stores/socket'

import { formatFullContent, generateSummaryHtml } from '@/views/chat/utils/contentFormatter'
import { useVoice } from '../voice/useVoice'
import { getServiceUrl } from '@/config/endpoints'
import './styles/chat.scss'

// 响应式数据
const inputText = ref('')
const streaming = ref(false)
const showLoading = ref(false)
const isAudioPlaying = ref(false) // 音频播放状态
const isFirstInteraction = ref(true)

// 语音输入相关
const {
  isRecording,
  isProcessing,
  isContinuousMode,
  currentVolume,
  toggleVoiceInput,
  resumeListeningAfterAIResponse
} = useVoice({
  smartSend: true, // 启用智能发送
  showMessages: true,
  continuousMode: false, // 初始状态为关闭，需要用户手动开启
  isAIStreaming: () => streaming.value, // 提供AI状态检查函数
  isAudioPlaying: () => isAudioPlaying.value, // 提供音频播放状态检查函数
  onTextRecognized: async (text: string) => {
    console.log('🎤 语音识别结果:', text)

    // 检查识别结果是否有效（不为空，且不是"未识别到内容"）
    const isValidText = text && text.trim() && !text.includes('未识别到内容')

    if (!isValidText) {
      console.log('🎤 识别结果无效，不发送:', text)
      return
    }

    // 在持续模式下，直接发送，不填充输入框
    if (isContinuousMode.value) {
      console.log('🎤 持续模式：自动发送消息')
      // 标记为语音输入
      isVoiceInput.value = true

      // 检查AI是否正在回答
      if (!streaming.value) {
        // AI没有在回答，直接发送
        console.log('🎤 持续模式：发送消息到AI')
        await handleSendStop(text)
      } else {
        console.log('🎤 AI正在回答中，等待回答完成')
      }
    } else {
      // 非持续模式：填充输入框
      inputText.value = text
      isVoiceInput.value = true

      // 检查AI是否正在回答
      if (!streaming.value) {
        // AI没有在回答，自动发送
        await handleSendStop()
      }
    }
  }
})

// 弹窗状态
const roleModalRef = ref(null) as any
const dataLinkModalRef = ref(null) as any
const fileBrowserModalRef = ref(null) as any
const modelModalRef = ref(null) as any

// 按钮激活状态
const roleBtnActive = ref(false)
const dataLinkActive = ref(false)
const fileBrowActive = ref(false)
const modelActive = ref(false)

// 滚动控制状态
const leftScrollDisabled = ref(false) // 左侧面板是否禁用自动滚动
const rightScrollDisabled = ref(false) // 右侧面板是否禁用自动滚动
const currentGenerationPosition = ref(0) // 当前生成内容的位置

// 滚动方向跟踪
const lastRightScrollTop = ref(0) // 右侧面板上次滚动位置

// DOM引用
const chatContainer = ref<HTMLElement>()
const detailContent = ref<HTMLElement>()
const inputRef = ref()

// 使用stores
const chatStore = useChatStore()
const socketStore = useSocketStore()

// 语音处理状态
const voiceProcessing = ref({
  visible: false,
  text: 'AI思考中...',
  current: 0,
  total: 100,
  showProgress: false
})

// 语音输入检测
const isVoiceInput = ref(false)
const currentAudioUrl = ref('')

// 计算属性
const messages = computed(() => chatStore.messages)
const dataLinkConnected = computed(() => socketStore.connected)

// 方法
const getMessageClass = (role: string) => {
  const baseClass = 'message'
  switch (role) {
    case 'user':
      return `${baseClass} msg-user`
    case 'assistant':
      return 'msg-assistant-summary'
    case 'system':
      return `${baseClass} msg-system`
    default:
      return baseClass
  }
}

const handleEnterKey = (event: KeyboardEvent | Event) => {
  if (event instanceof KeyboardEvent) {
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault()
      if (!streaming.value) {
        handleSendStop()
      }
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      // 插入换行符
      const textarea = event.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      textarea.value = text.substring(0, start) + '\n' + text.substring(end)
      textarea.selectionStart = textarea.selectionEnd = start + 1
    }
  }
}

// 标记是否已经开始语音生成
let hasStartedAudioGeneration = false
// 标记AI是否已生成完成
let aiGenerationComplete = false

const handleSendStop = async (text?: string | MouseEvent) => {
  // 如果是MouseEvent，说明是按钮点击，使用输入框的文本
  if (text && typeof text === 'object' && 'type' in text) {
    text = inputText.value.trim()
  }
  if (streaming.value) {
    // 停止流式传输
    chatStore.stopStreaming()
    return
  }

  // 使用传入的文本或输入框的文本
  const messageText = text || inputText.value.trim()
  if (!messageText) return

  // 处理首次交互
  if (isFirstInteraction.value) {
    isFirstInteraction.value = false
    document.body.classList.remove('initial-view')
    await nextTick()
    inputRef.value?.focus()
  }

  // 发送消息
  chatStore.addMessage('user', messageText)

  // 只有在非持续模式下才清空输入框
  if (!isContinuousMode.value) {
    inputText.value = ''
  }

  // 重置语音生成相关的标记
  hasStartedAudioGeneration = false
  aiGenerationComplete = false

  try {
    streaming.value = true
    showLoading.value = true

    // 显示AI生成状态
    voiceProcessing.value = {
      visible: true,
      text: 'AI生成中...',
      current: 0,
      total: 100,
      showProgress: false
    }

    // 监听AI生成超过100字符的事件（用于语音输入场景）
    const handleAI100Characters = (event: any) => {
      if (!isVoiceInput.value || hasStartedAudioGeneration) return
      const content = event.detail?.content
      if (!content || content.length < 100) return

      console.log('🎤 收到AI生成超过100字符事件，立即开始生成语音')
      hasStartedAudioGeneration = true

      // 异步生成语音（不等待完成，继续处理流式文本）
      generateAudioForCurrentMessage(content).catch(err => {
        console.error('🎤 即时语音生成失败:', err)
      })
    }

    // 添加事件监听器
    window.addEventListener('ai-content-100-characters', handleAI100Characters)

    try {
      await chatStore.streamChat()
      aiGenerationComplete = true
      console.log('🎤 AI生成完成')
    } finally {
      // 移除事件监听器
      window.removeEventListener('ai-content-100-characters', handleAI100Characters)
    }

    // 如果AI生成完成但还没有开始语音生成（说明内容少于100字），这时生成音频
    if (aiGenerationComplete && !hasStartedAudioGeneration && isVoiceInput.value) {
      const lastMessage = chatStore.messages[chatStore.messages.length - 1]

      if (lastMessage && lastMessage.role === 'assistant') {
        console.log('🎤 AI生成完成且少于100字，生成完整语音')

        // 不显示语音输出状态
        try {
          // 处理文本并生成音频
          const processedText = processTextForAudio(lastMessage.content, lastMessage.content.length)
          const audioUrl = await generateAudioUrl(processedText)

          if (audioUrl) {
            // 将音频 URL 添加到消息中，使用响应式更新
            const messageIndex = chatStore.messages.length - 1
            if (messageIndex >= 0) {
              chatStore.updateMessageProperty(messageIndex, 'audioUrl', audioUrl)
              currentAudioUrl.value = audioUrl
            }
          } else {
            console.warn('🎤 generateAudioUrl 返回了 null 或 undefined')
          }
        } catch (error) {
          console.error('🎤 语音输出失败:', error)
        }
      }
    } else if (hasStartedAudioGeneration) {
      console.log('🎤 已经在流式生成中触发了语音生成，等待音频播放完成')
      // 等待音频播放完成，然后开启语音检测
      // 这个逻辑在 onAudioEnded 中处理
    }

    // 在持续模式下，不要重置语音输入标志，保持持续监听
    if (!isContinuousMode.value) {
      isVoiceInput.value = false
    } else {
      console.log('🎤 持续模式，保持语音输入标志为true')
    }
  } catch (error) {
    // 只有非暂停的错误才显示错误提示
    if (error instanceof Error && error.name !== 'AbortError') {
      ElMessage.error(`发送失败: ${error}`)
    }
  } finally {
    streaming.value = false
    showLoading.value = false
    voiceProcessing.value.visible = false
  }
}

// 为当前消息生成音频（用于即时语音生成）
const generateAudioForCurrentMessage = async (content: string): Promise<void> => {
  const lastMessage = chatStore.messages[chatStore.messages.length - 1]

  if (lastMessage && lastMessage.role === 'assistant') {
    // 不显示语音输出状态
    try {
      // 传入原始文本长度，以便 processTextForAudio 判断是否需要添加后缀
      const finalAudioText = processTextForAudio(content, content.length)

      // 生成音频并保存 URL
      const audioUrl = await generateAudioUrl(finalAudioText)

      if (audioUrl) {
        // 将音频 URL 添加到消息中，使用响应式更新
        const messageIndex = chatStore.messages.length - 1
        if (messageIndex >= 0) {
          chatStore.updateMessageProperty(messageIndex, 'audioUrl', audioUrl)
          currentAudioUrl.value = audioUrl
        }
      }
    } catch (error) {
      console.error('🎤 即时语音生成失败:', error)
    }
  }
}

// 弹窗控制方法
const openRoleModal = () => {
  roleModalRef.value.init()
}

const openDataLinkModal = () => {
  dataLinkModalRef.value.init()
}

const openFileBrowserModal = () => {
  fileBrowserModalRef.value.init()
}

const openModelModal = () => {
  modelModalRef.value.init()
}

const handleRoleConfirm = (rolePrompt: string) => {
  roleBtnActive.value = !!rolePrompt
  chatStore.setSystemPrompt(rolePrompt)
}

const handleDataLinkConnect = () => {
  dataLinkActive.value = true
  socketStore.connect()
}

const handleDataLinkDisconnect = () => {
  dataLinkActive.value = false
  socketStore.disconnect()
}

const handleModelConfirm = (data: { algorithms: any[]; businessLogics: any[] }) => {
  console.log('========== 已选择模型数据和业务逻辑 ==========')
  console.log('data:', data)
}

// 生成音频 URL
// 处理AI回答文本，如果内容太长则截取第一个句号前的内容
const processTextForAudio = (text: string, originalLength?: number): string => {
  // 记录原始文本长度（如果传入）
  const originalTextLength = originalLength || text.length

  // 先清理HTML标签和特殊字符，只保留纯文本
  let cleanText = text
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/&nbsp;/g, ' ') // 替换HTML实体
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()

  // 移除所有特殊符号，只保留中文、英文、数字和常用标点
  // 保留：中文、英文、数字、空格和常用标点（。，！？、：；""''()【】）
  cleanText = cleanText
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s。，！？、：；""''()【】]/g, '') // 只保留中文、英文、数字、空格和常用标点
    .replace(/\s+/g, ' ') // 再次合并多个空格
    .trim()

  console.log('🎤 清理后的文本:', cleanText)
  console.log('🎤 原始文本长度:', originalTextLength)
  console.log('🎤 清理后的文本长度:', cleanText.length)

  // 使用智能截取逻辑，基于原始文本长度而不是清理后的长度
  // 如果传入的原始长度 >= 100，则需要在清理后的文本中查找合适的位置并添加后缀
  if (originalTextLength >= 100) {
    console.log('🎤 原始文本长度>=100，需要查找截取位置并添加后缀')
    const maxLength = 100
    const targetPosition = maxLength
    const sentenceEndings = ['。', '！', '？', '.', '!', '?', '；', ';', '，']

    // 从目标位置向前查找最近的标点符号
    let bestPosition = targetPosition
    let found = false

    for (let i = targetPosition; i >= Math.max(0, targetPosition - 50); i--) {
      for (const ending of sentenceEndings) {
        if (cleanText[i] === ending) {
          bestPosition = i + 1
          found = true
          break
        }
      }
      if (found) break
    }

    const truncatedText = cleanText.substring(0, bestPosition)
    const finalText = truncatedText + '具体内容请看文字版'

    console.log('🎤 智能截取结果: 截取到位置=', bestPosition, '最终文本长度=', finalText.length)
    console.log('🎤 是否包含"具体内容请看文字版":', finalText.includes('具体内容请看文字版'))
    return finalText
  } else {
    // 如果原始文本长度 < 100，直接返回清理后的文本
    console.log('🎤 原始文本长度<100，直接返回清理后的文本')
    return cleanText
  }
}

const generateAudioUrl = async (text: string): Promise<string | null> => {
  try {
    // text 已经经过 processTextForAudio 处理，直接使用
    console.log('🎤 开始生成音频:', text.substring(0, 50) + '...')

    // 1. 提交 TTS 任务
    const response = await fetch(`${getServiceUrl('voiceBackend')}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text, // text 已经过 processTextForAudio 处理
        voice: 'zh_CN-huayan-medium',
        speed: 1.0,
        pitch: 1.0
      })
    })

    if (!response.ok) {
      throw new Error(`TTS 请求失败: ${response.status}`)
    }

    const result = await response.json()
    const taskId = result.tts_result_id

    if (!taskId) {
      throw new Error('未获取到任务 ID')
    }

    console.log('🎤 TTS 任务已提交:', taskId)

    // 2. 轮询获取结果
    const maxAttempts = 30 // 最多等待 30 秒
    const pollInterval = 1000 // 每秒轮询一次

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval))

      try {
        console.log(`🎤 轮询尝试 ${attempt + 1}/${maxAttempts}，任务ID: ${taskId}`)
        const statusResponse = await fetch(`${getServiceUrl('voiceBackend')}/tts-status/${taskId}`)

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json()
          console.log(`🎤 状态查询结果:`, statusResult)

          if (statusResult.status === 'completed') {
            // 3. 获取音频文件
            const audioPath = statusResult.audio_path
            console.log(`🎤 音频路径: ${audioPath}`)

            // 从绝对路径中提取文件名
            const fileName = audioPath.split('/').pop()
            console.log(`🎤 文件名: ${fileName}`)

            const audioUrl = `${getServiceUrl('voiceBackend')}/static/${fileName}`
            console.log(`🎤 音频URL: ${audioUrl}`)

            // 测试音频文件是否可访问
            const audioResponse = await fetch(audioUrl)
            if (audioResponse.ok) {
              const audioBlob = await audioResponse.blob()
              const blobUrl = URL.createObjectURL(audioBlob)
              console.log('🎤 音频生成完成:', blobUrl)
              return blobUrl
            } else {
              throw new Error(`获取音频失败: ${audioResponse.status}`)
            }
          } else if (statusResult.status === 'failed') {
            throw new Error('TTS 处理失败')
          }
          // 如果状态是 'processing'，继续轮询
        } else {
          console.warn(`🎤 状态查询失败: ${statusResponse.status}`)
        }
      } catch (error) {
        console.warn(`🎤 轮询尝试 ${attempt + 1} 失败:`, error)
      }
    }

    throw new Error('TTS 处理超时')
  } catch (error) {
    console.error('生成音频失败:', error)
    return null
  }
}

// 音频播放事件处理
const onAudioPlay = () => {
  console.log('🎤 音频开始播放')
  isAudioPlaying.value = true
}

const onAudioPause = () => {
  console.log('🎤 音频暂停')
  isAudioPlaying.value = false
}

const onAudioEnded = async () => {
  console.log('🎤 音频播放完成')
  isAudioPlaying.value = false

  // 不显示任何状态，保持AI生成状态（如果还在生成中）

  // 在持续模式下，AI生成完成且音频播放完成后，延迟500ms开启智能监听
  // 条件检查：必须是持续模式 + 语音输入 + AI生成完成 + 非生成中
  if (
    isContinuousMode.value &&
    isVoiceInput.value &&
    aiGenerationComplete &&
    !streaming.value &&
    !isAudioPlaying.value
  ) {
    console.log('🎤 AI生成和语音播放都已完成，延迟500ms后开启智能监听')

    // 等待500ms后开启智能监听
    setTimeout(async () => {
      console.log('🎤 延迟500ms后，开启智能监听')
      try {
        await resumeListeningAfterAIResponse()
        console.log('🎤 智能监听已成功启动')
      } catch (error) {
        console.error('🎤 启动智能监听失败:', error)
      }
    }, 500)
  } else {
    console.log('🎤 不满足开启智能监听的条件:', {
      isContinuousMode: isContinuousMode.value,
      isVoiceInput: isVoiceInput.value,
      aiGenerationComplete: aiGenerationComplete,
      streaming: streaming.value,
      isAudioPlaying: isAudioPlaying.value
    })
  }
}

const onAudioError = (error: Error) => {
  console.error('🎤 音频播放错误:', error)
  isAudioPlaying.value = false
}

// 自动滚动到右侧面板底部
const scrollToBottom = () => {
  // 如果右侧面板滚动被禁用，则不执行自动滚动
  if (rightScrollDisabled.value) return

  nextTick(() => {
    if (detailContent.value) {
      const targetScrollTop = detailContent.value.scrollHeight
      const currentScrollTop = detailContent.value.scrollTop

      // 更新当前生成内容的位置
      currentGenerationPosition.value = targetScrollTop

      // 如果距离底部很近，直接滚动；否则使用平滑滚动
      if (Math.abs(targetScrollTop - currentScrollTop) < 50) {
        detailContent.value.scrollTop = targetScrollTop
      } else {
        detailContent.value.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        })
      }
    }
  })
}

// 自动滚动到左侧面板底部
const scrollLeftToBottom = () => {
  // 如果左侧面板滚动被禁用，则不执行自动滚动
  if (leftScrollDisabled.value) return

  nextTick(() => {
    if (chatContainer.value) {
      const targetScrollTop = chatContainer.value.scrollHeight
      const currentScrollTop = chatContainer.value.scrollTop

      // 如果距离底部很近，直接滚动；否则使用平滑滚动
      if (Math.abs(targetScrollTop - currentScrollTop) < 50) {
        chatContainer.value.scrollTop = targetScrollTop
      } else {
        chatContainer.value.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        })
      }
    }
  })
}

// 滚动到指定标题
const scrollToHeading = (targetId: string) => {
  nextTick(() => {
    const targetElement = document.getElementById(targetId)
    if (targetElement && detailContent.value) {
      // 计算目标元素相对于右侧面板的位置
      const containerRect = detailContent.value.getBoundingClientRect()
      const targetRect = targetElement.getBoundingClientRect()
      const scrollTop = targetRect.top - containerRect.top + detailContent.value.scrollTop - 20 // 20px偏移

      // 检查目标内容是否在当前可视页面内
      const { scrollTop: currentScrollTop, clientHeight } = detailContent.value
      const isTargetInCurrentPage =
        scrollTop >= currentScrollTop && scrollTop <= currentScrollTop + clientHeight

      // 如果目标内容不在当前页面，则跳转并停止自动滚动
      if (!isTargetInCurrentPage) {
        rightScrollDisabled.value = true
      }

      // 使用更平滑的滚动动画
      const startScrollTop = detailContent.value.scrollTop
      const distance = scrollTop - startScrollTop
      const duration = Math.min(Math.abs(distance) * 0.5, 800) // 动态计算持续时间，最大800ms

      let startTime: number

      const animateScroll = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 使用easeOutCubic缓动函数，让滚动更自然
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentScrollTop = startScrollTop + distance * easeOutCubic

        detailContent.value!.scrollTop = currentScrollTop

        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        }
      }

      requestAnimationFrame(animateScroll)
    }
  })
}

// 左侧面板滚动事件处理
const handleLeftScroll = () => {
  if (!chatContainer.value) return

  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px容差

  // 如果用户滚动到顶部或中间位置，禁用自动滚动
  if (!isAtBottom) {
    leftScrollDisabled.value = true
  }
  // 如果用户滚动到底部，重新启用自动滚动
  else {
    leftScrollDisabled.value = false
  }
}

// 右侧面板滚动事件处理
const handleRightScroll = () => {
  if (!detailContent.value) return

  const { scrollTop, clientHeight } = detailContent.value

  // 检测滚动方向
  const scrollDelta = scrollTop - lastRightScrollTop.value
  const scrollDirection = Math.abs(scrollDelta) > 2 ? (scrollDelta > 0 ? 'down' : 'up') : 'none'

  // 更新上次滚动位置
  lastRightScrollTop.value = scrollTop

  // 如果用户上滚，停止自动滚动
  if (scrollDirection === 'up' && !rightScrollDisabled.value) {
    rightScrollDisabled.value = true
    return
  }

  // 检查用户是否滚动到了当前生成内容所在的页面
  const isAtGenerationPage = scrollTop + clientHeight >= currentGenerationPosition.value - 50

  // 如果用户下滚到当前生成内容页面，重新启用自动滚动
  if (scrollDirection === 'down' && isAtGenerationPage && rightScrollDisabled.value) {
    rightScrollDisabled.value = false
  }
}

// 将scrollToHeading函数挂载到全局，供HTML中的onclick调用
;(window as any).scrollToHeading = scrollToHeading

// 复制代码函数
const copyCode = (codeId: string) => {
  const codeElement = document.getElementById(codeId)
  if (codeElement) {
    const text = codeElement.textContent || ''
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ElMessage.success('代码已复制到剪贴板')
      })
      .catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        ElMessage.success('代码已复制到剪贴板')
      })
  }
}

// 将copyCode函数挂载到全局，供HTML中的onclick调用
;(window as any).copyCode = copyCode

// 监听消息变化，自动滚动到最新内容
watch(
  messages,
  () => {
    scrollToBottom() // 右侧面板滚动到底部
    scrollLeftToBottom() // 左侧面板也滚动到底部
  },
  { deep: true }
)

// 监听流式传输状态，在流式传输时也自动滚动
watch(streaming, newVal => {
  if (newVal) {
    scrollToBottom() // 右侧面板滚动到底部
    scrollLeftToBottom() // 左侧面板也滚动到底部
  }
})

// 初始化滚动位置
const initializeScrollPositions = () => {
  if (detailContent.value) {
    lastRightScrollTop.value = detailContent.value.scrollTop
  }
}

// 生命周期
onMounted(() => {
  document.body.classList.add('initial-view')
  inputRef.value?.focus()

  // 初始化滚动位置
  nextTick(() => {
    initializeScrollPositions()
  })
})
</script>

<style scoped>
.ai-chat-app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%);
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.app-header h1 {
  font-size: 26px;
  text-shadow: 0 0 8px var(--el-color-primary);
  color: #ffca28;
}

.app-header::before {
  content: '⚡';
  font-size: 28px;
  color: var(--el-color-primary);
}

.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
  gap: 24px;
  overflow: hidden;
}

.panel-left {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel-right {
  flex: 0 0 60%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.meta {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 500;
}

.composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 1px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-container {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 8px 0 0 0;
  margin-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.detail-panel {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  line-height: 1.7;
  padding: 16px;
}

.footer-note {
  font-size: 13px;
  color: #6b7280;
  margin-top: 12px;
  text-align: center;
}

/* 消息样式 */
.message {
  margin: 4px 0;
  padding: 16px 20px;
  border-radius: 22px;
  max-width: 80%;
  line-height: 1.7;
  position: relative;
  animation: fadeIn 0.4s ease-in;
}

.msg-user {
  background: transparent;
  color: #1f2937;
  margin-left: auto;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.msg-assistant {
  color: #1f2937;
  border-radius: 22px;
  max-width: 100%;
}

.msg-system {
  color: #8b5cf6;
  font-style: italic;
  text-align: center;
  max-width: 100%;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 22px;
}

.msg-assistant-summary {
  background: transparent;
  padding: 0;
  border-radius: 0;
  line-height: 1.7;
  animation: fadeIn 0.4s ease-in;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 70;
}

/* AI加载动画 */
.ai-loading {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 20px;
  margin: 4px 0;
  border-radius: 22px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
}

.ai-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: loading-bounce 1.4s infinite ease-in-out both;
}

.ai-loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.ai-loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.ai-loading-dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 初始化样式 */
body.initial-view {
  overflow: hidden;
}

body.initial-view .composer {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 90%;
  max-width: 500px;
  transform: translate(-50%, -50%);
  margin-top: 0;
  z-index: 10;
  max-height: 80vh;
  overflow: hidden;
}

body.initial-view .footer-note {
  position: fixed;
  bottom: calc(50% - 100px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

body.initial-view .panel-left .chat-container,
body.initial-view .panel-right,
body.initial-view .meta {
  opacity: 0;
  pointer-events: none;
}

body:not(.initial-view) .panel-left .chat-container,
body:not(.initial-view) .panel-right,
body:not(.initial-view) .meta {
  opacity: 1;
}

/* 音量指示器样式 */
.volume-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: #67c23a;
  border-radius: 0 0 8px 8px;
  transition:
    width 0.1s ease,
    background-color 0.1s ease;
  z-index: 1;
}
</style>
