// 기기별 편의 설정만 저장 (실패해도 동작해야 함)
export function readLocal<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null
    return v && allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

export function writeLocal(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* 저장 불가 환경 */ }
}
