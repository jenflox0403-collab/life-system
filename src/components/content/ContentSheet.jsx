import { useState } from 'react'
import { STAGES, FORMATS, OWNERS } from '../../lib/contentTypes.js'

// 이 파일은 콘텐츠 카드 추가/수정 창(모달) 담당
// card가 있으면 수정 모드, 없으면 추가 모드 (화면 중앙 카드)
export default function ContentSheet({ card, onSave, onDelete, onClose }) {
  const isEdit = Boolean(card)
  const [title, setTitle] = useState(card?.title ?? '')
  const [format, setFormat] = useState(card?.format ?? 'long')
  const [owner, setOwner] = useState(card?.owner ?? 'me')
  const [stage, setStage] = useState(card?.stage ?? 'idea')
  const [uploadDate, setUploadDate] = useState(card?.uploadDate ?? '')
  const [memo, setMemo] = useState(card?.memo ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), format, owner, stage, uploadDate, memo: memo.trim() })
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="sao-modal max-h-[85vh] w-full max-w-md overflow-y-auto p-6"
      >
        <h2 className="sao-title mb-4 text-lg font-bold">{isEdit ? '콘텐츠 수정' : '콘텐츠 추가'}</h2>

        {/* 제목 */}
        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="콘텐츠 제목"
            autoFocus
            className="w-full rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {/* 형태 */}
        <ChipGroup label="형태" options={FORMATS} value={format} onChange={setFormat} colored />

        {/* 담당 */}
        <ChipGroup label="담당" options={OWNERS} value={owner} onChange={setOwner} />

        {/* 단계 */}
        <ChipGroup label="단계" options={STAGES} value={stage} onChange={setStage} />

        {/* 업로드 예정일 */}
        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">업로드 예정일 (선택)</span>
          <input
            type="date"
            value={uploadDate}
            onChange={(e) => setUploadDate(e.target.value)}
            className="w-full rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        {/* 메모 */}
        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium text-[var(--color-muted)]">메모 (선택)</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="메모"
            className="w-full resize-none rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <div className="flex gap-2">
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-black/10 px-4 py-3 font-bold text-[var(--color-danger)] transition active:scale-[0.98]"
            >
              삭제
            </button>
          )}
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-black/10 py-3 font-bold transition active:scale-[0.98]">
            취소
          </button>
          <button type="submit" className="flex-1 sao-btn-primary py-3">
            {isEdit ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </div>
  )
}

// 칩 선택 그룹 (형태·담당·단계 공용)
function ChipGroup({ label, options, value, onChange, colored }) {
  return (
    <div className="mb-3">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-muted)]">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.id === value
          const activeStyle = colored && opt.color
            ? { borderColor: opt.color, background: `${opt.color}1f`, color: opt.color }
            : { borderColor: '#4a9bc9', background: 'rgba(74,155,201,0.13)', color: '#3f8cba' }
          return (
            <button key={opt.id} type="button" onClick={() => onChange(opt.id)} className="chip" style={active ? activeStyle : {}}>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
