import { useState } from 'react'
import { MOODS } from '../../lib/moods.js'
import { todayKey } from '../../lib/date.js'

// 이 파일은 일기 쓰기/수정 창(모달) 담당
// entryDate가 있으면 그 날짜 수정 모드, 없으면 새로 쓰기(날짜 선택 가능)
export default function DiarySheet({ entryDate, diary, onSave, onDelete, onClose }) {
  const isEdit = Boolean(entryDate)
  const [date, setDate] = useState(entryDate ?? todayKey())
  const existing = diary[date] ?? {}
  const [text, setText] = useState(diary[entryDate]?.text ?? '')
  const [mood, setMood] = useState(diary[entryDate]?.mood ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    onSave(date, { text: text.trim(), mood })
  }

  // 새로 쓰기 모드에서 날짜를 바꾸면 그 날짜의 기존 내용을 불러옴
  function changeDate(next) {
    setDate(next)
    setText(diary[next]?.text ?? '')
    setMood(diary[next]?.mood ?? '')
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="sao-modal max-h-[85vh] w-full max-w-md overflow-y-auto p-6"
      >
        <h2 className="sao-title mb-4 text-lg font-bold">
          {isEdit ? `${date.slice(5).replace('-', '/')} 일기` : '일기 쓰기'}
        </h2>

        {!isEdit && (
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">날짜</span>
            <input
              type="date"
              value={date}
              onChange={(e) => changeDate(e.target.value)}
              className="w-full rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        )}

        {/* 기분 */}
        <div className="mb-3 flex gap-1.5">
          {MOODS.map((m) => {
            const active = m.id === mood
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(active ? '' : m.id)}
                aria-label={m.label}
                title={m.label}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition active:scale-90 ${
                  active ? 'scale-110' : 'opacity-45 grayscale'
                }`}
                style={active ? { background: `${m.color}22`, boxShadow: `0 0 0 2px ${m.color}` } : {}}
              >
                {m.emoji}
              </button>
            )
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="이 날 하루를 기록해보세요."
          autoFocus
          className="mb-5 w-full resize-y rounded-[5px] border border-black/10 px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-[var(--color-accent)]"
        />

        <div className="flex gap-2">
          {isEdit && (existing.text || existing.mood) && (
            <button
              type="button"
              onClick={() => onDelete(date)}
              className="rounded-xl border border-black/10 px-4 py-3 font-bold text-[var(--color-danger)] transition active:scale-[0.98]"
            >
              삭제
            </button>
          )}
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-black/10 py-3 font-bold transition active:scale-[0.98]">
            취소
          </button>
          <button type="submit" className="flex-1 sao-btn-primary py-3">
            저장
          </button>
        </div>
      </form>
    </div>
  )
}
