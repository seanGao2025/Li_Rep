<template>
  <div v-if="isVisible" class="voice-processing-bar">
    <div class="processing-content">
      <div class="robot-icon">🤖</div>
      <div class="processing-text">{{ text }}</div>
      <!-- <div class="progress-indicator" v-if="showProgress">({{ current }}/{{ total }})</div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  text?: string
  current?: number
  total?: number
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: 'AI思考中...',
  current: 0,
  total: 100,
  showProgress: false
})

const isVisible = computed(() => props.visible)
</script>

<style scoped>
.voice-processing-bar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 12px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInDown 0.3s ease-out;
  max-width: 300px;
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.robot-icon {
  font-size: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

.processing-text {
  flex: 1;
  white-space: nowrap;
}

.progress-indicator {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .voice-processing-bar {
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    margin: 0 20px;
    padding: 10px 16px;
    max-width: calc(100vw - 40px);
  }

  .processing-content {
    font-size: 14px;
    gap: 8px;
  }

  .robot-icon {
    font-size: 18px;
  }
}
</style>
