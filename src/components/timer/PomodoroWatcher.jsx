import { useEffect } from 'react'
import { load, save } from '../../lib/storage.js'
import { todayKey } from '../../lib/date.js'
import { playAlarm } from '../../lib/beep.js'
import { usePomodoro, getPomodoro, setPomodoro } from '../../hooks/usePomodoro.js'

// 이 파일은 포모도로 "완료 감지" 담당 (화면엔 아무것도 안 그림)
// 어느 탭에 있든 시간이 다 되면: 집중이면 세션 적립(+긴 휴식 제안), 알림음/진동
function finishSession(state) {
  let nextPhase = 'focus'
  if (state.phase === 'focus') {
    const log = load('pomodoroLog', {})
    const today = todayKey()
    const count = (log[today] ?? 0) + 1
    save('pomodoroLog', { ...log, [today]: count })
    nextPhase = count % 4 === 0 ? 'long' : 'short' // 4세션마다 긴 휴식
  }
  setPomodoro({ status: 'idle', endsAt: null, remaining: null, phase: nextPhase })
  playAlarm()
}

export default function PomodoroWatcher() {
  const pomo = usePomodoro()

  useEffect(() => {
    if (pomo.status !== 'running') return
    // 앱을 닫았다 열었을 때 이미 끝난 세션도 여기서 정리됨
    const timer = setInterval(() => {
      const state = getPomodoro()
      if (state.status === 'running' && state.endsAt <= Date.now()) {
        finishSession(state)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [pomo.status])

  return null
}
