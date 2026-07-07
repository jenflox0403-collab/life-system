import { eventType, eventColor } from '../../lib/eventTypes.js'

// 이 파일은 오늘 탭의 "오늘 일정" 담당 (달력에서 자동 로드, 읽기 전용)
// 일정 추가·수정은 달력 탭에서 하고, 여기선 그날 일정을 모아 보여주기만 함
export default function TodayEvents({ events }) {
  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-3 font-bold">오늘 일정</h3>
      <ul className="flex flex-col gap-1.5">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex items-center gap-2.5 rounded-[5px] border border-black/[0.07] bg-white px-3 py-2.5"
            style={{ borderLeft: `3px solid ${eventColor(event.type)}` }}
          >
            <div className="min-w-0 flex-1">
              <span className="truncate text-[15px] font-medium">{event.title}</span>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span style={{ color: eventColor(event.type) }}>{eventType(event.type).label}</span>
                {event.memo && <span className="truncate text-[var(--color-muted)]">{event.memo}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-[var(--color-muted)]">달력 탭에서 추가·수정할 수 있어요</p>
    </section>
  )
}
