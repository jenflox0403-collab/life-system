// 이 파일은 일기 "기분" 정의 담당 (기록 탭 그래프와 짝)

export const MOODS = [
  { id: 'best', emoji: '😄', label: '최고', score: 5, color: '#e3a93c' },
  { id: 'good', emoji: '🙂', label: '좋음', score: 4, color: '#4cc38a' },
  { id: 'ok', emoji: '😐', label: '보통', score: 3, color: '#4a9bc9' },
  { id: 'bad', emoji: '😕', label: '별로', score: 2, color: '#9d7fe0' },
  { id: 'hard', emoji: '😞', label: '힘듦', score: 1, color: '#c9536e' },
]

export function moodDef(id) {
  return MOODS.find((m) => m.id === id) ?? null
}
