import { useState } from 'react'
import { uid } from '../../lib/uid.js'

// 이 파일은 "나를 붙잡는 것들" 담당 — 내가 직접 쓰는 선언문·자극·목표
// 충동의 순간에 다시 읽으며 정신을 붙잡는 나만의 앵커 모음 (여기서 바로 추가·삭제)
const SECTIONS = [
  { key: 'declarations', title: '내 선언문', hint: '내가 되고 싶은 나 (예: 나는 끝까지 해내는 사람이다)' },
  { key: 'motivations', title: '나를 자극하는 것들', hint: '떠올리면 정신이 드는 이유 (예: 이 채널이 나를 어디로 데려갈지 기억해)' },
  { key: 'goals', title: '내 목표', hint: '충동의 순간에 다시 볼 큰 그림' },
]

export default function AnchorBoard({ sos, onChange, onClose }) {
  function addItem(key, text) {
    onChange({ ...sos, [key]: [...(sos[key] ?? []), { id: uid(), text }] })
  }

  function removeItem(key, id) {
    onChange({ ...sos, [key]: (sos[key] ?? []).filter((item) => item.id !== id) })
  }

  function removeTrigger(id) {
    onChange({ ...sos, triggerLog: (sos.triggerLog ?? []).filter((t) => t.id !== id) })
  }

  const triggers = [...(sos.triggerLog ?? [])].reverse().slice(0, 5) // 최근 5개

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {SECTIONS.map((section) => (
        <Section
          key={section.key}
          title={section.title}
          hint={section.hint}
          items={sos[section.key] ?? []}
          onAdd={(text) => addItem(section.key, text)}
          onRemove={(id) => removeItem(section.key, id)}
        />
      ))}

      {/* 최근 충동 기록 (패턴 파악용) */}
      {triggers.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-bold text-[var(--color-heading)]">최근 충동 기록</p>
          <ul className="flex flex-col gap-1">
            {triggers.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-[5px] bg-white/60 px-3 py-1.5 text-sm">
                <span className="shrink-0 text-xs text-[var(--color-muted)]">{t.date?.slice(5).replace('-', '/')}</span>
                <span className="min-w-0 flex-1 truncate">{t.text}</span>
                <button onClick={() => removeTrigger(t.id)} className="shrink-0 px-1 text-black/20 hover:text-red-400">✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onClose} className="sao-btn-primary py-3">돌아가기</button>
    </div>
  )
}

// 섹션 하나 (제목 + 목록 + 추가 입력)
function Section({ title, hint, items, onAdd, onRemove }) {
  const [text, setText] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text.trim())
    setText('')
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-bold text-[var(--color-heading)]">{title}</p>
      {items.length === 0 && <p className="mb-1.5 text-xs text-[var(--color-muted)]">{hint}</p>}
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 rounded-[5px] bg-white/70 px-3 py-2 text-[15px]">
            <span className="min-w-0 flex-1 leading-snug">{item.text}</span>
            <button onClick={() => onRemove(item.id)} className="shrink-0 px-1 text-black/20 hover:text-red-400">✕</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="mt-1.5 flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="추가하기"
          className="min-w-0 flex-1 rounded-[5px] border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <button type="submit" className="add-btn px-3 py-1.5 text-sm">추가</button>
      </form>
    </div>
  )
}
