import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { useListReorder } from '../../hooks/useListReorder.js'
import TodoRow from './TodoRow.jsx'

// 이 파일은 "오늘 To-Do" 카드 담당
export default function TodoSection({ todos, onChange, onSendToTimeblock, onDefer }) {
  const [text, setText] = useState('')
  // 손잡이 드래그 순서 바꾸기 (공용 훅)
  const { list, listRef, registerRef, dragId, handleProps } = useListReorder(todos, onChange)

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

      <ul ref={listRef} className="relative flex flex-col gap-1.5">
        {list.map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            onToggleDone={() => patch(todo.id, { done: !todo.done })}
            onToggleUrgent={() => patch(todo.id, { urgent: !todo.urgent })}
            onToggleImportant={() => patch(todo.id, { important: !todo.important })}
            onDefer={() => onDefer(todo)}
            onSendToBlock={() => onSendToTimeblock(todo)}
            onRename={(text) => patch(todo.id, { text })}
            onSetMemo={(memo) => patch(todo.id, { memo })}
            onRemove={() => onChange(todos.filter((t) => t.id !== todo.id))}
            registerRef={registerRef}
            dragging={dragId === todo.id}
            {...handleProps(todo.id)}
          />
        ))}
      </ul>
    </section>
  )
}
