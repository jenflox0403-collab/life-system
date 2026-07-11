// 이 파일은 타이머 완료 알림(소리·진동) 담당
// 브라우저 정책상 소리는 사용자가 버튼을 누른 뒤에만 낼 수 있어서,
// 타이머 "시작" 시 initAudio()를 미리 불러 준비해둡니다.

let ctx = null

/** 타이머 시작 시 호출 — 오디오 사용 준비 (사용자 제스처 안에서) */
export function initAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    ctx = ctx ?? new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
  } catch {
    // 소리가 안 되는 환경이어도 타이머는 정상 동작
  }
}

/** 세션 완료 알림 — 삐빅 3번 + 진동(지원 기기만) */
export function playAlarm() {
  try {
    if (ctx && ctx.state === 'running') {
      const beeps = [0, 0.28, 0.56]
      for (const t of beeps) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        const at = ctx.currentTime + t
        gain.gain.setValueAtTime(0.001, at)
        gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.22)
        osc.start(at)
        osc.stop(at + 0.24)
      }
    }
  } catch {
    // 무음 환경 무시
  }
  try {
    navigator.vibrate?.([200, 100, 200])
  } catch {
    // 진동 미지원 무시 (아이폰 등)
  }
}
