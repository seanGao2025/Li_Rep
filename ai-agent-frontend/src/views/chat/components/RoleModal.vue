<template>
  <el-dialog v-model="show" title="角色设置" width="600px" :before-close="handleClose">
    <div class="template-actions">
      <el-button type="primary" plain @click="applyDigitalTwinTemplate">
        填充数字孪生潮流开发模板
      </el-button>
      <span class="template-tip">可一键生成面向 Three.js 数字孪生潮流展示开发的开放 Prompt</span>
    </div>
    <el-input
      v-model="rolePrompt"
      type="textarea"
      :rows="30"
      placeholder="请输入角色设定或系统提示..."
    />
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">设定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DIGITAL_TWIN_POWER_FLOW_PROMPT } from '@/constants/promptTemplates'

const emit = defineEmits(['confirm'])

const rolePrompt = ref('')
const loading = ref(false)

// 使用计算属性处理 v-model
const show = ref(false)
const init = (initialPrompt = '') => {
  rolePrompt.value = initialPrompt
  show.value = true
}

const applyDigitalTwinTemplate = () => {
  rolePrompt.value = DIGITAL_TWIN_POWER_FLOW_PROMPT
}

const handleClose = () => {
  show.value = false
}

const handleConfirm = async () => {
  loading.value = true
  try {
    // 模拟设置延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    emit('confirm', rolePrompt.value)
    handleClose()
  } catch (error) {
    console.error('Failed to set role:', error)
  } finally {
    loading.value = false
  }
}

defineExpose({
  init
})
</script>

<style scoped>
.template-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.template-tip {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

:deep(.el-textarea__inner) {
  min-height: 300px !important;
  height: 300px !important;
  resize: vertical;
}

:deep(.el-textarea) {
  min-height: 300px !important;
}
</style>
