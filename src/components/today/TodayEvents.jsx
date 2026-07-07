import { eventType, eventColor } from '../../lib/eventTypes.js'

// 이 파일은 오늘 탭의 "오늘 일정" 담당 (달력과 같은 데이터 공유)
// 여기서 추가/수정한 일정은 달력 탭에도 그대로 반영됨
export default function TodayEvents({ events, onAdd, onEdit }) {
  return (
    <section className="sao-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="sao-title font-bold">오늘 일정</h3>
        <button type="button" onClick={onAdd} className="add-btn px-4 py-1.5">
          + 일정
        </button>
      </div>

      {events.length === 0 ? (
        <p className="py-2 text-sm text-[var(--color-muted)]">등록된 일정이 없어요</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="flex w-full items-center gap-2.5 rounded-[5px] border border-black/[0.07] bg-white px-3 py-2.5 text-left transition hover:bg-black/[0.02]"
                style={{ borderLeft: `3px solid ${eventColor(event.type)}` }}
              >
                <div className="min-w-0 flex-1">
                  <span className="truncate text-[15px] font-medium">{event.title}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span style={{ color: eventColor(event.type) }}>{eventType(event.type).label}</span>
                    {event.memo && <span className="truncate text-[var(--color-muted)]">{event.memo}</span>}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
