import { http } from 'msw'
import type { CareerItem } from '../../entities/types'
import { applyCareerEdit } from '../../domain/rules'
import * as db from '../data'
import { badRequest, json, newId, noContent, notFound, projectView, stateOf, unauthorized, userView, viewerOf, workView } from './util'

const byHandle = (h: unknown) => db.users.find(u => u.handle === h)

export const userHandlers = [
  http.get('*/api/me', ({ request }) => {
    const v = viewerOf(request)
    return json(v ? userView(v, v) : null)
  }),
  http.patch('*/api/me', async ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const body = (await request.json()) as { name?: string; statement?: string; tags?: string[]; place?: string }
    if (body.name !== undefined && !body.name.trim()) return badRequest('name required')
    Object.assign(v, body)
    return json(userView(v, v))
  }),
  http.get('*/api/settings', () => json(db.settings)),

  http.get('*/api/users/:handle', ({ request, params }) => {
    const u = byHandle(params.handle)
    return u && u.role !== 'admin' ? json(userView(u, viewerOf(request))) : notFound()
  }),
  http.get('*/api/users/:handle/works', ({ request, params }) => {
    const u = byHandle(params.handle)
    if (!u) return notFound()
    return json(db.works.filter(w => w.artistId === u.id).map(w => workView(w, viewerOf(request))))
  }),
  http.get('*/api/users/:handle/projects', ({ request, params }) => {
    const u = byHandle(params.handle)
    if (!u) return notFound()
    return json(db.projects.filter(p => p.artistId === u.id).map(p => projectView(p, viewerOf(request))))
  }),
  // 소장품 (공개 여부는 미결정 §8 — 시안 기준 공개)
  http.get('*/api/users/:handle/collection', ({ request, params }) => {
    const u = byHandle(params.handle)
    if (!u) return notFound()
    const ids = new Set(db.orders.filter(o => o.buyerId === u.id).map(o => o.workId))
    return json(db.works.filter(w => ids.has(w.id)).map(w => workView(w, viewerOf(request))))
  }),
  ...[true, false].map(on => (on ? http.post : http.delete)('*/api/users/:handle/follow', ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const u = byHandle(params.handle)
    if (!u) return notFound()
    const f = stateOf(v.id).following
    if (on) f.add(u.id); else f.delete(u.id)
    return noContent()
  })),

  /* ---------- 경력 · 인증 (§4.8) ---------- */
  http.post('*/api/me/career', async ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const body = (await request.json()) as Omit<CareerItem, 'id' | 'verifyStatus'>
    if (!body.text?.trim()) return badRequest('text required')
    const item: CareerItem = { ...body, id: newId('c'), text: body.text.trim(), verifyStatus: 'unverified' }
    v.career.push(item)
    return json(item, 201)
  }),
  http.patch('*/api/me/career/:id', async ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const i = v.career.findIndex(c => c.id === params.id)
    if (i < 0) return notFound()
    if (v.career[i].auto) return badRequest('플랫폼 기록은 수정할 수 없어요')
    v.career[i] = applyCareerEdit(v.career[i], (await request.json()) as Partial<CareerItem>)
    return json(v.career[i])
  }),
  http.delete('*/api/me/career/:id', ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    v.career = v.career.filter(c => c.id !== params.id || c.auto)
    return noContent()
  }),
  http.post('*/api/me/career/:id/verify-request', async ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const c = v.career.find(x => x.id === params.id)
    if (!c) return notFound()
    const body = (await request.json()) as { documents: { name: string; url?: string }[]; note?: string }
    if (!body.documents?.length) return badRequest('documents required')
    c.verifyStatus = 'pending'
    c.rejectReason = undefined
    c.documents = body.documents.map(d => ({ id: newId('d'), name: d.name, url: d.url, submittedAt: db.TODAY }))
    c.requestNote = body.note
    return json(c)
  }),
]
