#!/bin/bash
# 语音后端服务快速启动脚本

set -e

echo "🎤 启动语音后端服务..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 python3，请先安装 Python 3.8+"
    echo "   macOS: brew install python3"
    echo "   Ubuntu: sudo apt-get install python3"
    exit 1
fi

# 检查依赖
echo "🔍 检查 Python 依赖..."
if ! python3 -c "import flask, flask_cors" 2>/dev/null; then
    echo "⚠️  缺少 Python 依赖，正在安装..."
    pip3 install -r requirements.txt
fi

# 检查 ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ 未找到 ffmpeg，请先安装："
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt-get install ffmpeg"
    exit 1
fi

# 检查端口
if lsof -i :1013 > /dev/null 2>&1; then
    echo "⚠️  端口 1013 已被占用"
    read -p "是否停止现有服务并重新启动? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "python.*app.py" 2>/dev/null || true
        sleep 2
    else
        echo "❌ 取消启动"
        exit 1
    fi
fi

# 启动服务
echo "🚀 启动服务..."
echo "📍 服务地址: http://localhost:1013"
echo "📖 查看日志: tail -f backend.log"
echo "🛑 按 Ctrl+C 停止服务"
echo "----------------------------------------"

python3 app.py

