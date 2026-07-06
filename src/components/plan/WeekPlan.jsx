import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { priorityColor } from '../today/TodoSection.jsx'

const QUADRANTS = [
  { key: 'q1', label: '긴급 + 중요', hint: '지금 바로', color: '#e0426a', match: (t) => t.urgent && t.important },
  { key: 'q2', label: '중요', hint: '계획해서', color: '#3ba7dc', match: (t) => !t.urgent && t.important },
  { key: 'q3', label: '긴급', hint: '빠르게 처리', color: '#f0a53c', match: (t) => t.urgent && !t.important },
  { key: 'q4', label: '나머지', hint: '여유될 때', color: '#aeb6bd', match: (t) => !t.urgent && !t.important },
]

// 이 파일은 계획 탭 > 주간 화면 담당 (주간 목표 + 아이젠하워 매트릭스 + 투두 전체)
export default function WeekPlan({ weekGoals, onChangeWeekGoals, todos, onChangeTodos }) {
  const [goalText, setGoalText] = useState('')
  const [todoText, setTodoText] = useState('')
  const [todoDate, setTodoDate] = useState(todayKey())
  const [urgent, setUrgent] = useState(false)
  const [important, setImportant] = useState(false)

  const activeTodos = todos.filter((todo) => !todo.done)

  function addGoal(event) {
    event.preventDefault()
    if (!goalText.trim()) return
    onChangeWeekGoals([...weekGoals, { id: uid(), text: goalText.trim(), done: false }])
    setGoalText('')
  }

  function addTodo(event) {
    event.preventDefault()
    if (!todoText.trim()) return
    onChangeTodos([
      ...todos,
      { id: uid(), text: todoText.trim(), date: todoDate, urgent, important, done: false },
    ])
    setTodoText('')
    setUrgent(false)
    setImportant(false)
  }

  function patchTodo(id, patch) {
    onChangeTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 이번 주 목표 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">이번 주 목표</h3>
        <form onSubmit={addGoal} className="mb-3 flex gap-2">
          <input
            value={goalText}
            onChange={(event) => setGoalText(event.target.value)}
            placeholder="이번 주에 이룰 것"
            className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <button type="submit" className="sao-btn-primary px-4 py-2">추가</button>
        </form>
        <ul className="flex flex-col gap-1.5">
          {weekGoals.map((goal) => (
            <li key={goal.id} className="flex items-center gap-2.5 rounded-xl bg-black/[0.03] px-3 py-2.5">
              <input
                type="checkbox"
                checked={goal.done}
                onChange={() => onChangeWeekGoals(weekGoals.map((g) => (g.id === goal.id ? { ...g, done: !g.done } : g)))}
                className="app-check"
              />
              <span className={`flex-1 text-[15px] ${goal.done ? 'text-[var(--color-muted)] line-through' : ''}`}>
                {goal.text}
              </span>
              <button
                onClick={() => onChangeWeekGoals(weekGoals.filter((g) => g.id !== goal.id))}
                className="px-1 text-black/20 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 아이젠하워 매트릭스 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-1 font-bold">아이젠하워 매트릭스</h3>
        <p className="mb-3 text-xs text-[var(--color-muted)]">완료 전 투두를 4분면으로 봅니다 · 긴급+중요는 오늘로 보내세요</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {QUADRANTS.map((quad) => {
            const items = activeTodos.filter(quad.match)
            return (
              <div key={quad.key} className="rounded-xl border border-black/[0.08] p-3" style={{ borderTopColor: quad.color, borderTopWidth: 3 }}>
                <p className="mb-1.5 text-sm font-bold" style={{ color: quad.color }}>
                  {quad.label}
                  <span className="ml-1.5 text-xs font-medium text-[var(--color-muted)]">{quad.hint} · {items.length}개</span>
                </p>
                {items.length === 0 ? (
                  <p className="py-1 text-xs text-[var(--color-muted)]">없음</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {items.map((todo) => (
                      <li key={todo.id} className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate">{todo.text}</span>
                        {quad.key === 'q1' && todo.date !== todayKey() && (
                          <button
                            onClick={() => patchTodo(todo.id, { date: todayKey() })}
                            className="shrink-0 rounded-md bg-[var(--color-accent)]/10 px-2 py-0.5 text-xs font-bold text-[var(--color-accent)]"
                          >
                            오늘로 →
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 투두 전체 목록 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">투두 전체</h3>
        <form onSubmit={addTodo} className="mb-3 flex flex-col gap-2">
          <input
            value={todoText}
            onChange={(event) => setTodoText(event.target.value)}
            placeholder="할 일 입력"
            className="rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <input
              type="date"
              value={todoDate}
              onChange={(event) => setTodoDate(event.target.value)}
              className="rounded-xl border border-black/10 px-2 py-1.5"
            />
            <button
              type="button"
              onClick={() => setUrgent(!urgent)}
              className={`rounded-full border px-3 py-1 transition ${
                urgent ? 'border-orange-400 bg-orange-50 font-bold text-orange-500' : 'border-black/10 text-[var(--color-muted)]'
              }`}
            >
              🔥 긴급
            </button>
            <button
              type="button"
              onClick={() => setImportant(!important)}
              className={`rounded-full border px-3 py-1 transition ${
                important ? 'border-blue-400 bg-blue-50 font-bold text-blue-500' : 'border-black/10 text-[var(--color-muted)]'
              }`}
            >
              ⭐ 중요
            </button>
            <button type="submit" className="ml-auto sao-btn-primary px-4 py-1.5">추가</button>
          </div>
        </form>

        <ul className="flex flex-col">
          {[...todos]
            .sort((a, b) => (a.date < b.date ? -1 : 1))
            .map((todo) => (
              <li key={todo.id} className="flex items-center gap-2.5 border-b border-black/[0.04] py-2.5 last:border-0">
                <span className="size-2 shrink-0 rounded-full" style={{ background: priorityColor(todo) }} />
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => patchTodo(todo.id, { done: !todo.done })}
                  className="app-check"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-[15px] ${todo.done ? 'text-[var(--color-muted)] line-through' : ''}`}>{todo.text}</p>
                  <p className="text-xs text-[var(--color-muted)]">{todo.date?.slice(5).replace('-', '/')}</p>
                </div>
                <button onClick={() => onChangeTodos(todos.filter((t) => t.id !== todo.id))} className="px-1 text-black/20 hover:text-red-400">
                  ✕
                </button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}
