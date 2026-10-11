import { http } from 'msw'
import type { User } from '../../entities/types'
import { verifiedCount } from '../../domain/rules'
import type { ReviewItem } from '../../shared/api/types'
import * as db from '../data'
import { badRequest, forbidden, json, notFound, summary, unauthorized, viewerOf } from './util'

const requireAdmin = (req: Request) => {
  const v = viewerOf(req)
  return !v ? unauthorized() : v.role !== 'admin' ? forbidden('관리자만 접근할 수 있어요') : v
}
const reviewItem = (u: User, itemId: string): ReviewItem => ({
  item: u.career.find(c => c.id === itemId)!,
  artist: { ...summary(u), verifiedCount: verifiedCount(u.career) },
  otherItems: u.career.filter(c => c.id !== itemId),
})
const findItem = (itemId: unknown) => {
  const u = db.users.find(x => x.career.some(c => c.id === itemId))
  return u ? { u, c: u.career.find(c => c.id === itemId)! } : null
}

export const adminHandlers = [
  http.get('*/api/admin/career-reviews', ({ request }) => {
    const a = requireAdmin(request)
    if (a instanceof Response) return a
    const status = new URL(request.url).searchParams.get('status') ?? 'pending'
    const list = db.users.flatMap(u => u.career.filter(c => c.verifyStatus === status).map(c => reviewItem(u, c.id)))
    return json(list)
  }),
  http.get('*/api/admin/career-reviews/:itemId', ({ request, params }) => {
    const a = requireAdmin(request)
    if (a instanceof Response) return a
    const f = findItem(params.itemId)
    return f ? json(reviewItem(f.u, f.c.id)) : notFound()
  }),
  http.get('*/api/admin/career-reviews/:itemId/logs', ({ request, params }) => {
    const a = requireAdmin(request)
    if (a instanceof Response) return a
    return json(db.reviewLogs.filter(l => l.itemId === params.itemId))
  }),
  ...(['verify', 'reject', 'revoke'] as const).map(action =>
    http.post(`*/api/admin/career-reviews/:itemId/${action}`, async ({ request, params }) => {
      const a = requireAdmin(request)
      if (a instanceof Response) return a
      const f = findItem(params.itemId)
      if (!f) return notFound()
      const { reason } = (await request.json().catch(() => ({}))) as { reason?: string }
      if (action !== 'verify' && !reason?.trim()) return badRequest('사유를 입력해 주세요')
      if (action === 'revoke' && f.c.verifyStatus !== 'verified') return badRequest('인증된 항목만 취소할 수 있어요')
      if (action !== 'revoke' && f.c.verifyStatus !== 'pending') return badRequest('심사 중인 항목이 아니에요')
      f.c.verifyStatus = action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'unverified'
      f.c.verifiedAt = action === 'verify' ? db.TODAY : undefined
      f.c.rejectReason = action === 'reject' ? reason : undefined
      db.reviewLogs.push({ itemId: f.c.id, artistId: f.u.id, adminId: a.id, action, reason, textSnapshot: f.c.text, at: db.TODAY })
      return json(reviewItem(f.u, f.c.id))
    })),

  http.get('*/api/admin/settings', ({ request }) => {
    const a = requireAdmin(request)
    return a instanceof Response ? a : json(db.settings)
  }),
  http.patch('*/api/admin/settings', async ({ request }) => {
    const a = requireAdmin(request)
    if (a instanceof Response) return a
    const body = (await request.json()) as Partial<typeof db.settings>
    if (body.verifiedBadgeThreshold !== undefined && !(body.verifiedBadgeThreshold >= 1)) return badRequest('기준 개수는 1 이상')
    if (body.verifiedFeedBoost !== undefined && !(body.verifiedFeedBoost >= 1)) return badRequest('가중치는 1.0 이상')
    Object.assign(db.settings, body)
    return json(db.settings)
  }),
]
