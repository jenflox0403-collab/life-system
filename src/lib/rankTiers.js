// 이 파일은 등급 테마 "빛의 길" 담당 (잠언 4:18)
// 레벨 숫자 위에 입히는 격 — 어둠에서 시작해 점점 밝아져 한낮의 광명에 이름

// from: 이 레벨부터 이 등급 (아래에서 위로 밝아짐)
export const LIGHT_TIERS = [
  { from: 1, name: '첫 빛', icon: '🕯️' },
  { from: 4, name: '새벽', icon: '🌒' },
  { from: 8, name: '여명', icon: '🌄' },
  { from: 13, name: '아침 햇살', icon: '🌤️' },
  { from: 19, name: '떠오르는 해', icon: '🌅' },
  { from: 27, name: '한낮의 빛', icon: '☀️' },
  { from: 37, name: '광명', icon: '🌟' },
]

// 잠언 4:18 — 등급 화면에 은은히 노출
export const LIGHT_VERSE = '의인의 길은 돋는 햇살 같아서 크게 빛나 한낮의 광명에 이르느니라 (잠언 4:18)'

/** 레벨 → 현재 등급 + 다음 등급까지 필요한 레벨 */
export function tierFromLevel(level) {
  let index = 0
  for (let i = 0; i < LIGHT_TIERS.length; i += 1) {
    if (level >= LIGHT_TIERS[i].from) index = i
  }
  const tier = LIGHT_TIERS[index]
  const nextTier = LIGHT_TIERS[index + 1] ?? null
  return {
    index,
    name: tier.name,
    icon: tier.icon,
    nextName: nextTier?.name ?? null,
    nextAtLevel: nextTier?.from ?? null,
  }
}
