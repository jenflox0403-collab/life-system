import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 모바일(특히 아이폰) 핀치 줌 차단 — 앱처럼 고정된 화면을 위해
// (세로 스크롤은 그대로, 두 손가락 확대/축소만 막음)
document.addEventListener('gesturestart', (event) => event.preventDefault())
document.addEventListener('gesturechange', (event) => event.preventDefault())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
