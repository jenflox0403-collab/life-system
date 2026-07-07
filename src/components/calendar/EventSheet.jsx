import { useState } from 'react'
import { EVENT_TYPES, DEAL_STATUSES, hasDeal } from '../../lib/eventTypes.js'
import { todayKey } from '../../lib/date.js'

// 이 파일은 일정 추가/수정 창(모달) 담당
// event가 있으면 수정 모드, 없으면 새 일정 추가 모드
export default function EventSheet({ event, defaultDate, onSave, onDelete, onClose }) {
  const isEdit = Boolean(event)
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? defaultDate ?? todayKey())
  const [type, setType] = useState(event?.type ?? 'personal')
  const [memo, setMemo] = useState(event?.memo ?? '')
  const [brand, setBrand] = useState(event?.brand ?? '')
  const [status, setStatus] = useState(event?.status ?? DEAL_STATUSES[0])

  const showDeal = hasDeal(type)

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    // 광고·협업일 때만 브랜드·상태 저장, 나머지는 비움
    onSave({
      title: title.trim(),
      date,
      type,
      memo: memo.trim(),
      brand: showDeal ? brand.trim() : '',
      status: showDeal ? status : '',
    })
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="pb-safe max-h-[90vh] w-full max-w-5xl overflow-y-auto sao-sheet p-6"
      >
        <h2 className="sao-title mb-4 text-lg font-bold">{isEdit ? '일정 수정' : '일정 추가'}</h2>

        {/* 제목 */}
        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정 제목"
            autoFocus
            className="w-full rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {/* 날짜 */}
        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">날짜</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {/* 유형 */}
        <div className="mb-3">
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-muted)]">유형</span>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => {
              const active = t.id === type
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className="chip flex items-center gap-1.5"
                  style={active ? { borderColor: t.color, background: 'rgba(0,0,0,0.03)', color: 'var(--color-text)' } : {}}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 광고·협업 전용: 브랜드명 + 진행 상태 */}
        {showDeal && (
          <div className="mb-3 rounded-[8px] bg-black/[0.03] p-3">
            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">브랜드명</span>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="예: OO브랜드"
                className="w-full rounded-[5px] border border-black/10 px-3 py-2 outline-none focus:border-[var(--color-accent)]"
              />
            </label>
            <span className="mb-1.5 block text-sm font-medium text-[var(--color-muted)]">진행 상태</span>
            <div className="flex flex-wrap gap-1.5">
              {DEAL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="chip"
                  style={s === status ? { borderColor: '#4a9bc9', background: 'rgba(74,155,201,0.13)', color: '#3f8cba' } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 메모 */}
        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">메모 (선택)</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="메모"
            className="w-full resize-none rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {/* 버튼 */}
        <div className="flex gap-2">
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-black/10 px-4 py-3 font-bold text-[var(--color-danger)] transition active:scale-[0.98]"
            >
              삭제
            </button>
          )}
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-black/10 py-3 font-bold transition active:scale-[0.98]">
            취소
          </button>
          <button type="submit" className="flex-1 sao-btn-primary py-3">
            {isEdit ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </div>
  )
}
