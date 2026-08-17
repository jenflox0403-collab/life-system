import { useLayoutEffect, useRef, useState } from 'react'
import { uid } from '../../lib/uid.js'
import TodoRow from './TodoRow.jsx'

// 이 파일은 "오늘 To-Do" 카드 담당
export default function TodoSection({ todos, onChange, onSendToTimeblock, onDefer }) {
  const [text, setText] = useState('')
  const [dragId, setDragId] = useState(null)
  const [dragOrder, setDragOrder] = useState(null) // 드래그 중 로컬 순서 (부모까지 안 올려 렉 방지)
  const listRef = useRef(null) // <ul> — 위치 기준점
  const rowRefs = useRef({}) // id → 줄 DOM
  const posRef = useRef({}) // id → 직전 세로 위치 (부드러운 이동 애니메이션용)
  const dragRef = useRef(null)

  // 드래그 중엔 로컬 순서로 그림 → 손을 떼야 부모(onChange)에 반영
  const list = dragOrder ?? todos

  function registerRef(id, el) {
    if (el) rowRefs.current[id] = el
    else delete rowRefs.current[id]
  }

  // 순서가 바뀌면 각 줄을 이전 위치 → 새 위치로 스르륵 이동 (FLIP 기법)
  // 끌고 있는 줄은 애니메이션 없이(손가락 따라) 바로 자리 잡음
  useLayoutEffect(() => {
    for (const t of list) {
      const el = rowRefs.current[t.id]
      if (!el) continue
      const top = el.offsetTop // 변형(transform)과 무관한 실제 배치 위치
      const prev = posRef.current[t.id]
      if (t.id === dragId) {
        el.style.transition = 'none'
        el.style.transform = ''
      } else if (prev != null && prev !== top) {
        el.style.transition = 'none'
        el.style.transform = `translateY(${prev - top}px)`
        requestAnimationFrame(() => {
          el.style.transition = 'transform 160ms ease'
          el.style.transform = ''
        })
      }
      posRef.current[t.id] = top
    }
  })

  function handleDown(event, id) {
    dragRef.current = { id, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragId(id)
    setDragOrder(todos)
  }

  function handleMove(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    const clientY = event.clientY
    const ul = listRef.current
    if (!ul) return
    // ul은 변형이 없어 기준점이 안정적 — 각 줄 위치는 offsetTop으로(애니메이션 영향 없음)
    const ulTop = ul.getBoundingClientRect().top
    setDragOrder((prev) => {
      const cur = prev ?? todos
      const dragged = cur.find((t) => t.id === d.id)
      if (!dragged) return prev
      // 끌고 있는 줄을 뺀 나머지 줄들 사이의 어느 자리에 넣을지 계산 (off-by-one 방지)
      const others = cur.filter((t) => t.id !== d.id)
      let target = others.length
      for (let i = 0; i < others.length; i += 1) {
        const el = rowRefs.current[others[i].id]
        if (!el) continue
        const mid = ulTop + el.offsetTop + el.offsetHeight / 2
        if (clientY < mid) {
          target = i
          break
        }
      }
      const next = [...others]
      next.splice(target, 0, dragged)
      // 순서가 그대로면 갱신 안 함 (불필요한 리렌더·흔들림 방지)
      if (next.every((t, idx) => t.id === cur[idx].id)) return prev
      return next
    })
  }

  function handleUp(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    dragRef.current = null
    if (dragOrder) onChange(dragOrder) // 최종 순서만 저장
    setDragOrder(null)
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
