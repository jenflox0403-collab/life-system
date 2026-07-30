import { useState } from 'react'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 '말씀 읊조리기' 전체화면 담당
// 내가 정한 묵상 구절 한 개를 큼지막하게 보여주고, 여기서 직접 수정도 함
const DEFAULT_MEDITATION = { text: '', ref: '' }

export default function VerseOverlay({ onClose }) {
  const [meditation, setMeditation] = useStoredState('meditation', DEFAULT_MEDITATION)
  const isEmpty = !(meditation.text ?? '').trim()

  // 구절이 아직 없으면 바로 편집 모드로 시작
  const [editing, setEditing] = useState(isEmpty)
  const [draftText, setDraftText] = useState(meditation.text ?? '')
  const [draftRef, setDraftRef] = useState(meditation.ref ?? '')

  function startEdit() {
    setDraftText(meditation.text ?? '')
    setDraftRef(meditation.ref ?? '')
    setEditing(true)
  }

  function save(e) {
    e.preventDefault()
    if (!draftText.trim()) return
    setMeditation({ text: draftText.trim(), ref: draftRef.trim() })
    setEditing(false)
  }

  return (
    <div className="verse-overlay fixed inset-0 z-40 flex flex-col overflow-y-auto">
      {/* 닫기 */}
      <div className="flex shrink-0 justify-end p-4">
        <button onClick={onClose} aria-label="닫기" className="sao-circle !h-9 !w-9 text-lg text-[var(--color-muted)]">
          ✕
        </button>
      </div>

      <div className="sos-enter flex flex-1 flex-col items-center justify-center px-7 pb-16">
        {editing ? (
          <form onSubmit={save} className="flex w-full max-w-sm flex-col gap-3">
            <p className="text-center text-sm text-[var(--color-muted)]">묵상할 구절을 직접 적어보세요</p>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={5}
              autoFocus
              placeholder="구절 본문을 적어주세요"
              className="w-full resize-y rounded-[8px] border border-black/10 bg-white/80 px-3.5 py-3 leading-relaxed outline-none focus:border-[var(--color-accent)]"
            />
            <input
              value={draftRef}
              onChange={(e) => setDraftRef(e.target.value)}
              placeholder="출처 (예: 시편 1:2)"
              className="w-full rounded-[8px] border border-black/10 bg-white/80 px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]"
            />
            <button type="submit" className="add-btn py-2.5">저장</button>
            {!isEmpty && (
              <button type="button" onClick={() => setEditing(false)} className="text-sm text-[var(--color-muted)]">
                취소
              </button>
            )}
          </form>
        ) : (
          <div className="flex w-full max-w-md flex-col items-center">
            <p className="whitespace-pre-line text-center text-2xl font-medium leading-loose text-[var(--color-heading)]">
              {meditation.text}
            </p>
            {meditation.ref && (
              <p className="mt-6 text-base font-bold text-[var(--color-amber-deep)]">— {meditation.ref}</p>
            )}
            <p className="mt-10 text-sm text-[var(--color-muted)]">천천히 소리 내어 읊조려 보세요</p>
            <button onClick={startEdit} className="mt-6 text-sm text-[var(--color-muted)] underline">
              구절 바꾸기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
