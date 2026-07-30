import { useState } from 'react'
import { localSummary, remoteSummary, resolveUseLocal, resolveUseRemote } from '../../lib/sync.js'

// 이 파일은 동기화 충돌 안내 창 담당
// 이 기기와 클라우드 둘 다 바뀌었을 때, 어느 쪽을 살릴지 사용자가 직접 고름 (자동 덮어쓰기 금지)
export default function ConflictModal({ remote, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const localCount = localSummary()
  const remoteCount = remoteSummary(remote)
  const remoteTime = remote?.updatedAt ? new Date(remote.updatedAt).toLocaleString('ko-KR') : '알 수 없음'

  async function useLocal() {
    setBusy(true)
    setError('')
    try {
      await resolveUseLocal()
      onClose()
    } catch (err) {
      setError(err.message || '올리기에 실패했어요.')
      setBusy(false)
    }
  }

  function useRemote() {
    // 이 기기를 클라우드 것으로 덮어씀 → 되돌리기 백업 후 새로고침
    resolveUseRemote(remote)
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="sao-modal w-full max-w-md p-6">
        <h3 className="sao-title mb-2 text-lg font-bold">⚠️ 어느 걸 살릴까요?</h3>
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)]">
          이 기기와 클라우드 <b>양쪽 다 바뀌어서</b> 한쪽을 골라야 해요.
          <br />
          고른 쪽으로 맞추고, 다른 쪽은 그 내용으로 덮어써요.
        </p>

        <div className="mb-4 flex flex-col gap-2">
          <div className="rounded-xl border border-black/10 p-3 text-sm">
            <p className="font-bold text-[var(--color-heading)]">📱 이 기기</p>
            <p className="text-[var(--color-muted)]">담긴 항목 약 {localCount}개</p>
          </div>
          <div className="rounded-xl border border-black/10 p-3 text-sm">
            <p className="font-bold text-[var(--color-heading)]">☁️ 클라우드</p>
            <p className="text-[var(--color-muted)]">
              담긴 항목 약 {remoteCount}개 · 마지막 저장 {remoteTime}
            </p>
          </div>
        </div>

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-2">
          <button onClick={useLocal} disabled={busy} className="sao-btn-primary py-3 disabled:opacity-50">
            📱 이 기기 걸 올리기 (클라우드 덮어쓰기)
          </button>
          <button
            onClick={useRemote}
            disabled={busy}
            className="rounded-xl border border-black/10 py-3 font-bold transition active:scale-[0.98] disabled:opacity-50"
          >
            ☁️ 클라우드 걸 받기 (이 기기 덮어쓰기)
          </button>
          <button onClick={onClose} disabled={busy} className="py-2 text-sm text-[var(--color-muted)]">
            나중에 (지금은 안 바꿈)
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
          받기를 골라도 직전 데이터는 자동 백업돼요. 설정에서 되돌릴 수 있어요.
        </p>
      </div>
    </div>
  )
}
