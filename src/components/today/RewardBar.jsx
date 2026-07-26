import { useEffect, useState } from 'react'
import { totalXp, levelFromXp, xpForDay, clearStreak, dailyLine, DAILY_TARGET } from '../../lib/rewards.js'
import { tierFromLevel } from '../../lib/rankTiers.js'
import { aggregate, unlockedBadgeIds, BADGES } from '../../lib/achievements.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { todayKey } from '../../lib/date.js'
import AchievementsSheet from './AchievementsSheet.jsx'

// 이 파일은 오늘 탭 최상단 보상 카드 담당 (게임화)
// 등급(빛의 길)·XP바 + 오늘 클리어 게이지 + 🔥연속(손해 강조) + 오늘의 한 마디
// + 탭하면 기록·도전과제 화면, 승급·새 배지 축하 연출
export default function RewardBar({ todos, routineLog, timeblocks, habitLog, diary, pomodoroLog, surviveLog, goals, sos }) {
  const data = { todos, routineLog, timeblocks, habitLog, diary, pomodoroLog, surviveLog }
  const today = todayKey()

  const xp = totalXp(data)
  const { level, current, need } = levelFromXp(xp)
  const tier = tierFromLevel(level)
  const todayXp = xpForDay(today, data)
  const streak = clearStreak(data)
  const line = dailyLine(goals, sos, today)

  const cleared = todayXp >= DAILY_TARGET
  const gauge = Math.min(100, Math.round((todayXp / DAILY_TARGET) * 100))
  const levelPct = Math.round((current / need) * 100)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  // 축하 연출 상태: 등급 승급 / 새 배지
  const [celebration, setCelebration] = useState(null)
  // 이미 본 배지·등급 기록 (null = 첫 실행, 이땐 조용히 초기화만)
  const [badgesSeen, setBadgesSeen] = useStoredState('badgesSeen', null)
  const [rankSeen, setRankSeen] = useStoredState('rankSeen', null)

  // 완료 이벤트로 값이 바뀌면 새 배지·승급을 감지해 축하
  useEffect(() => {
    const agg = aggregate(data)
    const unlocked = unlockedBadgeIds(agg)

    if (badgesSeen === null) {
      setBadgesSeen(unlocked) // 첫 실행: 지금까지 딴 건 조용히 기록
    } else {
      const fresh = unlocked.filter((id) => !badgesSeen.includes(id))
      if (fresh.length > 0) {
        const badge = BADGES.find((b) => b.id === fresh[0])
        setCelebration({ type: 'badge', text: `새 배지 · ${badge?.name ?? ''}`, icon: badge?.icon ?? '✦' })
        setBadgesSeen(unlocked)
      }
    }

    if (rankSeen === null) {
      setRankSeen(tier.index)
    } else if (tier.index > rankSeen) {
      setCelebration({ type: 'rank', text: `승급 · ${tier.name}`, icon: tier.icon })
      setRankSeen(tier.index)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp])

  // 축하는 잠깐 보여주고 사라짐
  useEffect(() => {
    if (!celebration) return
    const timer = setTimeout(() => setCelebration(null), 4500)
    return () => clearTimeout(timer)
  }, [celebration])

  return (
    <>
      <section
        className="sao-card cursor-pointer p-4 transition active:scale-[0.99]"
        onClick={() => setIsSheetOpen(true)}
        role="button"
        aria-label="기록·도전과제 보기"
      >
        {/* 등급 + 레벨 + 누적 XP */}
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-lg">{tier.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-[var(--color-heading)]">{tier.name}</span>
              <span className="sao-en text-[13px] font-bold text-[var(--color-amber-deep)]">LV.{level}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-[var(--color-amber)] transition-all duration-500"
                style={{ width: `${levelPct}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-[11px] text-[var(--color-muted)]">
            {current}/{need} XP
          </span>
        </div>

        {/* 오늘 클리어 게이지 */}
        <div className="mt-3 flex items-center gap-3">
          <span className="shrink-0 text-xs font-bold text-[var(--color-heading)]">오늘</span>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${gauge}%`,
                  background: cleared ? 'var(--color-amber)' : 'var(--color-accent)',
                }}
              />
            </div>
          </div>
          <span className="shrink-0 text-[11px] text-[var(--color-muted)]">
            {todayXp}/{DAILY_TARGET} XP
          </span>
        </div>

        {/* 클리어 축하 + 🔥연속(손해 강조) */}
        <div className="mt-2 flex items-center justify-between">
          {cleared ? (
            <span className="reward-pop text-sm font-bold text-[var(--color-amber-deep)]">
              <span className="reward-sparkle">✦</span> 오늘 클리어!
            </span>
          ) : (
            <span className="text-xs text-[var(--color-muted)]">할 일·루틴·블록을 완료하면 XP가 차요</span>
          )}
          {streak > 0 && (
            <span className="text-xs font-bold text-[var(--color-amber-deep)]">🔥 {streak}일 연속</span>
          )}
        </div>

        {/* 스트릭이 걸려 있는데 오늘 아직 못 채웠을 때 — 끊김 경고 */}
        {streak > 0 && !cleared && (
          <p className="mt-1.5 rounded-md bg-[var(--color-danger)]/10 px-2.5 py-1.5 text-center text-xs font-bold text-[var(--color-danger)]">
            오늘 클리어 못 하면 {streak}일 연속이 끊겨요
          </p>
        )}

        {/* 오늘의 한 마디 */}
        <p className="mt-3 border-t border-black/[0.05] pt-2.5 text-center text-[13px] text-[var(--color-muted)]">
          “{line}”
        </p>

        {/* 탭 안내 */}
        <p className="mt-1.5 text-center text-[11px] text-[var(--color-muted)]">탭해서 기록·도전과제 보기 ›</p>
      </section>

      {/* 승급 · 새 배지 축하 배너 */}
      {celebration && (
        <div className="reward-pop flex items-center gap-2 rounded-lg border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/12 px-4 py-3">
          <span className="reward-sparkle text-xl">{celebration.icon}</span>
          <div>
            <p className="text-xs text-[var(--color-amber-deep)]">
              {celebration.type === 'rank' ? '등급이 올랐어요!' : '도전과제 달성!'}
            </p>
            <p className="text-sm font-bold text-[var(--color-heading)]">{celebration.text}</p>
          </div>
        </div>
      )}

      {isSheetOpen && <AchievementsSheet data={data} onClose={() => setIsSheetOpen(false)} />}
    </>
  )
}
