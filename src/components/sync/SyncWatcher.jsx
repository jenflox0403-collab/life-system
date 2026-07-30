import { useEffect, useRef, useState } from 'react'
import { syncNow } from '../../lib/sync.js'
import ConflictModal from './ConflictModal.jsx'

const INTERVAL_MS = 20_000 // 20초마다 조용히 확인

// 이 파일은 자동 동기화 감시자 담당 (화면엔 안 보임, 충돌 때만 안내 창)
// 앱을 켤 때 / 다른 기기에서 돌아올 때(focus) / 주기적으로 클라우드와 맞춤
export default function SyncWatcher() {
  const [conflict, setConflict] = useState(null)
  const runningRef = useRef(false)

  useEffect(() => {
    async function run() {
      if (runningRef.current) return
      runningRef.current = true
      try {
        const result = await syncNow()
        if (result.status === 'pulled') {
          // 클라우드 최신을 받았으면 새로고침해서 모든 화면에 반영
          window.location.reload()
          return
        }
        if (result.status === 'conflict') setConflict(result.remote)
      } catch {
        /* 네트워크 문제 등은 조용히 넘김 — 다음 주기에 다시 시도 */
      } finally {
        runningRef.current = false
      }
    }

    run()
    const onFocus = () => run()
    window.addEventListener('focus', onFocus)
    const timer = setInterval(run, INTERVAL_MS)
    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(timer)
    }
  }, [])

  if (!conflict) return null
  return <ConflictModal remote={conflict} onClose={() => setConflict(null)} />
}
