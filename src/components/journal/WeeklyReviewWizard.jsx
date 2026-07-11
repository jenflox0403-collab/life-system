import { useMemo, useState } from 'react'
import { summarizeWeek, weekRangeLabel } from '../../lib/weekly.js'
import { moodDef } from '../../lib/moods.js'

// 이 파일은 주간 리뷰 위저드 담당 — 3단계 (숫자 요약 → 회고 질문 → 완료)

const QUESTIONS = [
  { id: 'good', label: '이번 주 잘한 것', placeholder: '작아도 좋아요. 스스로 칭찬해줄 것 하나!' },
  { id: 'tough', label: '아쉬웠던 것', placeholder: '자책 말고 관찰만. 뭐가 걸림돌이었나요?' },
  { id: 'next', label: '다음 주 다짐 한 줄', placeholder: '다음 주의 나에게 남기는 한 마디' },
]

export default function WeeklyReviewWizard({ days, existing, onSave, onClose }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    good: existing?.good ?? '',
    tough: existing?.tough ?? '',
    next: existing?.next ?? '',
  })
  // 요약은 열 때 한 번만 계산 (저장소에서 최신 데이터를 읽음)
  const summary = useMemo(() => summarizeWeek(days), [days])

  const stats = [
    { label: '할 일 완료', value: `${summary.todosDone}개` },
    { label: '루틴 체크', value: `${summary.routineChecks}번` },
    { label: '타임블록 완료', value: `${summary.blocksDone}개` },
    { label: '습관 체크', value: `${summary.habitChecks}번` },
    { label: '집중 세션', value: `${summary.pomodoros}회` },
    { label: '일기 쓴 날', value: `${summary.diaryDays}일` },
    { label: '이번 주 XP', value: `${summary.xp}` },
    { label: '클리어한 날', value: `${summary.clearedDays}일` },
  ]

  function handleSave() {
    onSave({
      startKey: days[0],
      endKey: days[6],
      ...answers,
      summary: { xp: summary.xp, clearedDays: summary.clearedDays, todosDone: summary.todosDone },
    })
    setStep(2)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div
        className="sao-modal sos-enter max-h-[85dvh] w-full max-w-sm overflow-y-auto p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="sao-title mb-1 text-base font-bold">주간 리뷰</h3>
        <p className="mb-4 text-center text-xs text-[var(--color-muted)]">{weekRangeLabel(days[0], days[6])}</p>

        {step === 0 && (
          <>
            <p className="mb-3 text-sm font-bold text-[var(--color-heading)]">이번 주 이렇게 살았어요</p>
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-md bg-black/[0.04] px-3 py-2.5">
                  <p className="text-[11px] text-[var(--color-muted)]">{stat.label}</p>
                  <p className="text-lg font-bold text-[var(--color-heading)]">{stat.value}</p>
                </div>
              ))}
            </div>
            {summary.moods.length > 0 && (
              <div className="mt-3 rounded-md bg-black/[0.04] px-3 py-2.5">
                <p className="text-[11px] text-[var(--color-muted)]">이번 주 기분 흐름</p>
                <p className="mt-1 text-xl">
                  {summary.moods.map((id) => moodDef(id)?.emoji).filter(Boolean).join(' ')}
                </p>
              </div>
            )}
            <button onClick={() => setStep(1)} className="sao-btn-primary mt-4 w-full py-2.5">
              다음 — 한 주 돌아보기
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="flex flex-col gap-3">
              {QUESTIONS.map((question) => (
                <label key={question.id} className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-[var(--color-heading)]">{question.label}</span>
                  <textarea
                    value={answers[question.id]}
                    onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}
                    placeholder={question.placeholder}
                    rows={2}
                    className="w-full resize-none rounded-md border border-black/15 bg-white p-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setStep(0)} className="add-btn flex-1 py-2.5">
                이전
              </button>
              <button onClick={handleSave} className="sao-btn-primary flex-[2] py-2.5">
                저장
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="py-4 text-center">
            <p className="reward-pop text-2xl">✦</p>
            <p className="mt-2 text-base font-bold text-[var(--color-heading)]">이번 주도 수고했어요!</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              리뷰가 저장됐어요. 기록 탭 &gt; 주간에서 다시 볼 수 있어요.
            </p>
            <button onClick={onClose} className="sao-btn-primary mt-4 w-full py-2.5">
              닫기
            </button>
          </div>
        )}

        {step !== 2 && (
          <button onClick={onClose} className="mt-2 w-full py-1.5 text-xs text-[var(--color-muted)]">
            닫기
          </button>
        )}
      </div>
    </div>
  )
}
