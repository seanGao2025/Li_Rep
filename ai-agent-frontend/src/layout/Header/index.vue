<template>
  <div class="header">
    <div class="header-left">
      <div class="header-left-logo">
        <img src="@/assets/images/logo.png" alt="logo" />
      </div>
    </div>
    <div class="header-center">
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        @select="handleMenuSelect"
        class="header-menu"
      >
        <el-menu-item index="/AI">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI 对话</span>
        </el-menu-item>
        <el-menu-item index="/socket-data">
          <el-icon><DataLine /></el-icon>
          <span>Socket 数据</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="header-right">
      <el-tag type="info" size="small">
        {{ currentTime }}
      </el-tag>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChatDotRound, DataLine } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const activeMenu = ref('/AI')
const currentTime = ref('')

// 时间更新定时器
let timeInterval: ReturnType<typeof setInterval> | null = null

// 方法
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  router.push(index)
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  // 设置当前激活菜单
  activeMenu.value = route.path

  // 更新时间
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left-logo img {
  height: 40px;
  width: auto;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-menu {
  border-bottom: none;
  background: transparent;
}

.header-menu .el-menu-item {
  border-bottom: none;
  margin: 0 10px;
  border-radius: 4px;
}

.header-menu .el-menu-item:hover {
  background-color: #f5f7fa;
}

.header-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: white;
}

.header-menu .el-menu-item.is-active .el-icon {
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .header {
    padding: 0 10px;
  }

  .header-center {
    display: none;
  }

  .header-right {
    font-size: 12px;
  }
}
</style>
