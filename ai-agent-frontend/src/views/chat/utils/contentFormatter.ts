/**
 * 生成摘要HTML
 */
export function generateSummaryHtml(content: string, msgId: number, isGenerating = false): string {
  if (!content) return ''

  const headingRegex = /^(#{1,6}) (.+)/gm
  let match
  let headingsHtml = ''
  let headingIndex = 0

  // 为标题添加编号
  const numberedContent = content.replace(headingRegex, (_, hashes, text) => {
    const prefix = ''
    const cleanedText = text.replace(/#/g, '').trim()

    return `${hashes} ${prefix} ${cleanedText}`
  })

  // 生成标题链接
  while ((match = headingRegex.exec(numberedContent)) !== null) {
    const level = match[1]?.length || 0
    const fullTitleText = match[2]?.trim() || ''
    const targetId = `msg-${msgId}-heading-${headingIndex}`
    const cleanTitleText = fullTitleText.replace(/[*#\-\+\[\]]/g, '').trim()
    const generatingClass = isGenerating ? ' generating' : ''

    if (cleanTitleText.includes('获取')) {
      headingsHtml += `<a href="javascript:void(0)" class="title-link level-${level}${generatingClass}" data-target-id="${targetId}" onclick="scrollToHeading('${targetId}')"><div class="icon globe">🌐</div>&nbsp;&nbsp;${cleanTitleText}</a>\n`
    } else if (cleanTitleText.includes('评估')) {
      headingsHtml += `<a href="javascript:void(0)" class="title-link level-${level}${generatingClass}" data-target-id="${targetId}" onclick="scrollToHeading('${targetId}')"> <div class="icon alert">🛑</div>&nbsp;&nbsp;${cleanTitleText}</a>\n`
    } else if (cleanTitleText.includes('调度员')) {
      headingsHtml += `<a href="javascript:void(0)" class="title-link level-${level}${generatingClass}" data-target-id="${targetId}" onclick="scrollToHeading('${targetId}')"><div class="icon tool">🛠️</div>&nbsp;&nbsp;${cleanTitleText}</a>\n`
    } else if (cleanTitleText.includes('生成')) {
      headingsHtml += `<a href="javascript:void(0)" class="title-link level-${level}${generatingClass}" data-target-id="${targetId}" onclick="scrollToHeading('${targetId}')"><div class="icon flash">⚡</div>&nbsp;&nbsp;${cleanTitleText}</a>\n`
    } else {
      headingsHtml += `<a href="javascript:void(0)" class="title-link level-${level}${generatingClass}" data-target-id="${targetId}" onclick="scrollToHeading('${targetId}')"><div class="icon bulb">💡</div>&nbsp;&nbsp;${cleanTitleText}</a>\n`
    }
    headingIndex++
  }
  return headingsHtml
}

/**
 * 将Markdown格式的表格转换为HTML表格
 */
export function convertMarkdownToTable(md: string): string {
  // 按行分割输入内容并去除首尾空白
  const lines = md.trim().split('\n')

  // 检查是否至少有3行（表头、分隔符、至少一行数据）
  if (lines.length < 3) return '<p>无效的表格格式</p>'

  // 解析表头行：按|分割，去除每项的空白，并过滤空值
  const headers = lines[0]
    ?.split('|')
    .map(h => h.trim())
    .filter(h => h) || []

  // 解析分隔符行：按|分割，去除每项的空白，并过滤空值
  const separators = lines[1]
    ?.split('|')
    .map(s => s.trim())
    .filter(s => s) || []

  // 验证分隔符行格式：必须与表头列数一致，且每列分隔符只包含-和:
  if (separators.length !== headers.length || separators.some(s => !/^[-:]+$/.test(s))) {
    return '<p>无效的分隔符</p>'
  }

  // 构建HTML表格开始部分
  let table = '<table><thead><tr>'

  // 添加表头单元格
  headers.forEach(h => (table += `<th>${h}</th>`))
  table += '</tr></thead><tbody>'

  // 解析数据行（从第3行开始）
  for (let i = 2; i < lines.length; i++) {
    // 按|分割每行数据，去除每项的空白，并过滤空值
    const cells = lines[i]
      ?.split('|')
      .map(c => c.trim())
      .filter(c => c) || []

    // 如果当前行的列数与表头不一致，则跳过该行
    if (cells.length !== headers.length) continue

    // 添加表格行和单元格
    table += '<tr>'
    cells.forEach(c => (table += `<td>${c}</td>`))
    table += '</tr>'
  }

  // 结束HTML表格标签
  table += '</tbody></table>'
  return table
}

/**
 * 提取并转换输入内容中的Markdown表格
 */
export function processMixedContent(input: string): string {
  // 按行分割输入内容
  const lines = input.split('\n')
  let result = ''
  let currentTable = ''
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (!inTable) {
      // 检查是否是表格开始
      if (
        i < lines.length - 2 &&
        line?.includes('|') &&
        lines[i + 1]?.includes('|') &&
        lines[i + 1]
          ?.split('|')
          .map(s => s.trim())
          .filter(s => s)
          .every(s => /^[-:]+$/.test(s))
      ) {
        // 开始收集表格
        currentTable = line + '\n' + lines[i + 1] + '\n'
        inTable = true
        i++ // 跳过分隔符行
      } else {
        // 普通文本行直接添加
        result += line + '\n'
      }
    } else {
      // 在表格中
      if (line?.includes('|')) {
        // 继续收集表格行
        currentTable += line + '\n'
      } else {
        // 表格结束，处理并添加表格
        result += convertMarkdownToTable(currentTable)
        result += line + '\n'
        inTable = false
        currentTable = ''
      }
    }
  }

  // 处理最后可能未完成的表格
  if (inTable && currentTable) {
    result += convertMarkdownToTable(currentTable)
  }

  return result
}

/**
 * 处理无序列表 - 支持流式渲染
 */
export function processUnorderedLists(content: string): string {
  // 处理以 - 开头的无序列表
  content = content.replace(/^(\s*)- (.+)$/gm, (_, indent, text) => {
    const indentLevel = Math.floor(indent.length / 2) // 每2个空格为一级缩进
    const listClass = indentLevel > 0 ? `nested-list level-${Math.min(indentLevel, 5)}` : 'main-list'
    
    // 处理包含冒号的文本，将冒号后的内容进一步缩进
    const processedText = text.trim().replace(/^(.+?):\s*(.+)$/, (_: string, title: string, description: string) => {
      return `<span class="list-title">${title}:</span><span class="list-description">${description}</span>`
    })
    
    return `<li class="${listClass}">${processedText}</li>`
  })

  // 处理以 * 开头的无序列表
  content = content.replace(/^(\s*)\* (.+)$/gm, (_, indent, text) => {
    const indentLevel = Math.floor(indent.length / 2) // 每2个空格为一级缩进
    const listClass = indentLevel > 0 ? `nested-list level-${Math.min(indentLevel, 5)}` : 'main-list'
    
    // 处理包含冒号的文本，将冒号后的内容进一步缩进
    const processedText = text.trim().replace(/^(.+?):\s*(.+)$/, (_: string, title: string, description: string) => {
      return `<span class="list-title">${title}:</span><span class="list-description">${description}</span>`
    })
    
    return `<li class="${listClass}">${processedText}</li>`
  })

  // 将连续的li标签包装在ul中
  content = content.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/g, (match) => {
    return `<ul class="content-list">${match}</ul>`
  })

  return content
}


/**
 * 处理代码块 - 支持流式渲染和语法高亮
 */
export function processCodeBlocks(content: string): string {
  // 处理完整的代码块 ```language\ncode\n```
  content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, ( language, code) => {
    const lang = language || 'text'
    const codeContent = code.trim()
    const codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return `
    <div class="code-block-container">
      <div class="code-block-header">
        <span class="code-language">${lang}</span>
        <button class="copy-code-btn" onclick="copyCode('${codeId}')" title="复制代码">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          <span>复制</span>
        </button>
      </div>
      <pre class="code-block"><code id="${codeId}" class="language-${lang}">${addLineNumbers(escapeHtml(codeContent))}</code></pre>
    </div>`
  })

  // 处理未闭合的代码块（流式渲染中）
  content = content.replace(/```(\w+)?\n([\s\S]*?)(?=\n```|$)/g, (match, language, code) => {
    // 检查是否已经处理过（避免重复处理）
    if (match.includes('code-block-container')) {
      return match
    }
    
    const lang = language || 'text'
    const codeContent = code.trim()
    const codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return `
    <div class="code-block-container">
      <div class="code-block-header">
        <span class="code-language">${lang}</span>
        <button class="copy-code-btn" onclick="copyCode('${codeId}')" title="复制代码">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          <span>复制</span>
        </button>
      </div>
      <pre class="code-block"><code id="${codeId}" class="language-${lang}">${addLineNumbers(escapeHtml(codeContent))}</code></pre>
    </div>`
  })

  return content
}

/**
 * HTML转义函数
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 为代码添加行号
 */
function addLineNumbers(code: string): string {
  const lines = code.split('\n')
  return lines.map((line, index) => {
    const lineNumber = index + 1
    return `<span class="line" data-line="${lineNumber}">${line}</span>`
  }).join('\n')
}


/**
 * 格式化完整内容
 */
export function formatFullContent(content: string, msgId: number): string {
  // console.log('content', content)
  if (!content) return ''
  let headingIndex = 0

  // 处理思考过程
  content = content.replace(/<think>([\s\S]*?)<\/think>/g, (_, p1) => {
    const thinkingContent = p1?.trim() || ''
    return thinkingContent
      ? `
    <div class="thinking-container">
      <div class="thinking-border" onclick="toggleThinking(this)">
        <div class="thinking-time">思考过程</div>
        <div class="thinking-content-scrollable">${thinkingContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>
    </div>`
      : ''
  })

  // 使用新函数处理混合内容中的表格（替换原表格正则处理）
  content = processMixedContent(content)

  // 处理标题
  content = content.replace(/^(#{1,6}) (.+)/gm, (_, hashes, text) => {
    const level = hashes?.length || 0
    const id = `msg-${msgId}-heading-${headingIndex++}`
    const prefix = ''
    // 这里已经清理了标题文本中的'#'，所以全局替换是多余的
    const cleanedText = text?.replace(/#/g, '').trim() || ''
    return `<h${level} id="${id}">${prefix} ${cleanedText}</h${level}>`
  })


  // 处理各种标记
  content = content.replace(/\[前端异常\] (.+)/g, '<span class="error">[前端异常] $1</span>')
  content = content.replace(/\[后端错误\] (.+)/g, '<span class="error">[后端错误] $1</span>')
  content = content.replace(
    /\[网络\/后端异常\] (.+)/g,
    '<span class="error">[网络/后端异常] $1</span>'
  )
  content = content.replace(/\[X\]/g, '<span class="warning">[X]</span>')
  content = content.replace(/设定完成/g, '<span class="success">设定完成</span>')
  
  // 处理分割线
  content = content.replace(/^---$/gm, '<hr class="content-divider">')
  
  // 处理无序列表 - 支持流式渲染
  content = processUnorderedLists(content)
  // 处理代码块 - 支持流式渲染
  content = processCodeBlocks(content)
  content = content.replace(/`([^`]+)`/g, '<code>$1</code>')
  content = content.replace(/^> (.+)/gm, '<blockquote>$1</blockquote>')
  content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 改进的段落处理 - 避免在HTML标签内添加段落标签
  // 先处理双换行符
  content = content.replace(/\n\n/g, '</p><p>')
  
  // 只在非HTML标签的行前后添加段落标签，并且跳过已经包含在代码块中的内容
  content = content.replace(/^(?!<[^>]*>)(?!.*<\/[^>]*>)(?!.*<pre)(?!.*<code)(?!.*<div class="code-block-container").*$/gm, (match) => {
    // 如果这一行不是空的，且不包含HTML标签，则添加段落标签
    if (match.trim() && !match.includes('<') && !match.includes('>')) {
      return `<p>${match}</p>`
    }
    return match
  })

  content = content.replace(/<\/p><p>/g, '</p>\n<p>')

  return content
}
