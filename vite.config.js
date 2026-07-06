import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// host를 켜서 같은 와이파이의 휴대폰에서도 접속 가능
// (개발 서버 server, 완성본 미리보기 서버 preview 둘 다 적용)
export default defineConfig({
  // base: './' → GitHub Pages(하위 경로 주소)에서도 자산 경로가 깨지지 않도록 상대경로 사용
  base: './',
  plugins: [react(), tailwindcss()],
  server: { host: true },
  preview: { host: true, port: 4173 },
})
