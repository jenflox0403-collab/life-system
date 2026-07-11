import { useState } from 'react'
import { BODY_RESET } from '../../lib/sosContent.js'

// 이 파일은 "재시작 한 걸음" 담당 — 선언문 + 몸 리셋 + 가장 작은 다음 한 걸음
// 한 걸음을 오늘 할 일에 추가하면 실행 착수 장벽이 확 낮아짐
export default function RestartStep({ line, onAddStep, onClose }) {
  const [checked, setChecked] = useState({})
  const [step, setStep] = useState('')
  const [added, setAdded] = useState(false)

  function toggle(item) {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }))
  }

  function handleAdd() {
    if (!step.trim()) return
    onAddStep(step.trim())
    setAdded(true)
  }

  return (
    <div className="flex w-full max-w-sm flex-col">
      {/* 선언문 / 격려문 */}
      <div className="rounded-[8px] bg-white/70 px-4 py-3 text-center">
        <p className="text-[15px] font-medium leading-relaxed text-[var(--color-heading)]">“{line}”</p>
      </div>

      {/* 몸 리셋 체크 */}
      <p className="mb-2 mt-5 text-sm font-bold text-[var(--color-heading)]">몸부터 리셋</p>
      <div className="flex flex-col gap-1.5">
        {BODY_RESET.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className="flex items-center gap-2.5 rounded-[5px] bg-white/70 px-3 py-2.5 text-left"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border text-xs text-white ${
                checked[item] ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-black/20 bg-white'
              }`}
            >
              {checked[item] ? '✓' : ''}
            </span>
            <span className={`text-[15px] ${checked[item] ? 'text-[var(--color-muted)] line-through' : ''}`}>{item}</span>
          </button>
        ))}
      </div>

      {/* 가장 작은 한 걸음 */}
      <p className="mb-2 mt-5 text-sm font-bold text-[var(--color-heading)]">지금 할 수 있는 가장 작은 한 걸음</p>
      {added ? (
        <p className="rounded-[6px] bg-[var(--color-accent)]/12 px-3 py-2.5 text-sm font-medium text-[var(--color-accent)]">
          오늘 할 일에 추가했어요. 딱 이것만 해봐요 ✦
        </p>
      ) : (
        <>
          <input
            value={step}
            onChange={(e) => setStep(e.target.value)}
            placeholder="예: 자료 폴더 하나만 열기"
            className="w-full rounded-[5px] border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <button onClick={handleAdd} className="mt-2 sao-btn-primary py-3">오늘 할 일에 추가</button>
        </>
      )}

      <button onClick={onClose} className="mt-3 py-2 text-sm text-[var(--color-muted)]">닫고 시작하기</button>
    </div>
  )
}
