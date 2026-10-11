// mock fixture. prototype.html의 시안 데이터를 타입에 맞춰 옮긴 것.
// 이미지 URL 'art:aN'은 CSS로 그린 가상의 작품(shared/ui/Art)을 뜻한다.
import type { AddOnOption, Backing, CareerReviewLog, Order, PlatformSettings, SupportProject, User, Work } from '../entities/types'

export const TODAY = '2026-10-11'

export const settings: PlatformSettings = {
  verifiedBadgeThreshold: 5,
  verifiedFeedBoost: 1.3,
  decisionWindowDays: 7,
  storageFreeMonths: 3,
}

export const PRICING = { shippingFee: 45000, storageMonthly: 15000 }

const tone = {
  jiwoo: 'linear-gradient(135deg,#C2412A,#E0A43A)',
  serin: 'linear-gradient(135deg,#E6A98F,#7C4A3A)',
  ian: 'linear-gradient(135deg,#2D3E50,#9FB4B6)',
  moss: 'linear-gradient(135deg,#33463F,#7A9A8C)',
  doyoon: 'linear-gradient(135deg,#4A4740,#8C877D)',
  haneul: 'linear-gradient(135deg,#2F3E8F,#7C8CD6)',
  admin: 'linear-gradient(135deg,#1B1A17,#4A4740)',
}

export const users: User[] = [
  {
    id: 'u-jiwoo', handle: 'jiwoo.han', name: '한지우', avatarTone: tone.jiwoo, coverUrl: 'art:a3', place: '서울 성수 작업실',
    statement: '지나간 빛이 방에 남기는 온도를 그립니다. 기억 속 오후 네 시를 캔버스 위에 오래 머물게 하고 싶어요.',
    tags: ['유화', '추상 풍경'], isArtist: true, role: 'user', stats: { followers: 12400, following: 86 },
    career: [
      { id: 'c1', category: 'education', yearFrom: 2014, yearTo: 2018, text: '홍익대학교 회화과 졸업', isPublic: true, verifyStatus: 'verified' },
      { id: 'c2', category: 'exhibition', yearFrom: 2022, text: '개인전 〈오후 네 시〉, 갤러리 소소', isPublic: true, verifyStatus: 'verified' },
      { id: 'c3', category: 'exhibition', yearFrom: 2026, text: '개인전 〈빛의 체류〉, 아트스페이스 휴', isPublic: true, verifyStatus: 'verified' },
      { id: 'c4', category: 'award', yearFrom: 2023, text: '제12회 청년작가 회화상 우수상', isPublic: true, verifyStatus: 'verified' },
      { id: 'c5', category: 'support_project', yearFrom: 2026, text: '후원 프로젝트 〈늦은 오후의 방〉 완성 · 마일스톤 3/3 · 후원자 52명', isPublic: true, verifyStatus: 'verified', auto: true },
      { id: 'c6', category: 'affiliation', yearFrom: 2021, text: '서울문화재단 레지던시 입주작가', isPublic: true, verifyStatus: 'verified' },
      { id: 'c7', category: 'exhibition', yearFrom: 2025, text: '단체전 〈창가의 사람들〉, 연희 아트룸', isPublic: true, verifyStatus: 'unverified' },
    ],
  },
  {
    id: 'u-serin', handle: 'serin.oh', name: '오세린', avatarTone: tone.serin, coverUrl: 'art:a9', place: '부산 영도',
    statement: '익어가고 무르는 것들의 색을 기록합니다.', tags: ['과일 정물', '유화'], isArtist: true, role: 'user', stats: { followers: 8100, following: 140 },
    career: [
      { id: 'c11', category: 'education', yearFrom: 2013, yearTo: 2017, text: '부산대학교 미술학과 졸업', isPublic: true, verifyStatus: 'verified' },
      { id: 'c12', category: 'education', yearFrom: 2017, yearTo: 2019, text: '부산대학교 대학원 서양화 석사', isPublic: true, verifyStatus: 'verified' },
      { id: 'c13', category: 'exhibition', yearFrom: 2021, text: '개인전 〈무르익음〉, 갤러리 담', isPublic: true, verifyStatus: 'verified' },
      { id: 'c14', category: 'exhibition', yearFrom: 2023, text: '아트부산 신진작가 특별전', isPublic: true, verifyStatus: 'verified' },
      { id: 'c15', category: 'award', yearFrom: 2022, text: '신진작가 공모 선정', isPublic: true, verifyStatus: 'verified' },
    ],
  },
  {
    id: 'u-ian', handle: 'ian.studio', name: '이안', avatarTone: tone.ian, coverUrl: 'art:a7', place: '제주',
    statement: '해와 정원의 원을 반복해서 그립니다.', tags: ['아크릴', '원형 연작'], isArtist: true, role: 'user', stats: { followers: 5600, following: 52 },
    career: [
      { id: 'c41', category: 'education', yearFrom: 2015, yearTo: 2019, text: '한국예술종합학교 미술원 졸업', isPublic: true, verifyStatus: 'verified' },
      { id: 'c42', category: 'exhibition', yearFrom: 2022, text: '개인전 〈둥근 정원〉', isPublic: true, verifyStatus: 'verified' },
      { id: 'c43', category: 'exhibition', yearFrom: 2024, text: '2인전 〈해의 자리〉', isPublic: true, verifyStatus: 'verified' },
      { id: 'c44', category: 'award', yearFrom: 2024, text: '제주 청년미술상', isPublic: true, verifyStatus: 'verified' },
      { id: 'c45', category: 'affiliation', yearFrom: 2025, text: '제주문화예술재단 지원작가', isPublic: true, verifyStatus: 'verified' },
    ],
  },
  {
    id: 'u-moss', handle: 'moss.studio', name: 'moss.studio', avatarTone: tone.moss, coverUrl: 'art:a5', place: '서울 망원',
    statement: '면과 선으로 도시의 구획을 다시 나눕니다.', tags: ['기하 추상', '아크릴'], isArtist: true, role: 'user', stats: { followers: 2300, following: 210 },
    career: [
      { id: 'c21', category: 'education', yearFrom: 2017, yearTo: 2021, text: '국민대학교 회화전공 졸업', isPublic: true, verifyStatus: 'verified' },
      { id: 'c22', category: 'exhibition', yearFrom: 2023, text: '2인전 〈구획〉, 공간 오름', isPublic: true, verifyStatus: 'verified' },
      { id: 'c23', category: 'exhibition', yearFrom: 2025, text: '개인전 〈선의 도시〉, 갤러리 물결', isPublic: true, verifyStatus: 'pending', documents: [{ id: 'd1', name: '전시 도록 스캔.jpg', submittedAt: '2026-10-09' }, { id: 'd2', name: '전시 포스터.png', submittedAt: '2026-10-09' }], requestNote: '도록 12쪽에 이름이 있어요' },
      { id: 'c24', category: 'award', yearFrom: 2024, text: '서울 청년작가 공모 입선', isPublic: true, verifyStatus: 'rejected', rejectReason: '제출한 서류에서 작가 이름을 확인할 수 없어요. 입선자 명단이나 상장을 첨부해 주세요.' },
      { id: 'c25', category: 'affiliation', yearFrom: 2022, text: '한국추상미술협회 회원', isPublic: false, verifyStatus: 'verified' },
      { id: 'c26', category: 'etc', yearFrom: 2024, text: '문예지 《선》 표지 작업', isPublic: true, verifyStatus: 'unverified' },
    ],
  },
  {
    id: 'u-doyoon', handle: 'doyoon.kim', name: '김도윤', avatarTone: tone.doyoon, coverUrl: 'art:a6', place: '전주',
    statement: '먹이 번지는 시간을 기다립니다.', tags: ['수묵', '드로잉'], isArtist: true, role: 'user', stats: { followers: 940, following: 77 },
    career: [
      { id: 'c31', category: 'education', yearFrom: 2018, yearTo: 2022, text: '전북대학교 한국화과 졸업', isPublic: true, verifyStatus: 'pending', documents: [{ id: 'd3', name: '졸업증명서.pdf', submittedAt: '2026-10-08' }] },
      { id: 'c32', category: 'exhibition', yearFrom: 2025, text: '단체전 〈먹의 숨〉, 전주 공간', isPublic: true, verifyStatus: 'pending', documents: [{ id: 'd4', name: '전시 리플릿.pdf', submittedAt: '2026-10-08' }] },
    ],
  },
  {
    id: 'u-haneul', handle: 'haneul', name: '김하늘', avatarTone: tone.haneul, coverUrl: 'art:a8',
    statement: '좋아하는 작품을 하나씩 모으는 중', tags: [], isArtist: false, role: 'user', stats: { followers: 24, following: 31 }, career: [],
  },
  {
    id: 'u-admin', handle: 'atelier.ops', name: 'atelier 운영팀', avatarTone: tone.admin, tags: [], isArtist: false, role: 'admin', stats: { followers: 0, following: 0 }, career: [],
  },
]

const img = (key: string) => [{ url: `art:${key}` }]

export const works: Work[] = [
  {
    id: 'w1', artistId: 'u-jiwoo', title: '늦은 오후의 방', images: img('a1'), category: 'painting', material: 'Oil on canvas', size: '72.7 × 60.6 cm (20호)',
    year: 2026, madePeriod: '2026.03 – 06', price: 1800000, saleStatus: 'available', likes: 2400, fromProjectId: 'p3', status: 'published', createdAt: '2026-10-09',
    description: '할머니 집 거실에 오후 네 시쯤 들던 빛을 기억하며 그렸어요. 방은 비어 있지만, 누군가 막 떠난 온기가 남아 있는 장면입니다.',
    story: '붉은 층은 열두 번 덧칠했고, 마른 뒤 다시 긁어내며 빛이 바닥에 스미는 느낌을 만들었어요.',
    records: [
      { title: '구도 스케치', date: '2026-03-12', note: '창틀 그림자를 대각선으로 두고 방을 둘로 나눴습니다.', imageUrl: 'art:a1', stage: 'wip' },
      { title: '붉은 층 쌓기', date: '2026-04-28', note: '카드뮴 레드를 얇게 열두 번. 마른 뒤 다시 긁어냈어요.', imageUrl: 'art:a1', stage: 'wip-half' },
      { title: '완성', date: '2026-06-20', note: '마지막으로 노란 빛의 경계를 부드럽게 풀었습니다.', imageUrl: 'art:a1', stage: 'final' },
    ],
  },
  { id: 'w2', artistId: 'u-jiwoo', title: '두 개의 정오', images: img('a2'), category: 'painting', material: 'Oil on canvas', size: '53 × 45.5 cm (10호)', year: 2025, madePeriod: '2025.08 – 10', price: 2400000, saleStatus: 'sold', likes: 1800, status: 'published', createdAt: '2026-09-30',
    description: '정오의 해와 그림자가 동시에 머무는 순간.', story: '같은 시간에 두 번 찾아간 공원의 기억을 겹쳤어요.', records: [] },
  { id: 'w3', artistId: 'u-serin', title: '복숭아 껍질의 시간', images: img('a9'), category: 'painting', material: 'Oil on linen', size: '40.9 × 31.8 cm (6호)', year: 2026, madePeriod: '2026.07', price: 920000, saleStatus: 'sold', likes: 1320, status: 'published', createdAt: '2026-09-27',
    description: '껍질이 무르기 시작하는 사흘을 한 화면에 담았습니다.', story: '매일 아침 같은 복숭아를 관찰했어요. 색이 가장 진해진 날 붓을 멈췄습니다.', records: [] },
  { id: 'w4', artistId: 'u-serin', title: 'Dusk, Tidal', images: img('a4'), category: 'painting', material: 'Acrylic on canvas', size: '60.6 × 50 cm (12호)', year: 2026, madePeriod: '2026.05', price: 1350000, saleStatus: 'available', likes: 980, status: 'published', createdAt: '2026-10-06',
    description: '해 질 녘 물이 빠지는 시간의 색.', story: '영도 바닷가에서 30분 동안 바뀌는 색을 기억해 두었다가 작업실에서 옮겼어요.', records: [] },
  { id: 'w5', artistId: 'u-moss', title: '구획 No.7', images: img('a5'), category: 'painting', material: 'Acrylic on panel', size: '45.5 × 45.5 cm', year: 2026, madePeriod: '2026.09', price: 680000, saleStatus: 'available', likes: 412, status: 'published', createdAt: '2026-10-10',
    description: '도시의 지도를 세 개의 면으로 줄였습니다.', story: '망원동 골목 지도를 접고 펼치기를 반복하며 구획을 찾았어요.', records: [] },
  { id: 'w6', artistId: 'u-doyoon', title: '먹의 숨', images: img('a6'), category: 'drawing', material: 'Ink on hanji', size: '70 × 50 cm', year: 2025, madePeriod: '2025.12', price: 420000, saleStatus: 'available', likes: 268, status: 'published', createdAt: '2026-10-08',
    description: '먹이 종이에 스미는 속도를 그대로 두었습니다.', story: '붓을 대고 기다리는 시간이 작업의 절반이에요.', records: [] },
  { id: 'w7', artistId: 'u-ian', title: '정원의 해', images: img('a7'), category: 'painting', material: 'Acrylic on canvas', size: '50 × 50 cm', year: 2026, madePeriod: '2026.08', price: 760000, saleStatus: 'reserved', likes: 1105, status: 'published', createdAt: '2026-10-04',
    description: '정원 한가운데 떠 있는 해.', story: '원을 하루에 하나씩, 백 일 동안 그렸어요. 그중 일흔세 번째입니다.', records: [] },
  { id: 'w8', artistId: 'u-serin', title: '흰 그릇의 오후', images: img('a8'), category: 'painting', material: 'Oil on canvas', size: '33.4 × 24.2 cm (4호)', year: 2026, madePeriod: '2026.06', price: 560000, saleStatus: 'available', likes: 640, status: 'published', createdAt: '2026-10-02',
    description: '빈 그릇에 고인 빛.', story: '아무것도 담기지 않은 그릇이 가장 많은 빛을 담고 있었어요.', records: [] },
  { id: 'w9', artistId: 'u-moss', title: '선의 도시', images: img('a5'), category: 'print', material: 'Silkscreen, ed. 1/20', size: '50 × 70 cm', year: 2025, madePeriod: '2025.11', saleStatus: 'not_for_sale', likes: 190, status: 'published', createdAt: '2026-09-12',
    description: '전시용 판화. 판매하지 않아요.', story: '개인전을 위해 만든 포스터 판화입니다.', records: [] },
]

const m = (id: string, order: number, goal: string, dueDate: string, extra: Partial<SupportProject['milestones'][number]> = {}) =>
  ({ id, order, goal, dueDate, isFinal: false, status: 'upcoming' as const, ...extra })

export const projects: SupportProject[] = [
  {
    id: 'p1', artistId: 'u-jiwoo', title: '〈물가의 오후〉 연작', coverUrl: 'art:a3', status: 'in_progress', createdAt: '2026-07-28',
    direction: '물가에서 보낸 오후를 네 폭이 이어지는 연작으로 완성하려 해요. 하늘과 물의 경계를 점점 지워 가며, 마지막 폭에서는 둘이 하나의 색이 되도록 그릴 계획입니다.',
    rewards: [{ amount: 10000, text: '작업노트 전체 열람' }, { amount: 30000, text: '+ 완성작 뒷면에 이름 기록' }, { amount: 50000, text: '+ 완성작 한정 프린트' }],
    activeBackers: 38, totalBackers: 46, totalFunded: 2940000,
    milestones: [
      m('m1', 1, '구상', '2026-08-10', { status: 'closed', submission: { imageUrls: ['art:a3'], note: '물가 사진 40장 중 네 장면을 골라 색 메모를 붙였어요.', submittedAt: '2026-08-10', stage: 'wip' }, decisions: { continued: 44, left: 2, pending: 0 } }),
      m('m2', 2, '스케치', '2026-09-05', { status: 'closed', submission: { imageUrls: ['art:a3'], note: '네 폭의 수평선 높이를 조금씩 낮춰 시선이 흘러가게 했어요.', submittedAt: '2026-09-04', stage: 'wip' }, decisions: { continued: 38, left: 6, pending: 0 } }),
      m('m3', 3, '채색', '2026-10-07', { status: 'deciding', submission: { imageUrls: ['art:a3'], note: '하늘과 물의 경계를 두 단계로 나눌지 고민하다가, 첫 두 폭은 나누고 뒤의 두 폭은 섞기로 했어요. 다음 단계에서 붓 자국을 정리합니다.', submittedAt: '2026-10-07', stage: 'wip-half' }, decisionDeadline: '2026-10-14', decisions: { continued: 21, left: 2, pending: 15 } }),
      m('m4', 4, '디테일', '2026-11-01'),
      m('m5', 5, '완성', '2026-11-25', { isFinal: true }),
    ],
  },
  {
    id: 'p2', artistId: 'u-serin', title: '복숭아의 계절', coverUrl: 'art:a9', status: 'recruiting', createdAt: '2026-10-05',
    direction: '복숭아가 익고 무르는 2주를 세 장의 그림으로 남깁니다. 마지막 장은 씨만 남은 접시를 그릴 계획이에요.',
    rewards: [{ amount: 10000, text: '후원자 이름 기록' }, { amount: 30000, text: '+ 엽서 세트' }],
    activeBackers: 17, totalBackers: 17, totalFunded: 0,
    milestones: [m('m21', 1, '첫째 주 드로잉', '2026-10-25'), m('m22', 2, '둘째 주 채색', '2026-11-12'), m('m23', 3, '완성', '2026-12-01', { isFinal: true })],
  },
  {
    id: 'p5', artistId: 'u-ian', title: '백 개의 해', coverUrl: 'art:a7', status: 'in_progress', createdAt: '2026-08-20',
    direction: '백 일 동안 하루 하나씩 그린 해 중 스물다섯 점을 골라 하나의 큰 화면으로 엮습니다.',
    rewards: [{ amount: 10000, text: '작업노트 열람' }], activeBackers: 64, totalBackers: 70, totalFunded: 1840000,
    milestones: [
      m('m51', 1, '선별', '2026-09-10', { status: 'closed', submission: { imageUrls: ['art:a7'], note: '백 점 중 스물다섯 점을 골랐어요.', submittedAt: '2026-09-10', stage: 'wip' }, decisions: { continued: 66, left: 4, pending: 0 } }),
      m('m52', 2, '배치', '2026-10-20'), m('m53', 3, '연결 채색', '2026-11-15'), m('m54', 4, '완성', '2026-12-10', { isFinal: true }),
    ],
  },
  {
    id: 'p3', artistId: 'u-jiwoo', title: '늦은 오후의 방', coverUrl: 'art:a1', status: 'completed', linkedWorkId: 'w1', createdAt: '2026-02-20', closedAt: '2026-06-20',
    direction: '기억 속 오후 네 시의 방 한 장면을 세 번의 과정으로 완성합니다.', rewards: [], activeBackers: 49, totalBackers: 52, totalFunded: 4410000,
    milestones: [m('m31', 1, '구도 스케치', '2026-03-12', { status: 'closed' }), m('m32', 2, '붉은 층 쌓기', '2026-04-28', { status: 'closed' }), m('m33', 3, '완성', '2026-06-20', { status: 'closed', isFinal: true })],
  },
  {
    id: 'p4', artistId: 'u-serin', title: 'Tidal 12', coverUrl: 'art:a4', status: 'ended', createdAt: '2025-10-01', closedAt: '2026-04-02',
    endReason: '작업실 이전으로 일정을 지키기 어려워 6번째 마일스톤에서 마무리했어요.',
    direction: '열두 달의 썰물을 한 달에 한 점씩.', rewards: [], activeBackers: 9, totalBackers: 31, totalFunded: 1530000,
    milestones: Array.from({ length: 12 }, (_, i) => m(`m4${i}`, i + 1, `${i + 1}월`, '2026-01-01', { status: i < 6 ? 'closed' : 'upcoming', isFinal: i === 11 })),
  },
]

export const backings: Backing[] = [
  { id: 'b1', projectId: 'p1', backerId: 'u-haneul', amountPerMilestone: 30000, paidTotal: 60000, status: 'active', decisions: { m1: 'continue', m2: 'continue' }, joinedAt: '2026-07-30' },
  { id: 'b2', projectId: 'p3', backerId: 'u-haneul', amountPerMilestone: 10000, paidTotal: 30000, status: 'finished', decisions: {}, joinedAt: '2026-02-21' },
]

export const orders: Order[] = [
  { id: 'o1', workId: 'w3', buyerId: 'u-haneul', sellerId: 'u-serin', addOns: [{ name: '원목 액자 맞춤', price: 180000 }], amounts: { work: 920000, addOns: 180000, fulfillment: 45000, total: 1145000 }, fulfillment: 'delivery', status: 'delivered', createdAt: '2026-09-27' },
  { id: 'o2', workId: 'w7', buyerId: 'u-haneul', sellerId: 'u-ian', addOns: [], amounts: { work: 760000, addOns: 0, fulfillment: 0, total: 760000 }, fulfillment: 'storage', storageMonths: 3, status: 'paid', createdAt: '2026-10-09' },
  { id: 'o3', workId: 'w2', buyerId: 'u-serin', sellerId: 'u-jiwoo', addOns: [], amounts: { work: 2400000, addOns: 0, fulfillment: 45000, total: 2445000 }, fulfillment: 'storage', storageMonths: 6, status: 'stored', createdAt: '2026-10-04' },
  { id: 'o4', workId: 'w5', buyerId: 'u-haneul', sellerId: 'u-moss', addOns: [], amounts: { work: 680000, addOns: 0, fulfillment: 45000, total: 725000 }, fulfillment: 'delivery', status: 'confirmed', createdAt: '2026-10-10' },
]

export const addOns: AddOnOption[] = [
  { id: 'frame', kind: 'frame', name: '원목 액자 맞춤', description: '작가 추천 오크 프레임 · 무반사 아크릴', price: 180000 },
  { id: 'install', kind: 'install', name: '설치 서비스', description: '수도권 방문 설치 · 벽 타공 포함', price: 60000 },
  { id: 'care', kind: 'care', name: '보존 관리 키트', description: '먼지 브러시 · 보관 커버 · 관리 안내서', price: 28000 },
]

/** mock 세션 상태 (계정별 좋아요·저장·팔로우) */
export const viewerState: Record<string, { liked: Set<string>; saved: Set<string>; following: Set<string> }> = {
  'u-haneul': { liked: new Set(['w1']), saved: new Set(['w4', 'w8']), following: new Set(['u-jiwoo', 'u-serin']) },
}

export const reviewLogs: CareerReviewLog[] = [
  { itemId: 'c24', artistId: 'u-moss', adminId: 'u-admin', action: 'reject', reason: '제출한 서류에서 작가 이름을 확인할 수 없어요. 입선자 명단이나 상장을 첨부해 주세요.', textSnapshot: '서울 청년작가 공모 입선', at: '2026-10-02' },
]
