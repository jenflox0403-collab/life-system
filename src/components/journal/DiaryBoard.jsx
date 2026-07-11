import { useState } from 'react'
import { useStoredState } from '../../hooks/useStoredState.js'
import { moodDef } from '../../lib/moods.js'
import MoodChart from './MoodChart.jsx'
import DiarySheet from './DiarySheet.jsx'

// 이 파일은 기록 탭 > 일기 화면 담당 — 월별 기분 그래프 + 지난 일기 리스트(탭해서 수정)
export default function DiaryBoard() {
  const [diary, setDiary] = useStoredState('diary', {})
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-based
  const [editing, setEditing] = useState(null) // null=닫힘, 'new'=새로 쓰기, 'YYYY-MM-DD'=수정

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const entries = Object.entries(diary)
    .filter(([date, entry]) => date.startsWith(monthPrefix) && (entry?.text || entry?.mood))
    .sort((a, b) => (a[0] > b[0] ? -1 : 1)) // 최신순

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

  function saveEntry(date, entry) {
    if (!entry.text && !entry.mood) {
      // 내용이 모두 비면 그 날짜 기록 삭제
      const next = { ...diary }
      delete next[date]
      setDiary(next)
    } else {
      setDiary({ ...diary, [date]: { ...diary[date], ...entry } })
    }
    setEditing(null)
  }

  function deleteEntry(date) {
    const next = { ...diary }
    delete next[date]
    setDiary(next)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 월 이동 + 기분 그래프 */}
      <section className="sao-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} aria-label="이전 달" className="sao-circle !h-8 !w-8 transition active:scale-90">
            ‹
          </button>
          <h3 className="sao-title text-base font-bold">
            {viewYear}년 {viewMonth + 1}월 기분
          </h3>
          <button onClick={() => changeMonth(1)} aria-label="다음 달" className="sao-circle !h-8 !w-8 transition active:scale-90">
            ›
          </button>
        </div>
        <MoodChart year={viewYear} monthIndex={viewMonth} diary={diary} />
      </section>

      {/* 일기 리스트 */}
      <section className="sao-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="sao-title font-bold">지난 일기</h3>
          <button type="button" onClick={() => setEditing('new')} className="add-btn px-4 py-1.5">
            + 일기
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="py-2 text-sm text-[var(--color-muted)]">이 달에 쓴 일기가 없어요</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {entries.map(([date, entry]) => {
              const mood = moodDef(entry.mood)
              return (
                <li key={date}>
                  <button
                    type="button"
                    onClick={() => setEditing(date)}
                    className="flex w-full items-start gap-2.5 rounded-[5px] border border-black/[0.07] bg-white px-3 py-2.5 text-left transition hover:bg-black/[0.02]"
                  >
                    <span className="shrink-0 text-xs font-bold text-[var(--color-muted)]">
                      {date.slice(5).replace('-', '/')}
                    </span>
                    {mood && <span className="shrink-0 text-base leading-none">{mood.emoji}</span>}
                    <span className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                      {entry.text || <span className="text-[var(--color-muted)]">(기분만 기록)</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {editing && (
        <DiarySheet
          entryDate={editing === 'new' ? null : editing}
          diary={diary}
          onSave={saveEntry}
          onDelete={deleteEntry}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
