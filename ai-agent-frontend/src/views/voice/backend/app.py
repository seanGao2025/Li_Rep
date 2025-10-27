from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from whisper_engine import speech_to_text
from tts_engine import text_to_speech
from llm_client import call_local_llm
import os
import logging
import threading
import uuid
import subprocess
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app
app = Flask(__name__, static_folder="static")
# 从环境变量获取 CORS 配置，支持多个前端端口
import os
cors_origins = [
    "http://localhost:1013", 
    "http://127.0.0.1:1013", 
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "null"
]

# 添加环境变量中的额外 CORS 源
if os.getenv("CORS_ORIGINS"):
    additional_origins = os.getenv("CORS_ORIGINS").split(",")
    cors_origins.extend(additional_origins)

CORS(app, origins=cors_origins)

# 创建线程池以更好地管理线程
thread_pool = ThreadPoolExecutor(max_workers=4)

# 存储异步任务的结果
async_results = {}

def convert_audio_to_wav(input_path: str, output_path: str):
    """
    使用 ffmpeg 将音频文件转换为 WAV 格式
    """
    try:
        logger.info("开始转换音频文件: %s -> %s", input_path, output_path)
        
        # 检查输入文件是否存在
        if not os.path.exists(input_path):
            raise Exception(f"输入文件不存在: {input_path}")
        
        # 检查文件大小
        file_size = os.path.getsize(input_path)
        logger.info("输入文件大小: %d bytes", file_size)
        
        if file_size == 0:
            raise Exception("输入文件为空")
        
        # 使用 ffmpeg 转换音频格式，添加更多参数提高兼容性
        cmd = [
            'ffmpeg',
            '-i', input_path,           # 输入文件
            '-f', 'wav',                # 强制输出格式为 WAV
            '-acodec', 'pcm_s16le',     # 音频编码：16位PCM
            '-ar', '16000',             # 采样率：16kHz
            '-ac', '1',                 # 单声道
            '-avoid_negative_ts', 'make_zero',  # 避免负时间戳
            '-fflags', '+genpts',       # 生成时间戳
            '-max_muxing_queue_size', '1024',  # 增加缓冲区大小
            '-y',                       # 覆盖输出文件
            output_path
        ]
        
        logger.info("执行 ffmpeg 命令: %s", ' '.join(cmd))
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            logger.info("音频转换成功: %s", output_path)
            # 检查输出文件是否生成
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                logger.info("输出文件大小: %d bytes", os.path.getsize(output_path))
            else:
                raise Exception("输出文件生成失败或为空")
        else:
            logger.error("音频转换失败，返回码: %d", result.returncode)
            logger.error("stderr: %s", result.stderr)
            logger.error("stdout: %s", result.stdout)
            
            # 尝试备用转换方案
            logger.info("尝试备用转换方案...")
            if _try_fallback_conversion(input_path, output_path):
                logger.info("备用转换方案成功")
                return
            else:
                raise Exception(f"ffmpeg 转换失败 (返回码: {result.returncode}): {result.stderr}")
            
    except subprocess.TimeoutExpired:
        logger.error("音频转换超时")
        raise Exception("音频转换超时")
    except FileNotFoundError:
        logger.error("ffmpeg 未找到，请确保已安装 ffmpeg")
        raise Exception("ffmpeg 未安装")
    except Exception as e:
        logger.error("音频转换异常: %s", e)
        raise Exception(f"音频转换失败: {str(e)}")

def _try_fallback_conversion(input_path: str, output_path: str) -> bool:
    """
    尝试备用音频转换方案
    """
    try:
        logger.info("尝试备用转换方案: %s -> %s", input_path, output_path)
        
        # 备用方案1：使用更宽松的参数
        fallback_cmd = [
            'ffmpeg',
            '-i', input_path,
            '-f', 'wav',
            '-acodec', 'pcm_s16le',
            '-ar', '16000',
            '-ac', '1',
            '-y',
            output_path
        ]
        
        logger.info("执行备用ffmpeg命令: %s", ' '.join(fallback_cmd))
        result = subprocess.run(fallback_cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info("备用转换成功，输出文件大小: %d bytes", os.path.getsize(output_path))
            return True
        
        # 备用方案2：尝试不同的编码器
        fallback_cmd2 = [
            'ffmpeg',
            '-i', input_path,
            '-f', 'wav',
            '-acodec', 'pcm_u8',  # 使用8位PCM
            '-ar', '16000',
            '-ac', '1',
            '-y',
            output_path
        ]
        
        logger.info("尝试8位PCM编码: %s", ' '.join(fallback_cmd2))
        result2 = subprocess.run(fallback_cmd2, capture_output=True, text=True, timeout=30)
        
        if result2.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info("8位PCM转换成功，输出文件大小: %d bytes", os.path.getsize(output_path))
            return True
        
        logger.error("所有备用转换方案都失败了")
        return False
        
    except Exception as e:
        logger.error("备用转换异常: %s", e)
        return False

# 健康检查端点
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Li-VoiceAss Backend",
        "version": "1.0.0"
    })

# 显式处理OPTIONS请求
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

# 确保目录存在
os.makedirs("backend/static", exist_ok=True)
os.makedirs("backend", exist_ok=True)

def process_tts_async(text, result_id):
    """
    异步处理TTS任务
    """
    try:
        logger.info("开始TTS处理，文本: %s", text[:50] + "..." if len(text) > 50 else text)
        audio_path = text_to_speech(text)
        logger.info("TTS处理完成，音频路径: %s", audio_path)
        async_results[result_id] = {
            "status": "completed",
            "audio_path": audio_path
        }
        logger.info("TTS结果已保存到async_results，ID: %s", result_id)
    except Exception as e:
        logger.error("异步TTS处理失败: %s", e, exc_info=True)
        async_results[result_id] = {
            "status": "failed",
            "error": str(e)
        }

def process_speech_to_text_async(file_path, result_id):
    """
    异步处理语音识别任务
    """
    try:
        logger.info("开始语音识别处理，文件路径: %s，结果ID: %s", file_path, result_id)
        user_text = speech_to_text(file_path)
        logger.info("语音识别完成，结果: %s", user_text)
        # 确保user_text不是None或undefined
        if not user_text:
            user_text = "（未识别到内容）"
        logger.info("语音识别最终结果: %s", user_text)
        async_results[result_id] = {
            "status": "completed",
            "user_text": user_text  # 确保这个字段存在
        }
        logger.info("语音识别结果已保存到async_results，ID: %s", result_id)
    except Exception as e:
        logger.error("异步语音识别处理失败: %s", e, exc_info=True)
        async_results[result_id] = {
            "status": "failed",
            "error": str(e),
            "user_text": "（语音识别失败）"  # 提供默认文本
        }
        logger.info("语音识别失败结果已保存到async_results，ID: %s", result_id)

def process_llm_async(user_text, result_id):
    """
    异步处理LLM调用任务
    """
    try:
        logger.info("开始处理LLM请求: %s", user_text)
        # 更新状态为处理中
        async_results[result_id] = {"status": "processing"}
        logger.info("调用call_local_llm函数")
        reply = call_local_llm(user_text, max_retries=3)
        logger.info("LLM返回结果，长度: %d", len(reply) if reply else 0)
        
        # 检查回复是否有效
        if reply is not None and isinstance(reply, str) and reply.strip() != "":
            logger.info("🤖 模型答：%s", reply)
            async_results[result_id] = {
                "status": "completed",
                "reply": reply
            }
            logger.info("LLM处理完成，结果已保存")
        else:
            logger.warning("LLM返回空回复或无效回复: %s", type(reply))
            async_results[result_id] = {
                "status": "failed",
                "error": "LLM未返回有效回复",
                "reply": "（AI未返回有效回复）"
            }
            logger.info("LLM处理失败，已记录空回复错误")
    except Exception as e:
        logger.error("异步LLM处理失败: %s", e, exc_info=True)
        async_results[result_id] = {
            "status": "failed",
            "error": str(e),
            "reply": "（AI处理失败，请稍后重试）"
        }
        logger.info("LLM处理失败，错误已保存")

# 一次性上传接口（原有）
@app.route("/speech", methods=["POST"])
def handle_audio():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "未上传音频文件"}), 400

        file = request.files["audio"]
        logger.info("收到音频文件，文件名: %s，MIME类型: %s", file.filename, file.content_type)
        
        # 保存原始文件
        original_filename = file.filename or "input"
        original_extension = original_filename.split('.')[-1] if '.' in original_filename else 'webm'
        original_path = f"backend/input.{original_extension}"
        file.save(original_path)
        
        # 转换为WAV格式
        wav_path = "backend/input.wav"
        convert_audio_to_wav(original_path, wav_path)
        
        # 异步处理语音识别
        stt_result_id = str(uuid.uuid4())
        async_results[stt_result_id] = {"status": "processing"}
        thread_pool.submit(process_speech_to_text_async, wav_path, stt_result_id)
        
        # 立即返回，告知前端任务已接受
        return jsonify({
            "audio_status": "processing",
            "stt_result_id": stt_result_id
        })
    except Exception as e:
        logger.error("处理失败: %s", e, exc_info=True)
        return jsonify({"error": str(e)}), 500

# 检查语音识别任务状态
@app.route("/speech-status/<result_id>", methods=["GET"])
def check_speech_status(result_id):
    logger.info("检查语音识别状态，ID: %s", result_id)
    if result_id in async_results:
        result = async_results[result_id]
        logger.info("语音识别状态结果: %s", result)
        if result["status"] == "completed":
            response = jsonify({
                "status": "completed",
                "user_text": result["user_text"]
            })
            # 任务完成后清理结果，避免影响后续请求
            del async_results[result_id]
            logger.info("语音识别任务完成，已清理结果，ID: %s", result_id)
            return response
        elif result["status"] == "failed":
            response = jsonify({
                "status": "failed",
                "error": result["error"]
            })
            # 任务失败后清理结果，避免影响后续请求
            del async_results[result_id]
            logger.info("语音识别任务失败，已清理结果，ID: %s", result_id)
            return response
        else:
            logger.info("语音识别任务仍在处理中，ID: %s", result_id)
            return jsonify({
                "status": "processing"
            })
    else:
        logger.warning("语音识别任务未找到，ID: %s", result_id)
        return jsonify({"status": "not_found"}), 404

# 调用LLM接口
@app.route("/call-llm", methods=["POST"])
def call_llm():
    try:
        data = request.get_json()
        if not data or "user_text" not in data:
            return jsonify({"error": "未提供文本"}), 400

        user_text = data["user_text"]

        # 异步调用LLM
        llm_result_id = str(uuid.uuid4())
        async_results[llm_result_id] = {"status": "processing"}
        thread_pool.submit(process_llm_async, user_text, llm_result_id)
        
        return jsonify({
            "llm_status": "processing",
            "llm_result_id": llm_result_id
        })
    except Exception as e:
        logger.error("处理失败: %s", e, exc_info=True)
        return jsonify({"error": str(e)}), 500

# 检查LLM任务状态
@app.route("/llm-status/<result_id>", methods=["GET"])
def check_llm_status(result_id):
    if result_id in async_results:
        result = async_results[result_id]
        if result["status"] == "completed":
            response = jsonify({
                "status": "completed",
                "reply": result["reply"]
            })
            # 任务完成后清理结果，避免影响后续请求
            del async_results[result_id]
            return response
        elif result["status"] == "failed":
            response = jsonify({
                "status": "failed",
                "error": result["error"]
            })
            # 任务失败后清理结果，避免影响后续请求
            del async_results[result_id]
            return response
        else:
            return jsonify({
                "status": "processing"
            })
    else:
        return jsonify({"status": "not_found"}), 404

# 文字处理接口
@app.route("/text", methods=["POST"])
def handle_text():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "未提供文本"}), 400

        user_text = data["text"]
        logger.info("📝 用户输入：%s", user_text)

        # 异步调用LLM
        llm_result_id = str(uuid.uuid4())
        async_results[llm_result_id] = {"status": "processing"}
        thread_pool.submit(process_llm_async, user_text, llm_result_id)
        
        return jsonify({
            "text_status": "processing",
            "llm_result_id": llm_result_id
        })
    except Exception as e:
        logger.error("处理失败: %s", e, exc_info=True)
        return jsonify({"error": str(e)}), 500

# TTS处理接口
@app.route("/tts", methods=["POST"])
def handle_tts():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "未提供文本"}), 400

        text = data["text"]

        # 异步合成语音
        result_id = str(uuid.uuid4())
        async_results[result_id] = {"status": "processing"}
        thread_pool.submit(process_tts_async, text, result_id)

        return jsonify({
            "tts_status": "processing",
            "tts_result_id": result_id
        })
    except Exception as e:
        logger.error("处理失败: %s", e, exc_info=True)
        return jsonify({"error": str(e)}), 500

# 检查TTS任务状态
@app.route("/tts-status/<result_id>", methods=["GET"])
def check_tts_status(result_id):
    logger.info("检查TTS状态，ID: %s", result_id)
    if result_id in async_results:
        result = async_results[result_id]
        logger.info("TTS状态结果: %s", result)
        if result["status"] == "completed":
            response = jsonify({
                "status": "completed",
                "audio_path": result["audio_path"]
            })
            # 任务完成后清理结果，避免影响后续请求
            del async_results[result_id]
            logger.info("TTS任务完成，已清理结果，ID: %s", result_id)
            return response
        elif result["status"] == "failed":
            response = jsonify({
                "status": "failed",
                "error": result["error"]
            })
            # 任务失败后清理结果，避免影响后续请求
            del async_results[result_id]
            logger.info("TTS任务失败，已清理结果，ID: %s", result_id)
            return response
        else:
            logger.info("TTS任务仍在处理中，ID: %s", result_id)
            return jsonify({
                "status": "processing"
            })
    else:
        logger.warning("TTS任务未找到，ID: %s", result_id)
        return jsonify({"status": "not_found"}), 404

# 静态文件路由
@app.route("/static/<path:filename>")
def static_files(filename):
    directory = os.path.join(os.getcwd(), "backend", "static")
    logger.info("尝试提供静态文件: %s/%s", directory, filename)
    if not os.path.exists(os.path.join(directory, filename)):
        logger.error("静态文件不存在: %s/%s", directory, filename)
        return jsonify({"error": "文件不存在"}), 404
    
    try:
        response = send_from_directory(directory, filename)
        # 添加适当的缓存控制头
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
    except Exception as e:
        logger.error("提供静态文件失败: %s", e)
        return jsonify({"error": "提供文件失败"}), 500

# 新增：流式上传接口
@app.route("/speech-stream", methods=["POST"])
def speech_stream():
    try:
        if "audio" not in request.files or "session" not in request.form:
            return jsonify({"error": "缺少 audio 或 session"}), 400

        audio_file = request.files["audio"]
        session_id = request.form["session"]
        logger.info("收到流式音频文件，会话ID: %s，MIME类型: %s", session_id, audio_file.content_type)

        # 保存原始文件
        original_filename = audio_file.filename or "chunk"
        original_extension = original_filename.split('.')[-1] if '.' in original_filename else 'webm'
        original_chunk_path = os.path.join("backend/static", f"{session_id}_chunk.{original_extension}")
        audio_file.save(original_chunk_path)

        # 转换为WAV格式
        wav_chunk_path = os.path.join("backend/static", f"{session_id}_chunk.wav")
        convert_audio_to_wav(original_chunk_path, wav_chunk_path)

        # 异步处理语音识别
        result_id = str(uuid.uuid4())
        async_results[result_id] = {"status": "processing"}
        thread_pool.submit(process_speech_to_text_async, wav_chunk_path, result_id)
        
        return jsonify({
            "stt_status": "processing",
            "stt_result_id": result_id,
            "session_id": session_id
        })
    except Exception as e:
        logger.error("流式处理失败: %s", e, exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=1013, debug=True)