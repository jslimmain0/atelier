import { http } from 'msw'
import type { Order, OrderStatus } from '../../entities/types'
import { checkoutTotal } from '../../domain/rules'
import type { OrderView } from '../../shared/api/types'
import * as db from '../data'
import { badRequest, forbidden, json, newId, notFound, unauthorized, userById, viewerOf } from './util'

const orderView = (o: Order): OrderView => {
  const w = db.works.find(x => x.id === o.workId)!
  const b = userById(o.buyerId)
  const s = userById(o.sellerId)
  return { ...o, work: { id: w.id, title: w.title, imageUrl: w.images[0].url }, buyer: { handle: b.handle, name: b.name }, seller: { handle: s.handle, name: s.name } }
}

// 상태 전이: 누가 어떤 상태로 바꿀 수 있는지 (§4.6)
const TRANSITIONS: Record<string, { from: OrderStatus[]; by: 'seller' | 'buyer' }> = {
  confirmed: { from: ['paid'], by: 'seller' },
  shipping: { from: ['confirmed'], by: 'seller' },
  stored: { from: ['confirmed'], by: 'seller' },
  delivered: { from: ['shipping'], by: 'seller' }, // mock: 실제로는 운송사 연동
  completed: { from: ['delivered'], by: 'buyer' },
}

export const orderHandlers = [
  http.get('*/api/addons', () => json(db.addOns)),
  http.get('*/api/pricing', () => json({ ...db.PRICING, storageFreeMonths: db.settings.storageFreeMonths })),

  http.post('*/api/orders', async ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const body = (await request.json()) as { workId: string; addOnIds: string[]; fulfillment: 'delivery' | 'storage'; storageMonths?: number; address?: string }
    const w = db.works.find(x => x.id === body.workId)
    if (!w) return notFound()
    if (w.artistId === v.id) return badRequest('내 작품은 구매할 수 없어요')
    if (w.saleStatus !== 'available' || !w.price) return badRequest('구매할 수 없는 작품이에요')
    if (body.fulfillment === 'delivery' && !body.address?.trim()) return badRequest('배송지를 입력해 주세요')
    const add = db.addOns.filter(a => body.addOnIds.includes(a.id))
    const t = checkoutTotal({
      workPrice: w.price, addOnPrices: add.map(a => a.price), fulfillment: body.fulfillment,
      shippingFee: db.PRICING.shippingFee, storageMonths: body.storageMonths ?? 0, storageMonthly: db.PRICING.storageMonthly, storageFreeMonths: db.settings.storageFreeMonths,
    })
    const o: Order = {
      id: newId('o'), workId: w.id, buyerId: v.id, sellerId: w.artistId, addOns: add.map(a => ({ name: a.name, price: a.price })),
      amounts: t, fulfillment: body.fulfillment, storageMonths: body.fulfillment === 'storage' ? body.storageMonths : undefined, status: 'paid', createdAt: db.TODAY,
    }
    db.orders.unshift(o)
    w.saleStatus = 'reserved'
    return json(orderView(o), 201)
  }),

  http.get('*/api/me/orders', ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const role = new URL(request.url).searchParams.get('role') === 'seller' ? 'sellerId' : 'buyerId'
    return json(db.orders.filter(o => o[role] === v.id).map(orderView))
  }),

  http.patch('*/api/orders/:id', async ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const o = db.orders.find(x => x.id === params.id)
    if (!o) return notFound()
    const { status } = (await request.json()) as { status: OrderStatus }
    const rule = TRANSITIONS[status]
    if (!rule || !rule.from.includes(o.status)) return badRequest(`${o.status} → ${status} 불가`)
    if ((rule.by === 'seller' ? o.sellerId : o.buyerId) !== v.id) return forbidden()
    o.status = status
    if (status === 'completed' || status === 'stored') db.works.find(w => w.id === o.workId)!.saleStatus = 'sold'
    return json(orderView(o))
  }),
]
