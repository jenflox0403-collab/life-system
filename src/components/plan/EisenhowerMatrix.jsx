// 이 파일은 아이젠하워 매트릭스 시각화(사분면 그래프) 담당
// 가로축=긴급도, 세로축=중요도. 완료 전 To-Do를 4칸에 칩으로 배치.
const CELLS = [
  { key: 'q2', match: (t) => t.important && !t.urgent, label: '중요·안급함', sub: '계획해서', color: '#4a9bc9' },
  { key: 'q1', match: (t) => t.important && t.urgent, label: '중요·긴급', sub: '지금 바로', color: '#c9536e' },
  { key: 'q4', match: (t) => !t.important && !t.urgent, label: '안중요·안급함', sub: '여유될 때', color: '#aeb6bd' },
  { key: 'q3', match: (t) => !t.important && t.urgent, label: '안중요·긴급', sub: '빠르게', color: '#e3a93c' },
]

export default function EisenhowerMatrix({ todos, onSendToday, todayKey }) {
  const active = todos.filter((todo) => !todo.done)

  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-1 font-bold">아이젠하워 매트릭스</h3>
      <p className="mb-3 text-xs text-[var(--color-muted)]">완료 전 To-Do를 4분면으로 · 중요·긴급은 오늘로 보내세요</p>

      <div className="flex">
        {/* 세로축 라벨 */}
        <div className="flex w-5 flex-col items-center justify-center">
          <span className="rotate-180 text-[11px] font-bold text-[var(--color-muted)] [writing-mode:vertical-rl]">
            중요도 ↑
          </span>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 grid-rows-2 gap-1.5">
            {CELLS.map((cell) => {
              const items = active.filter(cell.match)
              return (
                <div
                  key={cell.key}
                  className="min-h-24 rounded-[5px] border p-2"
                  style={{ borderColor: `${cell.color}55`, background: `${cell.color}0d` }}
                >
                  <p className="mb-1 text-[13px] font-bold" style={{ color: cell.color }}>
                    {cell.label}
                    <span className="ml-1 text-[11px] font-medium text-[var(--color-muted)]">· {cell.sub}</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {items.length === 0 && <span className="text-[11px] text-[var(--color-muted)]">—</span>}
                    {items.map((todo) => (
                      <button
                        key={todo.id}
                        onClick={() => cell.key === 'q1' && todo.date !== todayKey && onSendToday(todo.id)}
                        title={cell.key === 'q1' ? '오늘로 보내기' : todo.text}
                        className="max-w-full truncate rounded bg-white px-1.5 py-0.5 text-[11px] font-medium shadow-sm"
                        style={{ border: `1px solid ${cell.color}44` }}
                      >
                        {todo.text}
                        {cell.key === 'q1' && todo.date !== todayKey && ' →'}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          {/* 가로축 라벨 */}
          <p className="mt-1 text-right text-[11px] font-bold text-[var(--color-muted)]">긴급도 →</p>
        </div>
      </div>
    </section>
  )
}
