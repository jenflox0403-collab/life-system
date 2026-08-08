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
  'pomodoro',
  'sos',
  'ideas',
  'mandalart',
  'weeklyReviews',
  'badgesSeen',
  'rankSeen',
  'reminders',
  'notifSettings',
  'meditation',
  'dday',
  'weekPlan',
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
    // 동기화용: 실제 데이터(STORE_KEYS)가 바뀌면 "이 기기에서 바꿈" 표시
    // (동기화 설정/메타 키는 STORE_KEYS에 없으므로 표시되지 않음)
    if (!suppressDirty && STORE_KEYS.includes(key)) markDirty()
    return true
  } catch (error) {
    console.error(`[storage] ${key} 저장 실패:`, error)
    return false
  }
}

// ── 동기화용 변경 감지 ──────────────────────────────
// 클라우드에서 받은 데이터를 반영하는 동안엔 "변경됨" 표시가 켜지면 안 되므로 잠시 끔
let suppressDirty = false
export function setSuppressDirty(value) {
  suppressDirty = value
}
export function markDirty() {
  try {
    localStorage.setItem(PREFIX + 'syncDirty', '1')
  } catch {
    /* 저장 실패해도 앱 동작엔 지장 없음 */
  }
}
export function clearDirty() {
  try {
    localStorage.removeItem(PREFIX + 'syncDirty')
  } catch {
    /* 무시 */
  }
}
export function isDirty() {
  return localStorage.getItem(PREFIX + 'syncDirty') === '1'
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
