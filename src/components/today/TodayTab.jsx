import { formatKorean } from '../../lib/date.js'
import Placeholder from '../ui/Placeholder.jsx'

// 이 파일은 "오늘" 탭 담당 (2단계에서 본격 개발)
export default function TodayTab() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-[var(--color-muted)]">오늘</p>
        <h2 className="text-xl font-bold">{formatKorean()}</h2>
      </section>
      <Placeholder title="오늘 탭 준비 중" description="2단계에서 아침루틴, 10분 타임블록, 오늘 투두가 여기 들어와요." />
    </div>
  )
}
