import { useState, useEffect } from 'react'
import { BREATH_PHASES, BREATH_CYCLES } from '../../lib/sosContent.js'

// 이 파일은 호흡 가이드 담당 — 4-4-4-4 박스호흡에 맞춰 원이 커졌다 작아짐
// JS 상태기계로 단계·초·원 크기를 동기화해 어긋남 없이 진행
export default function BreathingGuide({ onClose }) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [cycle, setCycle] = useState(1)
  const [secLeft, setSecLeft] = useState(BREATH_PHASES[0].seconds)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false) // 첫 들숨 애니메이션이 보이도록 작은 원에서 시작

  const phase = BREATH_PHASES[phaseIdx]

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 60)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (done) return
    if (secLeft <= 0) {
      // 다음 단계로 (마지막 단계면 다음 싸이클, 다 돌면 완료)
      if (phaseIdx < BREATH_PHASES.length - 1) {
        setPhaseIdx(phaseIdx + 1)
        setSecLeft(BREATH_PHASES[phaseIdx + 1].seconds)
      } else if (cycle < BREATH_CYCLES) {
        setCycle(cycle + 1)
        setPhaseIdx(0)
        setSecLeft(BREATH_PHASES[0].seconds)
      } else {
        setDone(true)
      }
      return
    }
    const timer = setTimeout(() => setSecLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secLeft, phaseIdx, cycle, done])

  return (
    <div className="flex flex-col items-center">
      {/* 호흡 원 */}
      <div className="flex h-64 w-64 items-center justify-center">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-full bg-[var(--color-accent)]/15 ring-2 ring-[var(--color-accent)]"
          style={{
            // started 전엔 작은 원(1)에서 시작해 첫 들숨 애니메이션이 보이게 함
            transform: `scale(${!started ? 1 : done ? 1.2 : phase.scale})`,
            transition: `transform ${done ? 0.6 : phase.seconds}s ease-in-out`,
          }}
        >
          <div className="text-center">
            {done ? (
              <span className="text-lg font-bold text-[var(--color-accent)]">잘 했어요</span>
            ) : (
              <>
                <span className="block text-base font-bold text-[var(--color-heading)]">{phase.label}</span>
                <span className="block text-sm text-[var(--color-muted)]">{secLeft}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--color-muted)]">
        {done ? '천천히, 잘 따라왔어요.' : `${cycle} / ${BREATH_CYCLES} 회`}
      </p>

      <button onClick={onClose} className="mt-6 sao-btn-primary px-8 py-3">
        {done ? '돌아가기' : '그만하기'}
      </button>
    </div>
  )
}
