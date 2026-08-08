import { useState } from 'react'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 오늘 탭 "이번 주 영상 계획" 카드 담당 (접었다 펴기)
// 일~토 요일별로 업로드·제작·메모를 적어 한 주 콘텐츠를 한눈에.
// 매주 새 표: 날짜 키로 저장하므로 주가 바뀌면 자연스럽게 빈 표가 됨.

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const FIELDS = [
  { key: 'upload', label: '업로드' },
  { key: 'make', label: '제작' },
  { key: 'memo', label: '메모' },
]

/** 오늘이 속한 주(일~토) 7일의 날짜 키 배열 */
function weekDates(today) {
  const [y, m, d] = today.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const sunday = new Date(base)
  sunday.setDate(base.getDate() - base.getDay()) // 일요일로 이동 (getDay: 일=0)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(sunday)
    dd.setDate(sunday.getDate() + i)
    return todayKey(dd)
  })
}

function shortDate(dateStr) {
  return `${Number(dateStr.slice(5, 7))}/${Number(dateStr.slice(8, 10))}`
}

function hasAny(day) {
  return !!(day.upload || day.make || day.memo)
}

export default function WeekPlanCard() {
  const [plan, setPlan] = useStoredState('weekPlan', {})
  const [open, setOpen] = useState(false)
  const [editKey, setEditKey] = useState(null) // 편집 중인 날짜 키
  const today = todayKey()

  const dates = weekDates(today)
  const dayOf = (key) => plan[key] ?? {}
  const plannedCount = dates.filter((k) => hasAny(dayOf(k))).length
  const todayUpload = dayOf(today).upload

  function saveDay(key, data) {
    const cleaned = {
      upload: data.upload.trim(),
      make: data.make.trim(),
      memo: data.memo.trim(),
    }
    const next = { ...plan }
    if (hasAny(cleaned)) next[key] = cleaned
    else delete next[key] // 전부 비었으면 저장 안 함 (표 깔끔하게)
    setPlan(next)
    setEditKey(null)
  }

  return (
    <section className="sao-card p-4">
      {/* 접기/펴기 헤더 (요약) */}
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--color-heading)]">이번 주 영상 계획</p>
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
            {plannedCount > 0 ? `이번 주 ${plannedCount}일 예정` : '아직 계획이 없어요'}
            {todayUpload && ` · 오늘: ${todayUpload}`}
          </p>
        </div>
        <span className="shrink-0 pl-2 text-xs text-[var(--color-muted)]">{open ? '▲ 접기' : '▼ 펼치기'}</span>
      </button>

      {/* 펼친 상태: 일~토 7일 */}
      {open && (
        <div className="mt-3 flex flex-col gap-1.5">
          {dates.map((key, i) => {
            const day = dayOf(key)
            const isToday = key === today
            return (
              <button
                key={key}
                onClick={() => setEditKey(key)}
                className="flex gap-3 rounded-xl border p-2.5 text-left transition active:scale-[0.99]"
                style={{
                  borderColor: isToday ? 'var(--color-accent)' : 'rgba(0,0,0,0.08)',
                  background: isToday ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                }}
              >
                <div className="flex w-8 shrink-0 flex-col items-center pt-0.5">
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: isToday ? 'var(--color-accent)' : 'var(--color-heading)' }}
                  >
                    {DAY_LABELS[i]}
                  </span>
                  <span className="text-[10px] text-[var(--color-muted)]">{shortDate(key)}</span>
                </div>

                <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
                  {hasAny(day) ? (
                    FIELDS.map(
                      (f) =>
                        day[f.key] && (
                          <p key={f.key} className="break-words">
                            <span className="mr-1 text-[11px] font-bold text-[var(--color-muted)]">{f.label}</span>
                            <span className="text-[var(--color-text)]">{day[f.key]}</span>
                          </p>
                        ),
                    )
                  ) : (
                    <p className="text-[var(--color-muted)]">+ 계획 추가</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {editKey && (
        <DayEditor
          dateKey={editKey}
          dayLabel={DAY_LABELS[dates.indexOf(editKey)]}
          initial={dayOf(editKey)}
          onSave={(data) => saveDay(editKey, data)}
          onClose={() => setEditKey(null)}
        />
      )}
    </section>
  )
}

// 요일 하나의 업로드·제작·메모 편집 창
function DayEditor({ dateKey, dayLabel, initial, onSave, onClose }) {
  const [upload, setUpload] = useState(initial.upload ?? '')
  const [make, setMake] = useState(initial.make ?? '')
  const [memo, setMemo] = useState(initial.memo ?? '')

  const rows = [
    { label: '업로드 계획', value: upload, set: setUpload, placeholder: '이 날 올릴 영상 제목/주제' },
    { label: '제작 계획', value: make, set: setMake, placeholder: '촬영·편집 등 만들 것' },
    { label: '메모', value: memo, set: setMemo, placeholder: '시간·기타 메모' },
  ]

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div className="sao-modal w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="sao-title mb-4 text-lg font-bold">
          {dayLabel}요일 · {shortDate(dateKey)}
        </h3>

        {rows.map((r) => (
          <label key={r.label} className="mb-3 block text-xs font-bold text-[var(--color-heading)]">
            {r.label}
            <textarea
              value={r.value}
              onChange={(e) => r.set(e.target.value)}
              placeholder={r.placeholder}
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-black/10 bg-[var(--color-surface)] px-3 py-2 text-sm font-normal text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        ))}

        <button
          onClick={() => onSave({ upload, make, memo })}
          className="sao-btn-primary mt-2 w-full py-3"
        >
          저장
        </button>
        <button onClick={onClose} className="mt-2 w-full py-2 text-sm text-[var(--color-muted)]">
          닫기
        </button>
      </div>
    </div>
  )
}
