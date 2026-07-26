import { xpForDay, totalXp, levelFromXp, DAILY_TARGET } from './rewards.js'
import { weekKey } from './date.js'

// 이 파일은 도전과제(배지) + 최고 기록 계산 담당
// 배지·기록 모두 이미 저장된 기록에서 매번 계산 — 별도 저장 없음(꼬임·이중적립 없음)

/** 데이터에서 활동이 있었던 모든 날짜 키 모음 */
function activeDates(data) {
  const dates = new Set()
  for (const t of data.todos ?? []) if (t.done && t.date) dates.add(t.date)
  for (const key of Object.keys(data.routineLog ?? {})) dates.add(key)
  for (const key of Object.keys(data.timeblocks ?? {})) dates.add(key)
  for (const key of Object.keys(data.habitLog ?? {})) dates.add(key)
  for (const key of Object.keys(data.diary ?? {})) dates.add(key)
  for (const key of Object.keys(data.pomodoroLog ?? {})) dates.add(key)
  return dates
}

/** "2026-07-26" → Date 객체 */
function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "2026-07-26" → 정수(연속 판정용) */
function dayNumber(key) {
  return Math.floor(keyToDate(key).getTime() / 86400000)
}

/** 지금까지 가장 길었던 연속 클리어 일수 (역대 최장) */
function longestClearStreak(data) {
  const cleared = [...activeDates(data)]
    .filter((key) => xpForDay(key, data) >= DAILY_TARGET)
    .map(dayNumber)
    .sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev = null
  for (const n of cleared) {
    run = prev !== null && n === prev + 1 ? run + 1 : 1
    if (run > best) best = run
    prev = n
  }
  return best
}

/** 여러 지표를 한 번에 집계 */
export function aggregate(data) {
  const dates = activeDates(data)
  let todosDone = 0
  let routineChecks = 0
  let blocksDone = 0
  let habitChecks = 0
  let pomodoros = 0
  let diaryDays = 0
  let bestDayXp = 0
  const weekXp = {}

  for (const t of data.todos ?? []) if (t.done) todosDone += 1
  for (const day of dates) {
    const dayLog = (data.routineLog ?? {})[day] ?? {}
    for (const type of ['morning', 'evening']) {
      routineChecks += Object.values(dayLog[type] ?? {}).filter(Boolean).length
    }
    blocksDone += ((data.timeblocks ?? {})[day] ?? []).filter((b) => b.done).length
    habitChecks += Object.values((data.habitLog ?? {})[day] ?? {}).filter(Boolean).length
    pomodoros += (data.pomodoroLog ?? {})[day] ?? 0
    if (((data.diary ?? {})[day]?.text ?? '').trim()) diaryDays += 1

    const dayXp = xpForDay(day, data)
    if (dayXp > bestDayXp) bestDayXp = dayXp
    const wk = weekKey(keyToDate(day))
    weekXp[wk] = (weekXp[wk] ?? 0) + dayXp
  }

  const surviveCount = Object.values(data.surviveLog ?? {}).reduce((sum, n) => sum + n, 0)
  const bestWeekXp = Object.values(weekXp).reduce((max, v) => Math.max(max, v), 0)
  const level = levelFromXp(totalXp(data)).level

  return {
    todosDone,
    routineChecks,
    blocksDone,
    habitChecks,
    pomodoros,
    diaryDays,
    surviveCount,
    longestStreak: longestClearStreak(data),
    bestDayXp,
    bestWeekXp,
    level,
  }
}

// 배지 목록 — metric(집계값) >= target 이면 획득
export const BADGES = [
  { id: 'todo-first', icon: '👣', name: '첫걸음', group: '할 일', metric: (a) => a.todosDone, target: 1 },
  { id: 'todo-50', icon: '✍️', name: '부지런한 손', group: '할 일', metric: (a) => a.todosDone, target: 50 },
  { id: 'todo-100', icon: '💯', name: '백 번의 완수', group: '할 일', metric: (a) => a.todosDone, target: 100 },

  { id: 'streak-3', icon: '🔥', name: '사흘의 불꽃', group: '연속', metric: (a) => a.longestStreak, target: 3 },
  { id: 'streak-7', icon: '📅', name: '일주일 개근', group: '연속', metric: (a) => a.longestStreak, target: 7 },
  { id: 'streak-14', icon: '💪', name: '2주의 뚝심', group: '연속', metric: (a) => a.longestStreak, target: 14 },
  { id: 'streak-30', icon: '🏆', name: '한 달의 기적', group: '연속', metric: (a) => a.longestStreak, target: 30 },

  { id: 'diary-first', icon: '📖', name: '첫 마음', group: '일기', metric: (a) => a.diaryDays, target: 1 },
  { id: 'diary-30', icon: '🖋️', name: '기록하는 사람', group: '일기', metric: (a) => a.diaryDays, target: 30 },

  { id: 'pomo-first', icon: '⏱️', name: '첫 집중', group: '집중', metric: (a) => a.pomodoros, target: 1 },
  { id: 'pomo-25', icon: '🎯', name: '몰입의 맛', group: '집중', metric: (a) => a.pomodoros, target: 25 },
  { id: 'pomo-100', icon: '🧠', name: '집중의 대가', group: '집중', metric: (a) => a.pomodoros, target: 100 },

  { id: 'sos-first', icon: '🌊', name: '파도를 넘다', group: '충동', metric: (a) => a.surviveCount, target: 1 },
  { id: 'sos-10', icon: '⚓', name: '흔들리지 않는', group: '충동', metric: (a) => a.surviveCount, target: 10 },

  { id: 'routine-50', icon: '🌅', name: '아침을 여는 사람', group: '루틴', metric: (a) => a.routineChecks, target: 50 },
  { id: 'habit-100', icon: '🌿', name: '습관의 힘', group: '습관', metric: (a) => a.habitChecks, target: 100 },
  { id: 'block-50', icon: '🧱', name: '시간의 주인', group: '타임블록', metric: (a) => a.blocksDone, target: 50 },

  { id: 'tier-dawn', icon: '🌒', name: '새벽에 서다', group: '빛의 길', metric: (a) => a.level, target: 4 },
  { id: 'tier-morning', icon: '🌤️', name: '아침 햇살', group: '빛의 길', metric: (a) => a.level, target: 13 },
  { id: 'tier-noon', icon: '☀️', name: '한낮의 빛', group: '빛의 길', metric: (a) => a.level, target: 27 },
]

/** 각 배지에 획득 여부·진행도 붙여서 반환 */
export function evaluateBadges(agg) {
  return BADGES.map((badge) => {
    const value = badge.metric(agg)
    return {
      ...badge,
      unlocked: value >= badge.target,
      current: Math.min(value, badge.target),
    }
  })
}

/** 획득한 배지 id 목록 */
export function unlockedBadgeIds(agg) {
  return BADGES.filter((badge) => badge.metric(agg) >= badge.target).map((badge) => badge.id)
}
