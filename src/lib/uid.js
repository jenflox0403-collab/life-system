// 이 파일은 고유 ID 생성 담당
// crypto.randomUUID가 없는 구형 브라우저에서도 작동하도록 대체 방식 포함
export function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
