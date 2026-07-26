import { useEffect } from 'react'
import { load } from '../../lib/storage.js'
import { todayKey } from '../../lib/date.js'
import { xpForDay, clearStreak, DAILY_TARGET } from '../../lib/rewards.js'
import {
  loadNotif,
  notifPermission,
  fireNotification,
  nowMinutes,
  hhmmToMinutes,
  alreadyFired,
  markFired,
} from '../../lib/notify.js'

// 이 파일은 알림 감시자 담당 — 앱이 켜져 있는 동안 30초마다 시각을 확인해 알림을 띄움
// 화면에는 아무것도 안 그림(null). App.jsx에 항상 장착돼서 백그라운드로 돎.

const TICK_MS = 30000 // 30초마다 확인
const BLOCK_GRACE = 10 // 타임블록: 시작 후 10분 이내에만 (지난 블록 무더기 알림 방지)
const REMINDER_GRACE = 15 // 직접 리마인더: 예정 시각 후 15분 이내에만

// xpForDay·clearStreak 계산에 필요한 데이터만 매번 새로 읽음
function readData() {
  return {
    todos: load('todos', []),
    routineLog: load('routineLog', {}),
    timeblocks: load('timeblocks', {}),
    habitLog: load('habitLog', {}),
    diary: load('diary', {}),
    pomodoroLog: load('pomodoroLog', {}),
  }
}

export default function NotificationWatcher() {
  useEffect(() => {
    function check() {
      if (notifPermission() !== 'granted') return
      const notif = loadNotif()
      if (!notif.on) return

      const day = todayKey()
      const now = nowMinutes()

      // 1) 저녁 스트릭 보호 — 정한 시각 이후, 오늘 아직 클리어 못 했으면
      if (notif.streakOn && now >= hhmmToMinutes(notif.streakTime) && !alreadyFired('streak', day)) {
        const data = readData()
        if (xpForDay(day, data) < DAILY_TARGET) {
          const streak = clearStreak(data)
          const body =
            streak > 0
              ? `오늘 클리어 못 하면 🔥${streak}일 연속이 끊겨요!`
              : '오늘 아직 클리어 전이에요. 지금 하나만 시작해볼까요?'
          fireNotification('라이프 시스템', body, 'streak')
          markFired('streak', day)
        }
        // 이미 클리어했으면 발송·기록 안 함(다음날 다시 판단)
      }

      // 2) 타임블록 시작 — 시작 시각 근처(실시간)일 때만
      if (notif.blockOn) {
        for (const block of load('timeblocks', {})[day] ?? []) {
          if (typeof block.start !== 'number' || block.done) continue
          const key = `block-${block.start}` // 시작 분은 하루 안에서 유일 → 안정적 키
          if (now >= block.start && now - block.start <= BLOCK_GRACE && !alreadyFired(key, day)) {
            fireNotification('타임블록 시작', `지금 «${block.title || '블록'}» 시간이에요`, key)
            markFired(key, day)
          }
        }
      }

      // 3) 직접 리마인더 — 예정 시각 근처일 때만
      for (const reminder of load('reminders', [])) {
        if (!reminder.on || !reminder.time) continue
        const target = hhmmToMinutes(reminder.time)
        const key = `reminder-${reminder.id}`
        if (now >= target && now - target <= REMINDER_GRACE && !alreadyFired(key, day)) {
          fireNotification('리마인더', reminder.text || '리마인더', key)
          markFired(key, day)
        }
      }
    }

    check() // 마운트 즉시 한 번 확인
    const timer = setInterval(check, TICK_MS)
    return () => clearInterval(timer)
  }, [])

  return null
}
