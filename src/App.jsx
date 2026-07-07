import { useState } from 'react'
import TodayTab from './components/today/TodayTab.jsx'
import PlanTab from './components/plan/PlanTab.jsx'
import HabitsTab from './components/habits/HabitsTab.jsx'
import CalendarTab from './components/calendar/CalendarTab.jsx'
import ContentTab from './components/content/ContentTab.jsx'
import JournalTab from './components/journal/JournalTab.jsx'
import TimerTab from './components/timer/TimerTab.jsx'
import SettingsSheet from './components/ui/SettingsSheet.jsx'
import {
  IconToday,
  IconPlan,
  IconHabits,
  IconCalendar,
  IconContent,
  IconJournal,
  IconTimer,
  IconSettings,
} from './components/ui/icons.jsx'

// 이 파일은 앱의 뼈대 담당 — 상단 헤더 + 화면 전환 + 하단 탭바
const TABS = [
  { id: 'today', label: '오늘', en: 'Today', Icon: IconToday, screen: TodayTab },
  { id: 'plan', label: '계획', en: 'Plan', Icon: IconPlan, screen: PlanTab },
  { id: 'habits', label: '습관', en: 'Habit', Icon: IconHabits, screen: HabitsTab },
  { id: 'calendar', label: '달력', en: 'Calendar', Icon: IconCalendar, screen: CalendarTab },
  { id: 'content', label: '콘텐츠', en: 'Content', Icon: IconContent, screen: ContentTab },
  { id: 'journal', label: '기록', en: 'Journal', Icon: IconJournal, screen: JournalTab },
  { id: 'timer', label: '타이머', en: 'Timer', Icon: IconTimer, screen: TimerTab },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const current = TABS.find((tab) => tab.id === activeTab)
  const Screen = current.screen

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white/80 px-5 py-3.5 shadow-[0_2px_12px_rgba(60,75,90,0.08)] backdrop-blur">
        <h1 className="sao-title text-xl font-bold tracking-tight text-[var(--color-heading)]">{current.label}</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          aria-label="설정 및 백업"
          className="sao-circle !h-9 !w-9 transition hover:brightness-95 active:scale-95"
        >
          <IconSettings width={18} height={18} />
        </button>
      </header>

      <main className="flex-1 px-5 py-5 pb-28 sm:px-6">
        <Screen />
      </main>

      <nav
        aria-label="주요 탭"
        className="pb-safe fixed inset-x-0 bottom-0 z-10 border-t border-black/10 bg-white/85 shadow-[0_-4px_16px_rgba(60,75,90,0.1)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-5xl px-1">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            const TabIcon = tab.Icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex flex-1 flex-col items-center gap-1 pt-2.5 pb-1.5 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-[var(--color-amber-deep)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <span className={`${isActive ? 'sao-circle sao-circle-active' : 'sao-circle'} transition-transform group-active:scale-90`}>
                  <TabIcon width={21} height={21} strokeWidth={isActive ? 2.2 : 1.9} />
                </span>
                <span className={isActive ? 'font-bold' : ''}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {isSettingsOpen && <SettingsSheet onClose={() => setIsSettingsOpen(false)} />}
    </div>
  )
}
