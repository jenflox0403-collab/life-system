import { todayKey } from '../../lib/date.js'
import { eventType, eventColor, isAwaitingSettlement } from '../../lib/eventTypes.js'

// 상태 뱃지 색: 정산완료=초록(끝), 진행=빨강(돈 대기), 나머지=회색(협의 중)
function statusStyle(status, awaiting) {
  if (status === '정산완료') return { background: 'rgba(76,195,138,0.14)', color: '#2f9e6b' }
  if (awaiting) return { background: 'rgba(201,83,110,0.12)', color: 'var(--color-danger)' }
  return { background: 'rgba(0,0,0,0.05)', color: 'var(--color-muted)' }
}

// 이 파일은 일정 목록 담당
// 날짜가 선택되면 그날 일정, 아니면 오늘 이후 다가오는 일정을 보여줌
export default function EventList({ events, selected, onEditEvent, onAddForDay }) {
  const today = todayKey()

  const visible = (
    selected
      ? events.filter((e) => e.date === selected)
      : events.filter((e) => e.date >= today)
  ).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  const heading = selected ? `${selected.slice(5).replace('-', '/')} 일정` : '다가오는 일정'

  return (
    <section className="sao-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="sao-title font-bold">{heading}</h3>
        <button type="button" onClick={onAddForDay} className="add-btn px-4 py-1.5">
          + 일정
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="py-2 text-sm text-[var(--color-muted)]">
          {selected ? '이 날 일정이 없어요' : '다가오는 일정이 없어요'}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((event) => {
            const type = eventType(event.type)
            const awaiting = isAwaitingSettlement(event)
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onEditEvent(event)}
                  className="flex w-full items-center gap-2.5 rounded-[5px] border border-black/[0.07] bg-white px-3 py-2.5 text-left transition hover:bg-black/[0.02]"
                  style={{ borderLeft: `3px solid ${eventColor(event.type)}` }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[15px] font-medium">{event.title}</span>
                      {event.brand && (
                        <span className="shrink-0 text-xs text-[var(--color-muted)]">· {event.brand}</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span style={{ color: eventColor(event.type) }}>{type.label}</span>
                      {event.status && (
                        <span className="rounded-full px-1.5 py-px" style={statusStyle(event.status, awaiting)}>
                          {event.status}
                        </span>
                      )}
                      {event.memo && <span className="truncate text-[var(--color-muted)]">{event.memo}</span>}
                    </div>
                  </div>
                  {!selected && (
                    <span className="shrink-0 text-xs text-[var(--color-muted)]">{event.date.slice(5).replace('-', '/')}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
