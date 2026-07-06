// 이 파일은 아직 만들지 않은 탭의 "공사 중" 안내판 담당
export default function Placeholder({ title, description }) {
  return (
    <section className="flex flex-col items-center justify-center gap-2 sao-card px-6 py-16 text-center">
      <p className="text-3xl">🚧</p>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="text-sm text-[var(--color-muted)]">{description}</p>
    </section>
  )
}
