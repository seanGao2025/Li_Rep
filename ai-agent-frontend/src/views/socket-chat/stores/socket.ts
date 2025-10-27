import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import { endpoints } from '@/config/endpoints'

export const useSocketStore = defineStore('socket', () => {
  // 状态
  const connected = ref(false)
  const socket = ref<Socket | null>(null)
  const connectionId = ref('')
  const lastUpdate = ref('')
  const messageLogs = ref<Array<{ time: string; message: string }>>([])

  // 方法
  const connect = () => {
    if (socket.value?.connected) return

    // 清理旧连接（避免重复绑定事件监听器）
    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value.disconnect()
      socket.value = null
    }

    socket.value = io(endpoints.socket.baseUrl, {
      path: endpoints.socket.path || '/socket.io/',
      query: {
        type: 'LiAI'
      },
      transports: ['polling', 'websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      upgrade: true,
      rememberUpgrade: false
    })

    // 监听连接事件
    socket.value.on('connect', () => {
      connected.value = true
      connectionId.value = socket.value?.id || ''
      lastUpdate.value = new Date().toLocaleString()
      addLog('已连接数据库服务器')
    })

    // 监听断开连接事件
    socket.value.on('disconnect', () => {
      connected.value = false
      connectionId.value = ''
      lastUpdate.value = new Date().toLocaleString()
      addLog('已断开数据库服务器')
    })

    // 监听消息事件
    socket.value.on('message', data => {
      console.log('收到 message 事件:', data)
      
      // 检查是否是 AI-SOCKET 协议消息
      if (data && typeof data === 'object' && data.token === 'AI-SOCKET') {
        addLog('收到 AI-SOCKET 协议消息')
      } else {
        addLog('收到消息: ' + JSON.stringify(data))
      }
    })

    // 监听自定义事件
    socket.value.on('Message', data => {
      console.log('收到 Message 事件:', data)
      const messageContent = concatString(JSON.parse(data))
      addLog('收到Message事件: ' + messageContent)
    })

    // 监听所有事件（用于调试和确保所有消息都被记录）
    socket.value.onAny((eventName, ...args) => {
      // 跳过系统事件，只记录业务消息
      if (!['connect', 'disconnect', 'connect_error', 'reconnect', 'reconnect_attempt', 'upgrade', 'downgrade', 'connect_timeout'].includes(eventName)) {
        console.log('Socket 收到事件:', eventName, args)
        if (args.length > 0) {
          addLog(`收到 ${eventName} 事件: ${JSON.stringify(args[0])}`)
        } else {
          addLog(`收到 ${eventName} 事件`)
        }
      }
    })

    // 监听连接错误
    socket.value.on('connect_error', err => {
      addLog('连接错误: ' + err.message)
      console.error('Socket连接错误详情:', err)

      if (err.message.includes('xhr poll error')) {
        addLog('提示: 可能是网络问题、服务器未启动或CORS配置错误')
      } else if (err.message.includes('websocket error')) {
        addLog('提示: WebSocket连接失败,可能是网络问题或服务器不支持WebSocket')
        addLog('正在尝试使用轮询方式连接...')
      }
    })

    // 监听连接超时事件
    socket.value.on('connect_timeout', timeout => {
      addLog('连接超时: ' + timeout)
    })

    // 监听重连尝试事件
    socket.value.on('reconnect_attempt', attemptNumber => {
      addLog('尝试重连: ' + attemptNumber)
    })

    // 监听重连失败事件
    socket.value.on('reconnect_failed', () => {
      addLog('重连失败: 无法重连数据库服务器')
    })

    // 监听传输方式升级事件
    socket.value.on('upgrade', transport => {
      addLog('传输方式升级为: ' + transport.name)
    })

    // 监听传输方式降级事件
    socket.value.on('downgrade', transport => {
      addLog('传输方式降级为: ' + transport.name)
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value.disconnect()
      socket.value = null
    }
    connected.value = false
    connectionId.value = ''
    lastUpdate.value = new Date().toLocaleString()
    addLog('已断开数据库服务器')
  }

  const emit = (event: string, data: any) => {
    if (socket.value?.connected) {
      socket.value.emit(event, data)
      addLog(`发送消息: ${event}事件 ${JSON.stringify(data)}`)
    } else {
      addLog('错误: 未连接到服务器')
    }
  }

  // 发送 AI-SOCKET 协议消息
  const sendAIMessage = (content: string) => {
    if (socket.value?.connected) {
      const payload = {
        content,
        token: 'AI-SOCKET'
      }
      socket.value.emit('message', payload)
      addLog(`发送AI消息: ${content}`)
      return payload
    } else {
      addLog('错误: 未连接到服务器')
      throw new Error('未连接到服务器')
    }
  }

  // 监听 AI-SOCKET 响应事件
  const onAIResponse = (callback: (data: any) => void) => {
    if (socket.value) {
      // 监听消息事件，检查 token 是否为 AI-SOCKET
      socket.value.on('message', (data: any) => {
        if (data && data.token === 'AI-SOCKET') {
          console.log('收到 AI-SOCKET 响应:', data)
          callback(data)
        }
      })
    }
  }

  const addLog = (message: string) => {
    const now = new Date()
    messageLogs.value.unshift({
      time: now.toLocaleTimeString(),
      message
    })

    // 限制日志数量
    if (messageLogs.value.length > 50) {
      messageLogs.value = messageLogs.value.slice(0, 50)
    }

    lastUpdate.value = now.toLocaleString()
  }

  const clearLogs = () => {
    messageLogs.value = []
  }

  // 业务引擎反馈的字符串拼接
  const concatString = (data: any): string => {
    if (!data) return ''

    if (data.messageType === 'LineDetail') {
      return (
        data.Name +
        '计划检修：' +
        '线路具体参数如下【额定电压：' +
        data.Voltage +
        'kV' +
        '，额定电流：' +
        data.Current +
        'A' +
        '，输送容量：' +
        data.Capacity +
        'MVA' +
        '，长度：' +
        data.Length +
        'km' +
        '，电阻：' +
        data.R +
        '，电抗：' +
        data.X +
        '，电纳：' +
        data.B +
        '，状态：' +
        data.Status +
        '，始端有功：' +
        data.P_Start +
        'MW' +
        '，始端无功：' +
        data.Q_Start +
        'Mvar' +
        '，未端有功：' +
        data.P_End +
        'MW' +
        '，未端无功：' +
        data.Q_End +
        'Mvar' +
        '】'
      )
    } else if (data.messageType === 'allPathsDetail') {
      let result = ''
      // 处理路径数据
      for (let i = 0; i < data.data.length; i++) {
        const pathGroup = data.data[i]

        if (!Array.isArray(pathGroup)) {
          console.warn(`路径组 ${i} 不是数组`)
          continue
        }

        // 遍历组内所有路径
        for (let j = 0; j < pathGroup.length; j++) {
          const path = pathGroup[j]

          // 验证路径对象
          if (!path || typeof path !== 'object') {
            console.warn(`路径 ${i}-${j} 无效`)
            continue
          }

          // 提取路径信息
          const name = path.name || '未知线路'
          const id = path.id || '未知线路ID'
          const start = path.start_station_name || '未知始端'
          const end = path.end_station_name || '未知末端'
          const voltage = path.voltage ? `${path.voltage}kV` : '未知电压'
          const current = path.current ? `${path.current}A` : '未知电流 '
          const capacity = path.capacity ? `${path.capacity}MW` : '未知容量'
          const status = path.status === '1' ? '运行中' : '停运'

          // 构建路径信息字符串
          result +=
            '备选线路' +
            (j + 1) +
            '：' +
            `${name} ${id} (${start} → ${end}) ${voltage} ${current} ${capacity} [${status}]\n`
        }
      }

      return result
    }

    return ''
  }

  // 提取两个特定标记之间的内容
  const extractBetweenMarkers = (
    content: string,
    startMarker = '<dc.',
    endMarker = '.dc>'
  ): string => {
    const results = []
    let startIndex = 0

    while (startIndex < content.length) {
      // 查找起始标记
      const startPos = content.indexOf(startMarker, startIndex)
      if (startPos === -1) break

      // 查找结束标记
      const endPos = content.indexOf(endMarker, startPos + startMarker.length)
      if (endPos === -1) break

      // 提取标记之间的内容
      const extracted = content.substring(startPos + startMarker.length, endPos)
      results.push(extracted)

      // 更新搜索位置
      startIndex = endPos + endMarker.length
    }
    return JSON.stringify(results)
  }

  return {
    // 状态
    connected,
    socket,
    connectionId,
    lastUpdate,
    messageLogs,
    // 方法
    connect,
    disconnect,
    emit,
    sendAIMessage,
    onAIResponse,
    addLog,
    clearLogs,
    concatString,
    extractBetweenMarkers
  }
})
