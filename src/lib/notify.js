// 이 파일은 알림(브라우저 Notification) 담당
// 앱이 켜져 있는 동안에만 동작해요 — 서버가 없어서 앱을 완전히 끄면 알림을 못 보내요.

import { load, save } from './storage.js'

// 알림 설정 기본값
export const DEFAULT_NOTIF = {
  on: false, // 사용자가 알림을 켰는지
  streakOn: true, // 저녁 스트릭 보호 알림
  streakTime: '21:00', // 그 알림 시각 (HH:MM)
  blockOn: true, // 타임블록 시작 알림
}

/** 알림 설정 불러오기 (기본값에 저장값을 덮어씀) */
export function loadNotif() {
  return { ...DEFAULT_NOTIF, ...load('notifSettings', {}) }
}

/** 알림 설정 저장 */
export function saveNotif(next) {
  save('notifSettings', next)
}

/** 현재 브라우저 알림 권한: 'granted' | 'denied' | 'default' | 'unsupported' */
export function notifPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

/** 권한 요청 — 반드시 버튼 클릭 같은 사용자 동작 안에서만 호출해야 함 */
export async function requestNotifPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

/** 알림 띄우기 — 서비스워커 우선(모바일 호환), 안 되면 생성자로 폴백 */
export async function fireNotification(title, body, tag) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const options = { body, tag, icon: './icon-192.png', badge: './icon-192.png' }
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      if (reg) {
        await reg.showNotification(title, options)
        return
      }
    }
  } catch {
    // 서비스워커 경로 실패 → 아래 생성자 폴백으로
  }
  try {
    const notification = new Notification(title, options)
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {
    // 모바일 등에서 생성자 자체가 막힌 경우 — 조용히 무시
  }
}

// ---- 시간 계산 헬퍼 (분 단위) ----

/** 지금 시각을 '자정부터 지난 분'으로 (예: 09:30 → 570) */
export function nowMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/** 'HH:MM' → 분 (예: '21:00' → 1260) */
export function hhmmToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number)
  return h * 60 + m
}

/** 분 → 'HH:MM' (예: 570 → '09:30') */
export function minutesToHHMM(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ---- 하루 한 번만 울리게 하는 발송 기록 ----
// notifFired = { [키]: 'YYYY-MM-DD' } — 오늘 날짜와 다르면 다시 울릴 수 있음

/** 이 키가 오늘 이미 울렸는지 */
export function alreadyFired(key, dayKey) {
  return load('notifFired', {})[key] === dayKey
}

/** 이 키를 오늘 울렸다고 기록 (지난 날짜 기록은 자동 청소해서 커지지 않게) */
export function markFired(key, dayKey) {
  const fired = load('notifFired', {})
  const pruned = {}
  for (const [k, v] of Object.entries(fired)) {
    if (v === dayKey) pruned[k] = v
  }
  pruned[key] = dayKey
  save('notifFired', pruned)
}
