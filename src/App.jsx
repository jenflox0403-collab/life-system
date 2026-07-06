import { useState } from 'react'
import TodayTab from './components/today/TodayTab.jsx'
import PlanTab from './components/plan/PlanTab.jsx'
import HabitsTab from './components/habits/HabitsTab.jsx'
import CalendarTab from './components/calendar/CalendarTab.jsx'
import ContentTab from './components/content/ContentTab.jsx'
import JournalTab from './components/journal/JournalTab.jsx'
import TimerTab from './components/timer/TimerTab.jsx'
import SettingsSheet from './components/ui/SettingsSheet.jsx'

// 이 파일은 앱의 뼈대 담당 — 상단 헤더 + 화면 전환 + 하단 탭바
const TABS = [
  { id: 'today', label: '오늘', icon: '☀️', screen: TodayTab },
  { id: 'plan', label: '계획', icon: '🎯', screen: PlanTab },
  { id: 'habits', label: '습관', icon: '✅', screen: HabitsTab },
  { id: 'calendar', label: '달력', icon: '📅', screen: CalendarTab },
  { id: 'content', label: '콘텐츠', icon: '🎬', screen: ContentTab },
  { id: 'journal', label: '기록', icon: '📖', screen: JournalTab },
  { id: 'timer', label: '타이머', icon: '⏱️', screen: TimerTab },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const current = TABS.find((tab) => tab.id === activeTab)
  const Screen = current.screen

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold">{current.label}</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          aria-label="설정 및 백업"
          className="rounded-full p-2 text-xl leading-none transition hover:bg-black/5 active:scale-95"
        >
          ⚙️
        </button>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">
        <Screen />
      </main>

      <nav
        aria-label="주요 탭"
        className="pb-safe fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-2xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={tab.id === activeTab ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition ${
                tab.id === activeTab ? 'font-bold text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {isSettingsOpen && <SettingsSheet onClose={() => setIsSettingsOpen(false)} />}
    </div>
  )
}
