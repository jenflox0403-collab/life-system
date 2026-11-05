import { useEffect, useRef, useState } from 'react'
import TodayTab from './components/today/TodayTab.jsx'
import PlanTab from './components/plan/PlanTab.jsx'
import HabitsTab from './components/habits/HabitsTab.jsx'
import CalendarTab from './components/calendar/CalendarTab.jsx'
import ContentTab from './components/content/ContentTab.jsx'
import JournalTab from './components/journal/JournalTab.jsx'
import TimerTab from './components/timer/TimerTab.jsx'
import SettingsSheet from './components/ui/SettingsSheet.jsx'
import SosButton from './components/sos/SosButton.jsx'
import SosOverlay from './components/sos/SosOverlay.jsx'
import VerseButton from './components/verse/VerseButton.jsx'
import VerseOverlay from './components/verse/VerseOverlay.jsx'
import MiniTimer from './components/timer/MiniTimer.jsx'
import PomodoroWatcher from './components/timer/PomodoroWatcher.jsx'
import NotificationWatcher from './components/notify/NotificationWatcher.jsx'
import SyncWatcher from './components/sync/SyncWatcher.jsx'
import { load, save } from './lib/storage.js'
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

// 이 파일은 앱의 뼈대 담당 — 상단 헤더 + 화면 전환 + 하단 탭바 (+ 넓은 화면 2분할)
const TABS = [
  { id: 'today', label: '오늘', en: 'Today', Icon: IconToday, screen: TodayTab },
  { id: 'plan', label: '계획', en: 'Plan', Icon: IconPlan, screen: PlanTab },
  { id: 'habits', label: '습관', en: 'Habit', Icon: IconHabits, screen: HabitsTab },
  { id: 'calendar', label: '달력', en: 'Calendar', Icon: IconCalendar, screen: CalendarTab },
  { id: 'content', label: '콘텐츠', en: 'Content', Icon: IconContent, screen: ContentTab },
  { id: 'journal', label: '기록', en: 'Journal', Icon: IconJournal, screen: JournalTab },
  { id: 'timer', label: '타이머', en: 'Timer', Icon: IconTimer, screen: TimerTab },
]

const WIDE_MIN = 1100 // 이 폭 이상일 때만 2분할 가능

// 화면이 넓은지 추적 (창 크기 바뀌면 자동 갱신)
function useWide(minWidth) {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(min-width:${minWidth}px)`).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${minWidth}px)`)
    const onChange = () => setWide(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [minWidth])
  return wide
}

export default function App() {
  const savedSplit = load('uiSplit', {}) // 동기화·백업엔 안 섞이는 화면 설정
  const [activeTab, setActiveTab] = useState('today')
  const [splitOn, setSplitOn] = useState(!!savedSplit.on)
  const [rightTab, setRightTab] = useState(
    savedSplit.right && TABS.some((t) => t.id === savedSplit.right) ? savedSplit.right : 'calendar',
  )
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSosOpen, setIsSosOpen] = useState(false)
  const [isVerseOpen, setIsVerseOpen] = useState(false)
  // SOS에서 할 일을 추가했을 수 있으니, 닫힐 때 화면을 다시 마운트해 최신 데이터 로드
  const [screenEpoch, setScreenEpoch] = useState(0)

  const wide = useWide(WIDE_MIN)
  const twoPane = wide && splitOn // 넓은 화면 + 2분할 켜짐일 때만 두 칸

  const current = TABS.find((tab) => tab.id === activeTab)
  const Screen = current.screen
  const rightObj = TABS.find((tab) => tab.id === rightTab) ?? TABS[3]
  const RightScreen = rightObj.screen

  // 2분할 설정 기억 (localStorage, 동기화 대상 아님)
  useEffect(() => {
    save('uiSplit', { on: splitOn, right: rightTab })
  }, [splitOn, rightTab])

  // 팝업(SOS·설정)이 열려 있으면 숫자키 단축키를 막기 위한 최신 상태 참조
  const overlayRef = useRef(false)
  overlayRef.current = isSosOpen || isSettingsOpen

  // PC 단축키: 숫자 1~7 → (왼쪽) 탭 이동 (입력 중·팝업·조합키일 땐 무시)
  useEffect(() => {
    function handleKey(event) {
      if (overlayRef.current) return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < TABS.length) setActiveTab(TABS[index].id)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div
      className={`mx-auto flex w-full flex-col ${
        twoPane ? 'h-dvh max-w-[1700px] overflow-hidden' : 'min-h-dvh max-w-5xl'
      }`}
    >
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-black/10 bg-white/80 px-5 py-3.5 shadow-[0_2px_12px_rgba(60,75,90,0.08)] backdrop-blur">
        <h1 className="sao-title truncate text-xl font-bold tracking-tight text-[var(--color-heading)]">
          {twoPane ? `${current.label} · ${rightObj.label}` : current.label}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          {/* 2분할 토글 — 넓은 화면에서만 노출 */}
          {wide && (
            <button
              onClick={() => setSplitOn((v) => !v)}
              aria-pressed={splitOn}
              className="rounded-full border px-3 py-1.5 text-xs font-bold transition"
              style={
                splitOn
                  ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: '#fff' }
                  : { borderColor: 'rgba(0,0,0,0.15)', color: 'var(--color-muted)' }
              }
            >
              2분할
            </button>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="설정 및 백업"
            className="sao-circle !h-9 !w-9 transition hover:brightness-95 active:scale-95"
          >
            <IconSettings width={18} height={18} />
          </button>
        </div>
      </header>

      {twoPane ? (
        // ── 2분할: 테두리 박스 없이 가운데 구분선만 · 각 칸 독립 스크롤 ──
        <div className="flex min-h-0 flex-1">
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 px-5 pt-3 pb-1 text-xs font-bold text-[var(--color-muted)]">
              {current.label}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28">
              <Screen key={`left-${screenEpoch}`} />
            </div>
          </section>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-black/10">
            <div className="flex shrink-0 items-center gap-2 px-5 pt-3 pb-1">
              <span className="text-xs font-bold text-[var(--color-muted)]">오른쪽</span>
              <select
                value={rightTab}
                onChange={(e) => setRightTab(e.target.value)}
                className="ml-auto rounded-lg border border-black/15 bg-[var(--color-surface)] px-2 py-1 text-sm font-bold text-[var(--color-heading)] outline-none"
              >
                {TABS.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28">
              <RightScreen key={`right-${screenEpoch}-${rightTab}`} />
            </div>
          </section>
        </div>
      ) : (
        <main className="flex-1 px-5 py-5 pb-28 sm:px-6">
          <Screen key={screenEpoch} />
        </main>
      )}

      <nav
        aria-label="주요 탭"
        className="pb-safe fixed inset-x-0 bottom-0 z-10 border-t border-black/10 bg-white/85 shadow-[0_-4px_16px_rgba(60,75,90,0.1)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-5xl px-1">
          {TABS.map((tab, index) => {
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
                <span className="flex items-center gap-1">
                  <span className={isActive ? 'font-bold' : ''}>{tab.label}</span>
                  {/* PC 단축키 힌트 (숫자키) — 큰 화면에서만 */}
                  <span className="hidden text-[9px] font-normal text-[var(--color-muted)] sm:inline">{index + 1}</span>
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* 포모도로 완료 감지 + 미니 타이머 (돌아가는 동안 타이머 탭 밖에서 표시) */}
      <PomodoroWatcher />
      {/* 알림 감시자 — 앱 켜져 있는 동안 시각 체크해 알림 발송 */}
      <NotificationWatcher />
      {/* 동기화 감시자 — 앱 켤 때·돌아올 때·주기적으로 클라우드와 맞춤 */}
      <SyncWatcher />
      <MiniTimer visible={activeTab !== 'timer' && !isSosOpen && !isVerseOpen} onGoTimer={() => setActiveTab('timer')} />

      {/* 말씀 플로팅 버튼 (SOS 위) + 읊조리기 오버레이 */}
      {!isSosOpen && !isVerseOpen && <VerseButton onOpen={() => setIsVerseOpen(true)} />}
      {isVerseOpen && <VerseOverlay onClose={() => setIsVerseOpen(false)} />}

      {/* SOS 플로팅 버튼 (오버레이 열려 있을 땐 숨김) */}
      {!isSosOpen && !isVerseOpen && <SosButton onOpen={() => setIsSosOpen(true)} />}
      {isSosOpen && (
        <SosOverlay
          onClose={() => {
            setIsSosOpen(false)
            setScreenEpoch((e) => e + 1)
          }}
        />
      )}

      {isSettingsOpen && <SettingsSheet onClose={() => setIsSettingsOpen(false)} />}
    </div>
  )
}
