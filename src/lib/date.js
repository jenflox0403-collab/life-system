// 이 파일은 날짜 계산 도우미 담당

/** 오늘 날짜를 "2026-07-07" 형태로 반환 */
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "7월 7일 (화)" 같은 한국어 표기 */
export function formatKorean(date = new Date()) {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`
}
