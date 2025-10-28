import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
const pathSrc = fileURLToPath(new URL('./src', import.meta.url))
export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/api': {
        target: 'http://125.122.33.218:8810',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('代理请求:', req.method, req.url)
          })
          proxy.on('error', (err) => {
            console.error('代理错误:', err)
          })
        }
      }
    }
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: true,
      eslintrc: {
        enabled: true
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // 如果没有该文件，请先注释下一行
        additionalData: '@use "@/assets/theme/variables.scss" as *;'
      }
    }
  },
  resolve: {
    alias: {
      '@': pathSrc,
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  }
})
