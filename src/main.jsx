import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 모바일(특히 아이폰) 핀치 줌 차단 — 앱처럼 고정된 화면을 위해
// (세로 스크롤은 그대로, 두 손가락 확대/축소만 막음)
document.addEventListener('gesturestart', (event) => event.preventDefault())
document.addEventListener('gesturechange', (event) => event.preventDefault())

// PWA 서비스워커 등록 — 홈 화면 설치 + 오프라인에서도 열리게 함
// (개발 중에는 캐시가 방해되니 완성본(빌드)에서만 등록)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* 등록 실패해도 앱 사용에는 지장 없음 */
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
