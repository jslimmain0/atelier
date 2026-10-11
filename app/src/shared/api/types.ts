// API 응답 형태(뷰 모델). 저장 모델(entities/types)에 화면용 파생 값을 붙인 것.
import type { Backing, CareerItem, Order, ProjectStatus, SupportProject, User, Work } from '../../entities/types'

export interface ArtistSummary {
  id: string
  handle: string
  name: string
  avatarTone: string
  place?: string
  isVerified: boolean
}

export interface WorkView extends Work {
  artist: ArtistSummary
  viewer: { liked: boolean; saved: boolean; followingArtist: boolean; isMine: boolean }
}

/** 작품 상세: 작가 카드용 정보 추가 */
export interface WorkDetailView extends WorkView {
  artistInfo: { statement?: string; works: number; sold: number }
}

export interface UserView extends User {
  isVerified: boolean
  verifiedCount: number
  viewer: { isFollowing: boolean; isSelf: boolean }
}

export interface ProjectView extends SupportProject {
  artist: ArtistSummary
  displayStatus: ProjectStatus
  viewer: { backing: Backing | null; isMine: boolean }
}

export interface OrderView extends Order {
  work: { id: string; title: string; imageUrl: string }
  buyer: { handle: string; name: string }
  seller: { handle: string; name: string }
}

export interface BackingView extends Backing {
  project: ProjectView
}

export interface Eligibility {
  ok: boolean
  reasons: ('login' | 'not_artist' | 'not_verified' | 'open_project')[]
  verifiedCount: number
  threshold: number
  openProject?: { id: string; title: string }
}

export interface ReviewItem {
  item: CareerItem
  artist: ArtistSummary & { verifiedCount: number }
  otherItems: CareerItem[]
}

export interface NewWorkInput {
  title: string
  category: Work['category']
  material?: string
  size?: string
  year?: number
  description?: string
  story?: string
  price?: number
  imageUrls: string[]
}

export interface NewProjectInput {
  title: string
  direction: string
  coverUrl?: string
  milestones: { goal: string; dueDate: string }[]
  rewards: { amount: number; text: string }[]
}

export type FeedTab = 'foryou' | 'following' | 'popular'
