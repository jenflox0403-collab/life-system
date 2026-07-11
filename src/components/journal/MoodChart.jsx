import { daysInMonth, dateKey } from '../../lib/date.js'
import { moodDef } from '../../lib/moods.js'

// 이 파일은 월별 기분 그래프 담당 — 날짜별 막대(높이·색 = 그날 기분)
export default function MoodChart({ year, monthIndex, diary }) {
  const total = daysInMonth(year, monthIndex)
  const days = Array.from({ length: total }, (_, i) => {
    const key = dateKey(year, monthIndex, i + 1)
    return { day: i + 1, mood: moodDef(diary[key]?.mood) }
  })
  const hasAny = days.some((d) => d.mood)

  if (!hasAny) {
    return <p className="py-2 text-sm text-[var(--color-muted)]">이 달에 기록된 기분이 없어요</p>
  }

  return (
    <div>
      <div className="flex h-16 items-end gap-px">
        {days.map(({ day, mood }) => (
          <div
            key={day}
            className="flex-1 rounded-t-[2px]"
            title={mood ? `${monthIndex + 1}/${day} ${mood.label}` : `${monthIndex + 1}/${day}`}
            style={{
              height: mood ? `${mood.score * 20}%` : '4%',
              background: mood ? mood.color : 'rgba(0,0,0,0.06)',
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[var(--color-muted)]">
        <span>1일</span>
        <span>{total}일</span>
      </div>
    </div>
  )
}
