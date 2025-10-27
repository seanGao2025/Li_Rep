import requests
import json
import time
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def call_local_llm(prompt: str, max_retries=3) -> str:
    # 从环境变量获取 LLM 服务地址，默认为 LM Studio 默认端口
    import os
    url = os.getenv("LLM_URL", "http://localhost:1234/v1/chat/completions")
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "gpt-oss-20b",
        "messages": [
            {"role": "system", "content": "你是一个语音对话助手。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 500  # 限制最大token数以加快响应速度
    }
    
    logger.info("开始调用本地LLM，提示: %s", prompt[:50] + "..." if len(prompt) > 50 else prompt)
    
    # 实现重试机制
    for attempt in range(max_retries):
        try:
            # 移除超时设置，允许无限等待
            response = requests.post(url, headers=headers, data=json.dumps(data))
            if response.ok:
                try:
                    json_response = response.json()
                    reply = json_response["choices"][0]["message"]["content"]
                    # 检查回复是否有效
                    if reply is not None and isinstance(reply, str) and reply.strip() != "":
                        logger.info("LLM调用成功，响应长度: %d", len(reply))
                        return reply.strip()
                    else:
                        logger.warning("LLM返回空内容或无效内容: %s", type(reply))
                        # 如果是最后一次尝试，返回错误信息
                        if attempt == max_retries - 1:
                            return "（AI未返回有效回复）"
                except (KeyError, IndexError, json.JSONDecodeError) as e:
                    logger.error("解析LLM响应失败: %s", e)
                    # 如果是最后一次尝试，返回错误信息
                    if attempt == max_retries - 1:
                        return f"（解析响应失败: {str(e)}）"
                    # 否则继续重试
            else:
                logger.error("LLM调用失败，HTTP状态码: %d", response.status_code)
                # 如果是最后一次尝试，返回错误信息
                if attempt == max_retries - 1:
                    return f"（调用本地模型失败，HTTP状态码: {response.status_code}）"
                # 否则继续重试
        except requests.exceptions.Timeout:
            logger.warning("LLM调用超时，尝试次数: %d/%d", attempt + 1, max_retries)
            # 如果是最后一次尝试，返回超时信息
            if attempt == max_retries - 1:
                return "（调用本地模型超时，请稍后重试）"
            # 否则等待一段时间后重试
            time.sleep(2 ** attempt)  # 指数退避
        except requests.exceptions.ConnectionError:
            logger.warning("无法连接到LLM，尝试次数: %d/%d", attempt + 1, max_retries)
            # 如果是最后一次尝试，返回连接错误信息
            if attempt == max_retries - 1:
                return "（无法连接到本地模型，请检查 LM Studio 是否已启动）"
            # 否则等待一段时间后重试
            time.sleep(2 ** attempt)  # 指数退避
        except Exception as e:
            logger.error("LLM调用发生未知错误: %s", e, exc_info=True)
            # 如果是最后一次尝试，返回错误信息
            if attempt == max_retries - 1:
                return f"（调用本地模型时发生错误: {str(e)}）"
            # 否则继续重试
    
    # 如果所有重试都失败了，返回通用错误信息
    logger.error("LLM调用经过 %d 次重试后仍然失败", max_retries)
    return "（AI处理失败，请稍后重试）"