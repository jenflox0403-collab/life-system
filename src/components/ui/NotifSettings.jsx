import { useState } from 'react'
import { load, save } from '../../lib/storage.js'
import { uid } from '../../lib/uid.js'
import {
  loadNotif,
  saveNotif,
  notifPermission,
  requestNotifPermission,
  fireNotification,
} from '../../lib/notify.js'

// 이 파일은 설정 화면의 '알림' 섹션 담당
// 권한 켜기 → 저녁 스트릭 보호 / 타임블록 시작 / 직접 리마인더 각각 on·off

// 작은 on/off 스위치 (초록=켜짐)
function Toggle({ on, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? 'bg-[var(--color-accent)]' : 'bg-black/15'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? 'left-0.5 translate-x-5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function NotifSettings() {
  const [perm, setPerm] = useState(() => notifPermission())
  const [notif, setNotif] = useState(() => loadNotif())
  const [reminders, setReminders] = useState(() => load('reminders', []))

  const granted = perm === 'granted'

  // 설정 바꾸면 즉시 저장
  function updateNotif(patch) {
    const next = { ...notif, ...patch }
    setNotif(next)
    saveNotif(next)
  }

  function updateReminders(next) {
    setReminders(next)
    save('reminders', next)
  }

  // '알림 켜기' — 반드시 클릭 안에서 권한 요청
  async function enableNotifications() {
    const result = await requestNotifPermission()
    setPerm(result)
    if (result === 'granted') updateNotif({ on: true })
  }

  function addReminder() {
    updateReminders([...reminders, { id: uid(), time: '15:00', text: '', on: true }])
  }

  function patchReminder(id, patch) {
    updateReminders(reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeReminder(id) {
    updateReminders(reminders.filter((r) => r.id !== id))
  }

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--color-heading)]">알림</span>
        {granted && <Toggle on={notif.on} onClick={() => updateNotif({ on: !notif.on })} label="알림 사용" />}
      </div>

      {perm === 'unsupported' && (
        <p className="text-xs text-[var(--color-muted)]">이 브라우저는 알림을 지원하지 않아요.</p>
      )}

      {perm === 'denied' && (
        <p className="rounded-lg bg-black/[0.03] px-3 py-2 text-xs leading-relaxed text-[var(--color-muted)]">
          브라우저에서 알림이 차단돼 있어요. 주소창의 자물쇠 아이콘 → 알림 → “허용”으로 바꾼 뒤 새로고침해주세요.
        </p>
      )}

      {perm === 'default' && (
        <button onClick={enableNotifications} className="chip w-full !py-2.5">
          알림 켜기 (브라우저 권한 허용)
        </button>
      )}

      {/* 알림 종류 설정 — 권한 있고 켜졌을 때만 */}
      {granted && notif.on && (
        <div className="mt-3 flex flex-col gap-3">
          {/* 저녁 스트릭 보호 */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-[var(--color-heading)]">저녁 스트릭 보호</p>
              <p className="text-[11px] text-[var(--color-muted)]">오늘 클리어 안 했으면 연속 끊김 경고</p>
            </div>
            <div className="flex items-center gap-2">
              {notif.streakOn && (
                <input
                  type="time"
                  value={notif.streakTime}
                  onChange={(e) => updateNotif({ streakTime: e.target.value })}
                  className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs"
                />
              )}
              <Toggle on={notif.streakOn} onClick={() => updateNotif({ streakOn: !notif.streakOn })} label="저녁 스트릭 보호" />
            </div>
          </div>

          {/* 타임블록 시작 */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-[var(--color-heading)]">타임블록 시작 알림</p>
              <p className="text-[11px] text-[var(--color-muted)]">계획한 블록 시작 시각에 알림</p>
            </div>
            <Toggle on={notif.blockOn} onClick={() => updateNotif({ blockOn: !notif.blockOn })} label="타임블록 시작 알림" />
          </div>

          {/* 직접 리마인더 */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-sm text-[var(--color-heading)]">직접 리마인더</p>
              <button onClick={addReminder} className="text-xs font-bold text-[var(--color-accent)]">
                + 추가
              </button>
            </div>
            {reminders.length === 0 && (
              <p className="text-[11px] text-[var(--color-muted)]">추가한 리마인더가 없어요.</p>
            )}
            <div className="flex flex-col gap-2">
              {reminders.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={r.time}
                    onChange={(e) => patchReminder(r.id, { time: e.target.value })}
                    className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={r.text}
                    placeholder="예: 물 마시기"
                    onChange={(e) => patchReminder(r.id, { text: e.target.value })}
                    className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-2 py-1 text-xs"
                  />
                  <Toggle on={r.on} onClick={() => patchReminder(r.id, { on: !r.on })} label="리마인더 사용" />
                  <button
                    onClick={() => removeReminder(r.id)}
                    aria-label="리마인더 삭제"
                    className="shrink-0 px-1 text-lg leading-none text-[var(--color-muted)]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 테스트 */}
          <button
            onClick={() => fireNotification('테스트 알림', '알림이 이렇게 떠요 🔔', 'test')}
            className="mt-1 text-xs text-[var(--color-muted)] underline"
          >
            테스트 알림 보내기
          </button>
        </div>
      )}
    </div>
  )
}
