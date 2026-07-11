import { totalXp, levelFromXp, xpForDay, clearStreak, dailyLine, DAILY_TARGET } from '../../lib/rewards.js'
import { todayKey } from '../../lib/date.js'

// 이 파일은 오늘 탭 최상단 보상 카드 담당 (게임화)
// 레벨·XP바 + 오늘 클리어 게이지 + 연속 클리어 스트릭 + 오늘의 한 마디
export default function RewardBar({ todos, routineLog, timeblocks, habitLog, diary, surviveLog, goals, sos }) {
  const data = { todos, routineLog, timeblocks, habitLog, diary, surviveLog }
  const today = todayKey()

  const xp = totalXp(data)
  const { level, current, need } = levelFromXp(xp)
  const todayXp = xpForDay(today, data)
  const streak = clearStreak(data)
  const line = dailyLine(goals, sos, today)

  const cleared = todayXp >= DAILY_TARGET
  const gauge = Math.min(100, Math.round((todayXp / DAILY_TARGET) * 100))
  const levelPct = Math.round((current / need) * 100)

  return (
    <section className="sao-card p-4">
      {/* 레벨 + 누적 XP */}
      <div className="flex items-center gap-3">
        <span className="sao-en shrink-0 text-xl font-bold text-[var(--color-amber-deep)]">LV.{level}</span>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
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

      {/* 클리어 축하 + 스트릭 */}
      <div className="mt-2 flex items-center justify-between">
        {cleared ? (
          <span className="reward-pop text-sm font-bold text-[var(--color-amber-deep)]">
            <span className="reward-sparkle">✦</span> 오늘 클리어!
          </span>
        ) : (
          <span className="text-xs text-[var(--color-muted)]">할 일·루틴·블록을 완료하면 XP가 차요</span>
        )}
        {streak > 0 && (
          <span className="text-xs font-bold text-[var(--color-amber-deep)]">✦ {streak}일 연속 클리어</span>
        )}
      </div>

      {/* 오늘의 한 마디 */}
      <p className="mt-3 border-t border-black/[0.05] pt-2.5 text-center text-[13px] text-[var(--color-muted)]">
        “{line}”
      </p>
    </section>
  )
}
