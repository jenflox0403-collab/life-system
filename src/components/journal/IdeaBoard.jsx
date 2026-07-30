import { useEffect, useRef, useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 기록 탭 > 아이디어 담당 — "잡생각 메모 벽(포스트잇)"
// 손잡이(⠿)를 끌어서 원하는 칸으로 옮기면 격자에 딱 맞춰 스냅(테트리스식). 위치는 저장됨.
// 콘텐츠용이 아니라 순수 브레인 덤프 공간

const PALETTE = [
  { id: 'yellow', bg: '#fef3c7' },
  { id: 'pink', bg: '#fce7f0' },
  { id: 'blue', bg: '#dbeafe' },
  { id: 'green', bg: '#d9f2e0' },
  { id: 'purple', bg: '#ede9fe' },
  { id: 'orange', bg: '#ffe8d6' },
]
const NOTE_TEXT = '#413d34' // 밝은 메모 위 글자색 (테마 무관 고정)

const GAP = 10 // 칸 사이 간격(px)
const CELL_H = 130 // 한 칸 높이(px)
const TARGET_W = 165 // 한 칸 목표 너비 → 화면 폭에 따라 열 개수 자동 계산

function colorBg(id) {
  return (PALETTE.find((c) => c.id === id) ?? PALETTE[0]).bg
}

// 저장된 색이 없는 옛 메모는 id에서 색을 뽑아 "항상 같은 색"을 유지
function stableColor(note) {
  if (note.color) return note.color
  let sum = 0
  for (const ch of String(note.id)) sum += ch.charCodeAt(0)
  return PALETTE[sum % PALETTE.length].id
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

/** 저장된 col/row를 실제 격자 위치로 배치 (겹치면 다음 빈 칸으로 밀어 겹침 방지) */
function placeNotes(notes, cols) {
  const taken = new Set()
  const result = {}
  const ordered = [...notes].sort((a, b) => (a.row ?? 0) - (b.row ?? 0) || (a.col ?? 0) - (b.col ?? 0))
  for (const n of ordered) {
    let c = clamp(n.col ?? 0, 0, cols - 1)
    let r = Math.max(n.row ?? 0, 0)
    while (taken.has(`${c},${r}`)) {
      c += 1
      if (c >= cols) {
        c = 0
        r += 1
      }
    }
    taken.add(`${c},${r}`)
    result[n.id] = { col: c, row: r }
  }
  return result
}

function firstFreeCell(placed, cols) {
  const taken = new Set(Object.values(placed).map((p) => `${p.col},${p.row}`))
  for (let r = 0; ; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (!taken.has(`${c},${r}`)) return { col: c, row: r }
    }
  }
}

export default function IdeaBoard() {
  const [ideas, setIdeas] = useStoredState('ideas', [])
  const [editingId, setEditingId] = useState(null)
  const [boardW, setBoardW] = useState(0)
  const [drag, setDrag] = useState(null) // { id, x, y }
  const boardRef = useRef(null)
  const dragRef = useRef(null)
  const textareaRef = useRef(null)

  // 보드 너비 측정 (화면·창 크기 바뀌면 열 개수 자동 조정)
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const update = () => setBoardW(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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

  const width = boardW || 360
  const cols = Math.max(2, Math.round(width / TARGET_W))
  const cellW = (width - GAP * (cols - 1)) / cols
  const stepX = cellW + GAP
  const stepY = CELL_H + GAP
  const placed = placeNotes(ideas, cols)
  const maxRow = ideas.length ? Math.max(...Object.values(placed).map((p) => p.row)) : 0
  const boardH = ideas.length ? (maxRow + 1) * stepY - GAP : CELL_H

  function addNote() {
    const cell = firstFreeCell(placed, cols)
    const note = {
      id: uid(),
      text: '',
      color: PALETTE[ideas.length % PALETTE.length].id,
      date: todayKey(),
      col: cell.col,
      row: cell.row,
    }
    setIdeas([...ideas, note])
    setEditingId(note.id)
  }

  function patchNote(id, changes) {
    setIdeas(ideas.map((n) => (n.id === id ? { ...n, ...changes } : n)))
  }

  function removeNote(id) {
    setIdeas(ideas.filter((n) => n.id !== id))
    if (editingId === id) setEditingId(null)
  }

  function beginEdit(id) {
    if (editingId && editingId !== id) {
      const prev = ideas.find((n) => n.id === editingId)
      if (prev && !prev.text.trim()) setIdeas(ideas.filter((n) => n.id !== editingId))
    }
    setEditingId(id)
  }

  function stopEditing() {
    const editing = ideas.find((n) => n.id === editingId)
    if (editing && !editing.text.trim()) setIdeas(ideas.filter((n) => n.id !== editingId))
    setEditingId(null)
  }

  function grow(el) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  /** 메모를 목표 칸으로 이동 — 이미 있으면 자리 맞바꿈(스왑) */
  function moveNote(id, col, row) {
    const cur = placeNotes(ideas, cols)
    const occupant = Object.keys(cur).find(
      (nid) => nid !== id && cur[nid].col === col && cur[nid].row === row,
    )
    setIdeas(
      ideas.map((n) => {
        if (n.id === id) return { ...n, col, row }
        if (occupant && n.id === occupant) return { ...n, col: cur[id].col, row: cur[id].row }
        return n
      }),
    )
  }

  // ── 손잡이 드래그 (포인터 이벤트: 마우스·터치 공용) ──
  function handleDown(event, note) {
    event.stopPropagation()
    const p = placed[note.id]
    const rect = boardRef.current.getBoundingClientRect()
    const startLeft = p.col * stepX
    const startTop = p.row * stepY
    dragRef.current = {
      id: note.id,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left - startLeft,
      offsetY: event.clientY - rect.top - startTop,
      x: startLeft,
      y: startTop,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ id: note.id, x: startLeft, y: startTop })
  }

  function handleMove(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    const rect = boardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left - d.offsetX
    const y = event.clientY - rect.top - d.offsetY
    d.x = x
    d.y = y
    setDrag({ id: d.id, x, y })
  }

  function handleUp(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    const col = clamp(Math.round(d.x / stepX), 0, cols - 1)
    const row = Math.max(0, Math.round(d.y / stepY))
    moveNote(d.id, col, row)
    dragRef.current = null
    setDrag(null)
  }

  // 드래그 중 놓일 자리 미리보기(점선)
  let ghost = null
  if (drag) {
    const gc = clamp(Math.round(drag.x / stepX), 0, cols - 1)
    const gr = Math.max(0, Math.round(drag.y / stepY))
    ghost = { left: gc * stepX, top: gr * stepY }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-[var(--color-muted)]">⠿ 손잡이를 끌어 원하는 자리에 배치 · 탭하면 수정</p>
        <button onClick={addNote} className="add-btn shrink-0 px-4 py-1.5">+ 새 메모</button>
      </div>

      <div ref={boardRef} className="relative w-full" style={{ height: boardH }}>
        {ideas.length === 0 && (
          <div className="sao-card flex h-full items-center justify-center p-8 text-center">
            <p className="text-sm leading-relaxed text-[var(--color-muted)]">
              아직 메모가 없어요.
              <br />“+ 새 메모”로 떠오른 생각을 붙여보세요!
            </p>
          </div>
        )}

        {ghost && (
          <div
            className="pointer-events-none absolute rounded-xl border-2 border-dashed border-black/20"
            style={{ left: ghost.left, top: ghost.top, width: cellW, height: CELL_H }}
          />
        )}

        {ideas.map((note) => {
          const p = placed[note.id]
          const isEditing = editingId === note.id
          const isDragging = drag?.id === note.id
          const noteColor = stableColor(note)
          const bg = colorBg(noteColor)

          // 편집 중엔 넉넉하게 넓히고 화면 밖으로 안 나가게 위치 보정
          const editW = Math.min(width, 280)
          const w = isEditing ? editW : cellW
          const baseLeft = isDragging ? drag.x : p.col * stepX
          const left = isEditing ? clamp(p.col * stepX, 0, Math.max(0, width - w)) : baseLeft
          const top = isDragging ? drag.y : p.row * stepY

          return (
            <div
              key={note.id}
              className="absolute overflow-hidden rounded-xl shadow-[0_2px_8px_rgba(60,60,40,0.16)]"
              style={{
                left,
                top,
                width: w,
                height: isEditing ? 'auto' : CELL_H,
                background: bg,
                color: NOTE_TEXT,
                zIndex: isEditing ? 40 : isDragging ? 50 : 1,
                transition: isDragging ? 'none' : 'left 0.16s ease, top 0.16s ease',
              }}
            >
              {/* 손잡이 (여기만 드래그) */}
              <div
                onPointerDown={(e) => handleDown(e, note)}
                onPointerMove={handleMove}
                onPointerUp={handleUp}
                aria-label="옮기기 손잡이"
                className="flex h-6 cursor-grab touch-none select-none items-center justify-center text-black/25 active:cursor-grabbing"
                style={{ touchAction: 'none' }}
              >
                ⠿
              </div>

              {isEditing ? (
                <div className="px-3 pb-3">
                  <textarea
                    ref={textareaRef}
                    value={note.text}
                    onChange={(e) => {
                      patchNote(note.id, { text: e.target.value })
                      grow(e.target)
                    }}
                    placeholder="생각을 적어보세요…"
                    className="w-full min-h-[3.5rem] resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-black/30"
                    style={{ color: NOTE_TEXT }}
                  />
                  <div className="mt-2 flex items-center gap-1.5">
                    {PALETTE.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => patchNote(note.id, { color: c.id })}
                        aria-label={`${c.id} 색`}
                        className={`h-5 w-5 rounded-full border ${noteColor === c.id ? 'border-black/50' : 'border-black/10'}`}
                        style={{ background: c.bg }}
                      />
                    ))}
                    <button
                      onClick={() => removeNote(note.id)}
                      aria-label="삭제"
                      className="ml-auto px-1 text-black/35 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={stopEditing}
                      className="rounded-md bg-black/10 px-3 py-1 text-xs font-bold text-black/60"
                    >
                      완료
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={() => beginEdit(note.id)} className="h-[calc(100%-1.5rem)] cursor-pointer px-3 pb-2">
                  <p className="line-clamp-4 whitespace-pre-wrap break-words text-[14px] leading-snug">
                    {note.text || <span className="text-black/30">빈 메모</span>}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
