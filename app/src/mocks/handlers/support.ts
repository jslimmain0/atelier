import { http } from 'msw'
import type { Backing, DecisionChoice, SupportProject } from '../../entities/types'
import { isClosedProject, submitMilestone, supportEligibility, verifiedCount } from '../../domain/rules'
import type { BackingView, Eligibility, NewProjectInput } from '../../shared/api/types'
import * as db from '../data'
import { badRequest, forbidden, json, newId, noContent, notFound, projectView, unauthorized, viewerOf } from './util'

const find = (id: unknown) => db.projects.find(p => p.id === id)

export const supportHandlers = [
  http.get('*/api/support-projects', ({ request }) => json(db.projects.map(p => projectView(p, viewerOf(request))))),
  http.get('*/api/support-projects/:id', ({ request, params }) => {
    const p = find(params.id)
    return p ? json(projectView(p, viewerOf(request))) : notFound()
  }),

  http.get('*/api/me/support-eligibility', ({ request }) => {
    const v = viewerOf(request)
    const r = supportEligibility(v, db.projects, db.settings)
    const open = v && db.projects.find(p => p.artistId === v.id && !isClosedProject(p))
    const body: Eligibility = {
      ...r, verifiedCount: v ? verifiedCount(v.career) : 0, threshold: db.settings.verifiedBadgeThreshold,
      openProject: open ? { id: open.id, title: open.title } : undefined,
    }
    return json(body)
  }),

  http.post('*/api/support-projects', async ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    if (!supportEligibility(v, db.projects, db.settings).ok) return forbidden('개설 조건을 만족하지 않아요')
    const body = (await request.json()) as NewProjectInput
    if (!body.title?.trim() || !body.direction?.trim()) return badRequest('title, direction required')
    if (body.milestones.length < 2 || body.milestones.length > 10) return badRequest('마일스톤은 2~10회')
    const p: SupportProject = {
      id: newId('p'), artistId: v.id, title: body.title.trim(), direction: body.direction.trim(), coverUrl: body.coverUrl || 'art:a3',
      milestones: body.milestones.map((m, i) => ({ id: newId('m'), order: i + 1, goal: m.goal, dueDate: m.dueDate, isFinal: i === body.milestones.length - 1, status: 'upcoming' })),
      rewards: body.rewards.filter(r => r.text.trim()), activeBackers: 0, totalBackers: 0, totalFunded: 0, status: 'recruiting', createdAt: db.TODAY,
    }
    db.projects.unshift(p)
    return json(projectView(p, v), 201)
  }),

  // 정기 후원 시작 / 금액 변경
  http.post('*/api/support-projects/:id/backings', async ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const p = find(params.id)
    if (!p) return notFound()
    if (p.artistId === v.id) return badRequest('내 프로젝트는 후원할 수 없어요')
    if (isClosedProject(p)) return badRequest('끝난 프로젝트예요')
    const { amountPerMilestone } = (await request.json()) as { amountPerMilestone: number }
    if (!(amountPerMilestone >= 1000)) return badRequest('1,000원 이상')
    let b = db.backings.find(x => x.projectId === p.id && x.backerId === v.id)
    if (b && b.status === 'active') {
      b.amountPerMilestone = amountPerMilestone
    } else if (b) {
      return badRequest('이탈한 프로젝트는 다시 후원할 수 없어요')
    } else {
      b = { id: newId('b'), projectId: p.id, backerId: v.id, amountPerMilestone, paidTotal: 0, status: 'active', decisions: {}, joinedAt: db.TODAY } satisfies Backing
      db.backings.push(b)
      p.activeBackers++
      p.totalBackers++
    }
    return json(b, 201)
  }),

  http.get('*/api/me/backings', ({ request }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const list: BackingView[] = db.backings.filter(b => b.backerId === v.id).map(b => ({ ...b, project: projectView(find(b.projectId)!, v) }))
    return json(list)
  }),

  // 후원자 지속/이탈 선택 (선택 기간 안에는 변경 가능)
  http.post('*/api/milestones/:id/decision', async ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const p = db.projects.find(x => x.milestones.some(m => m.id === params.id))
    const m = p?.milestones.find(x => x.id === params.id)
    if (!p || !m) return notFound()
    if (m.status !== 'deciding' || !m.decisions || !m.decisionDeadline || db.TODAY > m.decisionDeadline) return badRequest('선택 기간이 아니에요')
    const b = db.backings.find(x => x.projectId === p.id && x.backerId === v.id)
    if (!b) return forbidden('후원자만 선택할 수 있어요')
    const { choice } = (await request.json()) as { choice: DecisionChoice | null }
    const prev = b.decisions[m.id]
    // 이전 선택 되돌리기
    if (prev === 'continue') m.decisions.continued--
    if (prev === 'leave') { m.decisions.left--; b.status = 'active'; p.activeBackers++ }
    if (prev) m.decisions.pending++
    if (choice) {
      m.decisions.pending--
      if (choice === 'continue') m.decisions.continued++
      else { m.decisions.left++; b.status = 'left'; p.activeBackers-- }
      b.decisions[m.id] = choice
    } else delete b.decisions[m.id]
    return json(b)
  }),

  // 작가: 결과물 업로드 → 7일 선택 기간 시작
  http.post('*/api/milestones/:id/submission', async ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const i = db.projects.findIndex(x => x.milestones.some(m => m.id === params.id))
    if (i < 0) return notFound()
    const p = db.projects[i]
    if (p.artistId !== v.id) return forbidden()
    const m = p.milestones.find(x => x.id === params.id)!
    const next = p.milestones.find(x => x.status === 'upcoming')
    if (m !== next) return badRequest('지금 올릴 수 있는 마일스톤이 아니에요')
    if (p.milestones.some(x => x.status === 'deciding')) return badRequest('이전 단계의 선택 기간이 끝나야 올릴 수 있어요')
    if (p.activeBackers === 0 && p.status !== 'recruiting') return badRequest('남은 후원자가 없어요')
    const body = (await request.json()) as { note: string; imageUrls: string[] }
    const updated = submitMilestone(p, m.id, body.note, body.imageUrls.length ? body.imageUrls : [p.coverUrl], db.TODAY, db.settings)
    const done = updated.milestones.find(x => x.id === m.id)!
    if (done.isFinal) {
      updated.status = 'completed'
      updated.closedAt = db.TODAY
      db.backings.filter(b => b.projectId === p.id && b.status === 'active').forEach(b => { b.status = 'finished' })
      // 완성한 후원 프로젝트는 경력에 자동 추가 + 자동 인증 (§4.7)
      v.career.push({
        id: newId('c'), category: 'support_project', yearFrom: +db.TODAY.slice(0, 4), isPublic: true, verifyStatus: 'verified', verifiedAt: db.TODAY, auto: true,
        text: `후원 프로젝트 〈${p.title}〉 완성 · 마일스톤 ${p.milestones.length}/${p.milestones.length} · 후원자 ${p.totalBackers}명`,
      })
    } else updated.status = 'in_progress'
    db.projects[i] = updated
    return json(projectView(updated, v))
  }),

  // 작가: 프로젝트 종료 (후원자 0명이면 반드시)
  http.post('*/api/support-projects/:id/close', async ({ request, params }) => {
    const v = viewerOf(request)
    if (!v) return unauthorized()
    const p = find(params.id)
    if (!p) return notFound()
    if (p.artistId !== v.id) return forbidden()
    if (isClosedProject(p)) return badRequest('이미 끝난 프로젝트예요')
    const { reason } = (await request.json()) as { reason?: string }
    p.status = 'ended'
    p.endReason = reason?.trim() || '작가가 프로젝트를 종료했어요.'
    p.closedAt = db.TODAY
    db.backings.filter(b => b.projectId === p.id && b.status === 'active').forEach(b => { b.status = 'finished' })
    return noContent()
  }),
]
