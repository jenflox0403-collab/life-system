import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 오늘 탭 상단 "디데이(D-Day) 가로 스크롤 띠" 담당
// 중요한 날짜까지 며칠 남았는지 한눈에. 여러 개도 옆으로 스크롤해서 봄.

const SOON_DAYS = 3 // 이 일수 이내면 "임박"(노랑)

/** target(YYYY-MM-DD)과 오늘 사이 남은 일수 (양수=미래, 0=오늘, 음수=지남) */
function diffDays(target, today) {
  const [ty, tm, td] = target.split('-').map(Number)
  const [ny, nm, nd] = today.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(ny, nm - 1, nd)) / 86400000)
}

function ddayText(diff) {
  if (diff === 0) return 'D-DAY'
  if (diff > 0) return `D-${diff}`
  return `D+${-diff}`
}

/** 남은 일수에 따른 강조 색 */
function ddayColor(diff) {
  if (diff <= 0) return 'var(--color-danger)' // 오늘·지남 → 빨강
  if (diff <= SOON_DAYS) return 'var(--color-amber-deep)' // 임박 → 노랑
  return 'var(--color-accent)' // 다가옴 → 파랑
}

function shortDate(dateStr) {
  return `${Number(dateStr.slice(5, 7))}/${Number(dateStr.slice(8, 10))}`
}

export default function DdayStrip() {
  const [ddays, setDdays] = useStoredState('dday', [])
  const [editing, setEditing] = useState(null) // null | 'new' | dday객체
  const today = todayKey()

  // 가까운 날짜가 앞에 오도록 정렬. 지난 날짜는 맨 뒤(최근 지난 것부터)
  const sorted = ddays
    .map((d) => ({ ...d, diff: diffDays(d.date, today) }))
    .sort((a, b) => {
      const ka = a.diff >= 0 ? a.diff : 1e7 - a.diff
      const kb = b.diff >= 0 ? b.diff : 1e7 - b.diff
      return ka - kb
    })

  function saveDday(data) {
    if (editing && editing !== 'new') {
      setDdays(ddays.map((d) => (d.id === editing.id ? { ...d, ...data } : d)))
    } else {
      setDdays([...ddays, { id: uid(), ...data }])
    }
    setEditing(null)
  }

  function removeDday() {
    if (editing && editing !== 'new') setDdays(ddays.filter((d) => d.id !== editing.id))
    setEditing(null)
  }

  return (
    <section>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sorted.map((d) => (
          <button
            key={d.id}
            onClick={() => setEditing(d)}
            className="sao-card shrink-0 !p-3 text-left transition active:scale-[0.97]"
            style={{ minWidth: 92 }}
          >
            <p className="text-lg font-extrabold leading-none" style={{ color: ddayColor(d.diff) }}>
              {ddayText(d.diff)}
            </p>
            <p className="mt-1.5 max-w-[130px] truncate text-xs font-bold text-[var(--color-heading)]">
              {d.label}
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
              {shortDate(d.date)}
              {d.diff < 0 && ' · 지남'}
            </p>
          </button>
        ))}

        <button
          onClick={() => setEditing('new')}
          className="add-btn shrink-0 whitespace-nowrap !px-4"
          aria-label="디데이 추가"
        >
          + 디데이
        </button>
      </div>

      {editing && (
        <DdayEditor
          initial={editing === 'new' ? null : editing}
          onSave={saveDday}
          onDelete={removeDday}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}

// 디데이 추가·수정 작은 창
function DdayEditor({ initial, onSave, onDelete, onClose }) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const canSave = label.trim() && date

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div className="sao-modal w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="sao-title mb-4 text-lg font-bold">{initial ? '디데이 수정' : '디데이 추가'}</h3>

        <label className="text-xs font-bold text-[var(--color-heading)]">
          무엇의 디데이인가요?
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="예: 구독 100만"
            className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <label className="mt-3 block text-xs font-bold text-[var(--color-heading)]">
          날짜
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <button
          onClick={() => canSave && onSave({ label: label.trim(), date })}
          disabled={!canSave}
          className="sao-btn-primary mt-5 w-full py-3 disabled:opacity-50"
        >
          저장
        </button>

        <div className="mt-2 flex justify-between">
          {initial ? (
            <button onClick={onDelete} className="py-2 text-sm font-bold text-[var(--color-danger)]">
              삭제
            </button>
          ) : (
            <span />
          )}
          <button onClick={onClose} className="py-2 text-sm text-[var(--color-muted)]">
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
