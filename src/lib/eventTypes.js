// 이 파일은 달력 일정의 "유형" 정의 담당
// 색은 index.css의 --evt-* 변수와 짝을 이룹니다.

export const EVENT_TYPES = [
  { id: 'ad', label: '광고건', color: 'var(--evt-ad)' },
  { id: 'upload', label: '업로드', color: 'var(--evt-upload)' },
  { id: 'plan', label: '기획안', color: 'var(--evt-plan)' },
  { id: 'meeting', label: '미팅', color: 'var(--evt-meeting)' },
  { id: 'personal', label: '개인일정', color: 'var(--evt-personal)' },
  { id: 'delegate', label: '위임사항', color: 'var(--evt-delegate)' },
  { id: 'season', label: '시즌성', color: 'var(--evt-season)' },
  { id: 'etc', label: '기타', color: 'var(--evt-etc)' },
]

// 업로드 유형 안의 세부 종류 (플랫폼/형식) — 색은 안 늘리고 글자 라벨로만 구분
export const UPLOAD_KINDS = [
  { id: 'ig_feed', label: '인스타 피드' },
  { id: 'yt_post', label: '유튜브 게시물' },
  { id: 'ig_story', label: '인스타 스토리' },
  { id: 'yt_shorts', label: '유튜브 쇼츠' },
  { id: 'ig_reels', label: '인스타 릴스' },
  { id: 'reels_shorts', label: '릴스 & 쇼츠 동시' },
]

/** 세부 종류 id → 라벨 (없으면 빈 문자열) */
export function uploadKindLabel(id) {
  return UPLOAD_KINDS.find((k) => k.id === id)?.label ?? ''
}

/** 유형 id로 정의 객체 찾기 (없으면 개인일정으로 처리) */
export function eventType(id) {
  return EVENT_TYPES.find((t) => t.id === id) ?? EVENT_TYPES.find((t) => t.id === 'personal') ?? EVENT_TYPES[0]
}

/** 유형 id → 색 */
export function eventColor(id) {
  return eventType(id).color
}
