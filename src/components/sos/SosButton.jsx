// 이 파일은 SOS 플로팅 버튼(FAB) 담당 — 어느 탭에서든 항상 우하단에 떠 있음
// 충동이 들 때 즉시 누를 수 있게 눈에 띄되 자극적이지 않은 톤(조용한 숨쉬기 그림자)
export default function SosButton({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      aria-label="SOS · 충동이 들 때 누르기"
      className="sos-fab fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white transition active:scale-90"
      style={{ background: 'var(--color-danger)' }}
    >
      <span className="sao-en text-[15px] font-bold">SOS</span>
    </button>
  )
}
