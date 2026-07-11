// 이 파일은 SOS 화면의 문구·설정 데이터 담당 (로직과 카피 분리)

// 허브 상단 안심 문구 (자기자비 — 수치심 소용돌이/RSD 완화)
export const REASSURANCE = '괜찮아요. 하루를 망친 게 아니에요.\n잠깐 멈췄다 다시 가면 돼요.'

// 호흡: 4-4-4-4 박스호흡 (단계별 초). scale은 원 크기(들숨 때 커짐)
export const BREATH_PHASES = [
  { label: '들이쉬기', seconds: 4, scale: 1.6 },
  { label: '잠깐 멈춤', seconds: 4, scale: 1.6 },
  { label: '내쉬기', seconds: 4, scale: 1 },
  { label: '잠깐 멈춤', seconds: 4, scale: 1 },
]
export const BREATH_CYCLES = 4 // 약 1분

// 그라운딩 5-4-3-2-1 (감각으로 현재에 닻 내리기)
export const GROUNDING_STEPS = [
  { count: 5, sense: '보이는 것', hint: '눈에 들어오는 것 5가지를 천천히 찾아봐요' },
  { count: 4, sense: '들리는 것', hint: '지금 들리는 소리 4가지에 귀 기울여요' },
  { count: 3, sense: '만져지는 것', hint: '손에 닿는 감촉 3가지를 느껴봐요' },
  { count: 2, sense: '냄새', hint: '맡을 수 있는 냄새 2가지를 찾아봐요' },
  { count: 1, sense: '맛', hint: '입 안의 맛이나 한 모금의 물 1가지' },
]

// 충동 지연 타이머 옵션(초) — 충동은 파도, 지나가게 두기(urge surfing)
export const URGE_DURATIONS = [
  { label: '90초', seconds: 90 },
  { label: '3분', seconds: 180 },
  { label: '5분', seconds: 300 },
]

// 몸 리셋 체크 (각성·도파민 조절)
export const BODY_RESET = [
  '물 한 잔 마시기',
  '일어서서 크게 기지개',
  '창밖을 20초 바라보기',
  '어깨 힘 빼고 크게 한숨',
]

// 선언문이 하나도 없을 때 보여줄 기본 격려문
export const DEFAULT_LINES = [
  '지금 이 순간, 나는 다시 선택할 수 있다.',
  '작게 시작해도 괜찮아. 한 걸음이면 충분해.',
  '완벽하지 않아도 나는 계속 나아간다.',
]
