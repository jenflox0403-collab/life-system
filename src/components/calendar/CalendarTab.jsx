import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import MonthGrid from './MonthGrid.jsx'
import EventList from './EventList.jsx'
import EventSheet from './EventSheet.jsx'

// 이 파일은 "달력" 탭 본체 담당 — 월간 그리드 + 일정 목록 + 그날 일기 + 추가/수정 창
export default function CalendarTab() {
  const [events, setEvents] = useStoredState('events', [])
  const [diary] = useStoredState('diary', {}) // 오늘 탭에서 쓴 일기 (읽기 전용)
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-based
  const [selectedDay, setSelectedDay] = useState(null) // null이면 다가오는 일정 모드
  const [editing, setEditing] = useState(null) // null=닫힘, 'new'=새 일정, 객체=수정

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
      setEvents(events.map((e) => (e.id === editing.id ? { ...e, ...data } : e)))
    } else {
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
      <MonthGrid
        year={viewYear}
        monthIndex={viewMonth}
        events={events}
        selected={selectedDay}
        onSelectDay={setSelectedDay}
        onChangeMonth={changeMonth}
        onQuickAdd={(key) => {
          setSelectedDay(key)
          setEditing('new')
        }}
      />

      <EventList
        events={events}
        selected={selectedDay}
        journalText={selectedDay ? diary[selectedDay]?.text ?? '' : null}
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
