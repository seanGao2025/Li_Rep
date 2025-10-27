// AI模块类型声明
export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  audioUrl?: string
  timestamp?: Date
}

export interface Model {
  id: string
  name: string
  description: string
  tooltip: string
  status: 'available' | 'running' | 'unavailable'
  imported: boolean
  type: 'model'
}

export interface Business {
  id: string
  name: string
  description: string
  tooltip: string
  status: 'available' | 'running' | 'unavailable'
  imported: boolean
  type: 'business'
  category: string
}

export interface Algorithm {
  id: string
  name: string
  description: string
  tooltip: string
  status: 'available' | 'running' | 'unavailable'
  imported: boolean
  type: 'algorithm'
  category: string
}

export interface RunResult {
  type: 'model' | 'business' | 'algorithm'
  name: string
  status: 'success' | 'running' | 'error'
  content: string
  time: Date
}
