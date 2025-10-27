import os
import logging
import json # 导入 json 模块以捕获特定错误
import soundfile as sf
import numpy as np
from functools import lru_cache
import threading

# --- 依赖库导入与检查 ---
try:
    from piper import PiperVoice
    PIPER_AVAILABLE = True
except ImportError:
    PIPER_AVAILABLE = False

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False

# --- 日志和路径设置 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("tts_engine")

# 抑制piper.phoneme_ids的警告日志，避免"Missing phoneme from id map"警告
piper_phoneme_logger = logging.getLogger("piper.phoneme_ids")
piper_phoneme_logger.setLevel(logging.ERROR)

try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:
    BASE_DIR = os.getcwd()

OUTPUT_PATH = os.path.join(BASE_DIR, "static", "reply.wav")
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)


# --- 【重要】模型配置 ---
# 1. 在您的项目根目录下创建一个名为 `piper_models` 的文件夹。
# 2. 指定您要使用的模型名称。
PIPER_VOICE_NAME = "zh_CN-huayan-medium"

# 3. 构建模型的完整路径。代码将从这里加载模型。
MODEL_PATH_ONNX = os.path.join(BASE_DIR, "piper_models", PIPER_VOICE_NAME + ".onnx")
MODEL_PATH_JSON = os.path.join(BASE_DIR, "piper_models", PIPER_VOICE_NAME + ".onnx.json")


# --- TTS 引擎初始化 ---
piper_voice = None
piper_voice_lock = threading.Lock()

# 缓存常用的短语以提高响应速度
@lru_cache(maxsize=128)
def cached_synthesize(text: str):
    """
    缓存常用的短语合成结果以提高响应速度
    """
    if piper_voice:
        try:
            audio_chunks = list(piper_voice.synthesize(text))
            if audio_chunks and hasattr(audio_chunks[0], 'audio_int16_bytes'):
                # 新版本返回AudioChunk对象，包含audio_int16_bytes属性
                audio_data = np.concatenate([chunk.audio_int16_array for chunk in audio_chunks])
            elif audio_chunks and hasattr(audio_chunks[0], 'audio'):
                # 其他版本返回AudioChunk对象，包含audio属性
                audio_data = np.concatenate([chunk.audio for chunk in audio_chunks])
            elif audio_chunks and isinstance(audio_chunks[0], np.ndarray):
                # 如果是numpy数组，直接连接
                audio_data = np.concatenate(audio_chunks)
            else:
                # 其他情况尝试转换
                if audio_chunks and hasattr(audio_chunks[0], 'audio'):
                    audio_data = np.concatenate([chunk.audio for chunk in audio_chunks])
                elif len(audio_chunks) == 1:
                    # 如果只有一个元素，尝试直接使用
                    audio_data = audio_chunks[0]
                    if hasattr(audio_data, 'audio'):
                        audio_data = audio_data.audio
                    elif hasattr(audio_data, 'audio_int16_array'):
                        audio_data = audio_data.audio_int16_array
                    # 如果audio_data是numpy数组，直接使用
                    elif isinstance(audio_data, np.ndarray):
                        audio_data = audio_data
                    else:
                        # 尝试转换为numpy数组
                        audio_data = np.array(audio_data)
                else:
                    raise TypeError("无法处理返回的音频数据类型")
            return audio_data
        except Exception as e:
            logger.error(f"Piper 缓存合成过程中发生错误: {e}", exc_info=True)
    return None

def initialize_piper():
    """
    从指定的本地路径加载 Piper 模型。
    这种方法比依赖自动下载更稳定。
    """
    global piper_voice
    if not PIPER_AVAILABLE:
        logger.warning("Piper-tts 库未安装，将无法使用 Piper 引擎。")
        return

    # **【核心修正】** 在加载前，先检查模型文件是否存在
    if not os.path.exists(MODEL_PATH_ONNX) or not os.path.exists(MODEL_PATH_JSON):
        logger.error("="*50)
        logger.error(f"Piper 模型文件未找到!")
        logger.error(f"请手动下载模型并将它们放入以下文件夹: {os.path.dirname(MODEL_PATH_ONNX)}")
        logger.error("需要下载两个文件:")
        logger.error(f"1. {os.path.basename(MODEL_PATH_ONNX)}")
        logger.error(f"2. {os.path.basename(MODEL_PATH_JSON)}")
        logger.error("下载地址: https://huggingface.co/rhasspy/piper-voices/tree/main/zh_CN/huayan/x_low")
        logger.error("="*50)
        return

    try:
        logger.info(f"正在从本地路径加载 Piper 语音模型: {MODEL_PATH_ONNX}...")
        piper_voice = PiperVoice.load(MODEL_PATH_ONNX, config_path=MODEL_PATH_JSON)
        # 预热模型和缓存
        piper_voice.synthesize("模型加载成功")
        # 预热一些常见的短语
        common_phrases = ["你好", "您好", "是的", "不是", "谢谢", "不客气", "再见"]
        for phrase in common_phrases:
            cached_synthesize(phrase)
        logger.info("Piper 语音模型加载并预热成功。")
    except json.JSONDecodeError:
        logger.error(f"加载 Piper 模型失败：配置文件 '{MODEL_PATH_JSON}' 已损坏或为空。", exc_info=True)
        piper_voice = None
    except Exception as e:
        logger.error(f"加载 Piper 模型时发生未知错误: {e}", exc_info=True)
        piper_voice = None

# 在模块加载时执行初始化
initialize_piper()

def text_to_speech(text: str, output_path: str = OUTPUT_PATH):
    """
    将文本转换为 WAV 文件。
    每次都重新生成新的音频文件，不使用缓存。
    优先使用全局加载的 Piper 引擎，失败则回退到 pyttsx3 或默认提示音。
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if not text or not text.strip():
        logger.warning("输入文本为空，将使用默认文本。")
        text = "你好"

    # 删除旧的音频文件（如果存在）
    if os.path.exists(output_path):
        try:
            os.remove(output_path)
            logger.debug("已删除旧的音频文件: %s", output_path)
        except Exception as e:
            logger.warning("无法删除旧音频文件 %s: %s", output_path, e)

    # ---- 1. Piper (首选) ----
    if piper_voice:
        try:
            sample_rate = piper_voice.config.sample_rate
            logger.info(f"尝试使用 Piper 合成语音... (模型采样率: {sample_rate} Hz)")

            # 直接合成，跳过缓存
            audio_chunks = list(piper_voice.synthesize(text))

            # 统一处理各种可能的返回类型
            if audio_chunks and hasattr(audio_chunks[0], 'audio_int16_bytes'):
                audio_data = np.concatenate([chunk.audio_int16_array for chunk in audio_chunks])
            elif audio_chunks and hasattr(audio_chunks[0], 'audio'):
                audio_data = np.concatenate([chunk.audio for chunk in audio_chunks])
            elif audio_chunks and isinstance(audio_chunks[0], np.ndarray):
                audio_data = np.concatenate(audio_chunks)
            else:
                if audio_chunks and hasattr(audio_chunks[0], 'audio'):
                    audio_data = np.concatenate([chunk.audio for chunk in audio_chunks])
                elif len(audio_chunks) == 1:
                    chunk = audio_chunks[0]
                    if hasattr(chunk, 'audio'):
                        audio_data = chunk.audio
                    elif hasattr(chunk, 'audio_int16_array'):
                        audio_data = chunk.audio_int16_array
                    elif isinstance(chunk, np.ndarray):
                        audio_data = chunk
                    else:
                        audio_data = np.array(chunk)
                else:
                    raise TypeError("无法处理返回的音频数据类型")
            
            # 写入WAV文件 - 确保音频数据格式正确
            logger.info(f"音频数据形状: {audio_data.shape if isinstance(audio_data, np.ndarray) else 'unknown'}")
            logger.info(f"音频数据类型: {type(audio_data)}")
            
            # 确保音频数据是正确的格式
            if isinstance(audio_data, np.ndarray):
                # 确保是单声道1D数组
                if len(audio_data.shape) > 1:
                    audio_data = audio_data.flatten()
                logger.info(f"处理后的音频数据形状: {audio_data.shape}")
                logger.info(f"音频数据范围: [{audio_data.min():.2f}, {audio_data.max():.2f}]")
            else:
                logger.error(f"音频数据不是numpy数组: {type(audio_data)}")
                raise TypeError("音频数据格式错误")
            
            # 写入WAV文件
            sf.write(output_path, audio_data, sample_rate, format='WAV', subtype='PCM_16')

            if os.path.exists(output_path) and os.path.getsize(output_path) > 44: # WAV header is 44 bytes
                logger.info(f"Piper 合成成功 -> {output_path} (大小: {os.path.getsize(output_path)} 字节)")
                return output_path
            else:
                logger.error("Piper 合成失败：文件未生成或大小为 0。")
        except Exception as e:
            logger.error(f"Piper 合成过程中发生错误: {e}", exc_info=True)

    # ---- 2. pyttsx3 (备选) ----
    if PYTTSX3_AVAILABLE:
        try:
            logger.info("Piper 不可用或失败，回退到 pyttsx3...")
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            engine.stop()

            if os.path.exists(output_path) and os.path.getsize(output_path) > 44:
                logger.info(f"pyttsx3 合成成功 -> {output_path}")
                return output_path
            else:
                logger.error("pyttsx3 合成失败：文件未生成或大小为 0。")
        except Exception as e:
            logger.error(f"pyttsx3 合成过程中发生错误: {e}", exc_info=True)

    # ---- 3. 生成默认音频 (最终保障) ----
    try:
        logger.warning("所有 TTS 引擎都失败，生成默认提示音...")
        sample_rate = 22050; duration = 0.5; frequency = 440
        t = np.linspace(0., duration, int(sample_rate * duration), endpoint=False)
        amplitude = np.iinfo(np.int16).max * 0.5
        data = amplitude * np.sin(2. * np.pi * frequency * t)
        sf.write(output_path, data.astype(np.int16), sample_rate, format='WAV', subtype='PCM_16')
        logger.info(f"默认提示音生成成功 -> {output_path}")
        return output_path
    except Exception as e:
        logger.error(f"生成默认提示音失败: {e}", exc_info=True)

    raise RuntimeError("无法使用任何 TTS 引擎，也无法生成默认音频。")