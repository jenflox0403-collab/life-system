import { useRef, useState } from 'react'
import { uid } from '../../lib/uid.js'
import TodoRow from './TodoRow.jsx'

// 이 파일은 "오늘 To-Do" 카드 담당
export default function TodoSection({ todos, onChange, onSendToTimeblock, onDefer }) {
  const [text, setText] = useState('')
  const [dragId, setDragId] = useState(null)
  const rowRefs = useRef({}) // id → 줄 DOM (높이 재서 위치 계산)
  const dragRef = useRef(null)

  function registerRef(id, el) {
    if (el) rowRefs.current[id] = el
    else delete rowRefs.current[id]
  }

  // 손잡이를 끌면 포인터 y위치로 놓일 자리를 계산해 즉시 순서 바꿈
  function reorderTo(clientY) {
    const d = dragRef.current
    if (!d) return
    const ids = todos.map((t) => t.id)
    let target = todos.length - 1
    for (let i = 0; i < ids.length; i += 1) {
      const el = rowRefs.current[ids[i]]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (clientY < r.top + r.height / 2) {
        target = i
        break
      }
    }
    const from = todos.findIndex((t) => t.id === d.id)
    if (from === -1 || from === target) return
    const next = [...todos]
    const [moved] = next.splice(from, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  function handleDown(event, id) {
    dragRef.current = { id, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragId(id)
  }

  function handleMove(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    reorderTo(event.clientY)
  }

  function handleUp(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    dragRef.current = null
    setDragId(null)
  }

  function addTodo(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onChange([...todos, { id: uid(), text: trimmed, urgent: false, important: false, done: false }])
    setText('')
  }

  function patch(id, changes) {
    onChange(todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)))
  }

  const remaining = todos.filter((todo) => !todo.done).length

  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-3 font-bold">
        To-Do
        <span className="ml-2 text-sm font-medium text-[var(--color-muted)]">{remaining}개 남음</span>
      </h3>

      <form onSubmit={addTodo} className="mb-3 flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="할 일 입력 후 엔터 (⠿ 손잡이로 순서 이동)"
          className="min-w-0 flex-1 rounded-[5px] border border-black/10 px-3 py-2.5 text-[15px] outline-none focus:border-[var(--color-accent)]"
        />
        <button type="submit" className="add-btn px-4">추가</button>
      </form>

      {todos.length === 0 && (
        <p className="py-4 text-center text-sm text-[var(--color-muted)]">오늘 할 일을 추가해보세요!</p>
      )}

      <ul className="flex flex-col gap-1.5">
        {todos.map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            onToggleDone={() => patch(todo.id, { done: !todo.done })}
            onToggleUrgent={() => patch(todo.id, { urgent: !todo.urgent })}
            onToggleImportant={() => patch(todo.id, { important: !todo.important })}
            onDefer={() => onDefer(todo)}
            onSendToBlock={() => onSendToTimeblock(todo)}
            onRename={(text) => patch(todo.id, { text })}
            onRemove={() => onChange(todos.filter((t) => t.id !== todo.id))}
            registerRef={registerRef}
            dragging={dragId === todo.id}
            onHandleDown={(e) => handleDown(e, todo.id)}
            onHandleMove={handleMove}
            onHandleUp={handleUp}
          />
        ))}
      </ul>
    </section>
  )
}
