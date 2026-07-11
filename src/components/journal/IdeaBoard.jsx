import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 기록 탭 > 아이디어 화면 담당
// 스치는 생각을 흘리지 않게 빠르게 잡아두는 곳 (엔터 한 번으로 저장)
// 콘텐츠가 될 만한 건 "▸ 콘텐츠" 버튼으로 파이프라인 아이디어 칸으로 보냄
export default function IdeaBoard() {
  const [ideas, setIdeas] = useStoredState('ideas', [])
  const [content, setContent] = useStoredState('content', [])
  const [text, setText] = useState('')

  const sorted = [...ideas].sort((a, b) => (a.date < b.date ? 1 : -1)) // 최신순

  function addIdea(e) {
    e.preventDefault()
    if (!text.trim()) return
    setIdeas([...ideas, { id: uid(), text: text.trim(), date: todayKey() }])
    setText('')
  }

  function removeIdea(id) {
    setIdeas(ideas.filter((i) => i.id !== id))
  }

  /** 콘텐츠 파이프라인 "아이디어" 칸으로 이동 (여기 목록에선 빠짐) */
  function sendToContent(idea) {
    setContent([
      ...content,
      { id: uid(), title: idea.text, format: 'long', owner: 'me', stage: 'idea', uploadDate: '', memo: '', createdAt: todayKey(), archived: false },
    ])
    setIdeas(ideas.filter((i) => i.id !== idea.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="sao-card p-5">
        <h3 className="sao-title mb-3 font-bold">아이디어</h3>
        <form onSubmit={addIdea} className="mb-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="떠오른 생각을 잡아두세요 (Enter)"
            className="min-w-0 flex-1 rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
          <button type="submit" className="add-btn px-4 py-2">추가</button>
        </form>

        {sorted.length === 0 ? (
          <p className="py-2 text-sm text-[var(--color-muted)]">아직 잡아둔 아이디어가 없어요</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {sorted.map((idea) => (
              <li
                key={idea.id}
                className="flex items-start gap-2.5 rounded-[5px] border border-black/[0.07] bg-white px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-[15px] leading-snug">{idea.text}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">{idea.date.slice(5).replace('-', '/')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => sendToContent(idea)}
                  title="콘텐츠 파이프라인으로 보내기"
                  className="chip shrink-0"
                >
                  ▸ 콘텐츠
                </button>
                <button
                  type="button"
                  onClick={() => removeIdea(idea.id)}
                  aria-label="삭제"
                  className="shrink-0 px-1 pt-1 text-black/20 hover:text-red-400"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="px-1 text-xs text-[var(--color-muted)]">
        ▸ 콘텐츠를 누르면 콘텐츠 탭 파이프라인의 "아이디어" 칸으로 이동해요
      </p>
    </div>
  )
}
