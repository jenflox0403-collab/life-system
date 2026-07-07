import { todayKey } from '../../lib/date.js'

// 이 파일은 주간 화면에 딸린 이번 주 달력(월~일) 담당
// 각 날짜에 그날 To-Do 개수를 점으로 표시. 날짜를 누르면 그날로 이동(선택).
export default function WeekCalendar({ todos, selected, onSelectDay }) {
  const now = new Date()
  // 이번 주 월요일 찾기
  const monday = new Date(now)
  const offset = (now.getDay() + 6) % 7 // 월=0
  monday.setDate(now.getDate() - offset)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
  const labels = ['월', '화', '수', '목', '금', '토', '일']
  const todayK = todayKey()

  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-3 font-bold">이번 주</h3>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const key = todayKey(d)
          const count = todos.filter((todo) => todo.date === key && !todo.done).length
          const isToday = key === todayK
          const isSelected = key === selected
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-[5px] border py-2 transition-colors ${
                isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/[0.06]' : 'border-black/[0.07]'
              }`}
            >
              <span className={`text-[11px] ${i >= 5 ? 'text-[var(--color-danger)]' : 'text-[var(--color-muted)]'}`}>
                {labels[i]}
              </span>
              <span
                className={`text-sm font-bold ${
                  isSelected ? 'text-[var(--color-accent)]' : isToday ? 'text-[var(--color-accent)] underline decoration-dotted underline-offset-2' : ''
                }`}
              >
                {d.getDate()}
              </span>
              <span className="flex h-1.5 items-center">
                {count > 0 && <span className="size-1.5 rounded-full bg-[var(--color-accent)]" />}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
