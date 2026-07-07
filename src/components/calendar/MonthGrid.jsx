import { monthGridCells, todayKey } from '../../lib/date.js'
import { eventColor, eventCoversDay } from '../../lib/eventTypes.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MAX_DOTS = 3 // 모바일 한 칸 최대 점 개수 (넘치면 +N)
const MAX_LINES = 3 // 데스크톱 한 칸 최대 텍스트 줄 (넘치면 +N)

// 이 파일은 월간 달력 그리드 담당
// 모바일: 날짜 + 일정 색 점 / 데스크톱: 날짜 + 일정 제목 텍스트
// 더블클릭(PC)하면 그날 일정추가 팝업이 바로 뜸
export default function MonthGrid({ year, monthIndex, events, selected, onSelectDay, onChangeMonth, onQuickAdd }) {
  const cells = monthGridCells(year, monthIndex)
  const today = todayKey()

  // 여러 날 일정도 포함해서, 각 날짜를 덮는 일정 목록을 구함
  function eventsOn(key) {
    return events.filter((event) => event.date && eventCoversDay(event, key))
  }

  return (
    <section className="sao-card p-4">
      {/* 월 이동 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => onChangeMonth(-1)} aria-label="이전 달" className="sao-circle !h-8 !w-8 transition active:scale-90">
          ‹
        </button>
        <h3 className="sao-title text-base font-bold">
          {year}년 {monthIndex + 1}월
        </h3>
        <button onClick={() => onChangeMonth(1)} aria-label="다음 달" className="sao-circle !h-8 !w-8 transition active:scale-90">
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
          const dayEvents = eventsOn(cell.key)
          const isToday = cell.key === today
          const isSelected = cell.key === selected
          const weekday = index % 7

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : cell.key)}
              onDoubleClick={() => onQuickAdd(cell.key)}
              className={`flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md pt-1 text-[12px] transition md:aspect-auto md:min-h-[92px] md:items-stretch md:p-1.5 ${
                isSelected
                  ? 'bg-[var(--color-accent)] text-white'
                  : isToday
                    ? 'ring-2 ring-[var(--color-accent)]'
                    : 'hover:bg-black/[0.04]'
              } ${!isSelected && weekday === 0 ? 'text-[var(--color-danger)]' : ''}`}
            >
              <span className={`md:self-start md:px-0.5 ${isToday && !isSelected ? 'font-bold' : ''}`}>{cell.day}</span>

              {/* 모바일: 색 점 */}
              <span className="flex h-1.5 items-center gap-0.5 md:hidden">
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

              {/* 데스크톱: 일정 제목 텍스트 */}
              <span className="mt-0.5 hidden flex-col gap-0.5 md:flex">
                {dayEvents.slice(0, MAX_LINES).map((event) => (
                  <span
                    key={event.id}
                    className="truncate rounded-[3px] px-1 py-px text-left text-[11px] leading-tight"
                    style={
                      isSelected
                        ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
                        : { borderLeft: `3px solid ${eventColor(event.type)}`, background: 'rgba(0,0,0,0.03)' }
                    }
                    title={event.title}
                  >
                    {event.title}
                  </span>
                ))}
                {dayEvents.length > MAX_LINES && (
                  <span className={`px-1 text-left text-[10px] ${isSelected ? 'text-white' : 'text-[var(--color-muted)]'}`}>
                    +{dayEvents.length - MAX_LINES}건
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
