// API 계약 테스트: mock 핸들러(= 백엔드 명세 초안)가 규칙대로 동작하는지 확인
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { handlers } from './handlers/index'

const server = setupServer(...handlers)
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())

const call = async (method: string, path: string, user: string, body?: unknown) => {
  const res = await fetch(`http://localhost/api${path}`, {
    method, headers: { 'content-type': 'application/json', 'x-mock-user': user }, body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: res.status === 204 ? null : await res.json().catch(() => null) }
}

describe('경력 · 인증', () => {
  it('타인에게는 비공개 항목과 심사 상태를 숨긴다', async () => {
    const { data } = await call('GET', '/users/moss.studio', 'u-haneul')
    expect(data.career.some((c: { isPublic: boolean }) => !c.isPublic)).toBe(false)
    expect(data.career.map((c: { verifyStatus: string }) => c.verifyStatus)).not.toContain('pending')
  })
  it('인증된 항목을 수정하면 미인증이 된다', async () => {
    const { data } = await call('PATCH', '/me/career/c1', 'u-jiwoo', { text: '홍익대학교 회화과 졸업 (수석)' })
    expect(data.verifyStatus).toBe('unverified')
  })
  it('관리자 인증으로 기준 개수에 도달하면 인증 작가가 된다', async () => {
    expect((await call('GET', '/users/moss.studio', 'u-haneul')).data.isVerified).toBe(false)
    await call('POST', '/me/career/c26/verify-request', 'u-moss', { documents: [{ name: 'cover.pdf' }] })
    await call('POST', '/admin/career-reviews/c23/verify', 'u-admin')
    await call('POST', '/admin/career-reviews/c26/verify', 'u-admin')
    // 공개 인증 4개 (c25는 비공개라 제외) → 아직 아님
    expect((await call('GET', '/users/moss.studio', 'u-haneul')).data.verifiedCount).toBe(4)
    await call('PATCH', '/admin/settings', 'u-admin', { verifiedBadgeThreshold: 4 })
    expect((await call('GET', '/users/moss.studio', 'u-haneul')).data.isVerified).toBe(true)
    await call('PATCH', '/admin/settings', 'u-admin', { verifiedBadgeThreshold: 5 })
  })
  it('관리자가 아니면 심사 API에 접근할 수 없다', async () => {
    expect((await call('GET', '/admin/career-reviews', 'u-jiwoo')).status).toBe(403)
    expect((await call('POST', '/admin/career-reviews/c31/reject', 'u-admin', {})).status).toBe(400) // 사유 필수
  })
})

describe('구매', () => {
  it('주문하면 작품이 예약중이 되고, 판매자만 주문을 확인할 수 있다', async () => {
    const { status, data } = await call('POST', '/orders', 'u-haneul', { workId: 'w4', addOnIds: ['frame'], fulfillment: 'storage', storageMonths: 6 })
    expect(status).toBe(201)
    expect(data.amounts).toEqual({ work: 1350000, addOns: 180000, fulfillment: 45000, total: 1575000 })
    expect((await call('GET', '/works/w4', 'u-haneul')).data.saleStatus).toBe('reserved')
    expect((await call('PATCH', `/orders/${data.id}`, 'u-haneul', { status: 'confirmed' })).status).toBe(403)
    expect((await call('PATCH', `/orders/${data.id}`, 'u-serin', { status: 'confirmed' })).status).toBe(200)
    expect((await call('PATCH', `/orders/${data.id}`, 'u-serin', { status: 'completed' })).status).toBe(400)
  })
  it('내 작품 · 판매 완료 작품은 살 수 없다', async () => {
    expect((await call('POST', '/orders', 'u-jiwoo', { workId: 'w1', addOnIds: [], fulfillment: 'storage' })).status).toBe(400)
    expect((await call('POST', '/orders', 'u-haneul', { workId: 'w2', addOnIds: [], fulfillment: 'storage' })).status).toBe(400)
  })
})

describe('후원', () => {
  it('미인증 작가는 프로젝트를 열 수 없다', async () => {
    const { data } = await call('GET', '/me/support-eligibility', 'u-doyoon')
    expect(data.reasons).toContain('not_verified')
    expect((await call('POST', '/support-projects', 'u-doyoon', {})).status).toBe(403)
  })
  it('진행 중 프로젝트가 있으면 새로 열 수 없다', async () => {
    expect((await call('GET', '/me/support-eligibility', 'u-jiwoo')).data.reasons).toEqual(['open_project'])
  })
  it('이탈하면 현재 후원자가 줄고, 선택 기간 안에는 되돌릴 수 있다', async () => {
    const before = (await call('GET', '/support-projects/p1', 'u-haneul')).data.activeBackers
    await call('POST', '/milestones/m3/decision', 'u-haneul', { choice: 'leave' })
    expect((await call('GET', '/support-projects/p1', 'u-haneul')).data.activeBackers).toBe(before - 1)
    await call('POST', '/milestones/m3/decision', 'u-haneul', { choice: null })
    expect((await call('GET', '/support-projects/p1', 'u-haneul')).data.activeBackers).toBe(before)
  })
  it('후원자가 아니면 선택할 수 없다', async () => {
    expect((await call('POST', '/milestones/m3/decision', 'u-moss', { choice: 'continue' })).status).toBe(403)
  })
  it('마지막 결과물을 올리면 완성되고 경력에 자동 인증 항목이 생긴다', async () => {
    const before = (await call('GET', '/me', 'u-serin')).data.career.length
    for (const id of ['m21', 'm22', 'm23']) {
      expect((await call('POST', `/milestones/${id}/submission`, 'u-serin', { note: id, imageUrls: [] })).status).toBe(200)
      // mock 단순화: 다음 단계를 올리기 전 선택 기간을 닫는다
      const p = (await call('GET', '/support-projects/p2', 'u-serin')).data
      if (p.status !== 'completed') await call('POST', '/__dev/close-decisions', 'u-serin', { projectId: 'p2' })
    }
    const me = (await call('GET', '/me', 'u-serin')).data
    expect((await call('GET', '/support-projects/p2', 'u-serin')).data.status).toBe('completed')
    expect(me.career.length).toBe(before + 1)
    expect(me.career.at(-1)).toMatchObject({ category: 'support_project', verifyStatus: 'verified', auto: true })
  })
  it('종료하면 새 프로젝트를 열 수 있다', async () => {
    expect((await call('POST', '/support-projects/p5/close', 'u-ian', { reason: '테스트' })).status).toBe(204)
    expect((await call('GET', '/me/support-eligibility', 'u-ian')).data.ok).toBe(true)
  })
})
