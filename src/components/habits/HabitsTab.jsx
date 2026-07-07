import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { todayKey, daysInMonth } from '../../lib/date.js'
import HabitHeatmap from './HabitHeatmap.jsx'

const DEFAULT_HABITS = [
  { id: 'h1', name: '아침루틴 완수' },
  { id: 'h2', name: '운동 30분' },
  { id: 'h3', name: '성경/기도' },
  { id: 'h4', name: '콘텐츠 작업' },
  { id: 'h5', name: '독서 20분' },
]

// 이 파일은 "습관" 탭 본체 담당 — 오늘 체크 + 스트릭 + 히트맵 + 통계
export default function HabitsTab() {
  const [habits, setHabits] = useStoredState('habits', DEFAULT_HABITS)
  const [habitLog, setHabitLog] = useStoredState('habitLog', {})
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-based
  const [showYearView, setShowYearView] = useState(false)
  const today = todayKey()
  const todayLog = habitLog[today] ?? {}

  function toggleToday(habitId) {
    setHabitLog({ ...habitLog, [today]: { ...todayLog, [habitId]: !todayLog[habitId] } })
  }

  /** 연속 달성일: 오늘(체크 시) 또는 어제부터 거꾸로 센다 */
  function streakOf(habitId) {
    let count = 0
    const cursor = new Date()
    if (!todayLog[habitId]) cursor.setDate(cursor.getDate() - 1)
    while ((habitLog[todayKey(cursor)] ?? {})[habitId]) {
      count += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }

  function moveMonth(dir) {
    const next = new Date(viewYear, viewMonth + dir, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  /** 해당 월의 습관별 달성률과 전체 달성률 계산 */
  function monthStats(year, monthIndex) {
    const isCurrent = year === now.getFullYear() && monthIndex === now.getMonth()
    const days = isCurrent ? now.getDate() : daysInMonth(year, monthIndex)
    if (habits.length === 0 || days === 0) return { total: 0, perHabit: [] }
    let checkedSum = 0
    const perHabit = habits.map((habit) => {
      let checked = 0
      for (let day = 1; day <= days; day += 1) {
        const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        if ((habitLog[key] ?? {})[habit.id]) checked += 1
      }
      checkedSum += checked
      return { habit, rate: checked / days }
    })
    return { total: checkedSum / (habits.length * days), perHabit }
  }

  const stats = monthStats(viewYear, viewMonth)
  const worst = stats.perHabit.length > 0 ? stats.perHabit.reduce((a, b) => (a.rate <= b.rate ? a : b)) : null

  return (
    <div className="flex flex-col gap-4">
      {/* 오늘 체크 */}
      <section className="sao-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="sao-title font-bold">
            오늘 체크
            <span className="ml-2 text-sm font-medium text-[var(--color-muted)]">
              {habits.filter((habit) => todayLog[habit.id]).length}/{habits.length}
            </span>
          </h3>
          <button
            onClick={() => setHabits([...habits, { id: uid(), name: '새 습관' }])}
            className="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] hover:bg-black/5"
          >
            ＋추가
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center gap-3 rounded-xl px-1 py-2 hover:bg-black/[0.03]">
              <input
                type="checkbox"
                checked={!!todayLog[habit.id]}
                onChange={() => toggleToday(habit.id)}
                className="app-check"
              />
              <input
                value={habit.name}
                onChange={(event) =>
                  setHabits(habits.map((h) => (h.id === habit.id ? { ...h, name: event.target.value } : h)))
                }
                className={`min-w-0 flex-1 bg-transparent text-[15px] outline-none ${
                  todayLog[habit.id] ? 'text-[var(--color-muted)] line-through' : ''
                }`}
              />
              {streakOf(habit.id) > 0 && (
                <span className="shrink-0 text-xs font-bold text-[var(--color-amber-deep)]">✦ {streakOf(habit.id)}일 연속</span>
              )}
              <button
                onClick={() => setHabits(habits.filter((h) => h.id !== habit.id))}
                className="px-1 text-black/20 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 월별 히트맵 */}
      <section className="sao-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="sao-title font-bold">월별 히트맵</h3>
          <div className="flex items-center gap-1 text-sm">
            <button onClick={() => moveMonth(-1)} className="rounded-lg px-2 py-1 hover:bg-black/5">◀</button>
            <span className="min-w-20 text-center font-bold">{viewYear}년 {viewMonth + 1}월</span>
            <button onClick={() => moveMonth(1)} className="rounded-lg px-2 py-1 hover:bg-black/5">▶</button>
          </div>
        </div>
        <HabitHeatmap year={viewYear} monthIndex={viewMonth} habits={habits} habitLog={habitLog} />
      </section>

      {/* 월간 통계 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">{viewMonth + 1}월 통계</h3>
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-black/[0.03] p-3 text-center">
            <p className="text-2xl font-bold text-[var(--color-accent)]">{Math.round(stats.total * 100)}%</p>
            <p className="text-xs text-[var(--color-muted)]">전체 달성률</p>
          </div>
          <div className="rounded-xl bg-black/[0.03] p-3 text-center">
            <p className="truncate text-sm font-bold text-[var(--color-danger)]">{worst ? worst.habit.name : '—'}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              가장 아쉬운 습관 {worst && `(${Math.round(worst.rate * 100)}%)`}
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-1.5">
          {stats.perHabit.map(({ habit, rate }) => (
            <li key={habit.id} className="flex items-center gap-2 text-sm">
              <span className="w-28 truncate">{habit.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${rate * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs text-[var(--color-muted)]">{Math.round(rate * 100)}%</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 연간 뷰 */}
      <section className="sao-card p-5">
        <button onClick={() => setShowYearView(!showYearView)} className="sao-title w-full text-left font-bold">
          연간 뷰 {showYearView ? '▲' : '▼'}
        </button>
        {showYearView && (
          <div className="mt-4 flex h-32 items-end gap-1.5">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const rate = monthStats(viewYear, monthIndex).total
              return (
                <div key={monthIndex} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-[var(--color-accent)]"
                      style={{ height: `${Math.max(rate * 100, 2)}%`, opacity: rate === 0 ? 0.15 : 0.9 }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--color-muted)]">{monthIndex + 1}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
