import { useEffect, useState } from 'react'
import { categoryColor, minutesToLabel } from '../../lib/categories.js'

const ROW_H = 40 // 한 시간 행의 높이(px)

// 이 파일은 타임블록 격자(종이 플래너 스타일) 담당
// 왼쪽 세로줄 = 시간(6~24), 각 행 = 10분씩 6칸
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
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const hours = []
  for (let t = dayStart; t < dayEnd; t += 60) hours.push(t)

  const doneCount = blocks.filter((b) => b.done).length
  const rate = blocks.length === 0 ? null : Math.round((doneCount / blocks.length) * 100)

  /** 특정 시각(10분 칸)을 덮는 블록 찾기 */
  function blockAt(minute) {
    return blocks.find((b) => b.start <= minute && minute < b.end)
  }

  function handleCellClick(minute) {
    const covered = blockAt(minute)
    if (covered) onEditBlock(covered)
    else onCreateAt(minute)
  }

  return (
    <section className="sao-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="sao-title sao-en font-bold">
          Time Block
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
      <p className="mb-3 text-xs text-[var(--color-muted)]">
        빈 칸을 탭하면 새 블록, 색칠된 칸을 탭하면 수정 · 한 칸 = 10분
      </p>

      <div className="overflow-hidden rounded-xl border border-black/15">
        {hours.map((rowStart) => {
          const rowEnd = rowStart + 60
          const isNowRow = nowMinutes >= rowStart && nowMinutes < rowEnd
          // 이 행에 걸쳐 있는 블록 조각들 (제목은 블록이 시작하는 행에만 표시)
          const segments = blocks
            .filter((b) => b.start < rowEnd && b.end > rowStart)
            .map((b) => ({
              block: b,
              left: (Math.max(b.start, rowStart) - rowStart) / 60,
              width: (Math.min(b.end, rowEnd) - Math.max(b.start, rowStart)) / 60,
              isHead: b.start >= rowStart,
            }))

          return (
            <div key={rowStart} className="flex border-b border-black/15 last:border-b-0" style={{ height: ROW_H }}>
              {/* 시간 라벨 */}
              <div className="flex w-10 shrink-0 items-center justify-center border-r border-black/15 bg-black/[0.03] text-[13px] font-medium text-[var(--color-text)]">
                {Math.floor(rowStart / 60)}
              </div>

              {/* 10분 x 6칸 */}
              <div className="relative flex-1">
                <div className="absolute inset-0 flex">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => handleCellClick(rowStart + i * 10)}
                      aria-label={`${minutesToLabel(rowStart + i * 10)} 블록`}
                      className="flex-1 border-r border-black/[0.08] transition last:border-r-0 active:bg-black/5"
                    />
                  ))}
                </div>

                {/* 블록 조각 (색칠) */}
                {segments.map(({ block, left, width, isHead }) => (
                  <div
                    key={block.id}
                    onClick={() => onEditBlock(block)}
                    className="absolute inset-y-0 flex cursor-pointer items-center gap-1 overflow-hidden px-1.5 text-white"
                    style={{
                      left: `${left * 100}%`,
                      width: `${width * 100}%`,
                      background: categoryColor(block.category),
                      opacity: block.done ? 0.4 : 0.92,
                    }}
                  >
                    {isHead && (
                      <>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            onToggleDone(block.id)
                          }}
                          aria-label="완료 체크"
                          className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 border-white/90 text-[10px] font-bold leading-none ${
                            block.done ? 'bg-white text-black/60' : 'bg-transparent'
                          }`}
                        >
                          {block.done ? '✓' : ''}
                        </button>
                        <span className={`truncate text-xs font-bold ${block.done ? 'line-through' : ''}`}>
                          {block.title}
                        </span>
                      </>
                    )}
                  </div>
                ))}

                {/* 현재 시각 세로 라인 */}
                {isNowRow && (
                  <div
                    className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-red-500"
                    style={{ left: `${((nowMinutes - rowStart) / 60) * 100}%` }}
                  >
                    <span className="absolute -top-0.5 left-1 rounded bg-red-500 px-1 text-[9px] font-bold text-white">
                      {minutesToLabel(nowMinutes)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
