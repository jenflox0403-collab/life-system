import { load, save } from './storage.js'

// 이 파일은 테마(라이트/다크) 적용 담당
// 설정값: 'system'(기기 따라감) | 'light' | 'dark' — settings.theme에 저장

const THEME_COLORS = { light: '#e7eef5', dark: '#232b36' }
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

/** 설정값 → 실제 테마 ('system'이면 기기 설정을 봄) */
export function resolveTheme(pref) {
  if (pref === 'light' || pref === 'dark') return pref
  return mediaQuery.matches ? 'dark' : 'light'
}

/** 화면에 테마 적용 (html에 data-theme 붙임 + 상단 상태바 색도 맞춤) */
export function applyTheme(pref) {
  const theme = resolveTheme(pref)
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLORS[theme])
}

/** 앱 시작 시 1회: 저장된 설정 적용 + 기기 다크모드 변경 감지 */
export function initTheme() {
  const pref = load('settings', {}).theme ?? 'system'
  applyTheme(pref)
  mediaQuery.addEventListener('change', () => {
    const current = load('settings', {}).theme ?? 'system'
    if (current === 'system') applyTheme('system')
  })
}

/** 테마 설정 저장 + 즉시 적용 */
export function saveThemePref(pref) {
  const settings = load('settings', {})
  save('settings', { ...settings, theme: pref })
  applyTheme(pref)
}
