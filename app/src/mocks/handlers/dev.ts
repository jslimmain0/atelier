// mock 전용: 화면 상태 시뮬레이션 (시안 메뉴의 '상태 시뮬레이션'과 같은 역할)
import { http } from 'msw'
import type { Milestone } from '../../entities/types'
import * as db from '../data'
import { json } from './util'

let stash: Pick<Milestone, 'submission' | 'decisions' | 'decisionDeadline'> | null = null
let backersBefore: number | null = null

export type Scenario = 'normal' | 'delayed' | 'no_backers'
let current: Scenario = 'normal'

function apply(next: Scenario) {
  const p = db.projects.find(x => x.id === 'p1')
  const m3 = p?.milestones.find(m => m.id === 'm3')
  if (!p || !m3) return
  // 원래대로
  if (stash) { Object.assign(m3, stash); m3.status = 'deciding'; stash = null }
  if (backersBefore !== null) { p.activeBackers = backersBefore; backersBefore = null }
  // 3단계 결과물이 아직 안 올라온 상태 (제시일 10/7 경과)
  if (next === 'delayed' && m3.status === 'deciding') {
    stash = { submission: m3.submission, decisions: m3.decisions, decisionDeadline: m3.decisionDeadline }
    m3.submission = undefined; m3.decisions = undefined; m3.decisionDeadline = undefined; m3.status = 'upcoming'
  }
  if (next === 'no_backers') { backersBefore = p.activeBackers; p.activeBackers = 0 }
  current = next
}

export const devHandlers = [
  // 선택 기간 강제 종료 (실제로는 서버 배치가 기한 경과 시 처리)
  http.post('*/api/__dev/close-decisions', async ({ request }) => {
    const { projectId } = (await request.json()) as { projectId?: string }
    db.projects.filter(x => !projectId || x.id === projectId).forEach(p =>
      p.milestones.forEach(m => { if (m.status === 'deciding') m.status = 'closed' }))
    return json({ ok: true })
  }),
  http.get('*/api/__dev/scenario', () => json({ scenario: current })),
  http.post('*/api/__dev/scenario', async ({ request }) => {
    const { scenario } = (await request.json()) as { scenario: Scenario }
    apply(scenario)
    return json({ scenario: current })
  }),
]
