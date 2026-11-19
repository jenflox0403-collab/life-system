import { useLayoutEffect, useRef, useState } from 'react'

// 이 파일은 "손잡이 드래그로 목록 순서 바꾸기" 공용 훅 담당
// - 끌고 있는 줄은 손가락을 실시간으로 따라감(transform, 리렌더 없이 즉시) → 매끄러움
// - 나머지 줄은 FLIP 기법으로 스르륵 비켜줌
// - 위치 계산은 offsetTop(변형 영향 없음)으로 해서 꼬임 방지
// - 드래그 중엔 로컬 순서로만 그림(부모 갱신 X → 렉 방지), 손 떼면 onCommit(새 순서) 호출
//
// 사용법: const { list, listRef, registerRef, dragId, handleProps } = useListReorder(items, onCommit)
export function useListReorder(items, onCommit) {
  const [dragId, setDragId] = useState(null)
  const [dragOrder, setDragOrder] = useState(null) // 드래그 중 로컬 순서
  const listRef = useRef(null) // 위치 기준점(<ul>)
  const rowRefs = useRef({}) // id → 줄 DOM
  const posRef = useRef({}) // id → 직전 세로 위치(애니메이션용)
  const dragRef = useRef(null) // { id, pointerId, startClientY, startTop, lastClientY }

  const list = dragOrder ?? items

  function registerRef(id, el) {
    if (el) rowRefs.current[id] = el
    else delete rowRefs.current[id]
  }

  // 끌고 있는 줄을 손가락 위치에 맞춰 이동(재배치돼 슬롯이 바뀌어도 안 튀게 보정)
  function applyDragTransform() {
    const d = dragRef.current
    if (!d) return
    const el = rowRefs.current[d.id]
    if (!el) return
    const y = d.startTop + (d.lastClientY - d.startClientY) - el.offsetTop
    el.style.transition = 'none'
    el.style.transform = `translateY(${y}px)`
  }

  // 순서가 바뀌면 각 줄을 이전 위치 → 새 위치로 스르륵 이동(FLIP). 끌던 줄은 손가락 위치 유지.
  useLayoutEffect(() => {
    for (const t of list) {
      const el = rowRefs.current[t.id]
      if (!el) continue
      const top = el.offsetTop
      const prev = posRef.current[t.id]
      if (t.id === dragId) {
        const d = dragRef.current
        if (d) {
          el.style.transition = 'none'
          el.style.transform = `translateY(${d.startTop + (d.lastClientY - d.startClientY) - top}px)`
        }
      } else if (prev != null && prev !== top) {
        el.style.transition = 'none'
        el.style.transform = `translateY(${prev - top}px)`
        requestAnimationFrame(() => {
          el.style.transition = 'transform 180ms cubic-bezier(0.2, 0, 0, 1)'
          el.style.transform = ''
        })
      }
      posRef.current[t.id] = top
    }
  })

  function handleDown(event, id) {
    const el = rowRefs.current[id]
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      startClientY: event.clientY,
      startTop: el ? el.offsetTop : 0,
      lastClientY: event.clientY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragId(id)
    setDragOrder(items)
  }

  function handleMove(event) {
    const d = dragRef.current
    if (!d || event.pointerId !== d.pointerId) return
    d.lastClientY = event.clientY
    applyDragTransform() // 손가락 바로 따라가기(리렌더 없이 즉시)

    const ul = listRef.current
    if (!ul) return
    const ulTop = ul.getBoundingClientRect().top
    const clientY = event.clientY
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
    const el = rowRefs.current[d.id]
    if (el) {
      // 놓은 자리로 부드럽게 안착
      el.style.transition = 'transform 180ms cubic-bezier(0.2, 0, 0, 1)'
      el.style.transform = ''
    }
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
