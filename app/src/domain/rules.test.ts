import { describe, expect, it } from 'vitest'
import type { Backing, CareerItem, Milestone, PlatformSettings, SupportProject, User } from '../entities/types'
import {
  applyCareerEdit, checkoutTotal, effectiveDecision, feedScore, isVerifiedArtist, projectStatus,
  settleMilestone, submitMilestone, supportEligibility, verifiedCount, wouldLoseBadge,
} from './rules'

const S: PlatformSettings = { verifiedBadgeThreshold: 5, verifiedFeedBoost: 1.3, decisionWindowDays: 7, storageFreeMonths: 3 }
const item = (id: string, over: Partial<CareerItem> = {}): CareerItem =>
  ({ id, category: 'exhibition', yearFrom: 2024, text: `항목 ${id}`, isPublic: true, verifyStatus: 'verified', ...over })
const artist = (career: CareerItem[], over: Partial<User> = {}): User =>
  ({ id: 'u1', handle: 'a', name: '작가', avatarTone: '', tags: [], isArtist: true, role: 'user', career, stats: { followers: 0, following: 0 }, ...over })
const five = ['1', '2', '3', '4', '5'].map(i => item(i))

describe('작가 인증', () => {
  it('공개 + 인증 항목만 센다', () => {
    expect(verifiedCount([...five, item('6', { isPublic: false }), item('7', { verifyStatus: 'pending' })])).toBe(5)
  })
  it('기준 개수 이상이면 인증 작가', () => {
    expect(isVerifiedArtist(artist(five), S)).toBe(true)
    expect(isVerifiedArtist(artist(five.slice(0, 4)), S)).toBe(false)
    expect(isVerifiedArtist(artist(five), { ...S, verifiedBadgeThreshold: 6 })).toBe(false)
    expect(isVerifiedArtist(artist(five, { isArtist: false }), S)).toBe(false)
  })
  it('인증된 항목의 내용을 바꾸면 미인증으로 돌아간다', () => {
    expect(applyCareerEdit(item('1'), { text: '바뀐 문구' }).verifyStatus).toBe('unverified')
    expect(applyCareerEdit(item('1'), { text: '항목 1' }).verifyStatus).toBe('verified')
  })
  it('공개 여부만 바꾸면 인증은 유지된다', () => {
    expect(applyCareerEdit(item('1'), { isPublic: false }).verifyStatus).toBe('verified')
  })
  it('비공개 전환으로 기준 아래가 되면 마크 해제 경고', () => {
    const next = five.map((c, i) => (i === 0 ? { ...c, isPublic: false } : c))
    expect(wouldLoseBadge(artist(five), next, S)).toBe(true)
  })
})

describe('피드', () => {
  it('인증 작가 작품에 가중치를 곱한다', () => {
    const w = { likes: 100 } as Parameters<typeof feedScore>[0]
    expect(feedScore(w, true, S)).toBe(130)
    expect(feedScore(w, false, S)).toBe(100)
  })
})

const ms = (order: number, over: Partial<Milestone> = {}): Milestone =>
  ({ id: `m${order}`, order, goal: `${order}단계`, dueDate: '2026-11-01', isFinal: false, status: 'upcoming', ...over })
const project = (over: Partial<SupportProject> = {}): SupportProject => ({
  id: 'p1', artistId: 'u1', title: 'P', direction: '', coverUrl: 'art:a3', rewards: [],
  milestones: [ms(1, { status: 'closed' }), ms(2, { dueDate: '2026-10-07' }), ms(3, { isFinal: true })],
  activeBackers: 10, totalBackers: 12, totalFunded: 0, status: 'in_progress', createdAt: '2026-08-01', ...over,
})

describe('후원 프로젝트 상태', () => {
  it('제시일이 지났는데 결과물이 없으면 지연', () => {
    expect(projectStatus(project(), '2026-10-11')).toBe('delayed')
    expect(projectStatus(project(), '2026-10-05')).toBe('in_progress')
  })
  it('후원자가 0명이면 종료 대기', () => {
    expect(projectStatus(project({ activeBackers: 0 }), '2026-10-05')).toBe('awaiting_close')
  })
  it('끝난 프로젝트는 그대로', () => {
    expect(projectStatus(project({ status: 'ended', activeBackers: 0 }), '2026-10-11')).toBe('ended')
  })
})

describe('후원 프로젝트 개설 조건', () => {
  it('인증 작가 + 끝나지 않은 프로젝트 없음', () => {
    expect(supportEligibility(artist(five), [], S).ok).toBe(true)
    expect(supportEligibility(artist(five.slice(0, 3)), [], S).reasons).toEqual(['not_verified'])
    expect(supportEligibility(artist(five), [project()], S).reasons).toEqual(['open_project'])
    expect(supportEligibility(artist(five), [project({ status: 'completed' })], S).ok).toBe(true)
    expect(supportEligibility(null, [], S).reasons).toEqual(['login'])
  })
})

describe('지속 / 이탈', () => {
  const m = ms(2, { status: 'deciding', decisionDeadline: '2026-10-14' })
  const back = (id: string, amt: number, choice?: 'continue' | 'leave'): Backing =>
    ({ id, projectId: 'p1', backerId: id, amountPerMilestone: amt, paidTotal: 0, status: 'active', decisions: choice ? { m2: choice } : {}, joinedAt: '2026-08-01' })

  it('선택 기간 안의 무응답은 대기, 지나면 자동 지속', () => {
    expect(effectiveDecision(back('a', 1), m, '2026-10-14')).toBe('pending')
    expect(effectiveDecision(back('a', 1), m, '2026-10-15')).toBe('continue')
  })
  it('정산: 지속(명시 + 자동) 후원자의 회당 금액 합', () => {
    const r = settleMilestone(m, [back('a', 30000, 'continue'), back('b', 10000, 'leave'), back('c', 50000)], '2026-10-15')
    expect(r).toEqual({ amount: 80000, continued: 2, left: 1 })
  })
  it('결과물 업로드 시 7일 선택 기간 시작, 이전 선택 기간은 닫힘', () => {
    const p = submitMilestone(project({ milestones: [ms(1, { status: 'deciding' }), ms(2)] }), 'm2', '노트', [], '2026-10-11', S)
    expect(p.milestones[0].status).toBe('closed')
    expect(p.milestones[1]).toMatchObject({ status: 'deciding', decisionDeadline: '2026-10-18', decisions: { pending: 10 } })
  })
})

describe('구매 합계', () => {
  const base = { workPrice: 1_000_000, addOnPrices: [180_000], shippingFee: 45_000, storageMonthly: 15_000, storageFreeMonths: 3 }
  it('배송', () => expect(checkoutTotal({ ...base, fulfillment: 'delivery', storageMonths: 0 }).total).toBe(1_225_000))
  it('보관 3개월은 무료, 6개월은 3개월분 과금', () => {
    expect(checkoutTotal({ ...base, fulfillment: 'storage', storageMonths: 3 }).fulfillment).toBe(0)
    expect(checkoutTotal({ ...base, fulfillment: 'storage', storageMonths: 6 }).fulfillment).toBe(45_000)
  })
})
