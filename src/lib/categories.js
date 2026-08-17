// 이 파일은 타임블록 색 팔레트 + 시간 라벨 담당
// (예전 "카테고리(업무/콘텐츠…)" 개념은 없앰 — 이제 원하는 파스텔 색을 직접 고름)

// 파스텔 10색 — 밝아서 어두운 글자가 잘 보임
export const BLOCK_PALETTE = [
  { id: 'rose', color: '#ffd6d9' },
  { id: 'peach', color: '#ffe1c4' },
  { id: 'butter', color: '#fbecb6' },
  { id: 'lime', color: '#dcf0bd' },
  { id: 'mint', color: '#c4ecdc' },
  { id: 'sky', color: '#c6e6f5' },
  { id: 'blue', color: '#cfd9fb' },
  { id: 'lavender', color: '#e2d4fb' },
  { id: 'pink', color: '#f6d3ee' },
  { id: 'greige', color: '#e7e2d5' },
]

// 파스텔 위에 얹는 글자색 (테마 무관 고정, 밝은 배경용 진한 갈색)
export const BLOCK_TEXT = '#4a4436'

// 예전 카테고리로 만든 블록도 색이 비지 않게 파스텔로 매핑
const LEGACY_CAT = {
  work: '#c6e6f5',
  content: '#f6d3ee',
  study: '#cfd9fb',
  exercise: '#dcf0bd',
  faith: '#e2d4fb',
  personal: '#ffe1c4',
  buffer: '#e7e2d5',
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
