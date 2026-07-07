import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { todayKey, formatKorean } from '../../lib/date.js'
import RoutineCard from './RoutineCard.jsx'
import OverdueTodos from './OverdueTodos.jsx'
import TodayEvents from './TodayEvents.jsx'
import TodoSection from './TodoSection.jsx'
import TimeblockSection from './TimeblockSection.jsx'
import BlockEditor from './BlockEditor.jsx'
import DiarySection from './DiarySection.jsx'
import EventSheet from '../calendar/EventSheet.jsx'

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

/** 날짜 키에 하루 더하기 */
function addDays(key, delta) {
  const [y, m, d] = key.split('-').map(Number)
  return todayKey(new Date(y, m - 1, d + delta))
}

// 이 파일은 "오늘" 탭 본체 담당 — 날짜 이동 + 루틴 + To-Do + 타임블록 + 일기
export default function TodayTab() {
  const realToday = todayKey()
  const [viewKey, setViewKey] = useState(realToday)
  const [routines, setRoutines] = useStoredState('routines', DEFAULT_ROUTINES)
  const [routineLog, setRoutineLog] = useStoredState('routineLog', {})
  const [allTodos, setAllTodos] = useStoredState('todos', [])
  const [allBlocks, setAllBlocks] = useStoredState('timeblocks', {})
  const [events, setEvents] = useStoredState('events', []) // 달력과 공유 (여기서 추가·수정 가능)
  const [diary, setDiary] = useStoredState('diary', {})
  const [settings] = useStoredState('settings', {})
  const [editorState, setEditorState] = useState(null)
  const [eventEditing, setEventEditing] = useState(null) // null=닫힘, 'new'=추가, 객체=수정

  const dayStart = settings.timeblockStart ?? 360
  const dayEnd = settings.timeblockEnd ?? 1440
  const isToday = viewKey === realToday
  const [vy, vm, vd] = viewKey.split('-').map(Number)
  const viewDate = new Date(vy, vm - 1, vd)

  const dayLog = routineLog[viewKey] ?? { morning: {}, evening: {} }
  const dayTodos = allTodos.filter((todo) => todo.date === viewKey)
  // 밀린 할 일: 지난 날짜인데 아직 완료 안 한 것 (오늘 볼 때만 표시)
  const overdueTodos = allTodos.filter((todo) => !todo.done && todo.date < realToday)
  // 오늘 일정: 달력에서 그날 날짜로 등록한 일정 (읽기 전용)
  const dayEvents = events.filter((event) => event.date === viewKey)
  const dayBlocks = allBlocks[viewKey] ?? []
  const dayDiary = diary[viewKey]?.text ?? ''

  function toggleRoutine(type, itemId) {
    const typeLog = { ...dayLog[type], [itemId]: !dayLog[type]?.[itemId] }
    setRoutineLog({ ...routineLog, [viewKey]: { ...dayLog, [type]: typeLog } })
  }

  function changeTodos(nextDayTodos) {
    const others = allTodos.filter((todo) => todo.date !== viewKey)
    setAllTodos([...others, ...nextDayTodos.map((todo) => ({ ...todo, date: viewKey }))])
  }

  /** 미루기: 이 투두를 다음날로 넘김 (다음날 To-Do에 나타남) */
  function deferTodo(todo) {
    setAllTodos(allTodos.map((t) => (t.id === todo.id ? { ...t, date: addDays(viewKey, 1), done: false } : t)))
  }

  /** 밀린 할 일을 오늘 날짜로 당겨옴 */
  function bumpTodoToToday(id) {
    setAllTodos(allTodos.map((t) => (t.id === id ? { ...t, date: realToday } : t)))
  }

  /** 밀린 할 일 완료 처리 */
  function markTodoDone(id) {
    setAllTodos(allTodos.map((t) => (t.id === id ? { ...t, done: true } : t)))
  }

  /** 밀린 할 일 삭제 */
  function removeTodo(id) {
    setAllTodos(allTodos.filter((t) => t.id !== id))
  }

  /** 오늘 일정 추가·수정 (달력과 같은 events 저장소 공유) */
  function saveEvent(data) {
    if (eventEditing && eventEditing !== 'new') {
      setEvents(events.map((e) => (e.id === eventEditing.id ? { ...e, ...data } : e)))
    } else {
      setEvents([...events, { id: uid(), ...data }])
    }
    setEventEditing(null)
  }

  /** 오늘 일정 삭제 */
  function deleteEvent() {
    if (eventEditing && eventEditing !== 'new') {
      setEvents(events.filter((e) => e.id !== eventEditing.id))
    }
    setEventEditing(null)
  }

  function saveBlock(block) {
    const id = block.id ?? uid()
    const rest = dayBlocks.filter((b) => b.id !== block.id)
    setAllBlocks({ ...allBlocks, [viewKey]: [...rest, { ...block, id }] })
    setEditorState(null)
  }

  function deleteBlock(id) {
    setAllBlocks({ ...allBlocks, [viewKey]: dayBlocks.filter((b) => b.id !== id) })
    setEditorState(null)
  }

  function toggleBlockDone(id) {
    setAllBlocks({ ...allBlocks, [viewKey]: dayBlocks.map((b) => (b.id === id ? { ...b, done: !b.done } : b)) })
  }

  function copyYesterday() {
    const yBlocks = allBlocks[addDays(viewKey, -1)] ?? []
    if (yBlocks.length === 0) return
    const copied = yBlocks.map((b) => ({ ...b, id: uid(), done: false, todoId: undefined }))
    setAllBlocks({ ...allBlocks, [viewKey]: [...dayBlocks, ...copied] })
  }

  const hasYesterday = (allBlocks[addDays(viewKey, -1)] ?? []).length > 0

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
      {/* 날짜 이동 */}
      <section className="sao-card flex items-center justify-between p-4">
        <button onClick={() => setViewKey(addDays(viewKey, -1))} className="sao-circle !h-9 !w-9 text-[var(--color-muted)]" aria-label="전날">
          ‹
        </button>
        <div className="text-center">
          <p className="text-xs text-[var(--color-muted)]">{isToday ? '오늘' : viewKey.slice(0, 4) + '년'}</p>
          <h2 className="text-xl font-bold">{formatKorean(viewDate)}</h2>
          {!isToday && (
            <button onClick={() => setViewKey(realToday)} className="mt-0.5 text-xs font-bold text-[var(--color-accent)]">
              오늘로 돌아가기
            </button>
          )}
        </div>
        <button onClick={() => setViewKey(addDays(viewKey, 1))} className="sao-circle !h-9 !w-9 text-[var(--color-muted)]" aria-label="다음날">
          ›
        </button>
      </section>

      {/* 밀린 할 일 (오늘 볼 때만) */}
      {isToday && overdueTodos.length > 0 && (
        <OverdueTodos
          todos={overdueTodos}
          onBumpToday={bumpTodoToToday}
          onToggleDone={markTodoDone}
          onRemove={removeTodo}
        />
      )}

      {/* 오늘 일정 (달력과 공유 · 여기서도 추가/수정) */}
      <TodayEvents
        events={dayEvents}
        onAdd={() => setEventEditing('new')}
        onEdit={(event) => setEventEditing(event)}
      />

      <RoutineCard
        title="아침루틴"
        items={routines.morning}
        checked={dayLog.morning ?? {}}
        onToggle={(id) => toggleRoutine('morning', id)}
        onChangeItems={(items) => setRoutines({ ...routines, morning: items })}
      />

      <TodoSection
        todos={dayTodos}
        onChange={changeTodos}
        onSendToTimeblock={sendTodoToTimeblock}
        onDefer={deferTodo}
      />

      <TimeblockSection
        blocks={dayBlocks}
        dayStart={dayStart}
        dayEnd={dayEnd}
        isToday={isToday}
        onEditBlock={(block) => setEditorState(block)}
        onCreateAt={(minute) => setEditorState({ start: minute, end: Math.min(minute + 30, dayEnd) })}
        onToggleDone={toggleBlockDone}
        onCopyYesterday={copyYesterday}
        hasYesterday={hasYesterday}
      />

      <RoutineCard
        title="저녁 마감루틴"
        items={routines.evening}
        checked={dayLog.evening ?? {}}
        onToggle={(id) => toggleRoutine('evening', id)}
        onChangeItems={(items) => setRoutines({ ...routines, evening: items })}
      />

      <DiarySection
        value={dayDiary}
        onChange={(text) => setDiary({ ...diary, [viewKey]: { ...diary[viewKey], text } })}
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

      {eventEditing && (
        <EventSheet
          event={eventEditing === 'new' ? null : eventEditing}
          defaultDate={viewKey}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setEventEditing(null)}
        />
      )}
    </div>
  )
}
