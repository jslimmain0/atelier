// 화면 목록: prototype.html의 화면 번호와 1:1. 라우터와 탭바가 이 표를 기준으로 동작한다.
export type Tab = 'feed' | 'explore' | 'upload' | 'support' | 'profile'

export interface ScreenMeta {
  code: string
  title: string
  path: string
  tab: Tab | null // null이면 탭바 숨김 (하단 고정 바가 있는 화면)
}

export const SCREENS: ScreenMeta[] = [
  { code: '01', title: '피드', path: '/', tab: 'feed' },
  { code: '01-2', title: '탐색 · 검색', path: '/explore', tab: 'explore' },
  { code: '02', title: '작품 상세', path: '/works/:workId', tab: null },
  { code: '03', title: '작가 프로필', path: '/artists/:handle', tab: 'profile' },
  { code: '04', title: '작품 올리기', path: '/upload', tab: null },
  { code: '05', title: '구매하기', path: '/checkout/:workId', tab: null },
  { code: '06', title: '거래 내역', path: '/me/history', tab: 'profile' },
  { code: '07', title: '후원', path: '/support', tab: 'support' },
  { code: '10', title: '후원 프로젝트 열기', path: '/support/new', tab: null },
  { code: '08', title: '후원 프로젝트', path: '/support/:projectId', tab: null },
  { code: '09', title: '결과물 · 지속/이탈', path: '/support/:projectId/milestones/:order', tab: null },
  { code: '11', title: '내 후원 프로젝트', path: '/me/studio/support', tab: 'profile' },
  { code: '12', title: '저장한 작품', path: '/me/saved', tab: 'profile' },
  { code: '13', title: '경력 · 인증', path: '/me/career', tab: 'profile' },
  { code: '14', title: '관리자 · 인증 심사', path: '/admin/career-reviews', tab: 'profile' },
  { code: '14-2', title: '관리자 · 항목 심사', path: '/admin/career-reviews/:itemId', tab: null },
  { code: '15', title: '관리자 · 운영 설정', path: '/admin/settings', tab: 'profile' },
]
