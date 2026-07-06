import { useEffect, useRef, useState } from 'react'
import { categoryColor, minutesToLabel } from '../../lib/categories.js'

const PX_PER_10MIN = 9 // 10분 = 9px → 1시간 = 54px

// 이 파일은 10분 단위 타임블록 타임라인 담당
export default function TimeblockSection({
  blocks,
  dayStart,
  dayEnd,
  onEditBlock,
  onCreateAt,
  onToggleDone,
  onCopyYesterday,
  hasYesterday,
}) {
  const timelineRef = useRef(null)
  const [now, setNow] = useState(() => new Date())

  // 현재 시각 라인을 1분마다 갱신
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const totalHeight = ((dayEnd - dayStart) / 10) * PX_PER_10MIN
  const hours = []
  for (let t = dayStart; t < dayEnd; t += 60) hours.push(t)

  const doneCount = blocks.filter((b) => b.done).length
  const rate = blocks.length === 0 ? null : Math.round((doneCount / blocks.length) * 100)

  /** 빈 곳 탭 → 그 시각으로 새 블록 */
  function handleTimelineClick(event) {
    if (event.target !== timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const offsetY = event.clientY - rect.top
    const minute = dayStart + Math.floor(offsetY / PX_PER_10MIN) * 10
    onCreateAt(Math.min(minute, dayEnd - 10))
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">
          ⏰ 타임블록
          {rate !== null && (
            <span className="ml-2 text-sm font-medium text-[var(--color-muted)]">실행률 {rate}%</span>
          )}
        </h3>
        {hasYesterday && (
          <button
            onClick={onCopyYesterday}
            className="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] hover:bg-black/5"
          >
            어제 복사
          </button>
        )}
      </div>
      <p className="mb-3 text-xs text-[var(--color-muted)]">빈 시간을 탭하면 블록이 생겨요</p>

      <div className="flex">
        {/* 시간 눈금 */}
        <div className="relative w-11 shrink-0" style={{ height: totalHeight }}>
          {hours.map((t) => (
            <span
              key={t}
              className="absolute -translate-y-1/2 text-[11px] text-[var(--color-muted)]"
              style={{ top: ((t - dayStart) / 10) * PX_PER_10MIN }}
            >
              {minutesToLabel(t)}
            </span>
          ))}
        </div>

        {/* 타임라인 본체 */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative flex-1 cursor-pointer rounded-xl bg-black/[0.02]"
          style={{ height: totalHeight }}
        >
          {/* 시간 구분선 */}
          {hours.map((t) => (
            <div
              key={t}
              className="pointer-events-none absolute inset-x-0 border-t border-black/[0.05]"
              style={{ top: ((t - dayStart) / 10) * PX_PER_10MIN }}
            />
          ))}

          {/* 블록들 */}
          {blocks.map((block) => {
            const top = ((block.start - dayStart) / 10) * PX_PER_10MIN
            const height = ((block.end - block.start) / 10) * PX_PER_10MIN
            return (
              <div
                key={block.id}
                onClick={() => onEditBlock(block)}
                className="absolute inset-x-1 flex items-start gap-1.5 overflow-hidden rounded-lg px-2 py-1 text-white shadow-sm transition active:scale-[0.99]"
                style={{ top: top + 1, height: height - 2, background: categoryColor(block.category), opacity: block.done ? 0.45 : 1 }}
              >
                <input
                  type="checkbox"
                  checked={!!block.done}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onToggleDone(block.id)}
                  className="mt-0.5 size-4 shrink-0 accent-white"
                />
                <div className="min-w-0">
                  <p className={`truncate text-[13px] font-bold leading-tight ${block.done ? 'line-through' : ''}`}>
                    {block.title}
                  </p>
                  {height >= 32 && (
                    <p className="text-[11px] opacity-80">
                      {minutesToLabel(block.start)}–{minutesToLabel(block.end)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {/* 현재 시각 라인 */}
          {nowMinutes >= dayStart && nowMinutes <= dayEnd && (
            <div
              className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500"
              style={{ top: ((nowMinutes - dayStart) / 10) * PX_PER_10MIN }}
            >
              <span className="absolute -top-2.5 right-0 rounded bg-red-500 px-1 text-[10px] font-bold text-white">
                {minutesToLabel(nowMinutes)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
