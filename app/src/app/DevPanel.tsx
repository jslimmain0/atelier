// mock 모드 전용: 보기 계정 전환 · 상태 시뮬레이션. 실제 로그인 구현 시 제거.
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { endpoints, type Scenario } from '../shared/api/endpoints'
import { getMockUserId, PERSONAS, setMockUserId } from '../shared/lib/session'
import s from './shell.module.css'

export function DevPanel() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(getMockUserId())
  const [scenario, setScenario] = useState<Scenario>('normal')
  return (
    <div className={s.dev}>
      {open && (
        <div className={s['dev-panel']}>
          <label htmlFor="persona">보기 계정 (mock)</label>
          <select id="persona" value={current} onChange={e => {
            setMockUserId(e.target.value); setCurrent(e.target.value); qc.resetQueries()
          }}>
            {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <label htmlFor="scenario">한지우 〈물가의 오후〉 상태</label>
          <select id="scenario" value={scenario} onChange={async e => {
            const v = e.target.value as Scenario
            setScenario(v); await endpoints.setScenario(v); qc.resetQueries()
          }}>
            <option value="normal">정상 진행</option>
            <option value="delayed">제시일 지남 · 미업로드</option>
            <option value="no_backers">후원자 0명</option>
          </select>
          <button className={s['dev-action']} onClick={async () => { await endpoints.closeDecisions(); qc.resetQueries() }}>선택 기간 마감 처리 (7일 경과)</button>
          <small>새로고침하면 데이터가 처음으로 돌아가요</small>
        </div>
      )}
      <button className={s['dev-btn']} onClick={() => setOpen(o => !o)} aria-expanded={open}>DEV</button>
    </div>
  )
}
