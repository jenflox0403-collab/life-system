import { useState } from 'react'
import { useStoredState } from '../../hooks/useStoredState.js'
import { weekKey, weekDateKeys, todayKey } from '../../lib/date.js'
import { weekRangeLabel } from '../../lib/weekly.js'
import WeeklyReviewWizard from './WeeklyReviewWizard.jsx'

// 이 파일은 기록 탭 > 주간 담당 — 주간 리뷰 쓰기 + 지난 리뷰 목록

const ANSWER_ROWS = [
  { id: 'good', label: '잘한 것', color: 'var(--color-amber-deep)' },
  { id: 'tough', label: '아쉬운 것', color: 'var(--color-danger)' },
  { id: 'next', label: '다짐', color: 'var(--color-accent)' },
]

export default function WeeklyBoard() {
  const [reviews, setReviews] = useStoredState('weeklyReviews', {})
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const thisWeekId = weekKey()
  const thisWeekDays = weekDateKeys()
  const thisWeekReview = reviews[thisWeekId]
  const pastIds = Object.keys(reviews).sort().reverse()

  function saveReview(review) {
    setReviews({ ...reviews, [thisWeekId]: { ...review, savedAt: todayKey() } })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 이번 주 리뷰 쓰기/수정 */}
      <section className="sao-card p-4">
        <h3 className="sao-title mb-1 text-sm font-bold">이번 주 리뷰</h3>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          {weekRangeLabel(thisWeekDays[0], thisWeekDays[6])} · 일요일마다 한 주를 돌아봐요
        </p>
        <button
          onClick={() => setIsWizardOpen(true)}
          className={`${thisWeekReview ? 'add-btn' : 'sao-btn-primary'} w-full py-2.5`}
        >
          {thisWeekReview ? '이번 주 리뷰 수정하기' : '이번 주 리뷰 쓰기'}
        </button>
      </section>

      {/* 지난 리뷰 목록 */}
      {pastIds.length > 0 && (
        <section className="flex flex-col gap-3">
          {pastIds.map((id) => {
            const review = reviews[id]
            return (
              <article key={id} className="sao-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--color-heading)]">
                    {weekRangeLabel(review.startKey, review.endKey)}
                  </h4>
                  {review.summary && (
                    <span className="text-[11px] text-[var(--color-muted)]">
                      ✦ {review.summary.xp} XP · 클리어 {review.summary.clearedDays}일
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {ANSWER_ROWS.map(
                    (row) =>
                      (review[row.id] ?? '').trim() && (
                        <p key={row.id} className="text-sm">
                          <span className="mr-1.5 text-xs font-bold" style={{ color: row.color }}>
                            {row.label}
                          </span>
                          {review[row.id]}
                        </p>
                      ),
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      {pastIds.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--color-muted)]">
          아직 저장된 리뷰가 없어요. 첫 주간 리뷰를 써보세요!
        </p>
      )}

      {isWizardOpen && (
        <WeeklyReviewWizard
          days={thisWeekDays}
          existing={thisWeekReview}
          onSave={saveReview}
          onClose={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  )
}
