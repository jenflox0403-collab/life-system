import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey, monthKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { REASSURANCE, DEFAULT_LINES } from '../../lib/sosContent.js'
import BreathingGuide from './BreathingGuide.jsx'
import Grounding from './Grounding.jsx'
import UrgeTimer from './UrgeTimer.jsx'
import RestartStep from './RestartStep.jsx'
import AnchorBoard from './AnchorBoard.jsx'

const TOOLS = [
  { id: 'breath', title: '숨 고르기', desc: '4-4-4-4 호흡으로 몸부터 진정' },
  { id: 'ground', title: '지금에 닻 내리기', desc: '5-4-3-2-1 감각 그라운딩' },
  { id: 'urge', title: '충동 지나보내기', desc: '잠깐 기다리면 힘이 빠져요' },
  { id: 'restart', title: '다시 한 걸음', desc: '가장 작은 것부터 시작' },
  { id: 'anchor', title: '나를 붙잡는 것들', desc: '내 선언문 · 자극 · 목표' },
]

// SOS 저장 데이터 기본형 (선언문·자극·목표·버텨낸 기록·충동 메모)
const SOS_DEFAULT = { declarations: [], motivations: [], goals: [], surviveLog: {}, triggerLog: [] }

// 랜덤 한 줄 뽑기 — 내 앵커(선언문+자극) > 계획 탭 선언문 > 기본 격려문 순
function pickLine(goals, sos) {
  const year = new Date().getFullYear()
  const planDecls = (goals?.meta?.[year]?.declarations ?? []).map((d) => d.text)
  const mine = [...(sos.declarations ?? []), ...(sos.motivations ?? [])].map((d) => d.text)
  const pool = mine.length > 0 ? mine : planDecls.length > 0 ? planDecls : DEFAULT_LINES
  return pool[Math.floor(Math.random() * pool.length)]
}

// 이 파일은 SOS 전체화면 허브 담당 — 안심 문구 + 도구 5개 라우팅 + 충동 메모
export default function SosOverlay({ onClose }) {
  const [goals] = useStoredState('goals', {})
  const [todos, setTodos] = useStoredState('todos', [])
  const [sos, setSos] = useStoredState('sos', SOS_DEFAULT)
  const [view, setView] = useState('hub')
  const [line] = useState(() => pickLine(goals, sos)) // 열 때 한 번만 뽑음
  const [triggerText, setTriggerText] = useState('')
  const [triggerSaved, setTriggerSaved] = useState(false)

  // 이번 달 버텨낸 횟수
  const survived = sos.surviveLog?.[monthKey()] ?? 0

  function addStep(text) {
    setTodos([...todos, { id: uid(), text, date: todayKey(), urgent: false, important: false, done: false }])
  }

  /** 충동 타이머 완주 → 이번 달 버텨낸 횟수 +1 */
  function recordSurvived() {
    const month = monthKey()
    setSos({ ...sos, surviveLog: { ...(sos.surviveLog ?? {}), [month]: (sos.surviveLog?.[month] ?? 0) + 1 } })
  }

  /** 충동 트리거 한 줄 기록 (선택) */
  function saveTrigger(e) {
    e.preventDefault()
    if (!triggerText.trim()) return
    setSos({ ...sos, triggerLog: [...(sos.triggerLog ?? []), { id: uid(), date: todayKey(), text: triggerText.trim() }] })
    setTriggerText('')
    setTriggerSaved(true)
  }

  const backToHub = () => setView('hub')

  return (
    <div className="sos-overlay fixed inset-0 z-40 flex flex-col overflow-y-auto">
      {/* 닫기 */}
      <div className="flex shrink-0 justify-end p-4">
        <button onClick={onClose} aria-label="닫기" className="sao-circle !h-9 !w-9 text-lg text-[var(--color-muted)]">
          ✕
        </button>
      </div>

      <div className="sos-enter flex flex-1 flex-col items-center justify-center px-6 pb-16">
        {view === 'hub' && (
          <div className="flex w-full max-w-sm flex-col items-center">
            <p className="whitespace-pre-line text-center text-[17px] font-medium leading-relaxed text-[var(--color-heading)]">
              {REASSURANCE}
            </p>

            {/* 이번 달 버텨낸 기록 */}
            {survived > 0 && (
              <p className="mt-2 text-sm font-bold text-[var(--color-amber-deep)]">
                ✦ 이번 달 충동을 {survived}번 이겨냈어요
              </p>
            )}

            <div className="mt-7 flex w-full flex-col gap-2.5">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setView(tool.id)}
                  className="sao-card w-full p-4 text-left transition active:scale-[0.98]"
                >
                  <span className="block text-[16px] font-bold text-[var(--color-heading)]">{tool.title}</span>
                  <span className="mt-0.5 block text-sm text-[var(--color-muted)]">{tool.desc}</span>
                </button>
              ))}
            </div>

            {/* 충동 트리거 메모 (선택 · 부담 없이 한 줄) */}
            <div className="mt-6 w-full">
              {triggerSaved ? (
                <p className="text-center text-sm text-[var(--color-accent)]">기록했어요. 패턴을 알면 이기기 쉬워져요 ✦</p>
              ) : (
                <form onSubmit={saveTrigger} className="flex gap-1.5">
                  <input
                    value={triggerText}
                    onChange={(e) => setTriggerText(e.target.value)}
                    placeholder="뭐 때문이었어요? (선택, 한 줄)"
                    className="min-w-0 flex-1 rounded-[5px] border border-black/10 bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                  <button type="submit" className="add-btn px-3 py-1.5 text-sm">기록</button>
                </form>
              )}
            </div>
          </div>
        )}

        {view === 'breath' && <BreathingGuide onClose={backToHub} />}
        {view === 'ground' && <Grounding onClose={backToHub} />}
        {view === 'urge' && <UrgeTimer onClose={backToHub} onSurvived={recordSurvived} />}
        {view === 'restart' && <RestartStep line={line} onAddStep={addStep} onClose={onClose} />}
        {view === 'anchor' && <AnchorBoard sos={sos} onChange={setSos} onClose={backToHub} />}
      </div>
    </div>
  )
}
