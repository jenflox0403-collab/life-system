import { useState } from 'react'
import { uid } from '../../lib/uid.js'

// 이 파일은 "오늘 투두" 카드 담당
// 우선순위 도트: 긴급+중요(빨강) / 중요(파랑) / 긴급(주황) / 둘 다 아님(회색)
export function priorityColor(todo) {
  if (todo.urgent && todo.important) return '#e0426a'
  if (todo.important) return '#3ba7dc'
  if (todo.urgent) return '#f0a53c'
  return '#aeb6bd'
}

export default function TodoSection({ todos, onChange, onSendToTimeblock }) {
  const [text, setText] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [important, setImportant] = useState(false)

  function addTodo(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onChange([...todos, { id: uid(), text: trimmed, urgent, important, done: false }])
    setText('')
    setUrgent(false)
    setImportant(false)
  }

  function toggle(id) {
    onChange(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function remove(id) {
    onChange(todos.filter((todo) => todo.id !== id))
  }

  const remaining = todos.filter((todo) => !todo.done).length

  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-3 font-bold">
        오늘 투두
        <span className="ml-2 text-sm font-medium text-[var(--color-muted)]">{remaining}개 남음</span>
      </h3>

      <form onSubmit={addTodo} className="mb-3 flex flex-col gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="할 일 입력 후 엔터"
          className="rounded-xl border border-black/10 px-3 py-2.5 text-[15px] outline-none focus:border-[var(--color-accent)]"
        />
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setUrgent(!urgent)}
            className={`rounded-full border px-3 py-1 transition ${
              urgent ? 'border-orange-400 bg-orange-50 font-bold text-orange-500' : 'border-black/10 text-[var(--color-muted)]'
            }`}
          >
            🔥 긴급
          </button>
          <button
            type="button"
            onClick={() => setImportant(!important)}
            className={`rounded-full border px-3 py-1 transition ${
              important ? 'border-blue-400 bg-blue-50 font-bold text-blue-500' : 'border-black/10 text-[var(--color-muted)]'
            }`}
          >
            ⭐ 중요
          </button>
          <button type="submit" className="ml-auto sao-btn-primary px-5 py-1.5">
            추가
          </button>
        </div>
      </form>

      {todos.length === 0 && (
        <p className="py-4 text-center text-sm text-[var(--color-muted)]">오늘 할 일을 추가해보세요!</p>
      )}

      <ul className="flex flex-col">
        {todos.map((todo) => (
          <li key={todo.id} className="group flex items-center gap-3 border-b border-black/[0.04] py-2.5 last:border-0">
            <span className="size-2 shrink-0 rounded-full" style={{ background: priorityColor(todo) }} />
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggle(todo.id)}
              className="size-5 accent-[var(--color-accent)]"
            />
            <span className={`flex-1 text-[15px] ${todo.done ? 'text-[var(--color-muted)] line-through' : ''}`}>
              {todo.text}
            </span>
            {!todo.done && (
              <button
                onClick={() => onSendToTimeblock(todo)}
                title="타임블록으로 보내기"
                className="rounded-lg px-2 py-1 text-xs text-[var(--color-muted)] hover:bg-black/5"
              >
                ⏰ 블록
              </button>
            )}
            <button onClick={() => remove(todo.id)} className="px-1 text-black/20 hover:text-red-400">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
