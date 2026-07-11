import { useState, useRef, useEffect } from 'react'
import { useStoredState } from '../../hooks/useStoredState.js'

// 이 파일은 만다라트 플래너 담당 (계획 탭 하위)
// 가운데 핵심 목표 1개 → 주변 테마 8개 → 테마마다 실천 8칸 (총 81칸)
// 모바일: 중심 3×3에서 테마를 탭해 세부로 / PC: 9×9 전체를 한눈에, 모든 칸 직접 입력

// 3×3에서 가운데(4) 뺀 8자리 ↔ 테마 번호 매핑
const AROUND = [0, 1, 2, 3, 5, 6, 7, 8]

const EMPTY = {
  center: '',
  themes: Array.from({ length: 8 }, () => ({ text: '', items: Array(8).fill('') })),
}

export default function Mandalart() {
  const [board, setBoard] = useStoredState('mandalart', EMPTY)
  const [detail, setDetail] = useState(null) // 모바일: null=중심, 숫자=테마 세부

  // 오래된/빈 데이터여도 안전하게 읽기
  function themeOf(i) {
    return board.themes?.[i] ?? { text: '', items: [] }
  }

  function setCenter(text) {
    setBoard({ ...board, center: text })
  }

  function setThemeText(i, text) {
    const themes = (board.themes ?? EMPTY.themes).map((t, idx) => (idx === i ? { ...t, text } : t))
    setBoard({ ...board, themes })
  }

  function setThemeItem(i, j, text) {
    const themes = (board.themes ?? EMPTY.themes).map((t, idx) => {
      if (idx !== i) return t
      const items = [...(t.items ?? Array(8).fill(''))]
      items[j] = text
      return { ...t, items }
    })
    setBoard({ ...board, themes })
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="sao-card p-4">
        <h3 className="sao-title mb-1 font-bold">만다라트</h3>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          가운데 핵심 목표 → 테마 8개 → 테마별 실천 8칸. 칸을 눌러 바로 적으면 자동 저장돼요.
        </p>

        {/* ===== 모바일: 중심 3×3 ↔ 테마 세부 3×3 ===== */}
        <div className="md:hidden">
          {detail === null ? (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }, (_, pos) => {
                if (pos === 4) {
                  return (
                    <Cell
                      key="center"
                      value={board.center ?? ''}
                      onChange={setCenter}
                      placeholder="핵심 목표"
                      tone="core"
                    />
                  )
                }
                const i = AROUND.indexOf(pos)
                const theme = themeOf(i)
                const filled = (theme.items ?? []).filter((v) => v && v.trim()).length
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setDetail(i)}
                    className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[4px] border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 p-1 text-center"
                  >
                    <span className="line-clamp-2 w-full break-keep text-[11px] font-bold leading-tight text-[var(--color-heading)]">
                      {theme.text || `테마 ${i + 1}`}
                    </span>
                    <span className="text-[9px] text-[var(--color-muted)]">{filled}/8</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="mb-2 text-sm font-bold text-[var(--color-accent)]"
              >
                ‹ 전체로
              </button>
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }, (_, pos) => {
                  if (pos === 4) {
                    return (
                      <Cell
                        key="theme"
                        value={themeOf(detail).text}
                        onChange={(text) => setThemeText(detail, text)}
                        placeholder={`테마 ${detail + 1}`}
                        tone="theme"
                      />
                    )
                  }
                  const j = AROUND.indexOf(pos)
                  return (
                    <Cell
                      key={pos}
                      value={themeOf(detail).items?.[j] ?? ''}
                      onChange={(text) => setThemeItem(detail, j, text)}
                      placeholder="실천"
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===== PC: 9×9 전체 ===== */}
        <div className="hidden grid-cols-3 gap-1.5 md:grid">
          {Array.from({ length: 9 }, (_, block) => (
            <div key={block} className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 9 }, (_, pos) => {
                // 가운데 블록: 중앙=핵심 목표, 주변=테마 이름 (블록 중앙과 같은 데이터)
                if (block === 4) {
                  if (pos === 4) {
                    return <Cell key={pos} value={board.center ?? ''} onChange={setCenter} placeholder="핵심 목표" tone="core" />
                  }
                  const i = AROUND.indexOf(pos)
                  return (
                    <Cell
                      key={pos}
                      value={themeOf(i).text}
                      onChange={(text) => setThemeText(i, text)}
                      placeholder={`테마 ${i + 1}`}
                      tone="theme"
                    />
                  )
                }
                // 주변 블록: 중앙=테마 이름, 주변=실천 8칸
                const i = AROUND.indexOf(block)
                if (pos === 4) {
                  return (
                    <Cell
                      key={pos}
                      value={themeOf(i).text}
                      onChange={(text) => setThemeText(i, text)}
                      placeholder={`테마 ${i + 1}`}
                      tone="theme"
                    />
                  )
                }
                const j = AROUND.indexOf(pos)
                return (
                  <Cell
                    key={pos}
                    value={themeOf(i).items?.[j] ?? ''}
                    onChange={(text) => setThemeItem(i, j, text)}
                    placeholder=""
                  />
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// 만다라트 한 칸 (바로 입력, 자동 저장)
// 텍스트가 상하좌우 중앙에 오도록: 칸(flex 중앙정렬) 안에 내용 높이만큼만 자라는 입력창
function Cell({ value, onChange, placeholder, tone }) {
  const ref = useRef(null)

  // 입력창 높이를 내용에 딱 맞게 → 바깥 flex가 세로 중앙에 배치
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const toneClass =
    tone === 'core'
      ? 'border-[var(--color-amber)] bg-[var(--color-amber)]/15 font-bold'
      : tone === 'theme'
        ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 font-bold'
        : 'border-black/10 bg-white'
  return (
    <div className={`flex aspect-square items-center rounded-[4px] border p-0.5 focus-within:border-[var(--color-accent)] ${toneClass}`}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={1}
        className="max-h-full w-full resize-none overflow-hidden bg-transparent text-center text-[10px] leading-tight outline-none md:text-[11px]"
      />
    </div>
  )
}
