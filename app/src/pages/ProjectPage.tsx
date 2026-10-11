// 08 후원 프로젝트 상세
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { MilestoneTimeline } from '../entities/project/MilestoneTimeline'
import { closedMilestoneCount, decidingMilestone, isClosedProject, nextMilestone } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation, useRequireLogin } from '../shared/api/mutations'
import { qk } from '../shared/api/queries'
import type { ProjectView } from '../shared/api/types'
import { today } from '../shared/lib/clock'
import { monthDay, won } from '../shared/lib/format'
import { PROJECT_STATUS } from '../shared/lib/labels'
import { Art } from '../shared/ui/Art'
import { Field, Gate, MilestoneSteps, SheetDesc, Sum, Tiers } from '../shared/ui/blocks'
import { inputCls } from '../shared/ui/classes'
import { Icon } from '../shared/ui/Icon'
import { AppBar, Avatar, BackButton, BottomBar, Button, ButtonLink, Chip, Empty, VerifiedBadge } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'
import s from './support.module.css'

export function ProjectPage() {
  const { projectId = '' } = useParams()
  const { openSheet, toast } = useFeedback()
  const requireLogin = useRequireLogin()
  const { data: p, isPending, isError } = useQuery({ queryKey: qk.project(projectId), queryFn: () => endpoints.project(projectId) })
  const [picked, setPicked] = useState<number | null>(null)

  const head = <AppBar title="후원 프로젝트" left={<BackButton />} right={<button aria-label="공유" onClick={() => { navigator.clipboard?.writeText(location.href); toast('링크를 복사했어요') }}><Icon name="share" /></button>} />
  if (isPending) return head
  if (isError || !p) return <>{head}<Empty title="프로젝트를 찾을 수 없어요" action={<ButtonLink to="/support" size="sm">후원 목록</ButtonLink>} /></>

  const st = PROJECT_STATUS[p.displayStatus]
  const closed = isClosedProject(p)
  const dm = decidingMilestone(p)
  const nm = nextMilestone(p)
  const b = p.viewer.backing
  const amount = picked ?? b?.amountPerMilestone ?? (p.rewards[1] ?? p.rewards[0])?.amount ?? 30000

  return (
    <>
      {head}
      {p.displayStatus === 'delayed' && nm && (
        <Gate tone="warn" icon="alert" title="결과물이 지연되고 있어요">{monthDay(nm.dueDate)} 제시일이 지났어요. 결과물이 올라오기 전까지 다음 후원금은 결제되지 않아요.</Gate>
      )}
      {p.displayStatus === 'awaiting_close' && (
        <Gate tone="danger" icon="alert" title="남은 후원자가 없어요">작가가 프로젝트를 종료하면 지난 프로젝트로 기록돼요.</Gate>
      )}

      <div className={s.hero}>
        <Art url={p.coverUrl} stage={p.displayStatus === 'completed' ? undefined : 'wip'} className={s.heroArt}>
          <Chip tone={st.tone} className={s.stage}>{st.label}</Chip>
          {dm && <span className={s.cmp} aria-hidden><Art url={p.coverUrl} stage="wip" className={s.cmpI} /><Art url={p.coverUrl} stage="wip-half" className={s.cmpI} /></span>}
        </Art>
        <div className={s.heroBody}>
          <Link to={`/artists/${p.artist.handle}`} className={s.who}>
            <Avatar name={p.artist.name} tone={p.artist.avatarTone} size={24} /><b>{p.artist.name}</b><VerifiedBadge show={p.artist.isVerified} size={14} />
            <small>{monthDay(p.createdAt)} 시작</small>
          </Link>
          <h1 className={s.title}>{p.title}</h1>
          <MilestoneSteps milestones={p.milestones} lateId={p.displayStatus === 'delayed' ? nm?.id : undefined} />
        </div>
      </div>

      <div className={s.fund}>
        <div className={s.nums}><b className="won">{won(p.totalFunded)}</b><span>누적 후원</span><em>{closed ? `${p.totalBackers}명` : `${p.activeBackers}명 후원 중`}</em></div>
        <div className={s.meta}>
          <span>마일스톤 {closedMilestoneCount(p)} / {p.milestones.length}</span>
          {nm && !closed && <span>다음 제시일 {monthDay(nm.dueDate)}</span>}
          {closed && p.totalBackers > 0 && <span>끝까지 함께한 후원자 {Math.round((p.activeBackers / p.totalBackers) * 100)}%</span>}
        </div>
      </div>

      <section className={s.sec}>
        <h2 className="sec-t">이 작품이 나아갈 방향</h2>
        <p className="prose">{p.direction}</p>
        {p.endReason && <p className={s.endReason}>종료 사유 · {p.endReason}</p>}
      </section>

      {!closed && p.rewards.length > 0 && (
        <section>
          <h2 className="sec-t" style={{ padding: '0 18px', margin: 0 }}>회당 후원 금액 · 후원자 혜택</h2>
          <Tiers items={p.rewards} value={amount} onChange={setPicked} />
        </section>
      )}

      <section className={s.sec}><h2 className="sec-t" style={{ margin: 0 }}>마일스톤</h2></section>
      <MilestoneTimeline project={p} today={today()} />

      <BottomBar column={!p.viewer.isMine && !closed && !b}>
        {p.viewer.isMine ? <ButtonLink to="/me/studio/support" block>프로젝트 관리</ButtonLink>
          : closed ? (p.linkedWorkId ? <ButtonLink to={`/works/${p.linkedWorkId}`} variant="accent" block>완성작 보기</ButtonLink> : <Button variant="ghost" block disabled>끝난 프로젝트예요</Button>)
          : p.displayStatus === 'awaiting_close' ? <Button variant="ghost" block disabled>작가의 종료를 기다리는 중</Button>
          : b?.status === 'active' ? (
            <>
              <div className={s.price}><small>후원 중 · 누적 {won(b.paidTotal)}</small><b className="won">회당 {won(b.amountPerMilestone)}</b></div>
              <Button variant="ghost" onClick={() => openSheet(<BackSheet project={p} initial={b.amountPerMilestone} change />)}>금액 변경</Button>
            </>
          ) : b?.status === 'left' ? <Button variant="ghost" block disabled>이탈한 프로젝트예요</Button>
          : (
            <>
              <small className={s.hint}><Icon name="sprout" size={13} />결과물이 공개되고 지속할 때마다 결제돼요</small>
              <Button variant="patron" size="lg" onClick={() => requireLogin(() => openSheet(<BackSheet project={p} initial={amount} />))}>회당 {won(amount)} 후원하기</Button>
            </>
          )}
      </BottomBar>
    </>
  )
}

function BackSheet({ project: p, initial, change }: { project: ProjectView; initial: number; change?: boolean }) {
  const { closeSheet } = useFeedback()
  const [amount, setAmount] = useState(initial)
  const [custom, setCustom] = useState('')
  const remaining = p.milestones.filter(m => m.status !== 'closed').length
  const back = useApiMutation(() => endpoints.back(p.id, amount), {
    success: change ? `다음 마일스톤부터 회당 ${won(amount)}` : '후원을 시작했어요. 결과물이 공개되면 알려드릴게요', onSuccess: closeSheet,
  })
  const presets = [10000, 30000, 50000, 100000]
  return (
    <>
      <h2>{change ? '회당 후원 금액 변경' : '정기 후원 시작'}</h2>
      <SheetDesc>결과물이 공개되고 <b>지속</b>을 선택(또는 7일 뒤 자동 지속)할 때마다 아래 금액이 결제돼요. 언제든 결과물을 보고 이탈할 수 있어요.</SheetDesc>
      <div className={s.amounts} role="radiogroup" aria-label="회당 금액">
        {presets.map(v => <button key={v} role="radio" aria-checked={amount === v && !custom} onClick={() => { setAmount(v); setCustom('') }}><b className="won">{won(v)}</b>회당</button>)}
      </div>
      <Field label="직접 입력 (원)">{id => <input id={id} className={inputCls} inputMode="numeric" value={custom} onChange={e => { setCustom(e.target.value); setAmount(+e.target.value.replace(/\D/g, '') || 0) }} />}</Field>
      <div style={{ margin: '0 -18px' }}>
        <Sum rows={[{ label: '남은 마일스톤', value: `${remaining}회` }]} total={['모두 지속하면 최대', won(amount * remaining)]} />
      </div>
      <div style={{ height: 14 }} />
      <Button variant="patron" block disabled={amount < 1000 || back.isPending} onClick={() => back.mutate(undefined)}>
        {amount < 1000 ? '1,000원 이상 입력해 주세요' : change ? '변경하기' : '후원 시작하기'}
      </Button>
    </>
  )
}
