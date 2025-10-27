declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    utils: any
    api: Api
  }

  // 声明全局的setTimeout和clearTimeout
  function setTimeout(callback: () => void, ms?: number): number
  function clearTimeout(id: number): void

  interface Date {
    format(key?: string): string
  }
  interface Number {
    byteConvert(key?: string): string
  }
  interface Cookeopt {
    // 声明cookies方法
    get(key: string): any
    set(key: string, value: any, attributes?: any): any
    remove(url: string, data?: any, attributes?: any): any
  }

  let utils: {
    cookies: Cookeopt
    download(fileName: string, body: any): void
    uuid(): string
    ansiToHtml(data: any): string
    fileExtension(filename: string): string
    fileToBase64(file: any): Promise<string>
    getImageUrl(...args: any): string
    debounce: any
    Logger: typeof Logger
    uniqueArray(array = [] as any, key: string): Array<object>
    extractTableName: (sql: string) => string
  }

  let api: Api
}

export {}
