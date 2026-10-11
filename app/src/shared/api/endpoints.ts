// 엔드포인트 함수. DESIGN.md §6.4 API 초안과 1:1로 맞춘다.
import type { AddOnOption, Backing, CareerItem, CareerReviewLog, DecisionChoice, OrderStatus, PlatformSettings } from '../../entities/types'
import { api } from './client'
import type {
  BackingView, Eligibility, FeedTab, NewProjectInput, NewWorkInput, OrderView, ProjectView, ReviewItem, UserView, WorkDetailView, WorkView,
} from './types'

export type CareerInput = Pick<CareerItem, 'category' | 'yearFrom' | 'yearTo' | 'text' | 'isPublic'>
export type Scenario = 'normal' | 'delayed' | 'no_backers'

export const endpoints = {
  me: () => api.get<UserView | null>('/me'),
  updateMe: (body: { name?: string; statement?: string; tags?: string[]; place?: string }) => api.patch<UserView>('/me', body),
  settings: () => api.get<PlatformSettings>('/settings'),

  /* 작품 */
  feed: (tab: FeedTab) => api.get<WorkView[]>(`/feed?tab=${tab}`),
  works: (q: string, category: string) => api.get<WorkView[]>(`/works?${new URLSearchParams({ q, category })}`),
  work: (id: string) => api.get<WorkDetailView>(`/works/${id}`),
  createWork: (body: NewWorkInput) => api.post<WorkView>('/works', body),
  saved: () => api.get<WorkView[]>('/me/saved'),
  like: (id: string, on: boolean) => (on ? api.post<void>(`/works/${id}/like`) : api.delete<void>(`/works/${id}/like`)),
  save: (id: string, on: boolean) => (on ? api.post<void>(`/works/${id}/save`) : api.delete<void>(`/works/${id}/save`)),

  /* 사용자 */
  user: (handle: string) => api.get<UserView>(`/users/${handle}`),
  userWorks: (handle: string) => api.get<WorkView[]>(`/users/${handle}/works`),
  userProjects: (handle: string) => api.get<ProjectView[]>(`/users/${handle}/projects`),
  userCollection: (handle: string) => api.get<WorkView[]>(`/users/${handle}/collection`),
  follow: (handle: string, on: boolean) => (on ? api.post<void>(`/users/${handle}/follow`) : api.delete<void>(`/users/${handle}/follow`)),

  /* 경력 · 인증 */
  addCareer: (body: CareerInput) => api.post<CareerItem>('/me/career', body),
  editCareer: (id: string, body: Partial<CareerInput>) => api.patch<CareerItem>(`/me/career/${id}`, body),
  deleteCareer: (id: string) => api.delete<void>(`/me/career/${id}`),
  requestVerify: (id: string, body: { documents: { name: string; url?: string }[]; note?: string }) =>
    api.post<CareerItem>(`/me/career/${id}/verify-request`, body),

  /* 구매 */
  addOns: () => api.get<AddOnOption[]>('/addons'),
  pricing: () => api.get<{ shippingFee: number; storageMonthly: number; storageFreeMonths: number }>('/pricing'),
  createOrder: (body: { workId: string; addOnIds: string[]; fulfillment: 'delivery' | 'storage'; storageMonths?: number; address?: string }) =>
    api.post<OrderView>('/orders', body),
  myOrders: (role: 'buyer' | 'seller') => api.get<OrderView[]>(`/me/orders?role=${role}`),
  updateOrder: (id: string, status: OrderStatus) => api.patch<OrderView>(`/orders/${id}`, { status }),

  /* 후원 */
  projects: () => api.get<ProjectView[]>('/support-projects'),
  project: (id: string) => api.get<ProjectView>(`/support-projects/${id}`),
  eligibility: () => api.get<Eligibility>('/me/support-eligibility'),
  createProject: (body: NewProjectInput) => api.post<ProjectView>('/support-projects', body),
  back: (projectId: string, amountPerMilestone: number) => api.post<Backing>(`/support-projects/${projectId}/backings`, { amountPerMilestone }),
  myBackings: () => api.get<BackingView[]>('/me/backings'),
  decide: (milestoneId: string, choice: DecisionChoice | null) => api.post<Backing>(`/milestones/${milestoneId}/decision`, { choice }),
  submitMilestone: (milestoneId: string, body: { note: string; imageUrls: string[] }) => api.post<ProjectView>(`/milestones/${milestoneId}/submission`, body),
  closeProject: (id: string, reason: string) => api.post<void>(`/support-projects/${id}/close`, { reason }),

  /* 관리자 */
  reviews: (status = 'pending') => api.get<ReviewItem[]>(`/admin/career-reviews?status=${status}`),
  review: (itemId: string) => api.get<ReviewItem>(`/admin/career-reviews/${itemId}`),
  reviewLogs: (itemId: string) => api.get<CareerReviewLog[]>(`/admin/career-reviews/${itemId}/logs`),
  reviewAction: (itemId: string, action: 'verify' | 'reject' | 'revoke', reason?: string) =>
    api.post<ReviewItem>(`/admin/career-reviews/${itemId}/${action}`, { reason }),
  adminSettings: () => api.get<PlatformSettings>('/admin/settings'),
  updateSettings: (body: Partial<PlatformSettings>) => api.patch<PlatformSettings>('/admin/settings', body),

  /* mock 전용 */
  scenario: () => api.get<{ scenario: Scenario }>('/__dev/scenario'),
  setScenario: (scenario: Scenario) => api.post<{ scenario: Scenario }>('/__dev/scenario', { scenario }),
  closeDecisions: () => api.post<{ ok: boolean }>('/__dev/close-decisions', {}),
}
