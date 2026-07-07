import { priorityColor } from '../../lib/priority.js'

// 이 파일은 투두 한 줄 담당 (오늘 탭 / 계획 탭 공용)
// 긴급·중요를 항목에서 바로 토글, 내일로 미루기·블록 보내기·삭제 지원
export default function TodoRow({
  todo,
  onToggleDone,
  onToggleUrgent,
  onToggleImportant,
  onDefer, // 있으면 "내일로" 버튼 표시
  onSendToBlock, // 있으면 "블록" 버튼 표시
  onRemove,
  showDate = false,
}) {
  return (
    <li className="rounded-[5px] border border-black/[0.07] bg-white px-3 py-2">
      <div className="flex items-center gap-2.5">
        <span className="size-2 shrink-0 rounded-full" style={{ background: priorityColor(todo) }} />
        <input type="checkbox" checked={todo.done} onChange={onToggleDone} className="app-check" />
        <span className={`min-w-0 flex-1 text-[15px] ${todo.done ? 'text-[var(--color-muted)] line-through' : ''}`}>
          {todo.text}
        </span>
        {showDate && (
          <span className="shrink-0 text-xs text-[var(--color-muted)]">{todo.date?.slice(5).replace('-', '/')}</span>
        )}
        <button onClick={onRemove} className="shrink-0 px-1 text-black/20 hover:text-red-400">✕</button>
      </div>

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
          <button onClick={onDefer} className="chip">내일로 →</button>
        )}
        {onSendToBlock && !todo.done && (
          <button onClick={onSendToBlock} className="chip">▸ 블록</button>
        )}
      </div>
    </li>
  )
}
