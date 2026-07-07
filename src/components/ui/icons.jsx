// 이 파일은 SAO 스타일 아이콘 담당
// SAO 메뉴 글리프처럼 굵고 단단한 실루엣 느낌. currentColor로 색을 따라감.

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// 오늘 — 해 (가운데 꽉 찬 원)
export function IconToday(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4" />
    </svg>
  )
}

// 계획 — 과녁 (가운데 점 채움)
export function IconPlan(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

// 습관 — 두꺼운 체크
export function IconHabits(props) {
  return (
    <svg {...base} {...props} strokeWidth={3.2}>
      <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
    </svg>
  )
}

// 달력 — 채운 몸통 + 흰 줄
export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="currentColor" stroke="none" />
      <path d="M8 2.5v4M16 2.5v4" />
      <path d="M3.5 10.5h17" stroke="#fff" strokeWidth="2" />
      <path d="M7.5 14.5h3M13.5 14.5h3M7.5 17.5h3" stroke="#fff" strokeWidth="1.8" />
    </svg>
  )
}

// 콘텐츠 — 재생 (채운 삼각형)
export function IconContent(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M10 9l5.5 3-5.5 3V9z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

// 기록 — 책 (채운 표지)
export function IconJournal(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z" fill="currentColor" stroke="none" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" stroke="#fff" strokeWidth="2" fill="none" />
      <path d="M8.5 7.5h7M8.5 10.5h7" stroke="#fff" strokeWidth="1.8" />
    </svg>
  )
}

// 타이머 — 채운 시계
export function IconTimer(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13.5" r="7.5" fill="currentColor" stroke="none" />
      <path d="M12 13.5V9.5M12 13.5l2.8 1.8" stroke="#fff" strokeWidth="2.2" />
      <path d="M9.5 2.5h5" strokeWidth="2.5" />
    </svg>
  )
}

// 설정 — 톱니
export function IconSettings(props) {
  return (
    <svg {...base} {...props} strokeWidth={2}>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.2.61.76 1.05 1.42 1.09H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
