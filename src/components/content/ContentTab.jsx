import { useState } from 'react'
import PipelineBoard from './PipelineBoard.jsx'
import Placeholder from '../ui/Placeholder.jsx'

// 이 파일은 "콘텐츠" 탭 담당 — 하위 탭 3개(파이프라인 / 위임 / 성과)
// 지금은 파이프라인만 완성, 위임·성과는 다음 단계에서 채움
const SUBTABS = [
  { id: 'pipeline', label: '파이프라인' },
  { id: 'delegate', label: '위임' },
  { id: 'perf', label: '성과' },
]

export default function ContentTab() {
  const [sub, setSub] = useState('pipeline')

  return (
    <div className="flex flex-col gap-4">
      {/* 하위 탭 선택 */}
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

      {sub === 'pipeline' && <PipelineBoard />}
      {sub === 'delegate' && <Placeholder title="위임 보드 준비 중" description="편집자 업무 관리(지시→진행→검토→완료)가 들어와요." />}
      {sub === 'perf' && <Placeholder title="성과 기록 준비 중" description="업로드 콘텐츠 지표(조회수·CTR 등) 기록이 들어와요." />}
    </div>
  )
}
