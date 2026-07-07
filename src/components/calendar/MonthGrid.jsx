import { monthGridCells, todayKey } from '../../lib/date.js'
import { eventColor } from '../../lib/eventTypes.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MAX_DOTS = 3 // 한 칸에 최대 점 개수 (넘치면 +N 표시)

// 이 파일은 월간 달력 그리드 담당 — 날짜 칸 + 일정 색 점 + 이전/다음 달 이동
export default function MonthGrid({ year, monthIndex, events, selected, onSelectDay, onChangeMonth }) {
  const cells = monthGridCells(year, monthIndex)
  const today = todayKey()

  // 날짜별 일정 모으기 { '2026-07-07': [event, ...] }
  const byDate = {}
  for (const event of events) {
    if (!event.date) continue
    ;(byDate[event.date] ??= []).push(event)
  }

  return (
    <section className="sao-card p-4">
      {/* 월 이동 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => onChangeMonth(-1)}
          aria-label="이전 달"
          className="sao-circle !h-8 !w-8 transition active:scale-90"
        >
          ‹
        </button>
        <h3 className="sao-title text-base font-bold">
          {year}년 {monthIndex + 1}월
        </h3>
        <button
          onClick={() => onChangeMonth(1)}
          aria-label="다음 달"
          className="sao-circle !h-8 !w-8 transition active:scale-90"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-[var(--color-muted)]">
        {WEEKDAYS.map((day, i) => (
          <span key={day} className={i === 0 ? 'text-[var(--color-danger)]' : ''}>
            {day}
          </span>
        ))}
      </div>

      {/* 날짜 칸 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (cell === null) return <span key={`empty-${index}`} />
          const dayEvents = byDate[cell.key] ?? []
          const isToday = cell.key === today
          const isSelected = cell.key === selected
          const weekday = index % 7

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : cell.key)}
              className={`flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md pt-1 text-[12px] transition ${
                isSelected
                  ? 'bg-[var(--color-accent)] text-white'
                  : isToday
                    ? 'ring-2 ring-[var(--color-accent)]'
                    : 'hover:bg-black/[0.04]'
              } ${!isSelected && weekday === 0 ? 'text-[var(--color-danger)]' : ''}`}
            >
              <span className={isToday && !isSelected ? 'font-bold' : ''}>{cell.day}</span>
              {/* 일정 색 점 */}
              <span className="flex h-1.5 items-center gap-0.5">
                {dayEvents.slice(0, MAX_DOTS).map((event) => (
                  <span
                    key={event.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: isSelected ? 'rgba(255,255,255,0.9)' : eventColor(event.type) }}
                  />
                ))}
                {dayEvents.length > MAX_DOTS && (
                  <span className={`text-[8px] leading-none ${isSelected ? 'text-white' : 'text-[var(--color-muted)]'}`}>
                    +{dayEvents.length - MAX_DOTS}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
