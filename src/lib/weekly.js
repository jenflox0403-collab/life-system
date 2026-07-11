import { load } from './storage.js'
import { xpForDay, DAILY_TARGET } from './rewards.js'

// 이 파일은 주간 리뷰 계산 담당 — 한 주(월~일) 기록을 숫자로 요약

/** 저장소에서 한 주 치 데이터를 모아 요약 (매번 새로 읽어서 최신 상태 보장) */
export function summarizeWeek(days) {
  const data = {
    todos: load('todos', []),
    routineLog: load('routineLog', {}),
    timeblocks: load('timeblocks', {}),
    habitLog: load('habitLog', {}),
    diary: load('diary', {}),
    pomodoroLog: load('pomodoroLog', {}),
  }

  let todosDone = 0
  let routineChecks = 0
  let blocksDone = 0
  let habitChecks = 0
  let pomodoros = 0
  let diaryDays = 0
  let xp = 0
  let clearedDays = 0
  const moods = []

  for (const day of days) {
    todosDone += data.todos.filter((t) => t.date === day && t.done).length
    const dayLog = data.routineLog[day] ?? {}
    for (const type of ['morning', 'evening']) {
      routineChecks += Object.values(dayLog[type] ?? {}).filter(Boolean).length
    }
    blocksDone += (data.timeblocks[day] ?? []).filter((b) => b.done).length
    habitChecks += Object.values(data.habitLog[day] ?? {}).filter(Boolean).length
    pomodoros += data.pomodoroLog[day] ?? 0

    const entry = data.diary[day]
    if ((entry?.text ?? '').trim()) diaryDays += 1
    if (entry?.mood) moods.push(entry.mood)

    const dayXp = xpForDay(day, data)
    xp += dayXp
    if (dayXp >= DAILY_TARGET) clearedDays += 1
  }

  return { todosDone, routineChecks, blocksDone, habitChecks, pomodoros, diaryDays, moods, xp, clearedDays }
}

/** "2026-07-06" → "7월 6일" 짧은 표기 */
export function shortDate(key) {
  const [, m, d] = key.split('-').map(Number)
  return `${m}월 ${d}일`
}

/** 주 범위 라벨: "7월 6일 ~ 7월 12일" */
export function weekRangeLabel(startKey, endKey) {
  return `${shortDate(startKey)} ~ ${shortDate(endKey)}`
}
