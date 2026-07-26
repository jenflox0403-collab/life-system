import { useMemo } from 'react'
import { aggregate, evaluateBadges } from '../../lib/achievements.js'
import { LIGHT_TIERS, LIGHT_VERSE, tierFromLevel } from '../../lib/rankTiers.js'

// 이 파일은 '기록·도전과제' 화면 담당 — 보상 카드를 탭하면 열림
// 등급 사다리 + 최고 기록 + 배지 수집을 한눈에

export default function AchievementsSheet({ data, onClose }) {
  const agg = useMemo(() => aggregate(data), [data])
  const badges = useMemo(() => evaluateBadges(agg), [agg])
  const tier = tierFromLevel(agg.level)
  const unlockedCount = badges.filter((b) => b.unlocked).length

  const records = [
    { label: '최장 연속 클리어', value: `${agg.longestStreak}일`, icon: '🔥' },
    { label: '한 주 최고 XP', value: `${agg.bestWeekXp}`, icon: '📈' },
    { label: '하루 최고 XP', value: `${agg.bestDayXp}`, icon: '⭐' },
    { label: '모은 배지', value: `${unlockedCount} / ${badges.length}`, icon: '🎖️' },
  ]

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div
        className="sao-modal sos-enter max-h-[86dvh] w-full max-w-sm overflow-y-auto p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="sao-title mb-3 text-base font-bold">기록 · 도전과제</h3>

        {/* 현재 등급 */}
        <div className="rounded-lg bg-black/[0.04] p-4 text-center">
          <p className="text-3xl">{tier.icon}</p>
          <p className="mt-1 text-lg font-bold text-[var(--color-heading)]">
            {tier.name} <span className="text-sm text-[var(--color-muted)]">· LV.{agg.level}</span>
          </p>
          {tier.nextName && (
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              다음 등급 &lt;{tier.nextName}&gt;까지 LV.{tier.nextAtLevel}
            </p>
          )}
        </div>

        {/* 등급 사다리 */}
        <div className="mt-3 flex flex-col gap-1">
          {LIGHT_TIERS.map((t, i) => {
            const reached = agg.level >= t.from
            const current = i === tier.index
            return (
              <div
                key={t.name}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                  current ? 'bg-[var(--color-accent)]/15 font-bold' : ''
                }`}
                style={{ opacity: reached ? 1 : 0.4 }}
              >
                <span>{t.icon}</span>
                <span className={current ? 'text-[var(--color-heading)]' : 'text-[var(--color-muted)]'}>
                  {t.name}
                </span>
                <span className="ml-auto text-[11px] text-[var(--color-muted)]">LV.{t.from}~</span>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-[var(--color-muted)]">{LIGHT_VERSE}</p>

        {/* 최고 기록 */}
        <h4 className="mt-5 mb-2 text-sm font-bold text-[var(--color-heading)]">최고 기록</h4>
        <div className="grid grid-cols-2 gap-2">
          {records.map((record) => (
            <div key={record.label} className="rounded-md bg-black/[0.04] px-3 py-2.5">
              <p className="text-[11px] text-[var(--color-muted)]">
                {record.icon} {record.label}
              </p>
              <p className="text-lg font-bold text-[var(--color-heading)]">{record.value}</p>
            </div>
          ))}
        </div>

        {/* 도전과제 배지 */}
        <h4 className="mt-5 mb-2 text-sm font-bold text-[var(--color-heading)]">
          도전과제 <span className="text-[var(--color-muted)]">({unlockedCount}/{badges.length})</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center rounded-md bg-black/[0.03] px-2 py-3 text-center"
              style={{ opacity: badge.unlocked ? 1 : 0.45 }}
            >
              <span className={`text-2xl ${badge.unlocked ? '' : 'grayscale'}`}>{badge.icon}</span>
              <span className="mt-1 text-[11px] font-bold text-[var(--color-heading)]">{badge.name}</span>
              {badge.unlocked ? (
                <span className="text-[10px] text-[var(--color-amber-deep)]">달성!</span>
              ) : (
                <span className="text-[10px] text-[var(--color-muted)]">
                  {badge.current}/{badge.target}
                </span>
              )}
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-5 w-full py-2 text-sm text-[var(--color-muted)]">
          닫기
        </button>
      </div>
    </div>
  )
}
