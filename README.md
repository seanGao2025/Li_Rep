# Li_Rep

电网智能体 V1.33

## 快速开始

### 前置要求

1. **Node.js 18+**
2. **Python 3.8+** (语音功能需要)
3. **ffmpeg** (音频处理需要)

### 安装依赖

#### 前端依赖

```bash
cd ai-agent-frontend
npm install
```

#### 后端依赖

```bash
cd ai-agent-frontend/src/views/voice/backend
pip3 install -r requirements.txt
```

### 启动服务

#### 1. 启动语音后端服务（需要语音功能时）

**重要**：如果使用语音功能，必须先启动后端服务，否则会报错 `ERR_CONNECTION_REFUSED`

```bash
cd ai-agent-frontend/src/views/voice/backend
bash start.sh
```

或使用 Python 直接启动：

```bash
python3 app.py
```

更多配置说明请参考：[语音后端服务配置指南](ai-agent-frontend/src/views/voice/backend/README.md)

#### 2. 启动前端服务

```bash
cd ai-agent-frontend
npm run dev
```

访问：http://localhost:5174

### 构建生产版本

```bash
cd ai-agent-frontend
npm run build
```

## 常见问题

### Q: 语音功能报错 `POST http://localhost:1013/speech net::ERR_CONNECTION_REFUSED`

A: 需要先启动语音后端服务，步骤见上。

### Q: 如何配置服务端口？

A: 修改 `ai-agent-frontend/src/config/endpoints.ts` 或使用环境变量。

详细配置请参考：[语音后端服务配置指南](ai-agent-frontend/src/views/voice/backend/README.md)

## 项目结构

```
ai-agent-frontend/
├── src/
│   ├── views/
│   │   ├── chat/              # 聊天视图
│   │   ├── socket-chat/       # Socket 聊天视图
│   │   └── voice/             # 语音功能
│   │       └── backend/       # 语音后端服务 (Python Flask)
│   └── config/
│       └── endpoints.ts       # 服务端点配置
└── package.json
```

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **后端**: Python Flask + Whisper + Piper TTS
- **UI**: Element Plus
