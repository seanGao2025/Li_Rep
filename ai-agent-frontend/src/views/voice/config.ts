/**
 * 语音服务配置文件
 */

import { endpoints } from '@/config/endpoints'

export interface VoiceConfig {
  // 后端服务配置
  backend: {
    baseUrl: string
    timeout: number
    maxRetries: number
    pollInterval: number
  }
  
  // 录音配置
  recording: {
    audioBitsPerSecond: number
    mimeType: string
    dataCollectionInterval: number
  }
  
  // 语音识别配置
  speechRecognition: {
    supportedLanguages: string[]
    confidenceThreshold: number
  }
  
  // TTS配置
  textToSpeech: {
    voice: string
    speed: number
    pitch: number
  }
}

export const defaultVoiceConfig: VoiceConfig = {
  backend: {
    baseUrl: endpoints.voiceBackend.baseUrl,
    timeout: 30000,
    maxRetries: 30,
    pollInterval: 1000
  },
  recording: {
    audioBitsPerSecond: 128000,
    mimeType: 'audio/webm;codecs=opus',
    dataCollectionInterval: 100
  },
  speechRecognition: {
    supportedLanguages: ['zh-CN', 'en-US'],
    confidenceThreshold: 0.7
  },
  textToSpeech: {
    voice: 'zh_CN-huayan-medium',
    speed: 1.0,
    pitch: 1.0
  }
}

// 从环境变量或配置文件加载配置
export function loadVoiceConfig(): VoiceConfig {
  const config = { ...defaultVoiceConfig }
  
  // 从环境变量加载配置
  if (import.meta.env.VITE_VOICE_BACKEND_URL) {
    config.backend.baseUrl = import.meta.env.VITE_VOICE_BACKEND_URL
  }
  
  if (import.meta.env.VITE_VOICE_TIMEOUT) {
    config.backend.timeout = parseInt(import.meta.env.VITE_VOICE_TIMEOUT)
  }
  
  if (import.meta.env.VITE_VOICE_MAX_RETRIES) {
    config.backend.maxRetries = parseInt(import.meta.env.VITE_VOICE_MAX_RETRIES)
  }
  
  return config
}
