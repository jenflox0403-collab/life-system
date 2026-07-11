import { useSyncExternalStore } from 'react'
import { load, save } from '../lib/storage.js'

// 이 파일은 포모도로 타이머의 "공유 상태" 담당
// 일반 useState와 달리 앱 어디서든(타이머 탭·미니 타이머) 같은 상태를 실시간 공유하고,
// 종료 "시각"을 저장하므로 탭 이동·새로고침에도 시간이 끊기지 않아요.

const KEY = 'pomodoro'

const DEFAULT = {
  phase: 'focus', // focus | short | long
  status: 'idle', // idle | running | paused
  endsAt: null, // running일 때 종료 시각(ms)
  remaining: null, // paused일 때 남은 초
  focusText: '', // 집중 대상
  durations: { focus: 25, short: 5, long: 15 }, // 분
}

const stored = load(KEY, {})
let state = { ...DEFAULT, ...stored, durations: { ...DEFAULT.durations, ...(stored.durations ?? {}) } }

const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPomodoro() {
  return state
}

/** 상태 갱신 (부분 패치 또는 함수). 저장 + 모든 구독 컴포넌트에 알림 */
export function setPomodoro(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  save(KEY, state)
  for (const listener of listeners) listener()
}

/** 컴포넌트에서 포모도로 상태 구독 */
export function usePomodoro() {
  return useSyncExternalStore(subscribe, getPomodoro)
}

/** 현재 남은 초 계산 */
export function remainingSeconds(s = state) {
  if (s.status === 'running') return Math.max(0, Math.round((s.endsAt - Date.now()) / 1000))
  if (s.status === 'paused') return s.remaining ?? 0
  return (s.durations[s.phase] ?? 25) * 60
}
