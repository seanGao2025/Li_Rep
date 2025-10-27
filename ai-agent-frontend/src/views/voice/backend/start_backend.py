#!/usr/bin/env python3
"""
语音后端服务启动脚本
"""
import os
import sys
import subprocess
import signal
import time
from pathlib import Path

def find_python():
    """查找可用的 Python 解释器"""
    for python_cmd in ['python3', 'python']:
        try:
            result = subprocess.run([python_cmd, '--version'], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ 找到 Python: {python_cmd} ({result.stdout.strip()})")
            return python_cmd
        except (subprocess.CalledProcessError, FileNotFoundError):
            continue
    
    print("❌ 未找到可用的 Python 解释器")
    return None

def check_dependencies():
    """检查依赖是否安装"""
    python_cmd = find_python()
    if not python_cmd:
        return False
    
    try:
        # 检查关键依赖
        dependencies = ['flask', 'flask_cors', 'whisper', 'piper-tts']
        for dep in dependencies:
            result = subprocess.run([python_cmd, '-c', f'import {dep}'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                print(f"❌ 缺少依赖: {dep}")
                print(f"请运行: {python_cmd} -m pip install {dep}")
                return False
            else:
                print(f"✅ 依赖检查通过: {dep}")
        return True
    except Exception as e:
        print(f"❌ 依赖检查失败: {e}")
        return False

def check_port(port=1013):
    """检查端口是否被占用"""
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return True
    except OSError:
        return False

def kill_existing_processes():
    """杀死现有的后端进程"""
    try:
        # 查找并杀死占用端口的进程
        result = subprocess.run(['lsof', '-ti', ':1013'], 
                              capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    print(f"🔄 停止现有进程 PID: {pid}")
                    subprocess.run(['kill', '-9', pid], check=False)
            time.sleep(2)
        
        # 查找并杀死 python app.py 进程
        result = subprocess.run(['pkill', '-f', 'python.*app.py'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("🔄 停止现有的 app.py 进程")
            time.sleep(1)
            
    except Exception as e:
        print(f"⚠️  停止现有进程时出错: {e}")

def start_backend():
    """启动后端服务"""
    print("🚀 启动语音后端服务...")
    
    # 检查依赖
    if not check_dependencies():
        print("❌ 依赖检查失败，请先安装依赖")
        return False
    
    # 停止现有进程
    kill_existing_processes()
    
    # 检查端口
    if not check_port():
        print("⚠️  端口 1013 被占用，正在尝试释放...")
        kill_existing_processes()
        time.sleep(2)
    
    # 启动服务
    python_cmd = find_python()
    if not python_cmd:
        return False
    
    try:
        print("🎤 启动语音识别服务...")
        print("📍 服务地址: http://localhost:1013")
        print("🛑 按 Ctrl+C 停止服务")
        print("-" * 50)
        
        # 启动 Flask 应用
        process = subprocess.Popen([python_cmd, 'app.py'], 
                                 cwd=os.path.dirname(os.path.abspath(__file__)))
        
        # 等待进程结束
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 收到停止信号，正在关闭服务...")
        if process:
            process.terminate()
            process.wait()
        print("✅ 服务已停止")
    except Exception as e:
        print(f"❌ 启动服务失败: {e}")
        return False
    
    return True

def main():
    """主函数"""
    print("=" * 60)
    print("🎤 语音后端服务管理器")
    print("=" * 60)
    
    # 切换到脚本所在目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    print(f"📁 工作目录: {os.getcwd()}")
    
    # 启动服务
    success = start_backend()
    
    if success:
        print("✅ 服务启动完成")
    else:
        print("❌ 服务启动失败")
        sys.exit(1)

if __name__ == "__main__":
    main()
