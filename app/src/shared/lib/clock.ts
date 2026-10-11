// 오늘 날짜. mock 모드에서는 fixture 기준일(2026-10-11)로 고정해 상태가 흔들리지 않게 한다.
export const MOCK_TODAY = '2026-10-11'
export const today = () => (import.meta.env.VITE_USE_MOCK !== 'false' ? MOCK_TODAY : new Date().toISOString().slice(0, 10))
