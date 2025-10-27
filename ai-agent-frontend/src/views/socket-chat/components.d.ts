declare module './components/RoleModal.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module './components/DataLinkModal.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module './components/FileBrowserModal.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module './components/ModelModal.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module './stores/chat' {
  export const useChatStore: any
}

declare module './stores/socket' {
  export const useSocketStore: any
}

declare module './utils/contentFormatter' {
  export function formatFullContent(content: string, msgId: number): string
  export function generateSummaryHtml(content: string, msgId: number, isGenerating?: boolean): string
}
