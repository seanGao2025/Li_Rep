# AI 聊天组件

这是一个基于 Vue3 + Element Plus + TypeScript 的 AI 聊天界面组件，从原始的 HTML 代码转换而来。

## 功能特性

- 🤖 AI 聊天对话
- 🔗 数据链接管理
- 📁 文件浏览和预览
- ⚙️ 模型和业务逻辑管理
- 🎨 响应式设计
- 📱 移动端适配

## 组件结构

```
AI/
├── index.vue                 # 主组件
├── components/              # 子组件
│   ├── RoleModal.vue        # 角色设置弹窗
│   ├── DataLinkModal.vue    # 数据链接弹窗
│   ├── FileBrowserModal.vue # 文件浏览弹窗
│   └── ModelModal.vue       # 模型选择弹窗
├── stores/                  # 状态管理
│   ├── chat.ts             # 聊天状态
│   └── socket.ts           # Socket连接状态
├── utils/                   # 工具函数
│   └── contentFormatter.ts  # 内容格式化
├── styles/                  # 样式文件
│   └── chat.scss           # 聊天样式
├── types/                   # 类型定义
│   └── index.ts            # 类型声明
└── README.md               # 说明文档
```

## 使用方法

1. 在主路由中引入组件：

```vue
<template>
  <AI />
</template>

<script setup>
import AI from '@/views/AI/index.vue'
</script>
```

2. 确保已安装必要的依赖：

- Vue 3
- Element Plus
- Pinia (状态管理)
- Socket.IO Client

## 主要功能

### 聊天功能

- 支持流式对话
- 消息历史记录
- 角色设置
- 系统提示词

### 数据链接

- Socket.IO 连接管理
- 实时数据同步
- 连接状态监控

### 文件浏览

- 文件夹选择
- 文件预览
- 多种文件格式支持

### 模型管理

- 模型选择
- 业务逻辑管理
- 运行结果展示

## 样式特性

- 响应式布局
- 动画效果
- 主题适配
- 移动端优化

## 技术栈

- Vue 3 Composition API
- TypeScript
- Element Plus
- Pinia
- Socket.IO
- SCSS
