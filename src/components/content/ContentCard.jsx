import { formatDef, formatColor, ownerLabel, adjacentStage } from '../../lib/contentTypes.js'

// 이 파일은 콘텐츠 카드 한 장 담당 (파이프라인 칸반)
// 카드 본문 탭 → 수정, 아래 ◀▶ 버튼 → 단계 이동, 완료 단계면 아카이브 버튼
export default function ContentCard({ card, onEdit, onMove, onArchive }) {
  const format = formatDef(card.format)
  const canPrev = adjacentStage(card.stage, -1) !== null
  const canNext = adjacentStage(card.stage, 1) !== null

  return (
    <div
      className="rounded-[6px] border border-black/[0.07] bg-white p-3"
      style={{ borderLeft: `3px solid ${formatColor(card.format)}` }}
    >
      <button type="button" onClick={() => onEdit(card)} className="block w-full text-left">
        <span className="block text-[14px] font-medium leading-snug">{card.title}</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-full px-1.5 py-px font-medium" style={{ background: `${format.color}1f`, color: format.color }}>
            {format.label}
          </span>
          <span className="text-[var(--color-muted)]">{ownerLabel(card.owner)}</span>
          {card.uploadDate && (
            <span className="text-[var(--color-muted)]">업로드 {card.uploadDate.slice(5).replace('-', '/')}</span>
          )}
        </div>
        {card.memo && <p className="mt-1 truncate text-[11px] text-[var(--color-muted)]">{card.memo}</p>}
      </button>

      {/* 단계 이동 */}
      <div className="mt-2 flex items-center gap-1 border-t border-black/[0.05] pt-2">
        <button
          type="button"
          onClick={() => onMove(card, -1)}
          disabled={!canPrev}
          className="rounded-[4px] px-2 py-0.5 text-xs text-[var(--color-muted)] enabled:hover:bg-black/[0.04] disabled:opacity-25"
          aria-label="이전 단계"
        >
          ◀
        </button>
        {card.stage === 'done' ? (
          <button
            type="button"
            onClick={() => onArchive(card)}
            className="ml-auto rounded-[4px] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)] hover:bg-black/[0.04]"
          >
            아카이브
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onMove(card, 1)}
            disabled={!canNext}
            className="ml-auto rounded-[4px] px-2 py-0.5 text-xs text-[var(--color-muted)] enabled:hover:bg-black/[0.04] disabled:opacity-25"
            aria-label="다음 단계"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  )
}
