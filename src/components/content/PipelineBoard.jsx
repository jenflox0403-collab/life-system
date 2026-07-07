import { useState } from 'react'
import { uid } from '../../lib/uid.js'
import { todayKey } from '../../lib/date.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import { STAGES, adjacentStage } from '../../lib/contentTypes.js'
import ContentCard from './ContentCard.jsx'
import ContentSheet from './ContentSheet.jsx'

// 이 파일은 콘텐츠 파이프라인 칸반 담당
// 모바일: 단계 칩으로 한 단계씩 / PC: 5개 열 나란히
export default function PipelineBoard() {
  const [content, setContent] = useStoredState('content', [])
  const [quickText, setQuickText] = useState('')
  const [selectedStage, setSelectedStage] = useState('idea') // 모바일 단계 선택
  const [editing, setEditing] = useState(null) // null=닫힘, 'new'=추가, 객체=수정
  const [showArchive, setShowArchive] = useState(false)

  const active = content.filter((c) => !c.archived)
  const archived = content.filter((c) => c.archived)

  function cardsOf(stageId) {
    return active.filter((c) => c.stage === stageId)
  }

  function addQuick(e) {
    e.preventDefault()
    if (!quickText.trim()) return
    setContent([
      ...content,
      { id: uid(), title: quickText.trim(), format: 'long', owner: 'me', stage: 'idea', uploadDate: '', memo: '', createdAt: todayKey(), archived: false },
    ])
    setQuickText('')
    setSelectedStage('idea')
  }

  function saveCard(data) {
    if (editing && editing !== 'new') {
      setContent(content.map((c) => (c.id === editing.id ? { ...c, ...data } : c)))
    } else {
      setContent([...content, { id: uid(), createdAt: todayKey(), archived: false, ...data }])
    }
    setEditing(null)
  }

  function deleteCard() {
    if (editing && editing !== 'new') setContent(content.filter((c) => c.id !== editing.id))
    setEditing(null)
  }

  function moveCard(card, dir) {
    const next = adjacentStage(card.stage, dir)
    if (!next) return
    setContent(content.map((c) => (c.id === card.id ? { ...c, stage: next } : c)))
  }

  function archiveCard(card) {
    setContent(content.map((c) => (c.id === card.id ? { ...c, archived: true } : c)))
  }

  function unarchiveCard(id) {
    setContent(content.map((c) => (c.id === id ? { ...c, archived: false } : c)))
  }

  const cardProps = { onEdit: (card) => setEditing(card), onMove: moveCard, onArchive: archiveCard }

  return (
    <div className="flex flex-col gap-4">
      {/* 빠른 아이디어 입력 */}
      <form onSubmit={addQuick} className="flex gap-2">
        <input
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder="아이디어 입력 후 Enter"
          className="min-w-0 flex-1 rounded-[5px] border border-black/10 px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
        />
        <button type="submit" className="add-btn px-4 py-2">추가</button>
      </form>

      {/* 모바일: 단계 칩 + 한 단계 카드 */}
      <div className="md:hidden">
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          {STAGES.map((stage) => {
            const count = cardsOf(stage.id).length
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStage(stage.id)}
                className="chip shrink-0"
                style={stage.id === selectedStage ? { borderColor: '#4a9bc9', background: 'rgba(74,155,201,0.13)', color: '#3f8cba' } : {}}
              >
                {stage.label} {count > 0 && <span className="font-bold">{count}</span>}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-2">
          {cardsOf(selectedStage).length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-muted)]">이 단계에 카드가 없어요</p>
          ) : (
            cardsOf(selectedStage).map((card) => <ContentCard key={card.id} card={card} {...cardProps} />)
          )}
        </div>
      </div>

      {/* PC: 5개 열 나란히 */}
      <div className="hidden gap-3 md:grid md:grid-cols-5">
        {STAGES.map((stage) => {
          const cards = cardsOf(stage.id)
          return (
            <div key={stage.id} className="flex flex-col gap-2 rounded-[6px] bg-black/[0.03] p-2">
              <div className="flex items-center justify-between px-1 text-xs font-bold text-[var(--color-heading)]">
                <span>{stage.label}</span>
                <span className="text-[var(--color-muted)]">{cards.length}</span>
              </div>
              {cards.map((card) => (
                <ContentCard key={card.id} card={card} {...cardProps} />
              ))}
            </div>
          )
        })}
      </div>

      {/* 아카이브 */}
      <div>
        <button
          type="button"
          onClick={() => setShowArchive((v) => !v)}
          className="text-sm font-medium text-[var(--color-muted)]"
        >
          {showArchive ? '▴' : '▾'} 아카이브 ({archived.length})
        </button>
        {showArchive && <ArchiveView cards={archived} onUnarchive={unarchiveCard} onEdit={(card) => setEditing(card)} />}
      </div>

      {editing && (
        <ContentSheet
          card={editing === 'new' ? null : editing}
          onSave={saveCard}
          onDelete={deleteCard}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// 아카이브 목록 + 월별 업로드 개수
function ArchiveView({ cards, onUnarchive, onEdit }) {
  if (cards.length === 0) {
    return <p className="mt-2 text-sm text-[var(--color-muted)]">아카이브된 콘텐츠가 없어요</p>
  }

  // 월별 개수 (업로드예정일 없으면 생성일 기준)
  const byMonth = {}
  for (const card of cards) {
    const month = (card.uploadDate || card.createdAt || '').slice(0, 7)
    if (month) byMonth[month] = (byMonth[month] ?? 0) + 1
  }
  const months = Object.keys(byMonth).sort((a, b) => (a > b ? -1 : 1))

  return (
    <div className="mt-2 flex flex-col gap-2">
      {months.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-xs text-[var(--color-muted)]">
          {months.map((m) => (
            <span key={m} className="rounded-full bg-black/[0.04] px-2 py-0.5">
              {m.replace('-', '.')} · {byMonth[m]}개
            </span>
          ))}
        </div>
      )}
      <ul className="flex flex-col gap-1.5">
        {cards.map((card) => (
          <li key={card.id} className="flex items-center gap-2 rounded-[5px] border border-black/[0.06] bg-white px-3 py-2">
            <button type="button" onClick={() => onEdit(card)} className="min-w-0 flex-1 truncate text-left text-sm">
              {card.title}
            </button>
            <button type="button" onClick={() => onUnarchive(card.id)} className="chip shrink-0">
              복원
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
