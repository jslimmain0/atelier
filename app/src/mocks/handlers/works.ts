import { http } from 'msw'
import type { Work } from '../../entities/types'
import { feedScore, isVerifiedArtist } from '../../domain/rules'
import type { FeedTab, NewWorkInput, WorkDetailView } from '../../shared/api/types'
import * as db from '../data'
import { badRequest, json, newId, noContent, notFound, stateOf, unauthorized, userById, viewerOf, workView } from './util'

export const workHandlers = [
  http.get('*/api/feed', ({ request }) => {
    const viewer = viewerOf(request)
    const tab = (new URL(request.url).searchParams.get('tab') ?? 'foryou') as FeedTab
    const score = (w: Work) => feedScore(w, isVerifiedArtist(userById(w.artistId), db.settings), db.settings)
    let list = db.works.filter(w => w.status === 'published')
    if (tab === 'following') {
      const f = viewer ? stateOf(viewer.id).following : new Set<string>()
      list = list.filter(w => f.has(w.artistId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else if (tab === 'popular') {
      list = list.sort((a, b) => score(b) - score(a))
    } else {
      // 추천: 점수 - 경과일 패널티 (mock)
      const age = (w: Work) => (Date.parse(db.TODAY) - Date.parse(w.createdAt)) / 864e5
      list = list.sort((a, b) => score(b) - age(b) * 40 - (score(a) - age(a) * 40))
    }
    return json(list.map(w => workView(w, viewer)))
  }),

  http.get('*/api/works', ({ request }) => {
    const sp = new URL(request.url).searchParams
    const q = (sp.get('q') ?? '').trim().toLowerCase()
    const category = sp.get('category') ?? 'all'
    const list = db.works.filter(w => {
      if (w.status !== 'published') return false
      if (category !== 'all' && w.category !== category) return false
      if (!q) return true
      const a = userById(w.artistId)
      return [w.title, a.name, a.handle, w.material ?? ''].some(t => t.toLowerCase().includes(q))
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return json(list.map(w => workView(w, viewerOf(request))))
  }),

  http.post('*/api/works', async ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const body = (await request.json()) as NewWorkInput
    if (!body.title?.trim() || !body.imageUrls?.length) return badRequest('title, imageUrls required')
    const w: Work = {
      id: newId('w'), artistId: v.id, title: body.title.trim(), images: body.imageUrls.map(url => ({ url })), category: body.category,
      material: body.material, size: body.size, year: body.year, madePeriod: body.year ? String(body.year) : undefined,
      description: body.description, story: body.story, records: [], price: body.price,
      saleStatus: body.price ? 'available' : 'not_for_sale', likes: 0, status: 'published', createdAt: db.TODAY,
    }
    db.works.unshift(w)
    v.isArtist = true // 첫 작품 등록 시 작가 기능 활성화 (mock)
    return json(workView(w, v), 201)
  }),

  http.get('*/api/works/:id', ({ request, params }) => {
    const w = db.works.find(x => x.id === params.id)
    if (!w) return notFound()
    const artist = userById(w.artistId)
    const mine = db.works.filter(x => x.artistId === artist.id)
    const body: WorkDetailView = {
      ...workView(w, viewerOf(request)),
      artistInfo: { statement: artist.statement, works: mine.length, sold: mine.filter(x => x.saleStatus === 'sold').length },
    }
    return json(body)
  }),

  ...(['like', 'save'] as const).flatMap(kind => {
    const key = kind === 'like' ? 'liked' : 'saved'
    const toggle = (on: boolean) => ({ request, params }: { request: Request; params: Record<string, unknown> }) => {
      const v = viewerOf(request)
      if (!v) return unauthorized()
      const w = db.works.find(x => x.id === params.id)
      if (!w) return notFound()
      const set = stateOf(v.id)[key]
      if (kind === 'like' && on !== set.has(w.id)) w.likes += on ? 1 : -1
      if (on) set.add(w.id); else set.delete(w.id)
      return noContent()
    }
    return [http.post(`*/api/works/:id/${kind}`, toggle(true)), http.delete(`*/api/works/:id/${kind}`, toggle(false))]
  }),

  http.get('*/api/me/saved', ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const saved = stateOf(v.id).saved
    return json(db.works.filter(w => saved.has(w.id)).map(w => workView(w, v)))
  }),
]
