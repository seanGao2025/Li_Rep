#!/usr/bin/env python3
"""
语音后端服务管理器
提供启动、停止、状态检查等功能
"""
import os
import sys
import subprocess
import time
import signal
import json
from pathlib import Path

class BackendManager:
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.pid_file = self.backend_dir / "backend.pid"
        self.log_file = self.backend_dir / "backend.log"
        
    def is_running(self):
        """检查服务是否正在运行"""
        if not self.pid_file.exists():
            return False
            
        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            # 检查进程是否存在
            os.kill(pid, 0)
            return True
        except (OSError, ValueError):
            # 进程不存在或PID文件损坏
            if self.pid_file.exists():
                self.pid_file.unlink()
            return False
    
    def start(self):
        """启动后端服务"""
        if self.is_running():
            print("✅ 后端服务已在运行")
            return True
            
        print("🚀 启动语音后端服务...")
        
        try:
            # 启动服务
            with open(self.log_file, 'w') as log:
                process = subprocess.Popen(
                    [sys.executable, 'app.py'],
                    cwd=self.backend_dir,
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    preexec_fn=os.setsid
                )
            
            # 保存PID
            with open(self.pid_file, 'w') as f:
                f.write(str(process.pid))
            
            # 等待服务启动
            time.sleep(3)
            
            if self.is_running():
                print("✅ 后端服务启动成功")
                print(f"📍 服务地址: http://localhost:1013")
                print(f"📝 日志文件: {self.log_file}")
                return True
            else:
                print("❌ 后端服务启动失败")
                return False
                
        except Exception as e:
            print(f"❌ 启动失败: {e}")
            return False
    
    def stop(self):
        """停止后端服务"""
        if not self.is_running():
            print("ℹ️  后端服务未运行")
            return True
            
        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            # 发送终止信号
            os.killpg(os.getpgid(pid), signal.SIGTERM)
            time.sleep(2)
            
            # 如果还在运行，强制杀死
            if self.is_running():
                os.killpg(os.getpgid(pid), signal.SIGKILL)
                time.sleep(1)
            
            # 清理PID文件
            if self.pid_file.exists():
                self.pid_file.unlink()
            
            print("✅ 后端服务已停止")
            return True
            
        except Exception as e:
            print(f"❌ 停止失败: {e}")
            return False
    
    def restart(self):
        """重启后端服务"""
        print("🔄 重启后端服务...")
        self.stop()
        time.sleep(2)
        return self.start()
    
    def status(self):
        """检查服务状态"""
        if self.is_running():
            print("✅ 后端服务正在运行")
            print(f"📍 服务地址: http://localhost:1013")
            print(f"📝 日志文件: {self.log_file}")
            return True
        else:
            print("❌ 后端服务未运行")
            return False
    
    def logs(self, lines=50):
        """查看服务日志"""
        if not self.log_file.exists():
            print("📝 日志文件不存在")
            return
            
        try:
            with open(self.log_file, 'r') as f:
                log_lines = f.readlines()
                recent_lines = log_lines[-lines:] if len(log_lines) > lines else log_lines
                
            print(f"📝 最近 {len(recent_lines)} 行日志:")
            print("-" * 50)
            for line in recent_lines:
                print(line.rstrip())
                
        except Exception as e:
            print(f"❌ 读取日志失败: {e}")

def main():
    """主函数"""
    manager = BackendManager()
    
    if len(sys.argv) < 2:
        print("用法: python backend_manager.py [start|stop|restart|status|logs]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "start":
        success = manager.start()
        sys.exit(0 if success else 1)
    elif command == "stop":
        success = manager.stop()
        sys.exit(0 if success else 1)
    elif command == "restart":
        success = manager.restart()
        sys.exit(0 if success else 1)
    elif command == "status":
        success = manager.status()
        sys.exit(0 if success else 1)
    elif command == "logs":
        lines = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        manager.logs(lines)
    else:
        print(f"❌ 未知命令: {command}")
        print("可用命令: start, stop, restart, status, logs")
        sys.exit(1)

if __name__ == "__main__":
    main()
