import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { todayKey, formatKorean } from '../../lib/date.js'
import RoutineCard from './RoutineCard.jsx'
import TodoSection from './TodoSection.jsx'
import TimeblockSection from './TimeblockSection.jsx'
import BlockEditor from './BlockEditor.jsx'

// 기본 루틴 (처음 쓸 때 제공, 편집 가능)
const DEFAULT_ROUTINES = {
  morning: [
    { id: 'm1', name: '기상', minutes: 5 },
    { id: 'm2', name: '물 한 잔', minutes: 2 },
    { id: 'm3', name: '성경/기도', minutes: 15 },
    { id: 'm4', name: '스트레칭', minutes: 10 },
    { id: 'm5', name: '오늘 계획 확인', minutes: 5 },
  ],
  evening: [
    { id: 'e1', name: '오늘 회고 작성', minutes: 10 },
    { id: 'e2', name: '내일 타임블록 짜기', minutes: 10 },
    { id: 'e3', name: '취침 준비', minutes: 15 },
  ],
}

// 이 파일은 "오늘" 탭 본체 담당 — 루틴 + 타임블록 + 투두 조립
export default function TodayTab() {
  const today = todayKey()
  const [routines, setRoutines] = useStoredState('routines', DEFAULT_ROUTINES)
  const [routineLog, setRoutineLog] = useStoredState('routineLog', {})
  const [allTodos, setAllTodos] = useStoredState('todos', [])
  const [allBlocks, setAllBlocks] = useStoredState('timeblocks', {})
  const [settings] = useStoredState('settings', {})
  const [editorState, setEditorState] = useState(null) // null | 블록 초기값 객체

  const dayStart = settings.timeblockStart ?? 360 // 06:00
  const dayEnd = settings.timeblockEnd ?? 1440 // 24:00

  const todayLog = routineLog[today] ?? { morning: {}, evening: {} }
  const todayTodos = allTodos.filter((todo) => todo.date === today)
  const todayBlocks = allBlocks[today] ?? []

  function toggleRoutine(type, itemId) {
    const typeLog = { ...todayLog[type], [itemId]: !todayLog[type]?.[itemId] }
    setRoutineLog({ ...routineLog, [today]: { ...todayLog, [type]: typeLog } })
  }

  function changeTodos(nextTodayTodos) {
    const others = allTodos.filter((todo) => todo.date !== today)
    setAllTodos([...others, ...nextTodayTodos.map((todo) => ({ ...todo, date: today }))])
  }

  function saveBlock(block) {
    const id = block.id ?? uid()
    const rest = todayBlocks.filter((b) => b.id !== block.id)
    setAllBlocks({ ...allBlocks, [today]: [...rest, { ...block, id }] })
    setEditorState(null)
  }

  function deleteBlock(id) {
    setAllBlocks({ ...allBlocks, [today]: todayBlocks.filter((b) => b.id !== id) })
    setEditorState(null)
  }

  function toggleBlockDone(id) {
    setAllBlocks({
      ...allBlocks,
      [today]: todayBlocks.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
    })
  }

  function copyYesterday() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yBlocks = allBlocks[todayKey(yesterday)] ?? []
    if (yBlocks.length === 0) return
    const copied = yBlocks.map((b) => ({ ...b, id: uid(), done: false, todoId: undefined }))
    setAllBlocks({ ...allBlocks, [today]: [...todayBlocks, ...copied] })
  }

  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const hasYesterday = (allBlocks[todayKey(yesterdayDate)] ?? []).length > 0

  /** 투두 → 타임블록: 현재 시각 근처 30분 블록으로 에디터 열기 */
  function sendTodoToTimeblock(todo) {
    const now = new Date()
    const rounded = Math.min(
      Math.max(Math.ceil((now.getHours() * 60 + now.getMinutes()) / 10) * 10, dayStart),
      dayEnd - 30,
    )
    setEditorState({ title: todo.text, category: 'work', start: rounded, end: rounded + 30, todoId: todo.id })
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="sao-card p-5">
        <p className="text-sm text-[var(--color-muted)]">오늘</p>
        <h2 className="text-xl font-bold">{formatKorean()}</h2>
      </section>

      <RoutineCard
        title="아침루틴"
        emoji="🌅"
        items={routines.morning}
        checked={todayLog.morning ?? {}}
        onToggle={(id) => toggleRoutine('morning', id)}
        onChangeItems={(items) => setRoutines({ ...routines, morning: items })}
      />

      <TimeblockSection
        blocks={todayBlocks}
        dayStart={dayStart}
        dayEnd={dayEnd}
        onEditBlock={(block) => setEditorState(block)}
        onCreateAt={(minute) => setEditorState({ start: minute, end: Math.min(minute + 30, dayEnd) })}
        onToggleDone={toggleBlockDone}
        onCopyYesterday={copyYesterday}
        hasYesterday={hasYesterday}
      />

      <TodoSection todos={todayTodos} onChange={changeTodos} onSendToTimeblock={sendTodoToTimeblock} />

      <RoutineCard
        title="저녁 마감루틴"
        emoji="🌙"
        items={routines.evening}
        checked={todayLog.evening ?? {}}
        onToggle={(id) => toggleRoutine('evening', id)}
        onChangeItems={(items) => setRoutines({ ...routines, evening: items })}
      />

      {editorState && (
        <BlockEditor
          initial={editorState}
          dayStart={dayStart}
          dayEnd={dayEnd}
          onSave={saveBlock}
          onDelete={deleteBlock}
          onClose={() => setEditorState(null)}
        />
      )}
    </div>
  )
}
