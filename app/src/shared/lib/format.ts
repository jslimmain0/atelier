export const won = (n: number) => '₩' + n.toLocaleString('ko-KR')

/** 그리드용 짧은 가격: ₩1.8M, ₩920K */
export const shortWon = (n: number) =>
  n >= 1e6 ? `₩${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M` : `₩${Math.round(n / 1e3)}K`

/** 2400 → 2.4k */
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n))

/** '2026-10-07' → '10월 7일' */
export const monthDay = (d: string) => {
  const [, m, day] = d.split('-')
  return `${+m}월 ${+day}일`
}

export const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
