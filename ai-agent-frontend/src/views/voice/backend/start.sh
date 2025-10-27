#!/bin/bash
# 语音后端服务启动脚本

echo "🎤 启动语音后端服务..."

# 进入后端目录
cd "$(dirname "$0")"

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 python3，请先安装 Python"
    exit 1
fi

# 检查端口是否被占用
if lsof -i :1013 > /dev/null 2>&1; then
    echo "⚠️  端口 1013 已被占用，正在停止现有服务..."
    pkill -f "python.*app.py" 2>/dev/null || true
    sleep 2
fi

# 检查依赖
echo "🔍 检查依赖..."
python3 -c "import flask, flask_cors, whisper, piper" 2>/dev/null || {
    echo "❌ 缺少依赖，请先安装："
    echo "pip3 install -r requirements.txt"
    exit 1
}

# 启动服务
echo "🚀 启动服务..."
echo "📍 服务地址: http://localhost:1013"
echo "🛑 按 Ctrl+C 停止服务"
echo "----------------------------------------"

python3 app.py
