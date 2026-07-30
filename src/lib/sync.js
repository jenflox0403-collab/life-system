// 이 파일은 폰↔컴퓨터 자동 동기화 담당 (Firebase Realtime DB에 REST로 접속)
// 안전 원칙: 함부로 덮어쓰지 않는다.
//  - 내가 안 바꿨고 클라우드가 더 최신일 때만 조용히 받기(앞으로감기)
//  - 양쪽 다 바뀌면 "충돌"로 보고 물어보기 (절대 자동으로 안 덮어씀)
//  - 덮어쓰기 직전엔 현재 데이터를 되돌리기용으로 백업
import {
  exportAll,
  importAll,
  load,
  save,
  setSuppressDirty,
  isDirty,
  clearDirty,
} from './storage.js'

// ── 설정(이 기기 전용, 클라우드로 안 올림): { on, dbUrl, code } ──
export function loadSyncCfg() {
  return { on: false, dbUrl: '', code: '', ...load('syncCfg', {}) }
}
export function saveSyncCfg(cfg) {
  // syncCfg는 STORE_KEYS에 없어서 "변경됨" 표시나 클라우드 업로드에 섞이지 않음
  save('syncCfg', cfg)
}

// 이 기기가 마지막으로 맞춰본 클라우드 버전 시각 (0 = 아직 한 번도 안 함)
function lastSeen() {
  return load('syncLastSeen', 0)
}
function setLastSeen(t) {
  save('syncLastSeen', t)
}
export function resetSyncState() {
  setLastSeen(0)
  clearDirty()
}

// 언제 마지막으로 동기화가 돌았는지 (화면 표시용 벽시계 시각)
export function lastRunAt() {
  return load('syncLastRun', 0)
}
function markRun() {
  save('syncLastRun', Date.now())
}

// ── Firebase REST 주소 만들기 ──
function vaultUrl(cfg) {
  const base = String(cfg.dbUrl).trim().replace(/\/+$/, '')
  return `${base}/vaults/${encodeURIComponent(String(cfg.code).trim())}.json`
}

// 클라우드에 올릴 데이터 한 덩어리 (기존 백업 형식 + 버전 시각)
function buildBlob() {
  return { ...exportAll(), updatedAt: Date.now() }
}

async function fetchRemote(cfg) {
  const res = await fetch(vaultUrl(cfg), { cache: 'no-store' })
  if (!res.ok) throw new Error(`클라우드 읽기 실패 (${res.status})`)
  return await res.json() // 비어 있으면 null
}

async function putRemote(cfg, blob) {
  const res = await fetch(vaultUrl(cfg), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blob),
  })
  if (!res.ok) throw new Error(`클라우드 저장 실패 (${res.status})`)
}

// ── 되돌리기(롤백) 백업 ──
function snapshotRollback() {
  save('syncRollback', exportAll())
}
export function hasRollback() {
  return load('syncRollback', null) != null
}
export function restoreRollback() {
  const snap = load('syncRollback', null)
  if (!snap) return false
  setSuppressDirty(true)
  const ok = importAll(snap)
  setSuppressDirty(false)
  return ok
}

// 클라우드 데이터를 이 기기에 반영(덮어쓰기). 반영 후엔 호출한 쪽에서 새로고침 필요.
function applyRemote(remote) {
  snapshotRollback() // 덮어쓰기 직전 현재 데이터 백업
  setSuppressDirty(true)
  importAll(remote)
  setSuppressDirty(false)
  setLastSeen(remote.updatedAt || Date.now())
  clearDirty()
  markRun()
}

async function push(cfg) {
  const blob = buildBlob()
  await putRemote(cfg, blob)
  setLastSeen(blob.updatedAt)
  clearDirty()
  markRun()
}

// 로컬에 (설정 말고) 실제 데이터가 들어 있는지
function hasLocalData() {
  return countItems(exportAll().data) > 0
}

function countItems(data) {
  let n = 0
  for (const [key, value] of Object.entries(data || {})) {
    if (key === 'settings') continue
    if (Array.isArray(value)) n += value.length
    else if (value && typeof value === 'object') n += Object.keys(value).length
  }
  return n
}
export function localSummary() {
  return countItems(exportAll().data)
}
export function remoteSummary(remote) {
  return countItems(remote?.data)
}

/**
 * 한 번 동기화 시도. 절대 함부로 덮어쓰지 않음.
 * 반환 status: off | in-sync | pushed | pulled | conflict | error
 */
export async function syncNow() {
  const cfg = loadSyncCfg()
  if (!cfg.on || !cfg.dbUrl || !cfg.code) return { status: 'off' }

  let remote
  try {
    remote = await fetchRemote(cfg)
  } catch (error) {
    return { status: 'error', message: error.message }
  }

  const firstRun = lastSeen() === 0

  try {
    // 1) 클라우드가 비어 있음 → 이 기기 데이터를 최초 업로드
    if (!remote || typeof remote.updatedAt !== 'number') {
      await push(cfg)
      return { status: 'pushed' }
    }

    // 2) 이 기기에서 처음 맞춰보는 경우 (가장 위험한 순간)
    if (firstRun) {
      if (!hasLocalData()) {
        applyRemote(remote) // 이 기기가 비었으면 안전하게 받기
        return { status: 'pulled' }
      }
      return { status: 'conflict', remote } // 양쪽 다 데이터 → 물어보기
    }

    // 3) 클라우드가 내가 마지막으로 본 버전과 같은가?
    const changed = remote.updatedAt !== lastSeen()
    if (!changed) {
      if (isDirty()) {
        await push(cfg) // 클라우드는 그대로인데 내가 바꿈 → 안전하게 올리기
        return { status: 'pushed' }
      }
      markRun()
      return { status: 'in-sync' }
    }

    // 4) 클라우드가 바뀜
    if (!isDirty()) {
      applyRemote(remote) // 나는 안 바꿈 → 안전한 앞으로감기
      return { status: 'pulled' }
    }
    return { status: 'conflict', remote } // 양쪽 다 바뀜 → 물어보기
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}

// ── 충돌 해결 ──
/** 이 기기 걸 클라우드에 올림 (클라우드 덮어씀) */
export async function resolveUseLocal() {
  await push(loadSyncCfg())
}
/** 클라우드 걸 이 기기에 받음 (이 기기 덮어씀, 되돌리기 백업 후) — 이후 새로고침 필요 */
export function resolveUseRemote(remote) {
  applyRemote(remote)
}
