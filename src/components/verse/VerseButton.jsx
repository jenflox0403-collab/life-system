// 이 파일은 '말씀' 플로팅 버튼 담당 — SOS 버튼 바로 위에 항상 떠 있음
// 오늘의 묵상 구절을 언제든 꺼내 읊조릴 수 있게. SOS(빨강)와 톤을 달리한 금빛.
export default function VerseButton({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      aria-label="말씀 · 오늘의 묵상 읊조리기"
      className="fixed bottom-40 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_6px_18px_rgba(180,140,60,0.35)] transition active:scale-90"
      style={{ background: 'linear-gradient(145deg, var(--color-amber), var(--color-amber-deep))' }}
    >
      <span className="text-2xl">📖</span>
    </button>
  )
}
