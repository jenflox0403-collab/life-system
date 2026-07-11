import { useState, useEffect } from 'react'
import { usePomodoro, remainingSeconds } from '../../hooks/usePomodoro.js'

const PHASE_COLOR = { focus: 'var(--color-danger)', short: 'var(--color-accent)', long: '#4cc38a' }

function mmss(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// 이 파일은 플로팅 미니 타이머 담당
// 타이머가 도는 동안(또는 일시정지) 다른 탭에서도 남은 시간이 보이고, 탭하면 타이머 탭으로 이동
export default function MiniTimer({ visible, onGoTimer }) {
  const pomo = usePomodoro()
  const [, setTick] = useState(0)

  useEffect(() => {
    if (pomo.status !== 'running') return
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [pomo.status])

  if (!visible || pomo.status === 'idle') return null

  return (
    <button
      type="button"
      onClick={onGoTimer}
      aria-label="타이머로 이동"
      className="fixed bottom-40 right-5 z-30 flex items-center gap-2 rounded-full border border-black/10 bg-white/95 py-2 pl-3 pr-4 shadow-[0_6px_20px_rgba(60,75,90,0.25)] backdrop-blur transition active:scale-95"
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${pomo.status === 'paused' ? 'opacity-40' : ''}`}
        style={{ background: PHASE_COLOR[pomo.phase] ?? 'var(--color-accent)' }}
      />
      <span className="text-sm font-bold tabular-nums text-[var(--color-heading)]">{mmss(remainingSeconds(pomo))}</span>
      {pomo.phase === 'focus' && pomo.focusText && (
        <span className="max-w-24 truncate text-xs text-[var(--color-muted)]">{pomo.focusText}</span>
      )}
    </button>
  )
}
