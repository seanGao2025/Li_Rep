import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// 初始化样式表
import '@/assets/sass/element-plus.scss'
import '@/assets/sass/index.scss'
import '@/assets/sass/base.scss'
import '@/assets/sass/main.scss'
import '@/assets/sass/chat.scss'
import '@/assets/sass/running-result-item.scss'

// 全局工具
import '@/utils/index'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router).use(ElementPlus).mount('#app')
