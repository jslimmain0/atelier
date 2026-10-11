// DESIGN.md §5 도메인 모델. 백엔드 스키마/API 계약의 출발점.

export type ID = string
export type ISODate = string // 'YYYY-MM-DD'

/* ---------- 사용자 · 경력 인증 ---------- */
export type CareerCategory = 'education' | 'exhibition' | 'award' | 'affiliation' | 'support_project' | 'etc'
export type CareerVerifyStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface CareerItem {
  id: ID
  category: CareerCategory
  yearFrom: number
  yearTo?: number
  text: string // 프로필에 노출되는 문구
  isPublic: boolean
  verifyStatus: CareerVerifyStatus // 내용 수정 시 'unverified'로 초기화
  verifiedAt?: ISODate
  rejectReason?: string // 본인에게만
  auto?: boolean // 완성한 후원 프로젝트: 플랫폼 기록, 자동 인증
  documents?: { id: ID; name: string; url?: string; submittedAt: ISODate }[] // 본인 + 관리자만
  requestNote?: string // 인증 신청 시 관리자에게 남긴 메모
}

export interface CareerReviewLog {
  itemId: ID
  artistId: ID
  adminId: ID
  action: 'verify' | 'reject' | 'revoke'
  reason?: string
  textSnapshot: string // 처리 당시 문구
  at: ISODate
}

export type Role = 'user' | 'admin'

export interface User {
  id: ID
  handle: string
  name: string
  avatarTone: string // mock 아바타 그라데이션 (실제 이미지 전 단계)
  avatarUrl?: string
  coverUrl?: string // 'art:a3' 형태면 mock 작품
  place?: string
  statement?: string // 작가노트 한 줄
  tags: string[]
  isArtist: boolean
  role: Role
  career: CareerItem[]
  stats: { followers: number; following: number }
}

/* ---------- 작품 ---------- */
export type WorkCategory = 'painting' | 'drawing' | 'print' | 'photo' | 'sculpture' | 'ceramic' | 'digital' | 'etc'
export type SaleStatus = 'available' | 'reserved' | 'sold' | 'not_for_sale'

export interface ProcessRecord {
  title: string
  date: ISODate
  note: string
  imageUrl: string
  stage?: 'wip' | 'wip-half' | 'final' // mock 표현용
}

export interface Work {
  id: ID
  artistId: ID
  title: string
  images: { url: string; alt?: string }[]
  category: WorkCategory
  material?: string
  size?: string
  year?: number
  madePeriod?: string
  description?: string // 작품 이야기
  story?: string // 제작 스토리
  records: ProcessRecord[]
  price?: number // KRW
  saleStatus: SaleStatus
  likes: number
  fromProjectId?: ID
  status: 'draft' | 'published'
  createdAt: ISODate
}

/* ---------- 구매 ---------- */
export interface AddOnOption {
  id: ID
  kind: 'frame' | 'install' | 'care'
  name: string
  description: string
  price: number
}

export type OrderStatus = 'paid' | 'confirmed' | 'shipping' | 'delivered' | 'stored' | 'completed' | 'cancelled' | 'refunded'

export interface Order {
  id: ID
  workId: ID
  buyerId: ID
  sellerId: ID
  addOns: { name: string; price: number }[]
  amounts: { work: number; addOns: number; fulfillment: number; total: number }
  fulfillment: 'delivery' | 'storage'
  storageMonths?: number
  status: OrderStatus
  createdAt: ISODate
}

/* ---------- 후원 (크라우드 펀딩형, DESIGN.md §4.7) ---------- */
export type ProjectStatus = 'recruiting' | 'in_progress' | 'delayed' | 'awaiting_close' | 'completed' | 'ended'
export type MilestoneStatus = 'upcoming' | 'deciding' | 'closed'

export interface Milestone {
  id: ID
  order: number // 1..N
  goal: string
  dueDate: ISODate // 제시일
  isFinal: boolean
  submission?: { imageUrls: string[]; note: string; submittedAt: ISODate; stage?: 'wip' | 'wip-half' }
  decisionDeadline?: ISODate // 업로드 + 7일, 이후 무응답자는 자동 지속
  decisions?: { continued: number; left: number; pending: number }
  status: MilestoneStatus
}

export interface Reward {
  amount: number // 회당 금액 기준
  text: string
}

export interface SupportProject {
  id: ID
  artistId: ID
  title: string
  direction: string // 작품의 미래 방향
  coverUrl: string
  milestones: Milestone[]
  rewards: Reward[]
  activeBackers: number
  totalBackers: number
  totalFunded: number
  linkedWorkId?: ID
  status: 'recruiting' | 'in_progress' | 'completed' | 'ended' // 저장 상태. delayed/awaiting_close는 파생 (domain/rules.ts)
  endReason?: string
  createdAt: ISODate
  closedAt?: ISODate
}

export type DecisionChoice = 'continue' | 'leave'

export interface Backing {
  id: ID
  projectId: ID
  backerId: ID
  amountPerMilestone: number
  paidTotal: number
  status: 'active' | 'left' | 'finished'
  decisions: Record<ID, DecisionChoice> // milestoneId → 선택
  joinedAt: ISODate
}

/* ---------- 운영 ---------- */
export interface PlatformSettings {
  verifiedBadgeThreshold: number // 기본 5
  verifiedFeedBoost: number // 기본 1.3
  decisionWindowDays: number // 7
  storageFreeMonths: number // 3
}
