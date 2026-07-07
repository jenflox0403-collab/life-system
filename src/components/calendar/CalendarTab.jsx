import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { isAwaitingSettlement } from '../../lib/eventTypes.js'
import MonthGrid from './MonthGrid.jsx'
import EventList from './EventList.jsx'
import EventSheet from './EventSheet.jsx'

// 이 파일은 "달력" 탭 본체 담당 — 월간 그리드 + 일정 목록 + 추가/수정 창
export default function CalendarTab() {
  const [events, setEvents] = useStoredState('events', [])
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-based
  const [selectedDay, setSelectedDay] = useState(null) // null이면 다가오는 일정 모드
  const [editing, setEditing] = useState(null) // null=닫힘, 'new'=새 일정, 객체=수정

  // 정산 대기(광고·협업인데 정산완료 아님) 건수
  const awaitingCount = events.filter(isAwaitingSettlement).length

  function changeMonth(delta) {
    let month = viewMonth + delta
    let year = viewYear
    if (month < 0) {
      month = 11
      year -= 1
    } else if (month > 11) {
      month = 0
      year += 1
    }
    setViewYear(year)
    setViewMonth(month)
  }

  function saveEvent(data) {
    if (editing && editing !== 'new') {
      // 수정
      setEvents(events.map((e) => (e.id === editing.id ? { ...e, ...data } : e)))
    } else {
      // 추가
      setEvents([...events, { id: uid(), ...data }])
    }
    setEditing(null)
  }

  function deleteEvent() {
    if (editing && editing !== 'new') {
      setEvents(events.filter((e) => e.id !== editing.id))
    }
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 정산 대기 뱃지 */}
      {awaitingCount > 0 && (
        <div className="flex items-center gap-2 rounded-[8px] bg-[rgba(201,83,110,0.1)] px-4 py-2.5 text-sm font-medium text-[var(--color-danger)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-xs font-bold text-white">
            {awaitingCount}
          </span>
          정산 대기 중인 건이 있어요
        </div>
      )}

      <MonthGrid
        year={viewYear}
        monthIndex={viewMonth}
        events={events}
        selected={selectedDay}
        onSelectDay={setSelectedDay}
        onChangeMonth={changeMonth}
      />

      <EventList
        events={events}
        selected={selectedDay}
        onEditEvent={(event) => setEditing(event)}
        onAddForDay={() => setEditing('new')}
      />

      {editing && (
        <EventSheet
          event={editing === 'new' ? null : editing}
          defaultDate={selectedDay ?? undefined}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
