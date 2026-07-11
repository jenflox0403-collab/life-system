import { todayKey } from './date.js'
import { DEFAULT_LINES } from './sosContent.js'

// 이 파일은 게임화(XP·레벨·스트릭) 계산 담당
// XP는 별도 저장 없이, 이미 기록된 완료 데이터에서 매번 계산해요 (이중 적립·꼬임 없음)

// 행동별 XP
export const XP = {
  todo: 10, // 할 일 완료
  routineItem: 5, // 루틴 항목 체크
  timeblock: 10, // 타임블록 완료
  habit: 10, // 습관 체크
  survive: 20, // 충동 버텨냄 (SOS 타이머 완주)
}

// 하루 클리어 목표 XP
export const DAILY_TARGET = 80

/** 특정 날짜에 번 XP (충동 버텨냄은 월 단위 기록이라 여기엔 미포함) */
export function xpForDay(dateKey, data) {
  const { todos = [], routineLog = {}, timeblocks = {}, habitLog = {} } = data
  let xp = 0
  xp += todos.filter((t) => t.date === dateKey && t.done).length * XP.todo
  const dayLog = routineLog[dateKey] ?? {}
  for (const type of ['morning', 'evening']) {
    xp += Object.values(dayLog[type] ?? {}).filter(Boolean).length * XP.routineItem
  }
  xp += (timeblocks[dateKey] ?? []).filter((b) => b.done).length * XP.timeblock
  xp += Object.values(habitLog[dateKey] ?? {}).filter(Boolean).length * XP.habit
  return xp
}

/** 전체 누적 XP (지금까지의 모든 기록 + 충동 버텨냄) */
export function totalXp(data) {
  const dates = new Set()
  for (const t of data.todos ?? []) if (t.done && t.date) dates.add(t.date)
  for (const key of Object.keys(data.routineLog ?? {})) dates.add(key)
  for (const key of Object.keys(data.timeblocks ?? {})) dates.add(key)
  for (const key of Object.keys(data.habitLog ?? {})) dates.add(key)

  let xp = 0
  for (const date of dates) xp += xpForDay(date, data)
  for (const count of Object.values(data.surviveLog ?? {})) xp += count * XP.survive
  return xp
}

/** 누적 XP → 레벨. 다음 레벨까지 필요한 양은 조금씩 늘어남 (LV1→2는 100, 그다음 +50씩) */
export function levelFromXp(xp) {
  let level = 1
  let remaining = xp
  let need = 100
  while (remaining >= need) {
    remaining -= need
    level += 1
    need = 100 + (level - 1) * 50
  }
  return { level, current: remaining, need }
}

/** 통합 스트릭: "하루 클리어(목표 XP 달성)"를 며칠 연속했는지 (오늘 미달이면 어제부터 셈) */
export function clearStreak(data) {
  let count = 0
  const cursor = new Date()
  if (xpForDay(todayKey(cursor), data) < DAILY_TARGET) cursor.setDate(cursor.getDate() - 1)
  while (xpForDay(todayKey(cursor), data) >= DAILY_TARGET) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
    if (count > 3650) break // 안전장치
  }
  return count
}

/** 오늘의 한 마디 — 날짜 기준으로 고정 선택 (하루 종일 같은 문구, 내 앵커 > 계획 선언문 > 기본) */
export function dailyLine(goals, sos, dateKey) {
  const year = Number(dateKey.slice(0, 4))
  const planDecls = (goals?.meta?.[year]?.declarations ?? []).map((d) => d.text)
  const mine = [...(sos?.declarations ?? []), ...(sos?.motivations ?? [])].map((d) => d.text)
  const pool = mine.length > 0 ? mine : planDecls.length > 0 ? planDecls : DEFAULT_LINES

  // 날짜 문자열로 간단한 해시 → 매일 다른(하지만 그날은 고정된) 문구
  let hash = 0
  for (const ch of dateKey) hash = (hash * 31 + ch.charCodeAt(0)) % 100000
  return pool[hash % pool.length]
}
