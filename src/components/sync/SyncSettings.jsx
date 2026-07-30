import { useState } from 'react'
import {
  loadSyncCfg,
  saveSyncCfg,
  syncNow,
  resetSyncState,
  lastRunAt,
  hasRollback,
  restoreRollback,
} from '../../lib/sync.js'
import ConflictModal from './ConflictModal.jsx'

// 이 파일은 설정 화면의 "폰↔컴퓨터 동기화" 섹션 담당
function makeCode() {
  try {
    return crypto.randomUUID()
  } catch {
    return `code-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
  }
}

function timeAgo(ts) {
  if (!ts) return '아직 없음'
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return new Date(ts).toLocaleDateString('ko-KR')
}

const STATUS_TEXT = {
  pushed: { ok: true, text: '이 기기 데이터를 클라우드에 올렸어요.' },
  pulled: { ok: true, text: '클라우드 최신을 받았어요. 화면을 새로고침합니다.' },
  'in-sync': { ok: true, text: '이미 최신이에요. 맞춰져 있어요!' },
  off: { ok: false, text: '동기화를 켜고 주소·코드를 채워주세요.' },
}

export default function SyncSettings() {
  const [cfg, setCfg] = useState(loadSyncCfg)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [conflict, setConflict] = useState(null)
  const [showRollback, setShowRollback] = useState(hasRollback)

  function patch(changes) {
    const next = { ...cfg, ...changes }
    // 주소나 코드가 바뀌면 다른 금고이므로 "마지막으로 본 버전"을 초기화
    if (changes.dbUrl !== undefined || changes.code !== undefined) resetSyncState()
    setCfg(next)
    saveSyncCfg(next)
  }

  async function runSync() {
    setBusy(true)
    setMsg(null)
    try {
      const result = await syncNow()
      if (result.status === 'conflict') {
        setConflict(result.remote)
      } else if (result.status === 'pulled') {
        setMsg({ ok: true, text: STATUS_TEXT.pulled.text })
        setTimeout(() => window.location.reload(), 1000)
      } else if (result.status === 'error') {
        setMsg({ ok: false, text: `문제가 생겼어요: ${result.message}` })
      } else {
        setMsg(STATUS_TEXT[result.status] ?? { ok: true, text: '완료했어요.' })
      }
    } catch (err) {
      setMsg({ ok: false, text: `문제가 생겼어요: ${err.message}` })
    } finally {
      setBusy(false)
    }
  }

  function undoOverwrite() {
    if (restoreRollback()) window.location.reload()
  }

  const ready = cfg.on && cfg.dbUrl.trim() && cfg.code.trim()

  return (
    <div className="mb-5 rounded-2xl border border-black/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--color-heading)]">📡 폰↔컴퓨터 동기화</span>
        <button
          onClick={() => patch({ on: !cfg.on })}
          role="switch"
          aria-checked={cfg.on}
          className={`relative h-6 w-11 rounded-full transition ${cfg.on ? 'bg-[var(--color-accent)]' : 'bg-black/20'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${cfg.on ? 'left-[22px]' : 'left-0.5'}`}
          />
        </button>
      </div>

      {!cfg.on ? (
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          켜면 두 기기가 같은 데이터를 공유해요. 끄면 지금처럼 이 기기에만 저장돼요.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            무료 Firebase 데이터베이스 주소와, 두 기기에서 <b>똑같이</b> 쓸 동기화 코드를 넣어주세요.
            (설정법은 아래 도움말)
          </p>

          <label className="text-xs font-bold text-[var(--color-heading)]">
            Firebase 데이터베이스 주소
            <input
              value={cfg.dbUrl}
              onChange={(e) => patch({ dbUrl: e.target.value })}
              placeholder="https://내프로젝트-default-rtdb.firebaseio.com"
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm font-normal outline-none focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="text-xs font-bold text-[var(--color-heading)]">
            동기화 코드 (비밀번호처럼 두 기기 공통)
            <div className="mt-1 flex gap-1.5">
              <input
                value={cfg.code}
                onChange={(e) => patch({ code: e.target.value })}
                placeholder="예: 나만의-비밀코드-12345"
                className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm font-normal outline-none focus:border-[var(--color-accent)]"
              />
              <button
                onClick={() => patch({ code: makeCode() })}
                className="shrink-0 rounded-xl border border-black/10 px-3 text-xs font-bold"
              >
                코드 생성
              </button>
            </div>
          </label>

          <button onClick={runSync} disabled={!ready || busy} className="sao-btn-primary py-3 disabled:opacity-50">
            {busy ? '동기화 중…' : '지금 동기화'}
          </button>

          <p className="text-center text-xs text-[var(--color-muted)]">
            마지막 동기화: {timeAgo(lastRunAt())}
          </p>

          {msg && (
            <p
              role="status"
              className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
            >
              {msg.text}
            </p>
          )}

          {showRollback && (
            <button
              onClick={undoOverwrite}
              className="rounded-xl border border-amber-300 py-2 text-xs font-bold text-amber-700"
            >
              ↩︎ 마지막 덮어쓰기 되돌리기
            </button>
          )}

          <details className="text-xs text-[var(--color-muted)]">
            <summary className="cursor-pointer font-bold">Firebase 설정 도움말 (처음 한 번)</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-4 leading-relaxed">
              <li>console.firebase.google.com 접속 → "프로젝트 만들기"</li>
              <li>왼쪽 메뉴 "빌드 → Realtime Database" → "데이터베이스 만들기"</li>
              <li>위치는 그대로, 보안 규칙은 "잠금 모드"로 시작</li>
              <li>만들어진 주소(https://...firebaseio.com)를 위 칸에 붙여넣기</li>
              <li>규칙 탭에서 제가 알려드리는 규칙을 붙여넣고 게시</li>
              <li>다른 기기에서도 같은 주소·코드 입력 → "지금 동기화"</li>
            </ol>
            <p className="mt-2">막히면 화면 보여주시면 단계별로 도와드릴게요.</p>
          </details>
        </div>
      )}

      {conflict && (
        <ConflictModal
          remote={conflict}
          onClose={() => {
            setConflict(null)
            setShowRollback(hasRollback())
          }}
        />
      )}
    </div>
  )
}
