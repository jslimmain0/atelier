// mock 인증: 실제 로그인 전까지 '보기 계정'을 localStorage에 두고 요청 헤더로 보낸다.
const KEY = 'atl-mock-user'
export const MOCK_USER_HEADER = 'x-mock-user'

export const PERSONAS = [
  { id: '', label: '방문자 (비로그인)' },
  { id: 'u-haneul', label: '회원 · 김하늘' },
  { id: 'u-moss', label: '작가 · moss.studio (미인증)' },
  { id: 'u-jiwoo', label: '인증 작가 · 한지우' },
  { id: 'u-admin', label: '관리자 · 운영팀' },
] as const

export function getMockUserId(): string {
  try {
    const v = localStorage.getItem(KEY)
    return v === null ? 'u-haneul' : v
  } catch {
    return 'u-haneul'
  }
}

export function setMockUserId(id: string) {
  try { localStorage.setItem(KEY, id) } catch { /* 저장 불가 환경 */ }
}
