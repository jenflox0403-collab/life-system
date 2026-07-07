// 이 파일은 달력 일정의 "유형"과 "진행 상태" 정의 담당
// 색은 index.css의 --evt-* 변수와 짝을 이룹니다.

export const EVENT_TYPES = [
  { id: 'ad', label: '광고/협찬', color: 'var(--evt-ad)', hasDeal: true },
  { id: 'collab', label: '협업', color: 'var(--evt-collab)', hasDeal: true },
  { id: 'meeting', label: '미팅', color: 'var(--evt-meeting)', hasDeal: false },
  { id: 'personal', label: '개인', color: 'var(--evt-personal)', hasDeal: false },
]

// 광고·협업 일정의 진행 상태 (앞에서 뒤로 진행)
export const DEAL_STATUSES = ['문의', '협상', '확정', '진행', '정산완료']

/** 유형 id로 정의 객체 찾기 (없으면 개인으로 처리) */
export function eventType(id) {
  return EVENT_TYPES.find((t) => t.id === id) ?? EVENT_TYPES[3]
}

/** 유형 id → 색 */
export function eventColor(id) {
  return eventType(id).color
}

/** 이 유형이 브랜드명·진행상태 필드를 갖는지 (광고/협업만) */
export function hasDeal(id) {
  return eventType(id).hasDeal
}

/** 정산 대기 = 광고·협업이고 "진행" 단계(일은 됐고 돈 대기)인 건 */
export function isAwaitingSettlement(event) {
  return hasDeal(event.type) && event.status === '진행'
}
