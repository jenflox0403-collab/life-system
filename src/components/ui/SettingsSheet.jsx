import { useRef, useState } from 'react'
import { downloadBackup, restoreBackup } from '../../lib/backup.js'
import { load } from '../../lib/storage.js'
import { saveThemePref } from '../../lib/theme.js'

const THEME_OPTIONS = [
  { id: 'system', label: '시스템' },
  { id: 'light', label: '라이트' },
  { id: 'dark', label: '다크' },
]

// 이 파일은 설정 화면(테마·백업/복원) 담당 — 데이터 유실 방지 최우선!
export default function SettingsSheet({ onClose }) {
  const fileInputRef = useRef(null)
  const [message, setMessage] = useState(null)
  const [themePref, setThemePref] = useState(() => load('settings', {}).theme ?? 'system')

  function changeTheme(pref) {
    setThemePref(pref)
    saveThemePref(pref)
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const result = await restoreBackup(file)
    setMessage(result)
    if (result.ok) {
      setTimeout(() => window.location.reload(), 1200)
    }
    event.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="pb-safe w-full max-w-5xl sao-sheet p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="sao-title mb-1 text-lg font-bold">설정</h2>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          데이터는 이 기기 브라우저에만 저장돼요. 주기적으로 백업해주세요!
        </p>

        {/* 테마 선택 (라이트/다크) */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--color-heading)]">화면 테마</span>
          <div className="flex gap-1.5">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => changeTheme(option.id)}
                className={`chip !py-1.5 ${
                  themePref === option.id
                    ? '!border-[var(--color-accent)] !bg-[var(--color-accent)] !text-white'
                    : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={downloadBackup}
            className="sao-btn-primary py-3"
          >
            데이터 내보내기 (JSON 백업)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-black/10 py-3 font-bold transition active:scale-[0.98]"
          >
            데이터 가져오기 (백업 복원)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {message && (
          <p
            role="status"
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {message.message}
          </p>
        )}

        <button onClick={onClose} className="mt-5 w-full py-2 text-sm text-[var(--color-muted)]">
          닫기
        </button>
      </div>
    </div>
  )
}
