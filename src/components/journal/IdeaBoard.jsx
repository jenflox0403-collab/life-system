import { useEffect, useRef, useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 기록 탭 > 아이디어 담당 — "잡생각 메모 벽(포스트잇)"
// 머릿속에 스치는 생각들을 색색깔 메모로 자유롭게 붙여두고, 탭하면 바로 수정
// 콘텐츠용이 아니라 순수 브레인 덤프 공간

// 포스트잇 색 팔레트 (배경은 늘 밝게 — 다크모드에서도 벽에 붙인 메모처럼 보이게)
const PALETTE = [
  { id: 'yellow', bg: '#fef3c7' },
  { id: 'pink', bg: '#fce7f0' },
  { id: 'blue', bg: '#dbeafe' },
  { id: 'green', bg: '#d9f2e0' },
  { id: 'purple', bg: '#ede9fe' },
  { id: 'orange', bg: '#ffe8d6' },
]
const NOTE_TEXT = '#413d34' // 밝은 메모 위 글자색 (테마 무관 고정)

function colorBg(id) {
  return (PALETTE.find((c) => c.id === id) ?? PALETTE[0]).bg
}

// 저장된 색이 없는 옛 메모는 id에서 색을 뽑아 "항상 같은 색"을 유지 (순서가 바뀌어도 안 변함)
function stableColor(note) {
  if (note.color) return note.color
  let sum = 0
  for (const ch of String(note.id)) sum += ch.charCodeAt(0)
  return PALETTE[sum % PALETTE.length].id
}

export default function IdeaBoard() {
  const [ideas, setIdeas] = useStoredState('ideas', [])
  const [editingId, setEditingId] = useState(null)
  const textareaRef = useRef(null)

  // 편집 시작 시 포커스 + 높이 맞춤 + 커서 맨 끝
  useEffect(() => {
    if (!editingId || !textareaRef.current) return
    const el = textareaRef.current
    el.focus()
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    const len = el.value.length
    el.setSelectionRange(len, len)
  }, [editingId])

  function addNote() {
    const note = { id: uid(), text: '', color: PALETTE[ideas.length % PALETTE.length].id, date: todayKey() }
    setIdeas([note, ...ideas])
    setEditingId(note.id)
  }

  function patchNote(id, changes) {
    setIdeas(ideas.map((n) => (n.id === id ? { ...n, ...changes } : n)))
  }

  function removeNote(id) {
    setIdeas(ideas.filter((n) => n.id !== id))
    if (editingId === id) setEditingId(null)
  }

  /** 다른 메모로 편집 이동 — 직전 메모가 비어 있으면 조용히 버림 */
  function beginEdit(id) {
    if (editingId && editingId !== id) {
      const prev = ideas.find((n) => n.id === editingId)
      if (prev && !prev.text.trim()) setIdeas(ideas.filter((n) => n.id !== editingId))
    }
    setEditingId(id)
  }

  /** 편집 종료 — 빈 메모는 저장 안 하고 삭제 */
  function stopEditing() {
    const editing = ideas.find((n) => n.id === editingId)
    if (editing && !editing.text.trim()) setIdeas(ideas.filter((n) => n.id !== editingId))
    setEditingId(null)
  }

  function grow(el) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-[var(--color-muted)]">머릿속 잡생각을 자유롭게 붙여두는 메모 벽</p>
        <button onClick={addNote} className="add-btn shrink-0 px-4 py-1.5">+ 새 메모</button>
      </div>

      {ideas.length === 0 ? (
        <div className="sao-card p-8 text-center">
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            아직 메모가 없어요.
            <br />“+ 새 메모”로 떠오른 생각을 붙여보세요!
          </p>
        </div>
      ) : (
        <div className="columns-2 [column-gap:0.75rem] sm:columns-3">
          {ideas.map((note) => {
            const isEditing = editingId === note.id
            const noteColor = stableColor(note)
            const bg = colorBg(noteColor)
            return (
              <div
                key={note.id}
                onClick={() => !isEditing && beginEdit(note.id)}
                className="mb-3 break-inside-avoid cursor-pointer rounded-xl p-3.5 shadow-[0_2px_8px_rgba(60,60,40,0.13)] transition active:scale-[0.99]"
                style={{ background: bg, color: NOTE_TEXT }}
              >
                {isEditing ? (
                  <>
                    <textarea
                      ref={textareaRef}
                      value={note.text}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        patchNote(note.id, { text: e.target.value })
                        grow(e.target)
                      }}
                      placeholder="생각을 적어보세요…"
                      className="w-full min-h-[2.5rem] resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-black/30"
                      style={{ color: NOTE_TEXT }}
                    />
                    {/* 색 고르기 + 삭제 */}
                    <div className="mt-2 flex items-center gap-1.5">
                      {PALETTE.map((c) => (
                        <button
                          key={c.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            patchNote(note.id, { color: c.id })
                          }}
                          aria-label={`${c.id} 색`}
                          className={`h-5 w-5 rounded-full border ${noteColor === c.id ? 'border-black/50' : 'border-black/10'}`}
                          style={{ background: c.bg }}
                        />
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNote(note.id)
                        }}
                        aria-label="삭제"
                        className="ml-auto px-1 text-black/35 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          stopEditing()
                        }}
                        className="rounded-md bg-black/10 px-3 py-1 text-xs font-bold text-black/60"
                      >
                        완료
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                      {note.text || <span className="text-black/30">빈 메모</span>}
                    </p>
                    <p className="mt-2 text-[11px] text-black/35">{note.date?.slice(5).replace('-', '/')}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
