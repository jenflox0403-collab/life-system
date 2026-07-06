import { useState } from 'react'
import { uid } from '../../lib/uid.js'

export const GOAL_CATEGORIES = ['커리어', '건강', '재정', '신앙', '자기계발', '관계']

// 이 파일은 계획 탭 > 연간 화면 담당 (키워드 + 선언문 + 분야별 목표)
export default function YearPlan({ year, goals, meta, onChangeGoals, onChangeMeta }) {
  const [goalText, setGoalText] = useState('')
  const [goalCat, setGoalCat] = useState('커리어')
  const [goalMetric, setGoalMetric] = useState('')
  const [declText, setDeclText] = useState('')

  function addGoal(event) {
    event.preventDefault()
    if (!goalText.trim()) return
    onChangeGoals([...goals, { id: uid(), text: goalText.trim(), cat: goalCat, metric: goalMetric.trim(), done: false }])
    setGoalText('')
    setGoalMetric('')
  }

  function addDeclaration(event) {
    event.preventDefault()
    if (!declText.trim()) return
    onChangeMeta({ ...meta, declarations: [...(meta.declarations ?? []), { id: uid(), text: declText.trim() }] })
    setDeclText('')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 올해 키워드 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-2 font-bold">{year}년 핵심 키워드</h3>
        <input
          value={meta.keyword ?? ''}
          onChange={(event) => onChangeMeta({ ...meta, keyword: event.target.value })}
          placeholder="올해를 관통하는 한 단어 (예: 도약)"
          className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-center text-lg font-bold outline-none focus:border-[var(--color-accent)]"
        />
      </section>

      {/* 선언문 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">선언문</h3>
        <form onSubmit={addDeclaration} className="mb-3 flex gap-2">
          <input
            value={declText}
            onChange={(event) => setDeclText(event.target.value)}
            placeholder='"나는 ~할 것이다"'
            className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <button type="submit" className="sao-btn-primary px-4 py-2">추가</button>
        </form>
        <ul className="flex flex-col gap-1.5">
          {(meta.declarations ?? []).map((decl) => (
            <li key={decl.id} className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2.5">
              <span className="flex-1 text-[15px] font-medium">“{decl.text}”</span>
              <button
                onClick={() => onChangeMeta({ ...meta, declarations: meta.declarations.filter((d) => d.id !== decl.id) })}
                className="px-1 text-black/20 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 분야별 연간 목표 */}
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">분야별 연간 목표</h3>
        <form onSubmit={addGoal} className="mb-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {GOAL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGoalCat(cat)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  goalCat === cat
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] font-bold text-white'
                    : 'border-black/10 text-[var(--color-muted)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            value={goalText}
            onChange={(event) => setGoalText(event.target.value)}
            placeholder="목표 (예: 유튜브 구독자 5만)"
            className="rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex gap-2">
            <input
              value={goalMetric}
              onChange={(event) => setGoalMetric(event.target.value)}
              placeholder="측정 지표 (예: 구독자 수)"
              className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button type="submit" className="sao-btn-primary px-4 py-2">추가</button>
          </div>
        </form>

        <ul className="flex flex-col gap-1.5">
          {goals.map((goal) => (
            <li key={goal.id} className="flex items-center gap-2.5 rounded-xl bg-black/[0.03] px-3 py-2.5">
              <input
                type="checkbox"
                checked={goal.done}
                onChange={() => onChangeGoals(goals.map((g) => (g.id === goal.id ? { ...g, done: !g.done } : g)))}
                className="app-check"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-[15px] ${goal.done ? 'text-[var(--color-muted)] line-through' : ''}`}>{goal.text}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {goal.cat}
                  {goal.metric && ` · 지표: ${goal.metric}`}
                </p>
              </div>
              <button
                onClick={() => onChangeGoals(goals.filter((g) => g.id !== goal.id))}
                className="px-1 text-black/20 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
