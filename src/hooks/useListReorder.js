import { useLayoutEffect, useRef, useState } from 'react'

// 이 파일은 "손잡이 드래그로 목록 순서 바꾸기" 공용 훅 담당
// - 드래그 중엔 로컬 순서로만 그림(부모 갱신 X → 렉 방지), 손 떼면 onCommit(새 순서) 호출
// - 위치 계산은 offsetTop(변형 영향 없음)으로 해서 꼬임 방지
// - 자리 바뀐 줄은 FLIP 기법으로 부드럽게 미끄러짐(끌던 줄은 손가락 바로 따라감)
//
// 사용법: const { list, listRef, registerRef, dragId, handleProps } = useListReorder(items, onCommit)
//   <ul ref={listRef}> {list.map(it => <Row registerRef={registerRef} dragging={dragId===it.id} {...handleProps(it.id)} />)}
export function useListReorder(items, onCommit) {
  const [dragId, setDragId] = useState(null)
  const [dragOrder, setDragOrder] = useState(null) // 드래그 중 로컬 순서
  const listRef = useRef(null) // 위치 기준점(<ul>)
  const rowRefs = useRef({}) // id → 줄 DOM
  const posRef = useRef({}) // id → 직전 세로 위치(애니메이션용)
  const dragRef = useRef(null)

  const list = dragOrder ?? items

  function registerRef(id, el) {
    if (el) rowRefs.current[id] = el
    else delete rowRefs.current[id]
  }

  // 순서가 바뀌면 각 줄을 이전 위치 → 새 위치로 스르륵 이동(FLIP). 끌던 줄은 즉시.
  useLayoutEffect(() => {
    for (const t of list) {
      const el = rowRefs.current[t.id]
      if (!el) continue
      const top = el.offsetTop
      const prev = posRef.current[t.id]
      if (t.id === dragId) {
        el.style.transition = 'none'
        el.style.transform = ''
      } else if (prev != null && prev !== top) {
        el.style.transition = 'none'
        el.style.transform = `translateY(${prev - top}px)`
        requestAnimationFrame(() => {
          el.style.transition = 'transform 160ms ease'
          el.style.transform = ''
        })
      }
      posRef.current[t.id] = top
    }
  })

  function handleDown(event, id) {
    dragRef.current = { id, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragId(id)
    setDragOrder(items)
  }

  function handleMove(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    const clientY = event.clientY
    const ul = listRef.current
    if (!ul) return
    const ulTop = ul.getBoundingClientRect().top
    setDragOrder((prev) => {
      const cur = prev ?? items
      const dragged = cur.find((t) => t.id === d.id)
      if (!dragged) return prev
      // 끌고 있는 줄을 뺀 나머지 사이 어느 자리에 넣을지(off-by-one 방지)
      const others = cur.filter((t) => t.id !== d.id)
      let target = others.length
      for (let i = 0; i < others.length; i += 1) {
        const el = rowRefs.current[others[i].id]
        if (!el) continue
        const mid = ulTop + el.offsetTop + el.offsetHeight / 2
        if (clientY < mid) {
          target = i
          break
        }
      }
      const next = [...others]
      next.splice(target, 0, dragged)
      if (next.every((t, idx) => t.id === cur[idx].id)) return prev
      return next
    })
  }

  function handleUp(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    dragRef.current = null
    if (dragOrder) onCommit(dragOrder) // 최종 순서만 저장
    setDragOrder(null)
    setDragId(null)
  }

  // 손잡이에 붙일 포인터 핸들러 (TodoRow의 onHandleDown/Move/Up 이름에 맞춤)
  const handleProps = (id) => ({
    onHandleDown: (e) => handleDown(e, id),
    onHandleMove: handleMove,
    onHandleUp: handleUp,
  })

  return { list, listRef, registerRef, dragId, handleProps }
}
