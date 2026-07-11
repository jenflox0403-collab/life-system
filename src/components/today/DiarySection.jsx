import { MOODS } from '../../lib/moods.js'

// 이 파일은 오늘 탭 하단 짧은 일기(3~4줄) + 기분 선택 담당
// 저장은 diary 저장소(날짜별)에 함 — 기록 탭과 데이터 공유
export default function DiarySection({ value, mood, onChange, onChangeMood }) {
  return (
    <section className="sao-card p-5">
      <h3 className="sao-title mb-3 font-bold">한 줄 일기</h3>

      {/* 오늘 기분 (탭하면 선택/해제) */}
      <div className="mb-2.5 flex gap-1.5">
        {MOODS.map((m) => {
          const active = m.id === mood
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMood(active ? '' : m.id)}
              aria-label={m.label}
              title={m.label}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition active:scale-90 ${
                active ? 'scale-110' : 'opacity-45 grayscale'
              }`}
              style={active ? { background: `${m.color}22`, boxShadow: `0 0 0 2px ${m.color}` } : {}}
            >
              {m.emoji}
            </button>
          )
        })}
      </div>

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
