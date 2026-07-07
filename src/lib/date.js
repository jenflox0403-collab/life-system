// 이 파일은 날짜 계산 도우미 담당

/** 오늘 날짜를 "2026-07-07" 형태로 반환 */
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 그 주(월~일) 7일간의 "YYYY-MM-DD" 키 배열 반환 */
export function weekDateKeys(date = new Date()) {
  const monday = new Date(date)
  const offset = (date.getDay() + 6) % 7 // 월=0
  monday.setDate(date.getDate() - offset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return todayKey(d)
  })
}

/** "7월 7일 (화)" 같은 한국어 표기 */
export function formatKorean(date = new Date()) {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`
}

/** "2026-07" 형태의 월 키 */
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** "2026-Q3" 형태의 분기 키 */
export function quarterKey(date = new Date()) {
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
}

/** "2026-W28" 형태의 ISO 주차 키 */
export function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** 해당 월의 일수 */
export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

/** 연·월·일 → "2026-07-07" 키 (monthIndex는 0부터) */
export function dateKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * 월간 달력 그리드 칸 배열 (일요일 시작).
 * 앞쪽 빈칸은 null, 날짜 칸은 { day, key }.
 */
export function monthGridCells(year, monthIndex) {
  const total = daysInMonth(year, monthIndex)
  const firstDay = new Date(year, monthIndex, 1).getDay() // 0=일
  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: total }, (_, i) => ({ day: i + 1, key: dateKey(year, monthIndex, i + 1) })),
  ]
}
