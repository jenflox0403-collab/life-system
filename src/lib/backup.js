// 이 파일은 JSON 백업(내보내기/가져오기) 담당
import { exportAll, importAll } from './storage.js'

/** 전체 데이터를 JSON 파일로 다운로드 */
export function downloadBackup() {
  const backup = exportAll()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `라이프시스템-백업-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** 사용자가 고른 JSON 파일을 읽어 복원. 결과 메시지를 반환 */
export function restoreBackup(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result)
        const ok = importAll(backup)
        resolve(
          ok
            ? { ok: true, message: '복원 완료! 화면을 새로고침합니다.' }
            : { ok: false, message: '이 앱의 백업 파일이 아니에요. 파일을 다시 확인해주세요.' },
        )
      } catch {
        resolve({ ok: false, message: '파일을 읽을 수 없어요. JSON 백업 파일이 맞는지 확인해주세요.' })
      }
    }
    reader.onerror = () => resolve({ ok: false, message: '파일 읽기에 실패했어요.' })
    reader.readAsText(file)
  })
}
