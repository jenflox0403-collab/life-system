// 이 파일은 타임블록 색 팔레트 + 시간 라벨 담당
// (예전 "카테고리(업무/콘텐츠…)" 개념은 없앰 — 이제 원하는 파스텔 색을 직접 고름)

// 파스텔 10색 — 아주 연한 톤 (어두운 글자가 잘 보임)
export const BLOCK_PALETTE = [
  { id: 'rose', color: '#ffe6e8' },
  { id: 'peach', color: '#ffeedd' },
  { id: 'butter', color: '#fdf5cf' },
  { id: 'lime', color: '#eaf6d8' },
  { id: 'mint', color: '#dcf3ea' },
  { id: 'sky', color: '#ddeff8' },
  { id: 'blue', color: '#e5ebfc' },
  { id: 'lavender', color: '#efe7fc' },
  { id: 'pink', color: '#fbe7f6' },
  { id: 'greige', color: '#f1eee4' },
]

// 파스텔 위에 얹는 글자색 (테마 무관 고정, 밝은 배경용 진한 갈색)
export const BLOCK_TEXT = '#4a4436'

// 예전 카테고리로 만든 블록도 색이 비지 않게 파스텔로 매핑
const LEGACY_CAT = {
  work: '#ddeff8',
  content: '#fbe7f6',
  study: '#e5ebfc',
  exercise: '#eaf6d8',
  faith: '#efe7fc',
  personal: '#ffeedd',
  buffer: '#f1eee4',
}

/** 블록의 표시 색: 직접 고른 색 → (옛 블록)카테고리 매핑 → 기본 파스텔 */
export function blockColor(block) {
  if (block?.color) return block.color
  if (block?.category && LEGACY_CAT[block.category]) return LEGACY_CAT[block.category]
  return BLOCK_PALETTE[0].color
}

/** 분(360) → "06:00" 표기. 자정을 넘어가면(1440분 이상) 0·1·2시로 감싸서 표기 */
export function minutesToLabel(min) {
  const h = String(Math.floor(min / 60) % 24).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}
