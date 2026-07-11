import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { REASSURANCE, DEFAULT_LINES } from '../../lib/sosContent.js'
import BreathingGuide from './BreathingGuide.jsx'
import Grounding from './Grounding.jsx'
import UrgeTimer from './UrgeTimer.jsx'
import RestartStep from './RestartStep.jsx'

const TOOLS = [
  { id: 'breath', title: '숨 고르기', desc: '4-4-4-4 호흡으로 몸부터 진정' },
  { id: 'ground', title: '지금에 닻 내리기', desc: '5-4-3-2-1 감각 그라운딩' },
  { id: 'urge', title: '충동 지나보내기', desc: '잠깐 기다리면 힘이 빠져요' },
  { id: 'restart', title: '다시 한 걸음', desc: '가장 작은 것부터 시작' },
]

// 랜덤으로 하나 뽑기 (선언문 있으면 그중, 없으면 기본 격려문)
function pickLine(goals) {
  const year = new Date().getFullYear()
  const declarations = goals?.meta?.[year]?.declarations ?? []
  const pool = declarations.length > 0 ? declarations.map((d) => d.text) : DEFAULT_LINES
  return pool[Math.floor(Math.random() * pool.length)]
}

// 이 파일은 SOS 전체화면 허브 담당 — 안심 문구 + 도구 4개 라우팅
export default function SosOverlay({ onClose }) {
  const [goals] = useStoredState('goals', {})
  const [todos, setTodos] = useStoredState('todos', [])
  const [view, setView] = useState('hub')
  const [line] = useState(() => pickLine(goals)) // 열 때 한 번만 뽑음

  function addStep(text) {
    setTodos([...todos, { id: uid(), text, date: todayKey(), urgent: false, important: false, done: false }])
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
            <div className="mt-8 flex w-full flex-col gap-2.5">
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
          </div>
        )}

        {view === 'breath' && <BreathingGuide onClose={backToHub} />}
        {view === 'ground' && <Grounding onClose={backToHub} />}
        {view === 'urge' && <UrgeTimer onClose={backToHub} />}
        {view === 'restart' && <RestartStep line={line} onAddStep={addStep} onClose={onClose} />}
      </div>
    </div>
  )
}
