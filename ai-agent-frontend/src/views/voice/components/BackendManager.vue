<template>
  <div class="backend-manager">
    <el-card class="manager-card">
      <template #header>
        <div class="card-header">
          <span>🎤 语音后端服务管理</span>
          <el-button type="primary" size="small" @click="refreshStatus" :loading="loading">
            刷新状态
          </el-button>
        </div>
      </template>

      <!-- 服务状态 -->
      <div class="status-section">
        <div class="status-item">
          <span class="label">服务状态:</span>
          <el-tag :type="backendStatus.running ? 'success' : 'danger'">
            {{ backendStatus.running ? '运行中' : '未运行' }}
          </el-tag>
        </div>

        <div class="status-item">
          <span class="label">服务地址:</span>
          <span class="value">{{ backendStatus.url }}</span>
        </div>

        <div class="status-item">
          <span class="label">端口:</span>
          <span class="value">{{ backendStatus.port }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <el-button
          type="success"
          @click="startBackend"
          :disabled="backendStatus.running"
          :loading="actionLoading"
        >
          启动服务
        </el-button>

        <el-button type="warning" @click="restartBackend" :loading="actionLoading">
          重启服务
        </el-button>

        <el-button
          type="danger"
          @click="stopBackend"
          :disabled="!backendStatus.running"
          :loading="actionLoading"
        >
          停止服务
        </el-button>
      </div>

      <!-- 服务信息 -->
      <div class="info-section">
        <el-collapse>
          <el-collapse-item title="服务信息" name="info">
            <div class="info-content">
              <p>
                <strong>服务名称:</strong>
                {{ backendInfo.name }}
              </p>
              <p>
                <strong>描述:</strong>
                {{ backendInfo.description }}
              </p>
              <p>
                <strong>管理路径:</strong>
                {{ backendInfo.managerPath }}
              </p>
            </div>
          </el-collapse-item>

          <el-collapse-item title="管理命令" name="commands">
            <div class="commands-content">
              <div class="command-item">
                <span class="command-label">启动:</span>
                <el-input :value="backendInfo.commands.start" readonly size="small">
                  <template #append>
                    <el-button @click="copyCommand(backendInfo.commands.start)">复制</el-button>
                  </template>
                </el-input>
              </div>

              <div class="command-item">
                <span class="command-label">停止:</span>
                <el-input :value="backendInfo.commands.stop" readonly size="small">
                  <template #append>
                    <el-button @click="copyCommand(backendInfo.commands.stop)">复制</el-button>
                  </template>
                </el-input>
              </div>

              <div class="command-item">
                <span class="command-label">重启:</span>
                <el-input :value="backendInfo.commands.restart" readonly size="small">
                  <template #append>
                    <el-button @click="copyCommand(backendInfo.commands.restart)">复制</el-button>
                  </template>
                </el-input>
              </div>

              <div class="command-item">
                <span class="command-label">状态:</span>
                <el-input :value="backendInfo.commands.status" readonly size="small">
                  <template #append>
                    <el-button @click="copyCommand(backendInfo.commands.status)">复制</el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { backendService, type BackendStatus } from '../backendService'
import { endpoints } from '@/config/endpoints'

// 响应式数据
const backendStatus = ref<BackendStatus>({
  running: false,
  port: endpoints.voiceBackend.port,
  url: endpoints.voiceBackend.baseUrl
})

const loading = ref(false)
const actionLoading = ref(false)

// 服务信息
const backendInfo = ref(backendService.getBackendInfo())

// 刷新状态
const refreshStatus = async () => {
  loading.value = true
  try {
    backendStatus.value = await backendService.checkStatus()
  } catch (error) {
    ElMessage.error('刷新状态失败')
  } finally {
    loading.value = false
  }
}

// 启动服务
const startBackend = async () => {
  actionLoading.value = true
  try {
    const success = await backendService.startBackend()
    if (success) {
      ElMessage.success('后端服务启动成功')
      await refreshStatus()
    } else {
      ElMessage.warning('请手动启动后端服务')
    }
  } catch (error) {
    ElMessage.error('启动服务失败')
  } finally {
    actionLoading.value = false
  }
}

// 停止服务
const stopBackend = async () => {
  actionLoading.value = true
  try {
    const success = await backendService.stopBackend()
    if (success) {
      ElMessage.success('后端服务已停止')
      await refreshStatus()
    } else {
      ElMessage.warning('请手动停止后端服务')
    }
  } catch (error) {
    ElMessage.error('停止服务失败')
  } finally {
    actionLoading.value = false
  }
}

// 重启服务
const restartBackend = async () => {
  actionLoading.value = true
  try {
    const success = await backendService.restartBackend()
    if (success) {
      ElMessage.success('后端服务重启成功')
      await refreshStatus()
    } else {
      ElMessage.warning('请手动重启后端服务')
    }
  } catch (error) {
    ElMessage.error('重启服务失败')
  } finally {
    actionLoading.value = false
  }
}

// 复制命令
const copyCommand = async (command: string) => {
  try {
    await navigator.clipboard.writeText(command)
    ElMessage.success('命令已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 组件挂载时刷新状态
onMounted(() => {
  refreshStatus()
})
</script>

<style scoped>
.backend-manager {
  max-width: 800px;
  margin: 0 auto;
}

.manager-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-section {
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
}

.value {
  font-family: monospace;
  color: #666;
}

.actions-section {
  margin-bottom: 20px;
}

.actions-section .el-button {
  margin-right: 10px;
}

.info-content p {
  margin: 10px 0;
}

.commands-content {
  padding: 10px 0;
}

.command-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.command-label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 60px;
}

.command-item .el-input {
  flex: 1;
  margin-right: 10px;
}
</style>
