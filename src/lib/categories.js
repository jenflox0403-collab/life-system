// 이 파일은 타임블록 카테고리 정의 담당 (색상은 index.css의 --cat-* 변수와 짝)
export const CATEGORIES = [
  { id: 'work', label: '업무', color: 'var(--cat-work)' },
  { id: 'content', label: '콘텐츠', color: 'var(--cat-content)' },
  { id: 'exercise', label: '운동', color: 'var(--cat-exercise)' },
  { id: 'faith', label: '신앙', color: 'var(--cat-faith)' },
  { id: 'personal', label: '개인', color: 'var(--cat-personal)' },
  { id: 'buffer', label: '버퍼', color: 'var(--cat-buffer)' },
]

export function categoryColor(id) {
  return CATEGORIES.find((c) => c.id === id)?.color ?? 'var(--cat-buffer)'
}

/** 분(360) → "06:00" 표기 */
export function minutesToLabel(min) {
  const h = String(Math.floor(min / 60)).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}
