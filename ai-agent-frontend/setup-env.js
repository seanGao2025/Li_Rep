#!/usr/bin/env node

/**
 * 环境配置文件设置脚本
 * 用于帮助用户快速设置正确的环境变量
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 环境配置文件设置向导\n')

const envExampleContent = `# 前端服务配置
# VITE_FRONTEND_HOST=localhost
# VITE_FRONTEND_PORT=5174

# 语音后端服务配置（重要！需要根据实际部署服务器地址修改）
VITE_VOICE_BACKEND_HOST=localhost
VITE_VOICE_BACKEND_PORT=1013
# 或者直接使用完整 URL
# VITE_VOICE_BACKEND_URL=http://your-server-ip:1013

# LLM 服务配置
# VITE_LLM_HOST=localhost
# VITE_LLM_PORT=1234
# 或者直接使用完整 URL
# VITE_LLM_URL=http://your-server-ip:1234

# Socket 服务配置
# VITE_SOCKET_HOST=125.122.33.218
# VITE_SOCKET_PORT=8810
# 或者直接使用完整 URL
# VITE_SOCKET_URL=http://your-server-ip:8810
`

const envLocalContent = `# 本地开发环境配置
# 语音后端服务使用本地 localhost
VITE_VOICE_BACKEND_HOST=localhost
VITE_VOICE_BACKEND_PORT=1013

# LLM 服务配置
VITE_LLM_HOST=localhost
VITE_LLM_PORT=1234

# Socket 服务配置
VITE_SOCKET_HOST=125.122.33.218
VITE_SOCKET_PORT=8810
`

try {
  // 创建 .env.example
  const examplePath = path.join(__dirname, '.env.example')
  if (!fs.existsSync(examplePath)) {
    fs.writeFileSync(examplePath, envExampleContent)
    console.log('✅ 已创建 .env.example 文件')
  } else {
    console.log('ℹ️  .env.example 文件已存在')
  }

  // 创建 .env.local
  const localPath = path.join(__dirname, '.env.local')
  if (!fs.existsSync(localPath)) {
    fs.writeFileSync(localPath, envLocalContent)
    console.log('✅ 已创建 .env.local 文件（用于本地开发）')
  } else {
    console.log('ℹ️  .env.local 文件已存在')
  }

  console.log('\n📝 说明：')
  console.log('  1. .env.local 用于本地开发环境')
  console.log('  2. .env.production 用于生产环境构建')
  console.log('  3. 根据实际部署情况修改后端服务地址')
  console.log('\n🚀 下一步：')
  console.log('  1. 修改 .env.production 文件设置正确的服务器地址')
  console.log('  2. 运行 npm run build 进行构建')
  console.log('  3. 将 dist/ 目录部署到服务器')
  
} catch (error) {
  console.error('❌ 创建配置文件失败:', error.message)
  process.exit(1)
}

