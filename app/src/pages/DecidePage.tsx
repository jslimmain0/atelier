// 09 결과물 확인 · 지속/이탈 선택 (점수 없음, 7일 무응답 자동 지속)
import { useQuery } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import type { DecisionChoice } from '../entities/types'
import { daysBetween, nextMilestone } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { qk } from '../shared/api/queries'
import { today } from '../shared/lib/clock'
import { monthDay, won } from '../shared/lib/format'
import { Art } from '../shared/ui/Art'
import { Gate, MilestoneSteps } from '../shared/ui/blocks'
import { AppBar, Avatar, BackButton, BottomBar, Button, ButtonLink, Chip, Empty, Opt } from '../shared/ui/primitives'
import s from './support.module.css'

export function DecidePage() {
  const { projectId = '', order = '' } = useParams()
  const { data: p, isPending } = useQuery({ queryKey: qk.project(projectId), queryFn: () => endpoints.project(projectId) })
  const [pick, setPick] = useState<DecisionChoice | null>(null)
  const m = p?.milestones.find(x => String(x.order) === order)
  const decide = useApiMutation((c: DecisionChoice | null) => endpoints.decide(m!.id, c), {
    success: (_, c) => (c === 'continue' ? '후원을 이어가요' : c === 'leave' ? '이탈했어요. 함께해 주셔서 고마워요' : '선택을 취소했어요'),
    onSuccess: () => setPick(null),
  })

  const head = <AppBar title={m ? `${m.order}단계 결과물` : '결과물'} left={<BackButton />} />
  if (isPending) return head
  if (!p || !m || !m.submission) return <>{head}<Empty title="아직 공개된 결과물이 없어요" action={<ButtonLink to={`/support/${projectId}`} size="sm">프로젝트로</ButtonLink>} /></>

  const b = p.viewer.backing
  const chosen = b?.decisions[m.id]
  const deciding = m.status === 'deciding' && m.decisionDeadline
  const left = m.decisionDeadline ? Math.max(0, daysBetween(today(), m.decisionDeadline)) : 0
  const nm = nextMilestone(p)

  let action: ReactNode
  if (p.viewer.isMine) action = <Gate tone="plain" icon="sprout" title="내 프로젝트의 결과물이에요">지속 {m.decisions?.continued ?? 0} · 이탈 {m.decisions?.left ?? 0}{m.decisions?.pending ? ` · 선택 대기 ${m.decisions.pending}` : ''}</Gate>
  else if (!b) action = <Gate tone="plain" icon="sprout" title="후원자만 선택할 수 있어요">결과물은 누구나 볼 수 있어요. 후원하면 다음 결과물부터 지속/이탈을 선택할 수 있어요.</Gate>
  else if (!deciding) action = <Gate tone="plain" title="선택 기간이 끝났어요">{chosen === 'leave' ? '이 단계에서 이탈했어요.' : '이 단계에서 후원을 이어갔어요.'}</Gate>
  else if (b.status === 'left' && chosen !== 'leave') action = <Gate tone="plain" title="이 프로젝트에서 이탈했어요">이후 결제는 없어요. 이미 결제된 {won(b.paidTotal)}은 유지돼요.</Gate>
  else if (chosen) action = (
    <Gate icon="check" title={chosen === 'continue' ? '후원을 이어가기로 했어요' : '이번 단계에서 이탈하기로 했어요'}>
      {chosen === 'continue' ? `선택 기간이 끝나는 ${monthDay(m.decisionDeadline!)}에 회당 ${won(b.amountPerMilestone)}이 결제돼요.` : '이후 결제는 없어요.'} 선택 기간 안에는 바꿀 수 있어요.
      <div><Button size="sm" variant="ghost" style={{ marginTop: 10 }} disabled={decide.isPending} onClick={() => decide.mutate(null)}>선택 바꾸기</Button></div>
    </Gate>
  )
  else action = (
    <>
      <Gate tone="warn" icon="clock" title={`선택 기간 ${left}일 남음 · ${monthDay(m.decisionDeadline!)}까지`}>선택하지 않으면 자동으로 후원을 이어가요.</Gate>
      <div className={s.sec} role="radiogroup" aria-label="후원 계속 여부">
        <Opt tone="patron" checked={pick === 'continue'} onClick={() => setPick('continue')} title="계속 후원하기">
          회당 {won(b.amountPerMilestone)}이 결제되고, {nm ? `${nm.order}단계 ${nm.goal} (${monthDay(nm.dueDate)})` : '다음 단계'}까지 함께해요.
        </Opt>
        <Opt checked={pick === 'leave'} onClick={() => setPick('leave')} title="여기까지 할게요">
          이후 결제는 없어요. 지금까지 결제된 {won(b.paidTotal)}은 유지돼요.
        </Opt>
      </div>
    </>
  )
  const showBar = !!b && !!deciding && !chosen && !p.viewer.isMine && b.status === 'active'

  return (
    <>
      {head}
      <div className={s.hero}>
        <Art url={m.submission.imageUrls[0]} stage={m.submission.stage} className={s.heroArt} style={{ height: 220 }}>
          <Chip tone="patron" className={s.stage}>{m.order}단계 · {m.goal}</Chip>
        </Art>
        <div className={s.heroBody}>
          <Link to={`/support/${p.id}`} className={s.who}>
            <Avatar name={p.artist.name} tone={p.artist.avatarTone} size={24} /><b>{p.title}</b><small>{monthDay(m.submission.submittedAt)} 공개</small>
          </Link>
          <p className={s.note}>{m.submission.note}</p>
          <MilestoneSteps milestones={p.milestones} />
        </div>
      </div>
      {action}
      {showBar ? (
        <BottomBar>
          <Button variant={pick === 'leave' ? 'dark' : 'patron'} block disabled={!pick || decide.isPending} onClick={() => decide.mutate(pick)}>
            {pick === 'leave' ? '이탈하기' : pick === 'continue' ? '계속 후원하기' : '선택해 주세요'}
          </Button>
        </BottomBar>
      ) : <div style={{ height: 24 }} />}
    </>
  )
}
