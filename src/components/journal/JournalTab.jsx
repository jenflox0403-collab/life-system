import { useState } from 'react'
import DiaryBoard from './DiaryBoard.jsx'
import PrayerBoard from './PrayerBoard.jsx'
import IdeaBoard from './IdeaBoard.jsx'

// 이 파일은 "기록" 탭 담당 — 하위 탭 3개(아이디어 / 일기 / 기도)
const SUBTABS = [
  { id: 'idea', label: '아이디어' },
  { id: 'diary', label: '일기' },
  { id: 'prayer', label: '기도' },
]

export default function JournalTab() {
  const [sub, setSub] = useState('idea')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        {SUBTABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSub(tab.id)}
            className="chip"
            style={tab.id === sub ? { borderColor: '#4a9bc9', background: 'rgba(74,155,201,0.13)', color: '#3f8cba' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sub === 'diary' && <DiaryBoard />}
      {sub === 'prayer' && <PrayerBoard />}
      {sub === 'idea' && <IdeaBoard />}
    </div>
  )
}
