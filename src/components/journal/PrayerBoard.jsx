import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 기록 탭 > 기도제목 화면 담당
// 진행 중 목록 + "응답됨" 체크(응답일 기록) + 응답된 기도 아카이브
export default function PrayerBoard() {
  const [prayers, setPrayers] = useStoredState('prayers', [])
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showAnswered, setShowAnswered] = useState(false)

  const active = prayers.filter((p) => !p.answered)
  const answered = prayers.filter((p) => p.answered)

  function addPrayer(e) {
    e.preventDefault()
    if (!title.trim()) return
    setPrayers([
      ...prayers,
      { id: uid(), title: title.trim(), detail: detail.trim(), startDate: todayKey(), answered: false, answeredDate: '' },
    ])
    setTitle('')
    setDetail('')
    setShowForm(false)
  }

  function markAnswered(id) {
    setPrayers(prayers.map((p) => (p.id === id ? { ...p, answered: true, answeredDate: todayKey() } : p)))
  }

  function unmarkAnswered(id) {
    setPrayers(prayers.map((p) => (p.id === id ? { ...p, answered: false, answeredDate: '' } : p)))
  }

  function removePrayer(id) {
    setPrayers(prayers.filter((p) => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 카운트 */}
      <div className="flex gap-2">
        <div className="sao-card flex-1 p-3 text-center">
          <p className="text-xl font-bold text-[var(--color-accent)]">{active.length}</p>
          <p className="text-xs text-[var(--color-muted)]">진행 중 기도</p>
        </div>
        <div className="sao-card flex-1 p-3 text-center">
          <p className="text-xl font-bold text-[var(--color-amber-deep)]">{answered.length}</p>
          <p className="text-xs text-[var(--color-muted)]">응답된 기도</p>
        </div>
      </div>

      {/* 진행 중 기도 */}
      <section className="sao-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="sao-title font-bold">기도제목</h3>
          <button type="button" onClick={() => setShowForm((v) => !v)} className="add-btn px-4 py-1.5">
            + 기도
          </button>
        </div>

        {showForm && (
          <form onSubmit={addPrayer} className="mb-3 flex flex-col gap-2 rounded-[8px] bg-black/[0.03] p-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="기도제목"
              autoFocus
              className="rounded-[5px] border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
            />
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="상세 내용 (선택)"
              className="resize-none rounded-[5px] border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
            />
            <button type="submit" className="sao-btn-primary py-2.5">추가</button>
          </form>
        )}

        {active.length === 0 ? (
          <p className="py-2 text-sm text-[var(--color-muted)]">진행 중인 기도제목이 없어요</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {active.map((prayer) => (
              <li key={prayer.id} className="rounded-[5px] border border-black/[0.07] bg-white px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium leading-snug">{prayer.title}</p>
                    {prayer.detail && <p className="mt-0.5 text-sm text-[var(--color-muted)]">{prayer.detail}</p>}
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{prayer.startDate.slice(5).replace('-', '/')}부터</p>
                  </div>
                  <button type="button" onClick={() => removePrayer(prayer.id)} className="shrink-0 px-1 text-black/20 hover:text-red-400">
                    ✕
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => markAnswered(prayer.id)}
                  className="chip mt-2"
                  style={{ borderColor: '#e3a93c', color: '#c98f26' }}
                >
                  ✦ 응답됨
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 응답된 기도 아카이브 */}
      <div>
        <button
          type="button"
          onClick={() => setShowAnswered((v) => !v)}
          className="text-sm font-medium text-[var(--color-muted)]"
        >
          {showAnswered ? '▴' : '▾'} 응답된 기도 ({answered.length})
        </button>
        {showAnswered && (
          answered.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-muted)]">아직 응답된 기도가 없어요</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {answered.map((prayer) => (
                <li
                  key={prayer.id}
                  className="rounded-[5px] border border-black/[0.06] bg-white px-3 py-2.5"
                  style={{ borderLeft: '3px solid var(--color-amber)' }}
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium leading-snug">{prayer.title}</p>
                      {prayer.detail && <p className="mt-0.5 text-sm text-[var(--color-muted)]">{prayer.detail}</p>}
                      <p className="mt-1 text-xs text-[var(--color-amber-deep)]">
                        ✦ {prayer.startDate.slice(5).replace('-', '/')} → {prayer.answeredDate.slice(5).replace('-', '/')} 응답
                      </p>
                    </div>
                    <button type="button" onClick={() => removePrayer(prayer.id)} className="shrink-0 px-1 text-black/20 hover:text-red-400">
                      ✕
                    </button>
                  </div>
                  <button type="button" onClick={() => unmarkAnswered(prayer.id)} className="chip mt-2">
                    진행 중으로 되돌리기
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  )
}
