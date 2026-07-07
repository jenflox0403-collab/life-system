// 이 파일은 오늘 탭 하단 짧은 일기(3~4줄) 담당
// 저장은 diary 저장소(날짜별)에 함 — 나중에 기록 탭과 데이터 공유
export default function DiarySection({ value, onChange }) {
  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-3 font-bold">한 줄 일기</h3>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder="오늘 하루를 3~4줄로 기록해보세요."
        className="w-full resize-none rounded-[5px] border border-black/10 px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-[var(--color-accent)]"
      />
    </section>
  )
}
