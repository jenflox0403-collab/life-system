import { useState } from 'react'
import { uid } from '../../lib/uid.js'

// 이 파일은 아침/저녁 루틴 카드 담당
// items: [{id, name, minutes}] / checked: {id: true} 형태
export default function RoutineCard({ title, emoji, items, checked, onToggle, onChangeItems }) {
  const [isEditing, setIsEditing] = useState(false)
  const doneCount = items.filter((item) => checked[item.id]).length
  const isAllDone = items.length > 0 && doneCount === items.length
  const progress = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100)

  function updateItem(id, patch) {
    onChangeItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function removeItem(id) {
    onChangeItems(items.filter((item) => item.id !== id))
  }

  function moveItem(index, dir) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChangeItems(next)
  }

  function addItem() {
    onChangeItems([...items, { id: uid(), name: '새 항목', minutes: 5 }])
    setIsEditing(true)
  }

  return (
    <section className="sao-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="sao-title font-bold">
          {title}
          <span className="ml-2 text-sm font-medium text-[var(--color-muted)]">
            {doneCount}/{items.length}
          </span>
        </h3>
        <div className="flex gap-1">
          <button
            onClick={addItem}
            className="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] hover:bg-black/5"
          >
            ＋추가
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`rounded-lg px-2 py-1 text-sm hover:bg-black/5 ${
              isEditing ? 'font-bold text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
            }`}
          >
            {isEditing ? '완료' : '편집'}
          </button>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="flex flex-col gap-1">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-2">
            {isEditing ? (
              <>
                <input
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-black/10 px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  value={item.minutes}
                  onChange={(event) => updateItem(item.id, { minutes: Number(event.target.value) || 1 })}
                  className="w-14 rounded-lg border border-black/10 px-2 py-1.5 text-sm"
                  aria-label="예상 소요시간(분)"
                />
                <button onClick={() => moveItem(index, -1)} className="px-1 text-[var(--color-muted)]">↑</button>
                <button onClick={() => moveItem(index, 1)} className="px-1 text-[var(--color-muted)]">↓</button>
                <button onClick={() => removeItem(item.id)} className="px-1 text-red-400">✕</button>
              </>
            ) : (
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl px-1 py-2 transition hover:bg-black/[0.03]">
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => onToggle(item.id)}
                  className="sao-check"
                />
                <span className={`flex-1 text-[15px] ${checked[item.id] ? 'text-[var(--color-muted)] line-through' : ''}`}>
                  {item.name}
                </span>
                <span className="text-xs text-[var(--color-muted)]">{item.minutes}분</span>
              </label>
            )}
          </li>
        ))}
      </ul>

      {isAllDone && !isEditing && (
        <p className="animate-bounce pt-3 text-center text-sm font-bold text-[var(--color-accent)]">
          🎉 {title} 완료!
        </p>
      )}
    </section>
  )
}
