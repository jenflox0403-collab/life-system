import { useState } from 'react'
import { EVENT_TYPES } from '../../lib/eventTypes.js'
import { todayKey } from '../../lib/date.js'

// 이 파일은 일정 추가/수정 창(모달) 담당
// event가 있으면 수정 모드, 없으면 새 일정 추가 모드
// 모바일은 하단 시트, PC는 화면 중앙 카드로 뜸
export default function EventSheet({ event, defaultDate, onSave, onDelete, onClose }) {
  const isEdit = Boolean(event)
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? defaultDate ?? todayKey())
  const [endDate, setEndDate] = useState(event?.endDate ?? '')
  const [type, setType] = useState(event?.type ?? 'personal')
  const [memo, setMemo] = useState(event?.memo ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    // 종료일이 시작일보다 뒤일 때만 여러 날 일정으로 저장
    const validEnd = endDate && endDate > date ? endDate : ''
    onSave({ title: title.trim(), date, endDate: validEnd, type, memo: memo.trim() })
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 md:items-center" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="pb-safe max-h-[90vh] w-full max-w-5xl overflow-y-auto sao-sheet p-6 md:max-w-md md:rounded-2xl"
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

        {/* 날짜 (시작 ~ 종료) */}
        <div className="mb-3 flex gap-2">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">종료일 (선택)</span>
            <input
              type="date"
              value={endDate}
              min={date}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        </div>

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
