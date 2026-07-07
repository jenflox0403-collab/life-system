import { todayKey } from '../../lib/date.js'
import { eventType, eventColor } from '../../lib/eventTypes.js'

// "2026-07-07" → "7/7"
function shortDate(key) {
  return key.slice(5).replace('-', '/')
}

// 이 파일은 일정 목록 담당
// 날짜가 선택되면 그날 일정 + 그날 일기, 아니면 다가오는 일정을 보여줌
export default function EventList({ events, selected, journalText, onEditEvent, onAddForDay }) {
  const today = todayKey()

  const visible = (
    selected
      ? events.filter((e) => e.date === selected)
      : events.filter((e) => e.date >= today)
  ).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  const heading = selected ? `${shortDate(selected)} 일정` : '다가오는 일정'

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
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onEditEvent(event)}
                  className="flex w-full items-center gap-2.5 rounded-[5px] border border-black/[0.07] bg-white px-3 py-2.5 text-left transition hover:bg-black/[0.02]"
                  style={{ borderLeft: `3px solid ${eventColor(event.type)}` }}
                >
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-[15px] font-medium">{event.title}</span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span style={{ color: eventColor(event.type) }}>{type.label}</span>
                      {event.memo && <span className="truncate text-[var(--color-muted)]">{event.memo}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">{shortDate(event.date)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* 선택한 날의 일기 (읽기 전용) */}
      {selected && (
        <div className="mt-4 border-t border-black/[0.06] pt-3">
          <p className="mb-1.5 text-xs font-bold text-[var(--color-muted)]">이 날 일기</p>
          {journalText ? (
            <p className="whitespace-pre-wrap rounded-[6px] bg-black/[0.03] px-3 py-2.5 text-sm leading-relaxed">{journalText}</p>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">아직 없어요 · 오늘 탭에서 작성해요</p>
          )}
        </div>
      )}
    </section>
  )
}
