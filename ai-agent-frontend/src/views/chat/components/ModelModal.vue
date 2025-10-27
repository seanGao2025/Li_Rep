<template>
  <el-drawer
    v-model="show"
    title="模型与业务逻辑"
    direction="rtl"
    size="80%"
    :before-close="handleClose"
  >
    <div class="model-modal-content">
      <div class="panel-card">
        <el-tabs v-model="activeTab" class="model-tabs">
          <el-tab-pane label="算法" name="algorithms">
            <div class="selection-panel">
              <div class="unified-grid">
                <!-- 算法卡片 -->
                <div
                  v-for="algorithm in algorithms"
                  :key="algorithm.id"
                  class="algorithm-card"
                  :class="{
                    selected: isSelected(algorithm, 'algorithm'),
                    running: algorithm.status === 'running'
                  }"
                >
                  <el-checkbox
                    :model-value="isSelected(algorithm, 'algorithm')"
                    @change="toggleSelection(algorithm, 'algorithm')"
                    @click.stop
                  />
                  <el-tooltip
                    :content="algorithm.tooltip"
                    trigger="click"
                    placement="top"
                    effect="light"
                  >
                    <div class="model-name">
                      {{ algorithm.name }}
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="业务逻辑" name="business">
            <div class="selection-panel">
              <div class="business-logic-container">
                <el-collapse v-model="activeCategories" class="business-collapse">
                  <el-collapse-item
                    v-for="category in businessLogicCategories"
                    :key="category.name"
                    :name="category.name"
                  >
                    <template #title>
                      <span class="category-title">{{ category.name }}</span>
                    </template>
                    <div class="category-content">
                      <div
                        v-for="business in category.items"
                        :key="business.id"
                        class="business-card"
                        :class="{
                          selected: isSelected(business, 'business'),
                          running: business.status === 'running'
                        }"
                      >
                        <el-checkbox
                          :model-value="isSelected(business, 'business')"
                          @change="toggleSelection(business, 'business')"
                          @click.stop
                        />
                        <el-tooltip
                          :content="business.tooltip"
                          trigger="click"
                          placement="top"
                          effect="light"
                        >
                          <div class="model-name">
                            {{ business.name }}
                          </div>
                        </el-tooltip>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElDrawer, ElCheckbox, ElTabs, ElTabPane, ElCollapse, ElCollapseItem } from 'element-plus'
import type { Business, Algorithm } from '../types/index'
import { algorithmsData, businessLogicsData, businessLogicCategoriesList } from '../utils/modelData'

// 定义emit
const emit = defineEmits<{
  confirm: [data: { algorithms: Algorithm[]; businessLogics: Business[] }]
}>()

// 响应式数据
const activeTab = ref('algorithms')
// 使用数组存储多选的项目
const selectedItems = ref<
  Array<{ id: string; type: 'business' | 'algorithm'; item: Business | Algorithm }>
>([])

// 业务逻辑折叠面板的激活分类
const activeCategories = ref<string[]>([...businessLogicCategoriesList])

// 使用计算属性处理 v-model
const show = ref(false)
const init = () => {
  show.value = true
}

// 业务逻辑数据
const businessLogics = ref<Business[]>([...businessLogicsData])

// 按分类组织业务逻辑数据
const businessLogicCategories = computed(() => {
  return businessLogicCategoriesList.map(categoryName => ({
    name: categoryName,
    items: businessLogics.value.filter(b => b.category === categoryName)
  }))
})

// 算法数据
const algorithms = ref<Algorithm[]>([...algorithmsData])

// 方法
const handleClose = () => {
  // 整理选中的项目数据
  const algorithms: Algorithm[] = []
  const businessLogics: Business[] = []

  selectedItems.value.forEach(selected => {
    if (selected.type === 'algorithm') {
      algorithms.push(selected.item as Algorithm)
    } else if (selected.type === 'business') {
      businessLogics.push(selected.item as Business)
    }
  })

  // 发送数据给父组件
  emit('confirm', { algorithms, businessLogics })

  show.value = false
  // 关闭后清空选择
  selectedItems.value = []
}

// 判断项目是否被选中
const isSelected = (item: Business | Algorithm, type: 'business' | 'algorithm'): boolean => {
  return selectedItems.value.some(selected => selected.id === item.id && selected.type === type)
}

// 切换选择状态
const toggleSelection = (item: Business | Algorithm, type: 'business' | 'algorithm') => {
  const index = selectedItems.value.findIndex(
    selected => selected.id === item.id && selected.type === type
  )

  if (index > -1) {
    // 已选中，取消选择
    selectedItems.value.splice(index, 1)
  } else {
    // 未选中，添加到选择列表
    selectedItems.value.push({ id: item.id, type, item })
  }
}

defineExpose({
  init
})
</script>

<style scoped>
/* Tab样式 */
.model-tabs {
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.model-tabs :deep(.el-tabs__header) {
  margin: 0 0 16px 0;
}

.model-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.model-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.model-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 16px;
}

.model-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 20px;
}

.model-tabs :deep(.el-tabs__item.is-active) {
  color: #4fc3f7;
}

.model-tabs :deep(.el-tabs__active-bar) {
  background-color: #4fc3f7;
}

.model-modal-content {
  height: 100%;
}

.panel-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selection-panel {
  height: 100%;
  overflow: hidden;
}

.unified-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px 16px 20px 16px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 业务逻辑折叠面板样式 */
.business-logic-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 16px 20px 16px;
  box-sizing: border-box;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
}

.category-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 8px;
}

.business-card,
.algorithm-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 30px;
  position: relative;
  overflow: visible;
}

/* 复选框样式 */
.business-card :deep(.el-checkbox),
.algorithm-card :deep(.el-checkbox) {
  flex-shrink: 0;
}

.business-card:hover,
.algorithm-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.business-card:hover {
  border-color: #e6a23c;
}

.algorithm-card:hover {
  border-color: #67c23a;
}

.business-card.selected {
  border-color: #e6a23c;
  background: rgba(230, 162, 60, 0.05);
}

.algorithm-card.selected {
  border-color: #67c23a;
  background: rgba(103, 194, 58, 0.05);
}

.business-card.running,
.algorithm-card.running {
  position: relative;
}

.model-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.model-name:hover {
  color: #67c23a;
  text-decoration: underline;
}

.business-card .model-name:hover {
  color: #e6a23c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .unified-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;
  }

  .category-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .unified-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  .category-content {
    grid-template-columns: 1fr;
  }

  .business-card,
  .algorithm-card {
    min-height: 30px;
    padding: 8px;
  }

  .model-name {
    font-size: 12px;
  }
}
</style>
