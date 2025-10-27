# AI智能助手前端项目

一个基于Vue 3 + TypeScript + Element Plus的现代化AI智能助手前端应用。

## 🚀 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus + Semi Design
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Sass/SCSS
- **代码规范**: ESLint + Prettier
- **实时通信**: Socket.IO

## 📁 项目结构

```
ai-agent-frontend/
├── src/
│   ├── components/          # 公共组件
│   ├── layout/             # 布局组件
│   ├── modules/            # 业务模块
│   ├── router/             # 路由配置
│   ├── stores/             # 状态管理
│   ├── utils/              # 工具函数
│   ├── views/              # 页面组件
│   │   └── chat/           # 聊天模块
│   │       ├── components/ # 聊天相关组件
│   │       ├── stores/     # 聊天状态管理
│   │       ├── styles/     # 聊天样式
│   │       └── utils/      # 聊天工具函数
│   └── assets/             # 静态资源
├── public/                 # 公共资源
└── package.json           # 项目配置
```

## 🛠️ 开发环境设置

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### ⚠️ 重要提示：首次安装

如果项目是从压缩包解压获得的，**必须先删除 node_modules 目录**（如果有的话），然后重新安装依赖：

```bash
# 删除旧的 node_modules（避免权限问题）
rm -rf node_modules

# 使用 npm 安装依赖
npm install

# 或使用 yarn
yarn install
```

**常见错误**：如果运行 `npm run dev` 时报错 `operation not permitted`，说明项目文件中包含了从其他机器复制的 `node_modules` 目录，导致权限问题。解决方法：

1. 删除 `node_modules` 目录
2. 删除 `package-lock.json`（可选）
3. 运行 `npm install` 重新安装

### 启动开发服务器

```bash
# 开发模式
npm run dev

# 或
yarn dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用

### 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

## 📝 代码规范

### 代码检查

```bash
# 检查代码规范
npm run lint:check

# 自动修复代码规范问题
npm run lint
```

### 代码格式化

```bash
# 检查代码格式
npm run format:check

# 自动格式化代码
npm run format
```

## 🎯 主要功能

- **智能聊天**: 支持多轮对话，实时消息传输
- **模型管理**: 支持多种AI模型切换
- **角色设定**: 可自定义AI助手角色和行为
- **文件管理**: 支持文件上传和浏览
- **数据连接**: 支持多种数据源连接
- **响应式设计**: 适配多种设备屏幕

## 🔧 开发指南

### 添加新功能

1. 在 `src/views/` 下创建新的页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 如需状态管理，在 `src/stores/` 下创建对应的store
4. 在 `src/components/` 下创建可复用的组件

### 样式开发

- 使用Sass/SCSS编写样式
- 遵循BEM命名规范
- 样式文件按模块组织在 `src/assets/sass/` 下

### 组件开发

- 使用Vue 3 Composition API
- 支持TypeScript类型检查
- 遵循Vue 3最佳实践

## 🤝 团队协作

### Git工作流

1. **创建功能分支**

   ```bash
   git checkout -b feature/功能名称
   ```

2. **提交更改**

   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   ```

3. **推送分支**

   ```bash
   git push origin feature/功能名称
   ```

4. **创建Pull Request**
   - 在GitHub上创建PR
   - 请求代码审查
   - 合并到主分支

### 代码审查

- 所有代码变更需要通过Pull Request
- 至少需要一名团队成员审查
- 确保代码符合项目规范

## 📋 待办事项

- [ ] 完善单元测试覆盖
- [ ] 添加E2E测试
- [ ] 优化性能监控
- [ ] 完善错误处理机制

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 创建Issue: [GitHub Issues](https://github.com/您的用户名/ai-agent-frontend/issues)
- 团队群聊: [团队沟通群]

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
