// 비즈니스 규칙. 화면 코드와 분리해 테스트로 고정하고, 백엔드 구현의 기준으로 삼는다.
import type {
  Backing, CareerItem, DecisionChoice, ISODate, Milestone, PlatformSettings,
  ProjectStatus, SupportProject, User, Work,
} from '../entities/types'

export const daysBetween = (from: ISODate, to: ISODate) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 864e5)

export const addDays = (d: ISODate, n: number): ISODate =>
  new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10)

/* ---------- 작가 인증 (§4.8) ---------- */

/** 공개 + 인증된 경력 항목 수. 비공개 항목은 인증돼 있어도 제외 */
export const verifiedCount = (career: CareerItem[]) =>
  career.filter(c => c.isPublic && c.verifyStatus === 'verified').length

export const isVerifiedArtist = (user: User | null | undefined, s: PlatformSettings) =>
  !!user && user.isArtist && verifiedCount(user.career) >= s.verifiedBadgeThreshold

type CareerContent = Pick<CareerItem, 'category' | 'yearFrom' | 'yearTo' | 'text'>

/** 경력 수정: 내용이 바뀌면 인증이 해제된다 */
export function applyCareerEdit(item: CareerItem, patch: Partial<CareerContent> & { isPublic?: boolean }): CareerItem {
  const next = { ...item, ...patch }
  const changed = (['category', 'yearFrom', 'yearTo', 'text'] as const).some(k => k in patch && patch[k] !== item[k])
  if (changed && item.verifyStatus !== 'unverified') {
    return { ...next, verifyStatus: 'unverified', verifiedAt: undefined, rejectReason: undefined }
  }
  return next
}

/** 수정/비공개 전환 후 인증 마크가 빠지는지 (경고용) */
export function wouldLoseBadge(user: User, nextCareer: CareerItem[], s: PlatformSettings) {
  return isVerifiedArtist(user, s) && verifiedCount(nextCareer) < s.verifiedBadgeThreshold
}

/* ---------- 피드 (§4.1) ---------- */

export function feedScore(work: Work, artistVerified: boolean, s: PlatformSettings) {
  return work.likes * (artistVerified ? s.verifiedFeedBoost : 1)
}

/* ---------- 후원 (§4.7) ---------- */

export const isClosedProject = (p: SupportProject) => p.status === 'completed' || p.status === 'ended'
export const nextMilestone = (p: SupportProject) => p.milestones.find(m => m.status === 'upcoming')
export const decidingMilestone = (p: SupportProject) => p.milestones.find(m => m.status === 'deciding')
export const closedMilestoneCount = (p: SupportProject) => p.milestones.filter(m => m.status === 'closed').length

/** 화면에 보이는 프로젝트 상태 (지연·종료 대기는 파생) */
export function projectStatus(p: SupportProject, today: ISODate): ProjectStatus {
  if (isClosedProject(p)) return p.status
  if (p.status === 'in_progress' && p.activeBackers === 0) return 'awaiting_close'
  const next = nextMilestone(p)
  if (p.status === 'in_progress' && !decidingMilestone(p) && next && next.dueDate < today) return 'delayed'
  return p.status
}

export type EligibilityReason = 'login' | 'not_artist' | 'not_verified' | 'open_project'

/** 후원 프로젝트 개설 조건: 인증 작가 + 끝나지 않은 프로젝트 없음 */
export function supportEligibility(user: User | null, projects: SupportProject[], s: PlatformSettings) {
  const reasons: EligibilityReason[] = []
  if (!user) return { ok: false, reasons: ['login' as const] }
  if (!user.isArtist) reasons.push('not_artist')
  if (!isVerifiedArtist(user, s)) reasons.push('not_verified')
  if (projects.some(p => p.artistId === user.id && !isClosedProject(p))) reasons.push('open_project')
  return { ok: reasons.length === 0, reasons }
}

/** 후원자의 이번 마일스톤 선택. 선택 기간이 지나면 무응답은 자동 지속 */
export function effectiveDecision(b: Backing, m: Milestone, today: ISODate): DecisionChoice | 'pending' {
  const chosen = b.decisions[m.id]
  if (chosen) return chosen
  if (m.decisionDeadline && today > m.decisionDeadline) return 'continue'
  return 'pending'
}

/** 선택 기간 종료 시점의 정산: 지속(명시 + 자동) 후원자의 회당 금액 합 */
export function settleMilestone(m: Milestone, backings: Backing[], deadlinePassedOn: ISODate) {
  let amount = 0
  let continued = 0
  let left = 0
  for (const b of backings) {
    if (b.status !== 'active') continue
    const d = effectiveDecision(b, m, deadlinePassedOn)
    if (d === 'continue') { amount += b.amountPerMilestone; continued++ }
    else if (d === 'leave') left++
  }
  return { amount, continued, left }
}

/** 마일스톤 결과물 업로드: 선택 기간 시작 */
export function submitMilestone(p: SupportProject, milestoneId: string, note: string, imageUrls: string[], today: ISODate, s: PlatformSettings): SupportProject {
  return {
    ...p,
    milestones: p.milestones.map(m => {
      if (m.status === 'deciding') return { ...m, status: 'closed' }
      if (m.id !== milestoneId) return m
      return {
        ...m,
        status: 'deciding',
        submission: { imageUrls, note, submittedAt: today },
        decisionDeadline: addDays(today, s.decisionWindowDays),
        decisions: { continued: 0, left: 0, pending: p.activeBackers },
      }
    }),
  }
}

/* ---------- 구매 (§4.5) ---------- */

/** 판매 수수료율 — 임시값 (DESIGN.md §8 미결정) */
export const PLATFORM_FEE_RATE = 0.1

export function checkoutTotal(opts: {
  workPrice: number
  addOnPrices: number[]
  fulfillment: 'delivery' | 'storage'
  shippingFee: number
  storageMonths: number
  storageMonthly: number
  storageFreeMonths: number
}) {
  const addOns = opts.addOnPrices.reduce((a, b) => a + b, 0)
  const fulfillment = opts.fulfillment === 'delivery'
    ? opts.shippingFee
    : Math.max(0, opts.storageMonths - opts.storageFreeMonths) * opts.storageMonthly
  return { work: opts.workPrice, addOns, fulfillment, total: opts.workPrice + addOns + fulfillment }
}
