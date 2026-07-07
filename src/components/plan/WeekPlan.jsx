import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import TodoRow from '../today/TodoRow.jsx'
import EisenhowerMatrix from './EisenhowerMatrix.jsx'
import WeekCalendar from './WeekCalendar.jsx'

// 이 파일은 계획 탭 > 주간 화면 담당 (주간 목표 + 이번 주 달력 + 매트릭스 + To-Do 전체)
export default function WeekPlan({ weekGoals, onChangeWeekGoals, todos, onChangeTodos }) {
  const [goalText, setGoalText] = useState('')
  const [todoText, setTodoText] = useState('')
  const [todoDate, setTodoDate] = useState(todayKey())

  function addGoal(event) {
    event.preventDefault()
    if (!goalText.trim()) return
    onChangeWeekGoals([...weekGoals, { id: uid(), text: goalText.trim(), done: false }])
    setGoalText('')
  }

  function addTodo(event) {
    event.preventDefault()
    if (!todoText.trim()) return
    onChangeTodos([...todos, { id: uid(), text: todoText.trim(), date: todoDate, urgent: false, important: false, done: false }])
    setTodoText('')
  }

  function patchTodo(id, changes) {
    onChangeTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)))
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
            className="min-w-0 flex-1 rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <button type="submit" className="add-btn px-4 py-2">추가</button>
        </form>
        <ul className="flex flex-col gap-1.5">
          {weekGoals.map((goal) => (
            <li key={goal.id} className="flex items-center gap-2.5 rounded-[5px] bg-black/[0.03] px-3 py-2.5">
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

      <WeekCalendar todos={todos} />

      <EisenhowerMatrix todos={todos} todayKey={todayKey()} onSendToday={(id) => patchTodo(id, { date: todayKey() })} />

      {/* To-Do 전체 목록 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">To-Do 전체</h3>
        <form onSubmit={addTodo} className="mb-3 flex flex-col gap-2">
          <input
            value={todoText}
            onChange={(event) => setTodoText(event.target.value)}
            placeholder="할 일 입력 (긴급·중요는 아래에서 바로 설정)"
            className="rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={todoDate}
              onChange={(event) => setTodoDate(event.target.value)}
              className="rounded-[5px] border border-black/10 px-2 py-1.5"
            />
            <button type="submit" className="ml-auto add-btn px-4 py-1.5">추가</button>
          </div>
        </form>

        <ul className="flex flex-col gap-1.5">
          {[...todos]
            .sort((a, b) => (a.date < b.date ? -1 : 1))
            .map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                showDate
                onToggleDone={() => patchTodo(todo.id, { done: !todo.done })}
                onToggleUrgent={() => patchTodo(todo.id, { urgent: !todo.urgent })}
                onToggleImportant={() => patchTodo(todo.id, { important: !todo.important })}
                onRemove={() => onChangeTodos(todos.filter((t) => t.id !== todo.id))}
              />
            ))}
        </ul>
      </section>
    </div>
  )
}
