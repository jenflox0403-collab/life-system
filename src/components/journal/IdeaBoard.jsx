import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 기록 탭 > 아이디어 담당 — "잡생각 메모 벽(포스트잇)"
// 메모는 내용만큼 늘어나 3열에 차곡차곡 쌓임(꽉 찬 벽). 손잡이(⠿)를 끌면 원하는 열·순서로 이동.
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

const GAP = 10 // 메모 사이 간격(px)
const COLS = 3 // 열 개수 (항상 3열)
const EST_H = 110 // 아직 크기를 못 잰 메모의 임시 높이

const CLAMP_LINES = 8 // 접힌 메모가 보여줄 최대 줄 수
const LONG_NEWLINES = 8 // 이 줄 수를 넘으면 "긴 메모"로 보고 접기 제공
const LONG_CHARS = 260 // 이 글자 수를 넘으면 "긴 메모"로 봄

// 내용이 길어 접을 만한 메모인지 판단
function isLongNote(text) {
  if (!text) return false
  const newlines = (text.match(/\n/g)?.length ?? 0) + 1
  return newlines > LONG_NEWLINES || text.length > LONG_CHARS
}

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

export default function IdeaBoard() {
  const [ideas, setIdeas] = useStoredState('ideas', [])
  const [editingId, setEditingId] = useState(null)
  const [expanded, setExpanded] = useState(() => new Set()) // 펼쳐 본 긴 메모 (저장 안 함)
  const [boardW, setBoardW] = useState(0)
  const [heights, setHeights] = useState({})
  const [measureNonce, setMeasureNonce] = useState(0) // 편집 글상자가 커진 뒤 높이 재측정용
  const [drag, setDrag] = useState(null) // { id, x, y }
  const boardRef = useRef(null)
  const dragRef = useRef(null)
  const noteRefs = useRef({})
  const textareaRef = useRef(null)

  // 보드 너비 측정 (열 너비 계산용)
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const update = () => setBoardW(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const width = boardW || 360
  const colW = (width - GAP * (COLS - 1)) / COLS

  // 각 메모의 실제 높이 측정 (내용·너비·편집상태가 바뀔 때만)
  const measureKey =
    ideas
      .map((n) => `${n.id}:${n.text?.length ?? 0}:${n.important ? 1 : 0}${n.urgent ? 1 : 0}:${expanded.has(n.id) ? 1 : 0}`)
      .join('|') + `@${Math.round(width)}#${editingId}~${measureNonce}`
  useLayoutEffect(() => {
    const next = {}
    let changed = Object.keys(heights).length !== ideas.length
    for (const n of ideas) {
      const el = noteRefs.current[n.id]
      if (el) {
        next[n.id] = el.offsetHeight
        if (heights[n.id] !== next[n.id]) changed = true
      }
    }
    if (changed) setHeights(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measureKey])

  // 편집 시작 시 포커스 + 높이 맞춤 + 커서 맨 끝
  useEffect(() => {
    if (!editingId || !textareaRef.current) return
    const el = textareaRef.current
    el.focus()
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    const len = el.value.length
    el.setSelectionRange(len, len)
    // 글상자가 내용만큼 커진 뒤라, 아래 메모들이 다시 자리 잡도록 재측정 신호
    setMeasureNonce((n) => n + 1)
  }, [editingId])

  // ── 3열 쌓기 배치 계산 (드래그 중인 메모는 빼고 나머지가 자리 메움) ──
  const laidOut = drag ? ideas.filter((n) => n.id !== drag.id) : ideas
  const pos = {}
  const colHeights = [0, 0, 0]
  {
    const columns = [[], [], []]
    for (const n of laidOut) columns[clamp(n.col ?? 0, 0, COLS - 1)].push(n)
    for (const arr of columns) arr.sort((a, b) => (a.row ?? 0) - (b.row ?? 0))
    columns.forEach((arr, c) => {
      let y = 0
      for (const n of arr) {
        pos[n.id] = { left: c * (colW + GAP), top: y }
        y += (heights[n.id] ?? EST_H) + GAP
      }
      colHeights[c] = y
    })
  }
  const boardH = Math.max(
    ideas.length ? Math.max(...colHeights) - GAP : 160,
    drag ? drag.y + 140 : 0,
  )

  /** 드래그 위치(dx,dy)로 놓일 열·순서·표시선 y 계산 */
  function insertionAt(dx, dy) {
    const tc = clamp(Math.floor((dx + colW / 2) / (colW + GAP)), 0, COLS - 1)
    const arr = ideas
      .filter((n) => n.id !== drag?.id && clamp(n.col ?? 0, 0, COLS - 1) === tc)
      .sort((a, b) => (a.row ?? 0) - (b.row ?? 0))
    const py = dy + 24
    let y = 0
    for (let i = 0; i < arr.length; i += 1) {
      const h = heights[arr[i].id] ?? EST_H
      if (py < y + h / 2) return { tc, index: i, y }
      y += h + GAP
    }
    return { tc, index: arr.length, y }
  }

  function addNote() {
    // 편집 중이던 메모가 비어 있으면 조용히 버림
    let base = ideas
    if (editingId) {
      const prev = ideas.find((n) => n.id === editingId)
      if (prev && !prev.text.trim()) base = ideas.filter((n) => n.id !== editingId)
    }
    // 새 메모는 맨 위(첫 열 위쪽)에 오도록 row를 음수로
    const note = {
      id: uid(),
      text: '',
      color: PALETTE[base.length % PALETTE.length].id,
      date: todayKey(),
      col: 0,
      row: -1,
    }
    setIdeas([...base, note])
    setEditingId(note.id)
  }

  function patchNote(id, changes) {
    setIdeas(ideas.map((n) => (n.id === id ? { ...n, ...changes } : n)))
  }

  // 긴 메모 펼치기/접기 (화면에서만, 저장 안 함)
  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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

  /** 메모를 목표 열(tc)의 index 자리로 옮기고 열마다 순서(row) 다시 매김 */
  function dropNote(id, tc, index) {
    const columns = [[], [], []]
    for (const n of ideas) if (n.id !== id) columns[clamp(n.col ?? 0, 0, COLS - 1)].push(n)
    for (const arr of columns) arr.sort((a, b) => (a.row ?? 0) - (b.row ?? 0))
    const dragged = ideas.find((n) => n.id === id)
    columns[tc].splice(index, 0, dragged)
    const map = {}
    columns.forEach((arr, c) => arr.forEach((n, i) => (map[n.id] = { col: c, row: i })))
    setIdeas(ideas.map((n) => (map[n.id] ? { ...n, col: map[n.id].col, row: map[n.id].row } : n)))
  }

  // ── 손잡이 드래그 (마우스·터치 공용) ──
  function handleDown(event, note) {
    event.stopPropagation()
    const start = pos[note.id] ?? { left: 0, top: 0 }
    const rect = boardRef.current.getBoundingClientRect()
    dragRef.current = {
      id: note.id,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left - start.left,
      offsetY: event.clientY - rect.top - start.top,
      x: start.left,
      y: start.top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ id: note.id, x: start.left, y: start.top })
  }

  function handleMove(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    const rect = boardRef.current.getBoundingClientRect()
    d.x = event.clientX - rect.left - d.offsetX
    d.y = event.clientY - rect.top - d.offsetY
    setDrag({ id: d.id, x: d.x, y: d.y })
  }

  function handleUp(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    const { tc, index } = insertionAt(d.x, d.y)
    dropNote(d.id, tc, index)
    dragRef.current = null
    setDrag(null)
  }

  const insertion = drag ? insertionAt(drag.x, drag.y) : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-[var(--color-muted)]">⠿ 손잡이를 끌어 자리 이동 · 탭하면 수정</p>
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

        {/* 놓일 자리 표시선 */}
        {insertion && (
          <div
            className="pointer-events-none absolute h-1 rounded-full bg-[var(--color-accent)]/60"
            style={{ left: insertion.tc * (colW + GAP), top: Math.max(0, insertion.y - GAP / 2), width: colW }}
          />
        )}

        {/* 편집 중 바깥을 누르면 저장하고 닫기 */}
        {editingId && <div className="absolute inset-0 z-30" onClick={stopEditing} />}

        {ideas.map((note) => {
          const isEditing = editingId === note.id
          const isDragging = drag?.id === note.id
          const noteColor = stableColor(note)
          const bg = colorBg(noteColor)
          const p = pos[note.id] ?? { left: 0, top: 0 }
          const left = isDragging ? drag.x : p.left
          const top = isDragging ? drag.y : p.top

          return (
            <div
              key={note.id}
              ref={(el) => {
                if (el) noteRefs.current[note.id] = el
                else delete noteRefs.current[note.id]
              }}
              className="absolute overflow-hidden rounded-xl shadow-[0_2px_8px_rgba(60,60,40,0.16)]"
              style={{
                left,
                top,
                width: colW,
                background: bg,
                color: NOTE_TEXT,
                zIndex: isEditing ? 40 : isDragging ? 50 : 1,
                opacity: isDragging ? 0.92 : 1,
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
                  {/* 중요·긴급 토글 (눌리면 색이 참) */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => patchNote(note.id, { important: !note.important })}
                      aria-pressed={!!note.important}
                      className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                      style={
                        note.important
                          ? { background: 'rgba(217,119,6,0.16)', color: '#b45309', borderColor: 'rgba(217,119,6,0.5)' }
                          : { color: 'rgba(65,61,52,0.55)', borderColor: 'rgba(0,0,0,0.15)' }
                      }
                    >
                      중요
                    </button>
                    <button
                      onClick={() => patchNote(note.id, { urgent: !note.urgent })}
                      aria-pressed={!!note.urgent}
                      className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                      style={
                        note.urgent
                          ? { background: 'rgba(220,38,38,0.14)', color: '#b91c1c', borderColor: 'rgba(220,38,38,0.5)' }
                          : { color: 'rgba(65,61,52,0.55)', borderColor: 'rgba(0,0,0,0.15)' }
                      }
                    >
                      긴급
                    </button>
                  </div>
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
                </div>
              ) : (
                <div onClick={() => beginEdit(note.id)} className="cursor-pointer px-3 pb-3">
                  {(note.important || note.urgent) && (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {note.important && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                          style={{ background: 'rgba(217,119,6,0.16)', color: '#b45309' }}
                        >
                          중요
                        </span>
                      )}
                      {note.urgent && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                          style={{ background: 'rgba(220,38,38,0.14)', color: '#b91c1c' }}
                        >
                          긴급
                        </span>
                      )}
                    </div>
                  )}
                  <p
                    className="whitespace-pre-wrap break-words text-[14px] leading-relaxed"
                    style={
                      isLongNote(note.text) && !expanded.has(note.id)
                        ? {
                            display: '-webkit-box',
                            WebkitLineClamp: CLAMP_LINES,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }
                        : undefined
                    }
                  >
                    {note.text || <span className="text-black/30">빈 메모</span>}
                  </p>
                  {isLongNote(note.text) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(note.id)
                      }}
                      className="mt-1 text-[12px] font-bold text-black/45 hover:text-black/70"
                    >
                      {expanded.has(note.id) ? '접기 ▲' : '더보기 ▼'}
                    </button>
                  )}
                  <p className="mt-2 text-[11px] text-black/35">{note.date?.slice(5).replace('-', '/')}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
