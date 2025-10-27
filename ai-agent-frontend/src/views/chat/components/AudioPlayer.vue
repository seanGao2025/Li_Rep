<template>
  <div v-if="visible" class="audio-player">
    <div class="audio-controls">
      <!-- 播放/暂停按钮 -->
      <button class="play-button" @click="togglePlay" :disabled="!audioUrl">
        <svg v-if="!isPlaying" viewBox="0 0 24 24" class="play-icon">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="pause-icon">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>

      <!-- 时间显示 -->
      <div class="time-display">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <span class="separator">/</span>
        <span class="total-time">{{ formatTime(duration) }}</span>
      </div>

      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-bar" @click="seekTo" ref="progressBar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <!-- 音量控制 -->
      <button class="volume-button" @click="toggleMute">
        <svg v-if="!isMuted" viewBox="0 0 24 24" class="volume-icon">
          <path
            d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="mute-icon">
          <path
            d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
          />
        </svg>
      </button>

      <!-- 更多选项 -->
      <button class="more-button" @click="showMoreOptions">
        <svg viewBox="0 0 24 24" class="more-icon">
          <path
            d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  visible: boolean
  audioUrl?: string
  autoPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: true
})

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  error: [error: Error]
}>()

// 状态
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioElement = ref<HTMLAudioElement | null>(null)
const progressBar = ref<HTMLElement>()

// 计算属性
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 方法
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

const toggleMute = () => {
  if (!audioElement.value) return

  isMuted.value = !isMuted.value
  audioElement.value.muted = isMuted.value
}

const seekTo = (event: MouseEvent) => {
  if (!audioElement.value || !progressBar.value) return

  const rect = progressBar.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * duration.value

  audioElement.value.currentTime = newTime
  currentTime.value = newTime
}

const showMoreOptions = () => {
  // 可以添加更多选项，如下载、分享等
  console.log('显示更多选项')
}

// 初始化音频
const initAudio = () => {
  if (!props.audioUrl) return

  audioElement.value = new Audio(props.audioUrl)

  audioElement.value.addEventListener('loadedmetadata', () => {
    duration.value = audioElement.value?.duration || 0
  })

  audioElement.value.addEventListener('timeupdate', () => {
    currentTime.value = audioElement.value?.currentTime || 0
  })

  audioElement.value.addEventListener('play', () => {
    isPlaying.value = true
    emit('play')
  })

  audioElement.value.addEventListener('pause', () => {
    isPlaying.value = false
    emit('pause')
  })

  audioElement.value.addEventListener('ended', () => {
    isPlaying.value = false
    currentTime.value = 0
    emit('ended')
  })

  audioElement.value.addEventListener('error', e => {
    console.error('音频播放错误:', e)
    emit('error', new Error('音频播放失败'))
  })

  // 自动播放
  if (props.autoPlay) {
    audioElement.value.play()
  }
}

// 清理音频
const cleanup = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
    audioElement.value = null
  }
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
}

// 监听属性变化
watch(
  () => props.visible,
  newVisible => {
    if (newVisible && props.audioUrl) {
      initAudio()
    } else {
      cleanup()
    }
  }
)

watch(
  () => props.audioUrl,
  newUrl => {
    if (props.visible && newUrl) {
      cleanup()
      initAudio()
    }
  }
)

// 生命周期
onMounted(() => {
  if (props.visible && props.audioUrl) {
    initAudio()
  }
})

onUnmounted(() => {
  cleanup()
})

// 暴露方法
defineExpose({
  play: () => audioElement.value?.play(),
  pause: () => audioElement.value?.pause(),
  stop: cleanup
})
</script>

<style scoped>
.audio-player {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.play-button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.play-button:hover:not(:disabled) {
  background: #5a6268;
}

.play-button:disabled {
  background: #dee2e6;
  cursor: not-allowed;
}

.play-icon,
.pause-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.time-display {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
  min-width: 60px;
  flex-shrink: 0;
}

.separator {
  margin: 0 2px;
}

.progress-container {
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-width: 0;
  max-width: 100%;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6c757d;
  border-radius: 2px;
  transition: width 0.1s;
}

.volume-button,
.more-button {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: color 0.2s;
  flex-shrink: 0;
}

.volume-button:hover,
.more-button:hover {
  color: #495057;
}

.volume-icon,
.mute-icon,
.more-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-player {
    padding: 8px 12px;
    margin: 8px 0;
  }

  .audio-controls {
    gap: 6px;
  }

  .play-button {
    width: 24px;
    height: 24px;
  }

  .play-icon,
  .pause-icon {
    width: 12px;
    height: 12px;
  }

  .time-display {
    font-size: 11px;
    min-width: 50px;
  }

  .volume-button,
  .more-button {
    width: 18px;
    height: 18px;
  }

  .volume-icon,
  .mute-icon,
  .more-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
