import { useState } from 'react'
import { load, save } from '../lib/storage.js'

// 이 파일은 "저장되는 상태" 담당
// 일반 useState처럼 쓰면 값이 바뀔 때마다 localStorage에 자동 저장돼요.
export function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback))

  function update(next) {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      save(key, resolved)
      return resolved
    })
  }

  return [value, update]
}
