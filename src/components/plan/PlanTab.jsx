import { useState } from 'react'
import { useStoredState } from '../../hooks/useStoredState.js'
import { monthKey, quarterKey, weekKey } from '../../lib/date.js'
import YearPlan from './YearPlan.jsx'
import CascadeGoalList from './CascadeGoalList.jsx'
import WeekPlan from './WeekPlan.jsx'

const SUB_TABS = [
  { id: 'year', label: '연간' },
  { id: 'quarter', label: '분기' },
  { id: 'month', label: '월간' },
  { id: 'week', label: '주간' },
]

// 이 파일은 "계획" 탭 본체 담당 — 연간→분기→월간→주간 캐스케이드
export default function PlanTab() {
  const [subTab, setSubTab] = useState('week')
  const [goals, setGoals] = useStoredState('goals', { year: {}, quarter: {}, month: {}, week: {}, meta: {} })
  const [todos, setTodos] = useStoredState('todos', [])

  const now = new Date()
  const year = String(now.getFullYear())
  const qKey = quarterKey(now)
  const mKey = monthKey(now)
  const wKey = weekKey(now)

  const yearGoals = goals.year[year] ?? []
  const quarterGoals = goals.quarter[qKey] ?? []
  const monthGoals = goals.month[mKey] ?? []
  const weekGoals = goals.week[wKey] ?? []
  const yearMeta = goals.meta?.[year] ?? {}

  function setSlice(level, key, value) {
    setGoals({ ...goals, [level]: { ...goals[level], [key]: value } })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 하위 탭 */}
      <div className="sao-card flex p-1.5">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              subTab === tab.id
                ? 'bg-gradient-to-b from-[#edb84f] to-[#d99a29] text-white shadow-sm'
                : 'text-[var(--color-muted)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'year' && (
        <YearPlan
          year={year}
          goals={yearGoals}
          meta={yearMeta}
          onChangeGoals={(value) => setSlice('year', year, value)}
          onChangeMeta={(value) => setGoals({ ...goals, meta: { ...goals.meta, [year]: value } })}
        />
      )}

      {subTab === 'quarter' && (
        <CascadeGoalList
          title={`${qKey.replace('-', ' ')} 분기 마일스톤`}
          placeholder="이번 분기에 이룰 것"
          goals={quarterGoals}
          onChange={(value) => setSlice('quarter', qKey, value)}
          parentLabel="연간 목표"
          parentOptions={yearGoals}
          withCriteria
        />
      )}

      {subTab === 'month' && (
        <CascadeGoalList
          title={`${Number(mKey.slice(5))}월 목표`}
          placeholder="이번 달에 이룰 것"
          goals={monthGoals}
          onChange={(value) => setSlice('month', mKey, value)}
          parentLabel="분기 마일스톤"
          parentOptions={quarterGoals}
          showProgress
        />
      )}

      {subTab === 'week' && (
        <WeekPlan
          weekGoals={weekGoals}
          onChangeWeekGoals={(value) => setSlice('week', wKey, value)}
          todos={todos}
          onChangeTodos={setTodos}
        />
      )}
    </div>
  )
}
