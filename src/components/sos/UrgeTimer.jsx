import { useState, useEffect } from 'react'
import { URGE_DURATIONS } from '../../lib/sosContent.js'

const R = 54
const C = 2 * Math.PI * R

function mmss(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// 이 파일은 충동 지연 타이머 담당 — 충동은 파도, 이 시간만 지나가게 두기(urge surfing)
export default function UrgeTimer({ onClose }) {
  const [total, setTotal] = useState(null) // 선택 전엔 null
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (total === null || left <= 0) return
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [left, total])

  // 시간 선택 화면
  if (total === null) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="max-w-xs text-[15px] leading-relaxed text-[var(--color-heading)]">
          충동은 파도예요. 이 시간만 지나가게 두면 힘이 빠져요.
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">얼마나 기다려볼까요?</p>
        <div className="mt-6 flex gap-2">
          {URGE_DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => {
                setTotal(d.seconds)
                setLeft(d.seconds)
              }}
              className="sao-btn-primary px-6 py-3"
            >
              {d.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 text-sm text-[var(--color-muted)]">돌아가기</button>
      </div>
    )
  }

  const done = left <= 0

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg className="absolute -rotate-90" width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={done ? C : C * (1 - left / total)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="text-3xl font-bold text-[var(--color-heading)]">{done ? '✓' : mmss(left)}</span>
      </div>

      <p className="mt-5 text-[15px] font-medium text-[var(--color-heading)]">
        {done ? '잘 버텼어요. 충동이 지나갔어요.' : '숨 쉬며 기다려요.'}
      </p>

      <button onClick={onClose} className="mt-6 sao-btn-primary px-8 py-3">
        {done ? '돌아가기' : '그만 · 돌아가기'}
      </button>
    </div>
  )
}
