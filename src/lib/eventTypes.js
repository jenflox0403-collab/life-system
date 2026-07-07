// 이 파일은 달력 일정의 "유형" 정의 담당
// 색은 index.css의 --evt-* 변수와 짝을 이룹니다.

export const EVENT_TYPES = [
  { id: 'ad', label: '광고건', color: 'var(--evt-ad)' },
  { id: 'plan', label: '기획안', color: 'var(--evt-plan)' },
  { id: 'meeting', label: '미팅', color: 'var(--evt-meeting)' },
  { id: 'personal', label: '개인일정', color: 'var(--evt-personal)' },
  { id: 'delegate', label: '위임사항', color: 'var(--evt-delegate)' },
]

/** 유형 id로 정의 객체 찾기 (없으면 개인일정으로 처리) */
export function eventType(id) {
  return EVENT_TYPES.find((t) => t.id === id) ?? EVENT_TYPES[3]
}

/** 유형 id → 색 */
export function eventColor(id) {
  return eventType(id).color
}

/**
 * 이 일정이 특정 날짜(key = "YYYY-MM-DD")를 포함하는지.
 * endDate가 없으면 하루짜리. 날짜 키는 문자열 비교로 정확히 대소 판정됨.
 */
export function eventCoversDay(event, key) {
  const start = event.date
  const end = event.endDate || event.date
  return start <= key && key <= end
}
