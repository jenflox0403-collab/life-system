import { useState } from 'react'
import { uid } from '../../lib/uid.js'

// 이 파일은 분기/월간 공용 목표 리스트 담당
// 상위 목표(parentOptions)에 연결할 수 있는 목표 목록 + 진행 바
export default function CascadeGoalList({
  title,
  placeholder,
  goals,
  onChange,
  parentLabel,
  parentOptions,
  withCriteria = false,
  showProgress = false,
}) {
  const [text, setText] = useState('')
  const [parentId, setParentId] = useState('')
  const [criteria, setCriteria] = useState('')

  const doneCount = goals.filter((g) => g.done).length
  const progress = goals.length === 0 ? 0 : Math.round((doneCount / goals.length) * 100)

  function add(event) {
    event.preventDefault()
    if (!text.trim()) return
    onChange([
      ...goals,
      { id: uid(), text: text.trim(), parentId: parentId || null, criteria: criteria.trim(), done: false },
    ])
    setText('')
    setCriteria('')
  }

  function parentText(id) {
    return parentOptions.find((option) => option.id === id)?.text
  }

  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-3 font-bold">
        {title}
        {goals.length > 0 && (
          <span className="ml-2 text-sm font-medium text-[var(--color-muted)]">
            {doneCount}/{goals.length}
          </span>
        )}
      </h3>

      {showProgress && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <form onSubmit={add} className="mb-3 flex flex-col gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          className="rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
        />
        {withCriteria && (
          <input
            value={criteria}
            onChange={(event) => setCriteria(event.target.value)}
            placeholder="성공 기준 (예: 협업 3건 확정)"
            className="rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        )}
        <div className="flex gap-2">
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          >
            <option value="">{parentLabel} 연결 안 함</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.text}
              </option>
            ))}
          </select>
          <button type="submit" className="sao-btn-primary px-4 py-2">추가</button>
        </div>
      </form>

      {goals.length === 0 && (
        <p className="py-3 text-center text-sm text-[var(--color-muted)]">아직 목표가 없어요</p>
      )}

      <ul className="flex flex-col gap-1.5">
        {goals.map((goal) => (
          <li key={goal.id} className="flex items-center gap-2.5 rounded-xl bg-black/[0.03] px-3 py-2.5">
            <input
              type="checkbox"
              checked={goal.done}
              onChange={() => onChange(goals.map((g) => (g.id === goal.id ? { ...g, done: !g.done } : g)))}
              className="app-check"
            />
            <div className="min-w-0 flex-1">
              <p className={`text-[15px] ${goal.done ? 'text-[var(--color-muted)] line-through' : ''}`}>{goal.text}</p>
              {(goal.parentId || goal.criteria) && (
                <p className="truncate text-xs text-[var(--color-muted)]">
                  {goal.parentId && `↳ ${parentText(goal.parentId) ?? '삭제된 목표'}`}
                  {goal.parentId && goal.criteria && ' · '}
                  {goal.criteria && `기준: ${goal.criteria}`}
                </p>
              )}
            </div>
            <button onClick={() => onChange(goals.filter((g) => g.id !== goal.id))} className="px-1 text-black/20 hover:text-red-400">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
