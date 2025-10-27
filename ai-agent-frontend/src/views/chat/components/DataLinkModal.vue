<template>
  <el-dialog v-model="show" title="数据链接" width="600px" :before-close="handleClose">
    <div class="data-link-content">
      <div class="data-link-status" :class="socketStore.connected ? 'connected' : 'disconnected'">
        当前状态: {{ socketStore.connected ? '已连接' : '未连接' }}
        <span v-if="socketStore.connected">ID: {{ socketStore.connectionId }}</span>
      </div>

      <div class="data-link-info">
        <strong>最后更新:</strong>
        <div>{{ socketStore.lastUpdate || '无' }}</div>
      </div>

      <div class="data-link-info">
        <strong>消息日志:</strong>
        <div class="message-log">
          <div v-for="(log, index) in socketStore.messageLogs" :key="index" class="log-item">
            [{{ log.time }}] {{ log.message }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button
        :type="socketStore.connected ? 'danger' : 'primary'"
        @click="handleToggleConnection"
        :loading="connecting"
      >
        {{ socketStore.connected ? '断开连接' : '连接' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSocketStore } from '../stores/socket'

interface Props {
  connected: boolean
}

interface Emits {
  (e: 'connect'): void
  (e: 'disconnect'): void
}

// 保持 props 以维持组件 API 兼容性
// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用 socket store 中的状态
const socketStore = useSocketStore()
const connecting = ref(false)
const show = ref(false)

const init = () => {
  show.value = true
}

const handleClose = () => {
  show.value = false
}

const handleToggleConnection = async () => {
  if (socketStore.connected) {
    emit('disconnect')
  } else {
    connecting.value = true
    try {
      emit('connect')
      // socketStore 会自动添加日志
    } catch (error) {
      socketStore.addLog('连接失败: ' + error)
    } finally {
      connecting.value = false
    }
  }
}

defineExpose({
  init
})
</script>

<style scoped>
.data-link-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-link-status {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
}

.data-link-status.connected {
  background-color: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

.data-link-status.disconnected {
  background-color: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.2);
  color: #f56c6c;
}

.data-link-info {
  margin: 8px 0;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.data-link-info:last-child {
  border-bottom: none;
}

.message-log {
  height: 130px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 4px;
  word-break: break-all;
}
</style>
