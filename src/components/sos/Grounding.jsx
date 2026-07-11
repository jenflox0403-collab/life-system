import { useState } from 'react'
import { GROUNDING_STEPS } from '../../lib/sosContent.js'

// 이 파일은 그라운딩 5-4-3-2-1 담당 — 감각으로 현재에 닻 내리기
// 탭할 때마다 다음 감각으로 넘어감
export default function Grounding({ onClose }) {
  const [idx, setIdx] = useState(0)
  const done = idx >= GROUNDING_STEPS.length
  const step = done ? null : GROUNDING_STEPS[idx]

  return (
    <div className="flex flex-col items-center text-center">
      {done ? (
        <>
          <p className="text-2xl font-bold text-[var(--color-accent)]">지금, 여기에 왔어요</p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">주의가 현재로 돌아왔어요.</p>
          <button onClick={onClose} className="mt-8 sao-btn-primary px-8 py-3">돌아가기</button>
        </>
      ) : (
        <>
          <span className="text-6xl font-bold text-[var(--color-accent)]">{step.count}</span>
          <p className="mt-3 text-xl font-bold text-[var(--color-heading)]">{step.sense}</p>
          <p className="mt-2 max-w-xs text-sm text-[var(--color-muted)]">{step.hint}</p>
          <button onClick={() => setIdx(idx + 1)} className="mt-8 sao-btn-primary px-8 py-3">
            찾았어요 · 다음
          </button>
          <p className="mt-4 text-xs text-[var(--color-muted)]">{idx + 1} / {GROUNDING_STEPS.length}</p>
        </>
      )}
    </div>
  )
}
