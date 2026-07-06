// 이 파일은 localStorage 금고 관리인 담당
// 모든 데이터 저장/불러오기는 반드시 이 파일을 통해서만 합니다.

const PREFIX = 'lifesystem:'

// 앱이 사용하는 모든 데이터 칸 목록 (기획서 데이터 모델 기준)
export const STORE_KEYS = [
  'settings',
  'routines',
  'routineLog',
  'habits',
  'habitLog',
  'goals',
  'todos',
  'timeblocks',
  'events',
  'content',
  'delegation',
  'metrics',
  'diary',
  'prayers',
  'pomodoroLog',
]

/** 데이터 불러오기. 없거나 깨져 있으면 fallback을 돌려줌 */
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (error) {
    console.error(`[storage] ${key} 불러오기 실패:`, error)
    return fallback
  }
}

/** 데이터 저장하기. 성공하면 true */
export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`[storage] ${key} 저장 실패:`, error)
    return false
  }
}

/** 모든 데이터를 하나의 객체로 모아서 반환 (백업용) */
export function exportAll() {
  const data = {}
  for (const key of STORE_KEYS) {
    const value = load(key, null)
    if (value !== null) data[key] = value
  }
  return {
    app: 'life-system-dashboard',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
}

/** 백업 객체를 검증하고 전체 복원. 성공하면 true */
export function importAll(backup) {
  if (!backup || backup.app !== 'life-system-dashboard' || typeof backup.data !== 'object') {
    return false
  }
  for (const key of STORE_KEYS) {
    if (key in backup.data) save(key, backup.data[key])
  }
  return true
}
