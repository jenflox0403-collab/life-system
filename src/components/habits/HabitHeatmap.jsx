import { daysInMonth, todayKey } from '../../lib/date.js'

// 이 파일은 습관 탭의 월별 히트맵(달력형) 담당
// 색 진하기 = 그날 체크한 습관 비율
export default function HabitHeatmap({ year, monthIndex, habits, habitLog }) {
  const total = daysInMonth(year, monthIndex)
  const firstDay = new Date(year, monthIndex, 1).getDay() // 0=일
  const today = todayKey()

  function dateKeyOf(day) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function ratioOf(day) {
    if (habits.length === 0) return 0
    const log = habitLog[dateKeyOf(day)] ?? {}
    const checked = habits.filter((habit) => log[habit.id]).length
    return checked / habits.length
  }

  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ]

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-[var(--color-muted)]">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} />
          const ratio = ratioOf(day)
          const isToday = dateKeyOf(day) === today
          return (
            <div
              key={day}
              className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-medium ${
                isToday ? 'ring-2 ring-[var(--color-accent)]' : ''
              } ${ratio > 0.5 ? 'text-white' : 'text-[var(--color-text)]'}`}
              style={{
                background:
                  ratio === 0 ? 'rgba(0,0,0,0.04)' : `rgba(59, 167, 220, ${0.15 + ratio * 0.85})`,
              }}
              title={`${monthIndex + 1}/${day}: ${Math.round(ratio * 100)}%`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
