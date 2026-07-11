import { useState, useEffect } from 'react'
import { load } from '../../lib/storage.js'
import { todayKey } from '../../lib/date.js'
import { initAudio } from '../../lib/beep.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { usePomodoro, setPomodoro, remainingSeconds } from '../../hooks/usePomodoro.js'

const PHASES = [
  { id: 'focus', label: '집중', color: 'var(--color-danger)' },
  { id: 'short', label: '휴식', color: 'var(--color-accent)' },
  { id: 'long', label: '긴 휴식', color: '#4cc38a' },
]

const R = 54
const C = 2 * Math.PI * R

function mmss(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// 이 파일은 "타이머" 탭 본체 담당 — 포모도로 (집중/휴식/긴 휴식)
// 실제 시간 상태는 usePomodoro 공유 저장소에 있어 탭을 옮겨도 안 끊겨요
export default function TimerTab() {
  const pomo = usePomodoro()
  const [blocks] = useStoredState('timeblocks', {})
  const [, setTick] = useState(0)

  // 돌아가는 동안 1초마다 다시 그리기
  useEffect(() => {
    if (pomo.status !== 'running') return
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [pomo.status])

  const today = todayKey()
  const sessions = load('pomodoroLog', {})[today] ?? 0
  const phaseDef = PHASES.find((p) => p.id === pomo.phase) ?? PHASES[0]
  const total = (pomo.durations[pomo.phase] ?? 25) * 60
  const left = remainingSeconds(pomo)

  // 지금 시각에 걸친 타임블록 → 집중 대상 제안
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const currentBlock = (blocks[today] ?? []).find((b) => b.start <= nowMin && nowMin < b.end)

  function start() {
    initAudio() // 완료음 준비 (사용자 탭 안에서만 가능)
    const seconds = pomo.status === 'paused' ? (pomo.remaining ?? total) : total
    setPomodoro({ status: 'running', endsAt: Date.now() + seconds * 1000, remaining: null })
  }

  function pause() {
    setPomodoro((s) => ({ status: 'paused', remaining: Math.max(0, Math.round((s.endsAt - Date.now()) / 1000)), endsAt: null }))
  }

  function reset() {
    setPomodoro({ status: 'idle', endsAt: null, remaining: null })
  }

  function changePhase(id) {
    if (pomo.status !== 'idle') return
    setPomodoro({ phase: id })
  }

  function changeDuration(id, value) {
    const minutes = Math.min(120, Math.max(1, Number(value) || 1))
    setPomodoro((s) => ({ durations: { ...s.durations, [id]: minutes } }))
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="sao-card flex flex-col items-center p-5">
        {/* 단계 선택 */}
        <div className="mb-4 flex gap-1.5">
          {PHASES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => changePhase(p.id)}
              disabled={pomo.status !== 'idle'}
              className="chip disabled:opacity-40"
              style={p.id === pomo.phase ? { borderColor: p.color, background: `color-mix(in srgb, ${p.color} 12%, white)`, color: p.color } : {}}
            >
              {p.label} {pomo.durations[p.id]}분
            </button>
          ))}
        </div>

        {/* 집중 대상 */}
        {pomo.phase === 'focus' && (
          <div className="mb-4 w-full max-w-xs">
            <input
              value={pomo.focusText}
              onChange={(e) => setPomodoro({ focusText: e.target.value })}
              placeholder="무엇에 집중하나요? (선택)"
              className="w-full rounded-[5px] border border-black/10 px-3 py-2 text-center text-sm outline-none focus:border-[var(--color-accent)]"
            />
            {currentBlock && currentBlock.title !== pomo.focusText && (
              <button
                type="button"
                onClick={() => setPomodoro({ focusText: currentBlock.title })}
                className="chip mt-1.5 w-full justify-center"
              >
                지금 블록: {currentBlock.title} ↑
              </button>
            )}
          </div>
        )}

        {/* 원형 링 */}
        <div className="relative flex h-48 w-48 items-center justify-center">
          <svg className="absolute -rotate-90" width="180" height="180" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={phaseDef.color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - left / total)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="text-center">
            <p className="text-4xl font-bold tabular-nums text-[var(--color-heading)]">{mmss(left)}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {pomo.status === 'running' ? `${phaseDef.label} 중` : pomo.status === 'paused' ? '일시정지' : phaseDef.label}
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-4 flex gap-2">
          {pomo.status === 'running' ? (
            <button onClick={pause} className="sao-btn-primary px-8 py-3">일시정지</button>
          ) : (
            <button onClick={start} className="sao-btn-primary px-8 py-3">
              {pomo.status === 'paused' ? '이어서' : '시작'}
            </button>
          )}
          {pomo.status !== 'idle' && (
            <button onClick={reset} className="rounded-xl border border-black/10 px-6 py-3 font-bold transition active:scale-[0.98]">
              초기화
            </button>
          )}
        </div>
      </section>

      {/* 오늘 완료 세션 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">오늘 집중 세션</h3>
        {sessions === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">아직 완료한 세션이 없어요. 25분만 몰입해봐요!</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: Math.min(sessions, 12) }, (_, i) => (
              <span
                key={i}
                className={`h-3.5 w-3.5 rounded-full bg-[var(--color-amber)] ${(i + 1) % 4 === 0 ? 'mr-2' : ''}`}
              />
            ))}
            {sessions > 12 && <span className="text-xs text-[var(--color-muted)]">+{sessions - 12}</span>}
            <span className="ml-1 text-sm font-bold text-[var(--color-amber-deep)]">{sessions}세션 ✦</span>
          </div>
        )}
        <p className="mt-2 text-xs text-[var(--color-muted)]">집중 4세션마다 긴 휴식을 제안해요 · 세션당 +15 XP</p>
      </section>

      {/* 시간 설정 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">시간 설정</h3>
        <div className="flex gap-2">
          {PHASES.map((p) => (
            <label key={p.id} className="flex-1">
              <span className="mb-1 block text-center text-xs text-[var(--color-muted)]">{p.label}</span>
              <input
                type="number"
                min="1"
                max="120"
                value={pomo.durations[p.id]}
                disabled={pomo.status !== 'idle'}
                onChange={(e) => changeDuration(p.id, e.target.value)}
                className="w-full rounded-[5px] border border-black/10 px-2 py-2 text-center outline-none focus:border-[var(--color-accent)] disabled:opacity-40"
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">분 단위 · 타이머가 멈춰 있을 때만 바꿀 수 있어요</p>
      </section>
    </div>
  )
}
