import { useState, useRef, useEffect } from 'react'
import { priorityColor } from '../../lib/priority.js'

// 이 파일은 투두 한 줄 담당 (오늘 탭 / 계획 탭 공용)
// 평소엔 한 줄만, 탭하면 긴급·중요·연기·블록 버튼이 아래로 펼쳐짐
// 우선순위는 왼쪽 색 띠로 표시 (빨강=중요·긴급 등)
export default function TodoRow({
  todo,
  onToggleDone,
  onToggleUrgent,
  onToggleImportant,
  onDefer, // 있으면 "연기" 버튼 표시
  onSendToBlock, // 있으면 "블록" 버튼 표시
  onRemove,
  showDate = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const rowRef = useRef(null)

  // 펼쳐진 상태에서 바깥 아무 곳이나 누르면 닫힘
  useEffect(() => {
    if (!expanded) return
    function handleOutside(event) {
      if (rowRef.current && !rowRef.current.contains(event.target)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [expanded])

  // 우선순위 없는(회색) 항목은 띠 없이 깔끔하게
  const hasPriority = todo.urgent || todo.important
  const stripe = hasPriority ? priorityColor(todo) : 'transparent'

  return (
    <li
      ref={rowRef}
      className="rounded-[5px] border border-black/[0.07] bg-white px-3 py-2"
      style={{ borderLeft: `3px solid ${stripe}` }}
    >
      <div
        className="flex cursor-pointer items-center gap-2.5"
        onClick={() => setExpanded((v) => !v)}
      >
        <input
          type="checkbox"
          checked={todo.done}
          onChange={onToggleDone}
          onClick={(e) => e.stopPropagation()}
          className="app-check"
        />
        <span className={`min-w-0 flex-1 text-[15px] ${todo.done ? 'text-[var(--color-muted)] line-through' : ''}`}>
          {todo.text}
        </span>
        {showDate && (
          <span className="shrink-0 text-xs text-[var(--color-muted)]">{todo.date?.slice(5).replace('-', '/')}</span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          aria-label={expanded ? '접기' : '펼치기'}
          aria-expanded={expanded}
          className="shrink-0 px-1 text-[11px] text-black/25"
        >
          {expanded ? '▴' : '▾'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="shrink-0 px-1 text-black/20 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      {expanded && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-[26px]">
          <button
            onClick={onToggleUrgent}
            className="chip"
            style={todo.urgent ? { background: 'rgba(227,169,60,0.15)', borderColor: '#e3a93c', color: '#c98f26' } : {}}
          >
            긴급
          </button>
          <button
            onClick={onToggleImportant}
            className="chip"
            style={todo.important ? { background: 'rgba(74,155,201,0.13)', borderColor: '#4a9bc9', color: '#3f8cba' } : {}}
          >
            중요
          </button>
          {onDefer && !todo.done && (
            <button onClick={onDefer} className="chip">연기</button>
          )}
          {onSendToBlock && !todo.done && (
            <button onClick={onSendToBlock} className="chip">▸ 블록</button>
          )}
        </div>
      )}
    </li>
  )
}
