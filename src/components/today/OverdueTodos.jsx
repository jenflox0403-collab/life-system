import { useState } from 'react'
import { todayKey } from '../../lib/date.js'

// 지난 날짜인데 아직 안 한 할 일 목록 담당 (오늘 탭 상단 알림 카드)
// 까먹고 방치되는 할 일이 사라지지 않도록 한곳에 모아 보여줌

// 며칠 지났는지 계산 ("YYYY-MM-DD" 두 개의 날짜 차이)
function daysLate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const past = new Date(y, m - 1, d)
  const [ty, tm, td] = todayKey().split('-').map(Number)
  const today = new Date(ty, tm - 1, td)
  return Math.round((today - past) / 86400000)
}

export default function OverdueTodos({ todos, onBumpToday, onToggleDone, onRemove }) {
  const [open, setOpen] = useState(true)

  const sorted = [...todos].sort((a, b) => (a.date < b.date ? -1 : 1)) // 오래된 것부터

  return (
    <section className="sao-card overflow-hidden border-l-[3px] border-l-[var(--color-danger)] p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-bold text-[var(--color-danger)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-xs font-bold text-white">
            {todos.length}
          </span>
          밀린 할 일
        </span>
        <span className="text-[var(--color-muted)]">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <ul className="flex flex-col gap-1.5 px-5 pb-4">
          {sorted.map((todo) => {
            const late = daysLate(todo.date)
            return (
              <li
                key={todo.id}
                className="flex items-center gap-2 rounded-[5px] border border-black/[0.07] bg-white px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[15px]">{todo.text}</span>
                  <span className="text-xs text-[var(--color-danger)]">
                    {todo.date.slice(5).replace('-', '/')} · {late}일 지남
                  </span>
                </div>
                <button type="button" onClick={() => onBumpToday(todo.id)} className="chip shrink-0">
                  오늘로
                </button>
                <button type="button" onClick={() => onToggleDone(todo.id)} className="chip shrink-0">
                  완료
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(todo.id)}
                  aria-label="삭제"
                  className="shrink-0 px-1 text-black/20 hover:text-red-400"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
