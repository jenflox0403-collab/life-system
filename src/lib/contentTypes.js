// 이 파일은 콘텐츠 파이프라인의 "단계 / 형태 / 담당" 정의 담당

// 칸반 단계 (아이디어 → 업로드완료)
export const STAGES = [
  { id: 'idea', label: '아이디어' },
  { id: 'plan', label: '기획' },
  { id: 'shoot', label: '촬영' },
  { id: 'edit', label: '편집' },
  { id: 'done', label: '업로드완료' },
]

// 콘텐츠 형태 (색은 카드 왼쪽 띠/배지에 사용)
export const FORMATS = [
  { id: 'long', label: '롱폼', color: '#3ba7dc' },
  { id: 'short', label: '숏폼', color: '#e0426a' },
  { id: 'feed', label: '피드', color: '#9d7fe0' },
  { id: 'longshort', label: '롱+숏', color: '#2fc4be' },
]

// 담당
export const OWNERS = [
  { id: 'me', label: '나' },
  { id: 'editor', label: '편집자' },
]

export function stageLabel(id) {
  return STAGES.find((s) => s.id === id)?.label ?? '아이디어'
}

export function stageIndex(id) {
  const i = STAGES.findIndex((s) => s.id === id)
  return i === -1 ? 0 : i
}

/** 다음/이전 단계 id (끝이면 null) */
export function adjacentStage(id, dir) {
  const next = stageIndex(id) + dir
  return STAGES[next]?.id ?? null
}

export function formatDef(id) {
  return FORMATS.find((f) => f.id === id) ?? FORMATS[0]
}

export function formatColor(id) {
  return formatDef(id).color
}

export function ownerLabel(id) {
  return OWNERS.find((o) => o.id === id)?.label ?? '나'
}
