// 11 내 후원 프로젝트 (작가 관리: 결과물 업로드 · 후원자 현황 · 종료)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ProjectCard } from '../entities/project/ProjectCard'
import { closedMilestoneCount, daysBetween, decidingMilestone, isClosedProject, nextMilestone } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { qk, useMe } from '../shared/api/queries'
import type { ProjectView } from '../shared/api/types'
import { today } from '../shared/lib/clock'
import { monthDay, won } from '../shared/lib/format'
import { PROJECT_STATUS } from '../shared/lib/labels'
import { CheckList, Field, Gate, ImagePicker, Settle, SheetDesc, TxRow } from '../shared/ui/blocks'
import { inputCls } from '../shared/ui/classes'
import { AppBar, BackButton, Button, ButtonLink, Chip, Empty } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'
import s from './support.module.css'

export function StudioSupportPage() {
  const { data: me, isPending } = useMe()
  const { openSheet } = useFeedback()
  const projects = useQuery({ queryKey: qk.userProjects(me?.handle ?? ''), queryFn: () => endpoints.userProjects(me!.handle), enabled: !!me?.isArtist })

  const head = <AppBar title="내 후원 프로젝트" left={<BackButton />} />
  if (isPending || (me?.isArtist && projects.isPending)) return head
  if (!me?.isArtist) return <>{head}<Empty title="작가만 볼 수 있는 화면이에요" /></>

  const all = projects.data ?? []
  const p = all.find(x => !isClosedProject(x))
  const past = all.filter(isClosedProject)
  const pastList = past.length > 0 && <><h2 className="sec-t" style={{ padding: '18px 18px 0' }}>지난 프로젝트</h2>{past.map(x => <ProjectCard key={x.id} project={x} />)}</>

  if (!p) {
    return (
      <>
        {head}
        <Empty title="진행 중인 후원 프로젝트가 없어요" action={<ButtonLink to="/support/new" size="sm" variant="patron">후원 프로젝트 열기</ButtonLink>}>
          {me.isVerified ? '작품의 방향을 제시하고 후원을 모집해 보세요.' : '인증 작가가 되면 후원 프로젝트를 열 수 있어요.'}
        </Empty>
        {pastList}
      </>
    )
  }

  const st = p.displayStatus
  const dm = decidingMilestone(p)
  const nm = nextMilestone(p)
  const canUpload = !!nm && !dm && st !== 'awaiting_close'

  return (
    <>
      {head}
      <Settle patron label={`${p.title} · ${PROJECT_STATUS[st].label}`} big={won(p.totalFunded)}
        rows={[['후원 중', `${p.activeBackers}명`], ['누적 참여', `${p.totalBackers}명`], ['마일스톤', `${closedMilestoneCount(p)}/${p.milestones.length}`]]} />

      {st === 'awaiting_close' && (
        <Gate tone="danger" icon="alert" title="남은 후원자가 없어요">
          프로젝트를 더 진행할 수 없어요. 종료해야 다음 후원을 모집할 수 있어요.
          <div><Button size="sm" variant="danger" style={{ marginTop: 10 }} onClick={() => openSheet(<CloseSheet project={p} />)}>프로젝트 종료하기</Button></div>
        </Gate>
      )}
      {st === 'delayed' && nm && (
        <Gate tone="warn" icon="alert" title={`${nm.order}단계 제시일(${monthDay(nm.dueDate)})이 지났어요`}>
          결과물을 올려야 다음 후원금이 결제돼요. 후원자에게 지연으로 보여요.
          <div><Button size="sm" style={{ marginTop: 10 }} onClick={() => openSheet(<UploadSheet project={p} milestoneId={nm.id} />)}>{nm.order}단계 결과물 올리기</Button></div>
        </Gate>
      )}
      {st === 'recruiting' && <Gate icon="sprout" title="후원자를 모집하고 있어요">첫 제시일({nm && monthDay(nm.dueDate)})에 결과물을 올리면 진행 중으로 바뀌어요.</Gate>}
      {dm?.decisions && dm.decisionDeadline && (
        <Gate icon="clock" title={`${dm.order}단계 · 후원자 선택 기간 ${Math.max(0, daysBetween(today(), dm.decisionDeadline))}일 남음`}>
          <CheckList items={[
            { ok: true, label: '지속', value: `${dm.decisions.continued}명` },
            { ok: false, label: '이탈', value: `${dm.decisions.left}명` },
            { ok: false, label: `선택 대기 (${monthDay(dm.decisionDeadline)} 자동 지속)`, value: `${dm.decisions.pending}명` },
          ]} />
        </Gate>
      )}

      <h2 className="sec-t" style={{ padding: '18px 18px 0', margin: 0 }}>마일스톤</h2>
      {p.milestones.map(m => (
        <TxRow key={m.id}
          art={<span className={`${s.msNum} ${m.status === 'closed' ? s.msNumDone : ''}`}>{m.order}</span>}
          title={`${m.goal}${m.isFinal ? ' · 완성' : ''}`}
          sub={`제시일 ${monthDay(m.dueDate)}${m.submission ? ` · ${monthDay(m.submission.submittedAt)} 공개` : ''}${m.decisions ? ` · 지속 ${m.decisions.continued}/이탈 ${m.decisions.left}` : ''}`}
          right={m.status === 'closed' ? <Chip tone="ok">완료</Chip>
            : m.status === 'deciding' ? <Chip tone="warn">선택 기간</Chip>
            : canUpload && m === nm ? <Button size="sm" variant={st === 'delayed' ? 'dark' : 'ghost'} onClick={() => openSheet(<UploadSheet project={p} milestoneId={m.id} />)}>결과물 올리기</Button>
            : <Chip>예정</Chip>}
        />
      ))}
      <div style={{ padding: 18, display: 'grid', gap: 8 }}>
        <ButtonLink to={`/support/${p.id}`} variant="ghost" block>공개 페이지 보기</ButtonLink>
        {st !== 'awaiting_close' && <Button variant="danger" block onClick={() => openSheet(<CloseSheet project={p} />)}>중도 종료</Button>}
      </div>
      {pastList}
    </>
  )
}

function UploadSheet({ project: p, milestoneId }: { project: ProjectView; milestoneId: string }) {
  const { closeSheet } = useFeedback()
  const m = p.milestones.find(x => x.id === milestoneId)!
  const [images, setImages] = useState<string[]>([])
  const [note, setNote] = useState('')
  const up = useApiMutation(() => endpoints.submitMilestone(m.id, { note: note.trim(), imageUrls: images }), {
    success: m.isFinal ? '완성작을 올렸어요. 프로젝트가 완성됐어요' : '결과물을 올렸어요. 7일 선택 기간이 시작돼요', onSuccess: closeSheet,
  })
  return (
    <>
      <h2>{m.order}단계 결과물 올리기</h2>
      <SheetDesc>목표: {m.goal} · 제시일 {monthDay(m.dueDate)}</SheetDesc>
      <ImagePicker label="결과물 사진" required value={images} onChange={setImages} />
      <Field label="작업 노트" required>{id => <textarea id={id} className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="이번 단계에서 한 일, 다음 단계 계획" />}</Field>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{m.isFinal ? '마지막 단계예요. 올리면 프로젝트가 완성되고 경력에 자동으로 기록돼요.' : '올리면 후원자에게 알림이 가고, 7일 동안 지속/이탈을 선택해요.'}</p>
      <Button block disabled={!images.length || !note.trim() || up.isPending} onClick={() => up.mutate(undefined)}>올리기</Button>
    </>
  )
}

function CloseSheet({ project: p }: { project: ProjectView }) {
  const { closeSheet } = useFeedback()
  const [reason, setReason] = useState('')
  const close = useApiMutation(() => endpoints.closeProject(p.id, reason), { success: '종료했어요. 이제 새 후원 프로젝트를 열 수 있어요', onSuccess: closeSheet })
  return (
    <>
      <h2>프로젝트를 종료할까요?</h2>
      <SheetDesc>종료하면 이후 결제는 없고, 〈{p.title}〉은 '중도 종료'로 프로필 이력에 남아요. 종료 후 새 후원 프로젝트를 열 수 있어요.</SheetDesc>
      <Field label="종료 사유 (후원자에게 공개)">{id => <textarea id={id} className={inputCls} value={reason} onChange={e => setReason(e.target.value)} />}</Field>
      <Button variant="danger" block disabled={close.isPending} onClick={() => close.mutate(undefined)}>종료하기</Button>
    </>
  )
}
