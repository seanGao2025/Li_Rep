/**
 * 语音录制服务
 * 基于 WebRTC MediaRecorder API 的语音录制功能
 */

export interface VoiceRecorderOptions {
  audioBitsPerSecond?: number
  mimeType?: string
  silenceThreshold?: number // 结束录音的静音阈值 (0-1)
  speechStartThreshold?: number // 开始录音的语音阈值 (0-1)
  silenceDuration?: number // 静音持续时间 (毫秒)
  minRecordingDuration?: number // 最小录音时长 (毫秒)
}

export interface VoiceRecorderCallbacks {
  onStart?: () => void
  onStop?: () => void
  onDataAvailable?: (audioBlob: Blob) => void
  onError?: (error: Error) => void
  onSilenceDetected?: () => void // 静音检测回调
  onVolumeChange?: (volume: number) => void // 音量变化回调
  isAudioPlaying?: () => boolean // 检查音频是否正在播放
  isAIStreaming?: () => boolean // 检查AI是否正在生成
  onUserStartSpeaking?: () => void // 用户开始说话的回调（在录音前调用，用于打断）
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private callbacks: VoiceRecorderCallbacks = {}
  private options: VoiceRecorderOptions
  
  // 静音检测相关
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array | null = null
  private silenceTimer: number | null = null
  private lastSoundTime: number = 0
  private _isContinuousMode: boolean = false
  private silenceStartTime: number = 0 // 静音开始时间
  
  // 公共访问器和设置器
  get isContinuousMode(): boolean {
    return this._isContinuousMode
  }
  
  set isContinuousMode(value: boolean) {
    this._isContinuousMode = value
    console.log('🎤 VoiceRecorder isContinuousMode 设置为:', value)
  }
  private isInSilence: boolean = false // 是否处于静音状态
  private isListeningForSpeech: boolean = false // 是否正在监听用户说话
  private isCurrentlyRecording: boolean = false // 是否正在录音
  private preRecordingBuffer: Blob[] = [] // 预录音缓冲区
  private isPreRecording: boolean = false // 是否正在预录音
  private preRecordingMediaRecorder: MediaRecorder | null = null // 预录音MediaRecorder
  private isFirstStart: boolean = true // 是否是第一次启动
  private lowVolumeCount: number = 0 // 连续低音量计数
  private volumeHistory: number[] = [] // 音量历史记录
  private maxVolumeHistory: number = 20 // 最大历史记录数量
  private maxPreRecordingChunks: number = 100 // 最大预录音块数（5秒，50ms*100=5秒）
  private preRecordingChunkSize: number = 50 // 预录音数据收集间隔（50ms）
  private preRecordingStartTime: number = 0 // 预录音开始时间
  // 移除了音量历史和自适应阈值相关属性

  constructor(options: VoiceRecorderOptions = {}) {
    this.options = {
      audioBitsPerSecond: 16000, // 降低比特率，提高兼容性
      mimeType: this.getSupportedMimeType(),
      silenceThreshold: 0.05, // 结束录音的静音阈值（提高阈值，避免环境噪音干扰）
      speechStartThreshold: 0.15, // 开始录音的语音阈值（较高，需要明显说话才触发）
      silenceDuration: 1000, // 1秒静音，提高响应速度
      minRecordingDuration: 1000, // 最小录音时长1秒，确保有足够内容
      ...options
    }
  }

  /**
   * 设置回调函数
   * @param callbacks 回调函数对象
   */
  setCallbacks(callbacks: VoiceRecorderCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 开始录音（智能监听模式）
   * @param continuousMode 是否为持续模式
   * @returns Promise<void>
   */
  async startRecording(continuousMode: boolean = false): Promise<void> {
    try {
      console.log('🎤 VoiceRecorder.startRecording 调用，持续模式:', continuousMode)
      console.log('🎤 是否第一次启动:', this.isFirstStart)
      this.isContinuousMode = continuousMode
      
      // 请求麦克风权限
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // 设置音频分析
      this.setupAudioAnalysis()

      // 第一次启动时直接开始持续监听和静音检测
      if (this.isFirstStart) {
        console.log('🎤 第一次启动：直接开始持续监听和静音检测')
        this.isFirstStart = false
        await this.startActualRecording()
      } else {
        // 后续启动使用智能监听
        console.log('🎤 后续启动：使用智能监听')
        this.startSmartListening()
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error('无法访问麦克风')
      this.callbacks.onError?.(err)
      throw err
    }
  }

  /**
   * 停止录音
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
    this.stopSilenceDetection()
    this.isListeningForSpeech = false  // 停止智能监听
    this.isCurrentlyRecording = false
    this.stopPreRecording()  // 停止预录音
  }

  /**
   * 重新开始录音（持续模式）
   */
  async restartRecording(): Promise<void> {
    try {
      console.log('🎤 持续模式：开始智能监听')
      console.log('🎤 当前 isContinuousMode:', this.isContinuousMode)
      console.log('🎤 是否第一次启动:', this.isFirstStart)
      
      // 如果音频流不可用，重新获取
      if (!this.audioStream) {
        console.log('🎤 音频流不可用，重新获取麦克风权限')
        this.audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        })
        
        // 重新设置音频分析
        this.setupAudioAnalysis()
        console.log('🎤 音频流重新获取成功')
      }
      
      // 确保持续模式状态正确
      this.isContinuousMode = true
      console.log('🎤 设置 isContinuousMode 为:', this.isContinuousMode)
      
      // 重启时总是使用智能监听（因为第一次启动已经完成）
      console.log('🎤 重启：使用智能监听')
      this.startSmartListening()

    } catch (error) {
      const err = error instanceof Error ? error : new Error('重新开始监听失败')
      this.callbacks.onError?.(err)
      throw err
    }
  }

  /**
   * 开始录音（内部方法）
   */
  private async startRecordingInternal(continuousMode: boolean = false): Promise<void> {
    if (!this.audioStream) {
      throw new Error('音频流不可用')
    }

    try {
      // 检查浏览器支持的 MIME 类型
      const supportedMimeType = this.getSupportedMimeType()
      
      // 创建新的 MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        audioBitsPerSecond: this.options.audioBitsPerSecond,
        mimeType: supportedMimeType
      })

      // 重置音频块数组
      this.audioChunks = []

      // 设置事件监听器
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
          // console.log(`🎤 正式录音数据块: 大小=${event.data.size}bytes, 类型=${event.data.type}, 总块数=${this.audioChunks.length}`)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop()
      }

      this.mediaRecorder.onerror = (event) => {
        const error = new Error(`录音错误: ${event}`)
        this.callbacks.onError?.(error)
      }

      // 开始录音
      this.mediaRecorder.start(250) // 每250ms收集一次数据，确保有足够数据
      console.log('🎤 MediaRecorder 状态:', this.mediaRecorder.state)
      this.callbacks.onStart?.()
      console.log('🎤 录音开始回调已调用')

      // 如果是持续模式，开始静音检测
      if (continuousMode) {
        console.log('🎤 开始静音检测')
        this.startSilenceDetection()
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error('无法访问麦克风')
      this.callbacks.onError?.(err)
      throw err
    }
  }

  /**
   * 设置音频分析
   */
  private setupAudioAnalysis(): void {
    if (!this.audioStream) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = this.audioContext.createMediaStreamSource(this.audioStream)
      this.analyser = this.audioContext.createAnalyser()
      
      this.analyser.fftSize = 256
      this.analyser.smoothingTimeConstant = 0.8
      
      source.connect(this.analyser)
      
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
    } catch (error) {
      console.warn('音频分析设置失败:', error)
    }
  }

  /**
   * 开始智能监听（检测用户是否开始说话）
   */
  private startSmartListening(): void {
    if (!this.analyser || !this.dataArray) return

    console.log('🎤 开始智能监听，等待用户开始说话')
    this.isListeningForSpeech = true
    this.isCurrentlyRecording = false

    const checkVolume = () => {
      // 检查是否应该继续监听
      if (!this.analyser || !this.dataArray || !this.isListeningForSpeech || !this.isContinuousMode) {
        console.log('🎤 智能监听停止:', {
          analyser: !!this.analyser,
          dataArray: !!this.dataArray,
          isListeningForSpeech: this.isListeningForSpeech,
          isContinuousMode: this.isContinuousMode
        })
        return
      }

      this.analyser.getByteFrequencyData(this.dataArray as any)
      
      // 计算平均音量
      let sum = 0
      const dataArray = this.dataArray
      if (!dataArray) return
      
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] || 0
      }
      const average = sum / dataArray.length
      const volume = average / 255 // 归一化到 0-1

      // 触发音量变化回调
      this.callbacks.onVolumeChange?.(volume)

      const speechStartThreshold = this.options.speechStartThreshold || 0.15

      // 每20次检测输出一次调试信息
      if (Math.random() < 0.05) { // 约5%的概率输出日志
        // console.log(`🎤 智能监听: 当前音量=${volume.toFixed(4)}, 开始阈值=${speechStartThreshold.toFixed(4)}, 监听状态=${this.isListeningForSpeech}`)
      }

      // 检查AI是否正在生成
      const aiStreaming = this.callbacks.isAIStreaming ? this.callbacks.isAIStreaming() : false
      
      // 如果AI正在生成，直接忽略检测，不进行录音触发
      if (aiStreaming) {
        // console.log(`🎤 AI正在生成中（音量=${volume.toFixed(4)}），暂停语音检测`)
        requestAnimationFrame(checkVolume)
        return
      }

      // 检查是否是AI的语音播放
      const audioPlaying = this.callbacks.isAudioPlaying ? this.callbacks.isAudioPlaying() : false
      
      // 如果音频正在播放，直接忽略检测，不进行录音触发
      if (audioPlaying) {

        requestAnimationFrame(checkVolume)
        return
      }
      
      // 检查是否有明显的声音（用户开始说话）
      if (volume > speechStartThreshold) {
        // console.log(`🎤 检测到用户明显开始说话，音量=${volume.toFixed(4)}, 阈值=${speechStartThreshold.toFixed(4)}，开始正式录音`)
        this.isListeningForSpeech = false
        this.startActualRecording()
        return
      }

      // 继续监听
      requestAnimationFrame(checkVolume)
    }

    // 开始检测
    requestAnimationFrame(checkVolume)
  }

  /**
   * 开始预录音（持续录音，用于缓冲）
   */
  private async startPreRecording(): Promise<void> {
    if (!this.audioStream || this.isPreRecording) return

    try {
      console.log('🎤 开始预录音，确保不丢失用户开始说话的内容')
      this.isPreRecording = true
      this.preRecordingBuffer = []
      this.preRecordingStartTime = Date.now()

      // 创建预录音MediaRecorder，使用与正式录音相同的格式
      const preRecordingMimeType = this.getSupportedMimeType() // 使用相同的格式选择方法
      this.preRecordingMediaRecorder = new MediaRecorder(this.audioStream, {
        audioBitsPerSecond: this.options.audioBitsPerSecond,
        mimeType: preRecordingMimeType
      })

      // 设置预录音事件监听器
      this.preRecordingMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.preRecordingBuffer.push(event.data)
          
          // 每10个块输出一次调试信息，避免日志过多
          if (this.preRecordingBuffer.length % 10 === 0) {
            const totalSize = this.preRecordingBuffer.reduce((sum, chunk) => sum + chunk.size, 0)
            console.log(`🎤 预录音进度: 块数=${this.preRecordingBuffer.length}, 总大小=${totalSize}bytes, 当前块大小=${event.data.size}bytes`)
          }
          
          // 限制缓冲区大小，只保留最近5秒的内容
          if (this.preRecordingBuffer.length > this.maxPreRecordingChunks) {
            const removedChunk = this.preRecordingBuffer.shift()
            if (removedChunk) {
              console.log(`🎤 移除最旧的预录音块: 大小=${removedChunk.size}bytes`)
            }
          }
        }
      }

      this.preRecordingMediaRecorder.onerror = (event) => {
        console.error('预录音错误:', event)
      }

      // 开始预录音，每50ms收集一次数据，提高精度
      this.preRecordingMediaRecorder.start(this.preRecordingChunkSize)
      console.log(`🎤 预录音已启动，格式=${preRecordingMimeType}，收集间隔=${this.preRecordingChunkSize}ms`)

    } catch (error) {
      console.error('预录音启动失败:', error)
      this.isPreRecording = false
    }
  }

  /**
   * 停止预录音
   */
  private stopPreRecording(): void {
    if (this.preRecordingMediaRecorder && this.isPreRecording) {
      console.log('🎤 停止预录音')
      this.preRecordingMediaRecorder.stop()
      this.preRecordingMediaRecorder = null
      this.isPreRecording = false
    }
  }

  /**
   * 开始实际录音（不使用预录音）
   */
  private async startActualRecording(): Promise<void> {
    if (this.isCurrentlyRecording) return

    console.log('🎤 开始实际录音')
    
    // 调用用户开始说话的回调（用于打断AI生成/播放）
    console.log('🎤 onUserStartSpeaking 回调是否存在:', !!this.callbacks.onUserStartSpeaking)
    if (this.callbacks.onUserStartSpeaking) {
      console.log('🎤 调用用户开始说话回调，准备打断AI')
      this.callbacks.onUserStartSpeaking()
      console.log('🎤 用户开始说话回调已执行')
    } else {
      console.warn('🎤 onUserStartSpeaking 回调不存在，无法打断AI')
    }
    
    this.isCurrentlyRecording = true
    this.lastSoundTime = Date.now()
    this.silenceStartTime = 0
    this.isInSilence = false

    // 开始正式录音
    await this.startRecordingInternal(true)
    console.log('🎤 录音已开始')
  }

  /**
   * 开始实际录音（合并预录音内容）- 保留方法用于兼容性
   */
  private async startActualRecordingWithPreBuffer(): Promise<void> {
    if (this.isCurrentlyRecording) return

    console.log('🎤 开始实际录音，合并预录音内容')
    
    // 调用用户开始说话的回调（用于打断AI生成/播放）
    console.log('🎤 onUserStartSpeaking 回调是否存在:', !!this.callbacks.onUserStartSpeaking)
    if (this.callbacks.onUserStartSpeaking) {
      console.log('🎤 调用用户开始说话回调，准备打断AI')
      this.callbacks.onUserStartSpeaking()
      console.log('🎤 用户开始说话回调已执行')
    } else {
      console.warn('🎤 onUserStartSpeaking 回调不存在，无法打断AI')
    }
    
    this.isCurrentlyRecording = true
    this.lastSoundTime = Date.now()
    this.silenceStartTime = 0
    this.isInSilence = false

    // 停止预录音
    this.stopPreRecording()

    // 开始正式录音
    await this.startRecordingInternal(true)

    // 将预录音内容合并到当前录音中
    if (this.preRecordingBuffer.length > 0) {
      const totalPreRecordingSize = this.preRecordingBuffer.reduce((sum, chunk) => sum + chunk.size, 0)
      const preRecordingDuration = Date.now() - this.preRecordingStartTime
      const avgChunkSize = totalPreRecordingSize / this.preRecordingBuffer.length
      
      console.log(`🎤 合并预录音内容，共 ${this.preRecordingBuffer.length} 个音频块，总大小=${totalPreRecordingSize}bytes，预录音时长=${preRecordingDuration}ms，平均块大小=${avgChunkSize.toFixed(2)}bytes`)
      
      // 验证预录音质量
      if (totalPreRecordingSize < 1000) { // 小于1KB可能有问题
        console.warn('🎤 预录音内容过少，可能存在质量问题')
      }
      
      if (avgChunkSize < 50) { // 平均块大小过小
        console.warn('🎤 预录音块大小过小，可能存在数据丢失')
      }
      
      // 验证预录音和正式录音的格式一致性
      const preRecordingFormat = this.preRecordingBuffer[0]?.type || 'unknown'
      const currentFormat = this.audioChunks[0]?.type || 'unknown'
      
      if (preRecordingFormat !== currentFormat && this.audioChunks.length > 0) {
        console.warn(`🎤 格式不一致警告: 预录音格式=${preRecordingFormat}, 正式录音格式=${currentFormat}`)
      }
      
      // 将预录音内容添加到当前录音的音频块中（前置）
      this.audioChunks.unshift(...this.preRecordingBuffer)
      
      // 计算合并后的总大小
      const totalSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0)
      console.log(`🎤 合并完成，当前录音总大小=${totalSize}bytes，音频块数量=${this.audioChunks.length}`)
      
      // 验证合并后的音频质量
      if (totalSize < 2000) { // 小于2KB可能有问题
        console.warn('🎤 合并后音频总大小过小，可能存在质量问题')
      }
      
      this.preRecordingBuffer = []
    } else {
      console.log('🎤 没有预录音内容需要合并')
    }
  }


  /**
   * 开始静音检测（录音过程中）
   */
  private startSilenceDetection(): void {
    if (!this.analyser || !this.dataArray) return

    // 重置静音检测状态
    this.lastSoundTime = Date.now()
    this.silenceStartTime = 0
    this.isInSilence = false
    // 不再需要音量历史和自适应阈值

    const checkVolume = () => {
      if (!this.analyser || !this.dataArray) return

      this.analyser.getByteFrequencyData(this.dataArray as any)
      
      // 计算平均音量
      let sum = 0
      const dataArray = this.dataArray
      if (!dataArray) return
      
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] || 0
      }
      const average = sum / dataArray.length
      const volume = average / 255 // 归一化到 0-1

      // 触发音量变化回调
      this.callbacks.onVolumeChange?.(volume)

      // 记录音量历史
      this.volumeHistory.push(volume)
      if (this.volumeHistory.length > this.maxVolumeHistory) {
        this.volumeHistory.shift()
      }

      const currentTime = Date.now()
      const silenceThreshold = this.options.silenceThreshold! // 使用静音阈值

      // 计算平均音量
      const avgVolume = this.volumeHistory.length > 0 ? 
        this.volumeHistory.reduce((a, b) => a + b, 0) / this.volumeHistory.length : 0

      // 检查是否有声音 - 使用更智能的判断
      // 如果当前音量高于阈值，或者平均音量明显高于阈值，认为有声音
      const hasSound = volume > silenceThreshold || avgVolume > silenceThreshold * 1.2

      // 更频繁的调试信息
      if (Math.random() < 0.2) { // 约20%的概率输出日志
        // console.log(`🎤 音量检测: 当前音量=${volume.toFixed(4)}, 平均音量=${avgVolume.toFixed(4)}, 结束阈值=${silenceThreshold.toFixed(4)}, 静音状态=${this.isInSilence}, 有声音=${hasSound}`)
      }
      
      if (hasSound) {
        // 有声音，更新最后声音时间
        this.lastSoundTime = currentTime
        this.lowVolumeCount = 0 // 重置低音量计数
        
        // 在持续模式下，音量检测逻辑已移除，录音由AI回答完成后重新开始
        
        // 如果之前在静音状态，现在有声音了，清除静音状态
        if (this.isInSilence) {
          this.isInSilence = false
          this.silenceStartTime = 0
          // 清除静音计时器
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer)
            this.silenceTimer = null
          }
        }
      } else {
        // 音量低于阈值，增加低音量计数
        this.lowVolumeCount++
        
        // 如果连续低音量超过3次（约60ms），或者平均音量持续低于阈值，开始静音检测
        if (this.lowVolumeCount >= 3 || (this.volumeHistory.length >= 10 && avgVolume < silenceThreshold)) {
          if (!this.isInSilence) {
            // 开始静音状态
            this.isInSilence = true
            this.silenceStartTime = currentTime
            // console.log('🎤 开始静音检测，连续低音量次数:', this.lowVolumeCount)
          } else {
          // 已经在静音状态，检查静音时长
          const silenceDuration = currentTime - this.silenceStartTime
          const totalDuration = currentTime - (this.lastSoundTime - this.options.minRecordingDuration!)
          
          // 更频繁的静音检测调试信息
          if (Math.random() < 0.3) { // 约30%的概率输出日志
            // console.log(`🎤 静音检测: 静音时长=${silenceDuration}ms, 总时长=${totalDuration}ms, 需要静音时长=${this.options.silenceDuration}ms, 最小录音时长=${this.options.minRecordingDuration}ms, 当前音量=${volume.toFixed(4)}, 平均音量=${avgVolume.toFixed(4)}, 低音量计数=${this.lowVolumeCount}`)
          }
          
          if (silenceDuration >= this.options.silenceDuration! && !this.silenceTimer) {
            // 检查最小录音时长
            if (totalDuration >= this.options.minRecordingDuration!) {
              console.log('🎤 静音条件满足，准备停止录音')
              this.silenceTimer = window.setTimeout(() => {
                console.log('🎤 音量过小，自动停止录音')
                // 直接停止录音，触发数据处理流程
                this.stopRecording()
                this.silenceTimer = null
                
                // 在持续模式下，重新开始智能监听
                if (this.isContinuousMode) {
                  // console.log('🎤 持续模式：用户停止说话，重新开始智能监听')
                  setTimeout(() => {
                    this.startSmartListening()
                  }, 500) // 减少延迟到0.5秒重新开始监听
                }
              }, 100) // 减少延迟到100ms确保录音完成
            } else {
              console.log('🎤 静音时长足够，但总录音时长不足，继续等待')
            }
          }
        }
        }
      }

      // 继续检测
      if (this.isContinuousMode && this.mediaRecorder?.state === 'recording') {
        requestAnimationFrame(checkVolume)
      }
    }

    // 开始检测
    requestAnimationFrame(checkVolume)
  }

  // 移除了自适应阈值功能，使用固定阈值

  /**
   * 停止静音检测
   */
  private stopSilenceDetection(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }
    // 不在这里修改 isContinuousMode，应该由外部调用者控制
    this.isInSilence = false
    this.silenceStartTime = 0
    // 不再需要清理音量历史
  }

  /**
   * 检查是否正在录音
   * @returns boolean
   */
  isRecording(): boolean {
    return this.isCurrentlyRecording || this.mediaRecorder?.state === 'recording'
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stopSilenceDetection()
    
    // 停止预录音
    this.stopPreRecording()
    
    if (this.mediaRecorder) {
      this.mediaRecorder = null
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.analyser = null
    this.dataArray = null
    this.audioChunks = []
    this.preRecordingBuffer = []
    this.isPreRecording = false
    this.isListeningForSpeech = false
    this.isCurrentlyRecording = false
    this.isFirstStart = true
  }

  /**
   * 获取最兼容的 MIME 类型（用于预录音）
   * @returns string
   */

  /**
   * 获取支持的 MIME 类型
   * @returns string
   */
  private getSupportedMimeType(): string {
    const mimeTypes = [
      'audio/wav', // 优先使用 WAV，最兼容
      'audio/mp4', // MP4 格式，兼容性好
      'audio/mp4;codecs=mp4a.40.2', // MP4 with AAC codec
      'audio/ogg;codecs=opus', // OGG with Opus
      'audio/webm;codecs=opus', // WebM with Opus
      'audio/webm' // WebM 通用（最后选择）
    ]

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('🎤 选择音频格式:', mimeType)
        return mimeType
      }
    }

    console.warn('🎤 没有找到支持的音频格式，使用默认格式')
    return 'audio/wav' // 默认使用WAV，避免webm问题
  }

  /**
   * 处理录音停止
   */
  private handleRecordingStop(): void {
    // 检查是否有音频数据
    if (this.audioChunks.length === 0) {
      console.warn('🎤 录音停止但没有音频数据，跳过处理')
      this.callbacks.onStop?.()
      return
    }

    // 创建音频 Blob
    const mimeType = this.mediaRecorder?.mimeType || 'audio/wav'
    const audioBlob = new Blob(this.audioChunks, { type: mimeType })
    
    console.log('🎤 录音停止，音频数据大小:', audioBlob.size, 'bytes, 格式:', mimeType)

    // 验证音频数据大小
    if (audioBlob.size === 0) {
      console.warn('🎤 音频数据为空，跳过处理')
      this.callbacks.onStop?.()
      return
    }

    // 调用数据可用回调
    this.callbacks.onDataAvailable?.(audioBlob)

    // 调用停止回调
    this.callbacks.onStop?.()

    // 在持续模式下，不清理资源，准备重新开始
    if (!this.isContinuousMode) {
      this.cleanup()
    } else {
      // 只清理当前录音相关的资源，保留音频流和音频上下文
      this.audioChunks = []
      if (this.mediaRecorder) {
        this.mediaRecorder = null
      }
      // 注意：不清理 audioStream 和 audioContext，保持可用状态
      console.log('🎤 持续模式：保留音频流，准备重新开始录音')
    }
  }

  /**
   * 获取录音状态
   * @returns string
   */
  getState(): string {
    return this.mediaRecorder?.state || 'inactive'
  }
}

// 创建默认实例
export const voiceRecorder = new VoiceRecorder()
