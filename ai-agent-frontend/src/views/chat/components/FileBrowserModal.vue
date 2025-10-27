<template>
  <el-drawer v-model="show" title="资料浏览" direction="rtl" size="80%" :before-close="handleClose">
    <div class="file-browser-content">
      <!-- 内容区域 -->
      <div class="content-area" :class="{ 'preview-hidden': !showPreview }">
        <!-- 文件列表容器 -->
        <div class="file-list-container" :class="{ 'preview-visible': showPreview }">
          <div class="file-list">
            <div v-if="files.length === 0" class="empty-message">
              <el-icon size="60" color="#ccc">
                <Folder />
              </el-icon>
              <span>尚未选择资料库</span>
              <small>点击下方按钮开始浏览</small>
            </div>
            <div v-else>
              <div
                v-for="(file, index) in files"
                :key="index"
                class="file-item"
                @dblclick="showFilePreview(file)"
              >
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
                <div class="file-type">
                  {{ getFileExtension(file.name) || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件预览区域 -->
        <div v-if="showPreview" class="file-preview" :class="{ 'preview-visible': showPreview }">
          <div class="preview-header">
            <span class="preview-title">预览: {{ selectedFile?.name }}</span>
            <el-button type="text" @click="hidePreview" class="close-preview">&times;</el-button>
          </div>
          <div class="preview-content">
            <div v-if="previewContent" v-html="previewContent"></div>
            <div v-else-if="previewError" class="preview-error">
              {{ previewError }}
            </div>
            <div v-else class="preview-loading">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              加载中...
            </div>
          </div>
        </div>
      </div>

      <!-- 按钮容器 -->
      <div class="button-container">
        <input
          ref="fileInputRef"
          type="file"
          webkitdirectory
          multiple
          style="display: none"
          @change="handleFileSelect"
        />
        <el-button type="primary" @click="openFileDialog" :icon="FolderAdd">选择资料夹</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDrawer, ElButton, ElIcon, ElMessage } from 'element-plus'
import { Folder, FolderAdd, Loading } from '@element-plus/icons-vue'

const files = ref<File[]>([])
const selectedFile = ref<File | null>(null)
const showPreview = ref(false)
const previewContent = ref('')
const previewError = ref('')
const fileInputRef = ref<HTMLInputElement>()

// 使用计算属性处理 v-model
const show = ref(false)
const init = () => {
  show.value = true
}

// 方法
const handleClose = () => {
  show.value = false
}

const openFileDialog = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFiles = target.files

  if (selectedFiles && selectedFiles.length > 0) {
    files.value = Array.from(selectedFiles).sort((a, b) => a.name.localeCompare(b.name))
    hidePreview()
    ElMessage.success(`已选择 ${files.value.length} 个文件`)
  } else {
    files.value = []
  }
}

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const isTextFile = (ext: string): boolean => {
  return [
    'txt',
    'html',
    'css',
    'js',
    'json',
    'xml',
    'csv',
    'md',
    'log',
    'py',
    'java',
    'c',
    'cpp'
  ].includes(ext)
}

const isImageFile = (ext: string): boolean => {
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)
}

const showFilePreview = (file: File) => {
  selectedFile.value = file
  showPreview.value = true
  previewContent.value = ''
  previewError.value = ''

  const fileExtension = getFileExtension(file.name)

  if (isTextFile(fileExtension)) {
    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      if (fileExtension === 'html' || fileExtension === 'htm') {
        previewContent.value = `<iframe style="width: 100%; height: 100%; border: none;" srcdoc="${content.replace(
          /"/g,
          '&quot;'
        )}"></iframe>`
      } else {
        previewContent.value = `<pre><code>${content}</code></pre>`
      }
    }
    reader.onerror = () => {
      previewError.value = '文件读取失败'
    }
    reader.readAsText(file)
  } else if (isImageFile(fileExtension)) {
    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      previewContent.value = `<img src="${content}" style="max-width: 100%; max-height: 300px; display: block; margin: 0 auto; border-radius: 6px;" />`
    }
    reader.onerror = () => {
      previewError.value = '图片加载失败'
    }
    reader.readAsDataURL(file)
  } else {
    previewError.value = `不支持预览此文件类型 (.${fileExtension})`
  }
}

const hidePreview = () => {
  showPreview.value = false
  selectedFile.value = null
  previewContent.value = ''
  previewError.value = ''
}

defineExpose({
  init
})
</script>

<style scoped>
.file-browser-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

.content-area {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  gap: 20px;
  min-height: 0;
  height: calc(100vh - 200px);
  overflow: hidden;
  transition: gap 0.3s ease;
}

.content-area.preview-hidden {
  gap: 0;
}

.file-list-container {
  flex: 1;
  transition: flex 0.4s ease;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.file-list-container.preview-visible {
  flex: 0 0 40%;
}

.file-list {
  flex-grow: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  max-height: 100%;
  min-width: 0; /* 允许收缩，防止溢出 */
  /* 使用scrollbar-gutter来预留滚动条空间，避免布局跳动 */
  scrollbar-gutter: stable;
  /* 只在内容真正超出时才显示滚动条 */
  overflow-y: auto;
  overflow-x: hidden; /* 防止水平滚动 */
}

.file-preview {
  flex: 1;
  flex-shrink: 0;
  display: none;
  flex-direction: column;
  animation: fadeIn 0.4s ease;
  min-height: 0;
  max-height: 100%;
  transition: flex 0.4s ease;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.file-preview.preview-visible {
  display: flex;
  flex: 0 0 60%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  min-width: 0; /* 允许flex子元素收缩 */
}

.preview-title {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* 占据剩余空间 */
  margin-right: 12px; /* 与按钮保持距离 */
}

.close-preview {
  font-size: 1.5rem;
  color: #6b7280;
  transition:
    color 0.2s,
    transform 0.2s;
  line-height: 1;
  flex-shrink: 0; /* 防止按钮被挤压 */
  padding: 4px 8px; /* 增加点击区域 */
  min-width: 32px; /* 确保最小宽度 */
}

.close-preview:hover {
  color: #1f2937;
  transform: scale(1.1);
}

.preview-content {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
  font-family: 'SF Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #f8f9fa;
  max-height: 100%;
}

.preview-error {
  text-align: center;
  color: #6b7280;
  padding: 20px;
}

.preview-loading {
  text-align: center;
  color: #6b7280;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-container {
  flex-shrink: 0;
  text-align: right;
  padding: 16px 0;
}

.empty-message {
  text-align: center;
  color: #6b7280;
  padding: 40px 20px; /* 减少左右padding，避免水平滚动 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  box-sizing: border-box; /* 确保padding包含在宽度内 */
  min-width: 0; /* 允许收缩 */
}

.empty-message span {
  margin: 8px 0;
}

.empty-message small {
  color: #9ca3af;
}

.file-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 16px;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex-grow: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1f2937;
  font-size: 0.9rem;
}

.file-size {
  color: #6b7280;
  font-size: 0.875rem;
  width: 100px;
  text-align: right;
  flex-shrink: 0;
}

.file-type {
  color: #6b7280;
  font-size: 0.875rem;
  background-color: #f1f5f9;
  padding: 3px 8px;
  border-radius: 12px;
  width: 90px;
  text-align: center;
  flex-shrink: 0;
  text-transform: uppercase;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
