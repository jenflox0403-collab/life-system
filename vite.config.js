import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 개발 서버 설정: host를 켜서 같은 와이파이의 휴대폰에서도 접속 가능
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true },
})
