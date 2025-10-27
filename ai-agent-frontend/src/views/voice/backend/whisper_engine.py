import whisper

# 显式指定使用CPU和FP32精度，避免FP16警告
model = whisper.load_model("base", device="cpu", in_memory=True)

def speech_to_text(file_path: str) -> str:
    # 显式指定fp16=False以避免FP16警告
    result = model.transcribe(file_path, fp16=False)
    text = result["text"].strip()
    # 确保返回的文本不为空
    if not text:
        return "（未识别到内容）"
    return text