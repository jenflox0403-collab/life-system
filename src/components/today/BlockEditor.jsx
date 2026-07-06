import { useState } from 'react'
import { CATEGORIES, minutesToLabel } from '../../lib/categories.js'

// 이 파일은 타임블록 만들기/수정 창 담당 (아래에서 올라오는 시트)
export default function BlockEditor({ initial, dayStart, dayEnd, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(initial.title ?? '')
  const [category, setCategory] = useState(initial.category ?? 'work')
  const [start, setStart] = useState(initial.start)
  const [end, setEnd] = useState(initial.end)

  // 10분 단위 시각 선택지
  const options = []
  for (let t = dayStart; t <= dayEnd; t += 10) options.push(t)

  function handleSave() {
    if (end <= start) return
    onSave({
      ...initial,
      title: title.trim() || CATEGORIES.find((c) => c.id === category)?.label,
      category,
      start,
      end,
    })
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="pb-safe w-full max-w-5xl rounded-t-3xl bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-bold">{initial.id ? '블록 수정' : '새 타임블록'}</h3>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="무엇을 하나요?"
          autoFocus={!initial.id}
          className="mb-3 w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
        />

        <div className="mb-3 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                category === cat.id ? 'font-bold text-white' : 'border-black/10 text-[var(--color-muted)]'
              }`}
              style={category === cat.id ? { background: cat.color, borderColor: cat.color } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center gap-2">
          <select
            value={start}
            onChange={(event) => setStart(Number(event.target.value))}
            className="flex-1 rounded-xl border border-black/10 px-3 py-2.5"
          >
            {options.slice(0, -1).map((t) => (
              <option key={t} value={t}>{minutesToLabel(t)}</option>
            ))}
          </select>
          <span className="text-[var(--color-muted)]">→</span>
          <select
            value={end}
            onChange={(event) => setEnd(Number(event.target.value))}
            className="flex-1 rounded-xl border border-black/10 px-3 py-2.5"
          >
            {options.filter((t) => t > start).map((t) => (
              <option key={t} value={t}>{minutesToLabel(t)}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {initial.id && (
            <button onClick={() => onDelete(initial.id)} className="rounded-xl border border-red-200 px-4 py-3 font-bold text-red-500">
              삭제
            </button>
          )}
          <button onClick={handleSave} className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 font-bold text-white active:scale-[0.98]">
            저장
          </button>
        </div>
        <button onClick={onClose} className="mt-3 w-full py-1 text-sm text-[var(--color-muted)]">닫기</button>
      </div>
    </div>
  )
}
