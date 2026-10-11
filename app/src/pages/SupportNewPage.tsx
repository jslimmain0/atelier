// 10 후원 프로젝트 열기 (인증 작가 + 끝나지 않은 프로젝트 없음)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { addDays } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { qk } from '../shared/api/queries'
import { today } from '../shared/lib/clock'
import { CheckList, Field, Gate, ImagePicker, Pad, Progress, Stepper } from '../shared/ui/blocks'
import { inputCls } from '../shared/ui/classes'
import { AppBar, BackButton, BottomBar, Button, ButtonLink, Empty } from '../shared/ui/primitives'
import s from './support.module.css'

const GOAL_HINTS = ['구상', '스케치', '채색', '디테일']
const REWARD_AMOUNTS = [10000, 30000, 50000]
const defaultMilestones = (n: number, prev: { goal: string; dueDate: string }[] = []) =>
  Array.from({ length: n }, (_, i) => {
    if (i === n - 1) return { goal: '완성', dueDate: prev[i]?.dueDate ?? addDays(today(), (i + 1) * 21) }
    return prev[i] && !(i === prev.length - 1 && prev[i].goal === '완성') ? prev[i] : { goal: '', dueDate: addDays(today(), (i + 1) * 21) }
  })

export function SupportNewPage() {
  const navigate = useNavigate()
  const elig = useQuery({ queryKey: qk.eligibility, queryFn: endpoints.eligibility })
  const [title, setTitle] = useState('')
  const [direction, setDirection] = useState('')
  const [cover, setCover] = useState<string[]>([])
  const [ms, setMs] = useState(() => defaultMilestones(4))
  const [rewards, setRewards] = useState(REWARD_AMOUNTS.map(amount => ({ amount, text: '' })))
  const [touched, setTouched] = useState(false)
  const create = useApiMutation(endpoints.createProject, { success: '프로젝트를 열었어요. 후원 모집을 시작해요', onSuccess: () => navigate('/me/studio/support', { replace: true }) })

  const head = <AppBar title="후원 프로젝트 열기" left={<BackButton />} />
  if (elig.isPending) return head
  const e = elig.data
  if (!e) return <>{head}<Empty title="불러오지 못했어요" /></>
  if (e.reasons.includes('login')) return <>{head}<Empty title="후원 프로젝트를 열려면 로그인해 주세요">왼쪽 아래 DEV에서 보기 계정을 바꿔 보세요.</Empty></>

  if (!e.ok) {
    return (
      <>
        {head}
        <Gate tone={e.reasons.includes('not_artist') ? 'plain' : undefined} icon="sprout" title="후원 프로젝트 개설 조건">
          <CheckList items={[
            { ok: !e.reasons.includes('not_artist'), label: '작가 정보 등록', value: e.reasons.includes('not_artist') ? '필요' : '완료' },
            { ok: !e.reasons.includes('not_verified'), label: `인증 작가 (공개 인증 항목 ${e.threshold}개 이상)`, value: `${e.verifiedCount}/${e.threshold}` },
            { ok: !e.reasons.includes('open_project'), label: '끝나지 않은 프로젝트 없음', value: e.openProject ? '진행 중 1' : '없음' },
          ]} />
        </Gate>
        {e.reasons.includes('not_artist') ? (
          <Empty title="작가만 후원 프로젝트를 열 수 있어요" action={<ButtonLink to="/upload" size="sm">작품 올리기</ButtonLink>}>작품을 올리면 작가 기능이 열려요.</Empty>
        ) : e.reasons.includes('not_verified') ? (
          <Pad>
            <h2 className="sec-t">인증까지</h2>
            <Progress patron value={e.verifiedCount / e.threshold} label="인증 진행률" />
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>경력 항목 {e.threshold - e.verifiedCount}개가 더 인증되면 후원 프로젝트를 열 수 있어요.</p>
            <div style={{ marginTop: 14 }}><ButtonLink to="/me/career" block>경력 · 인증 관리</ButtonLink></div>
          </Pad>
        ) : (
          <Pad>
            <p className="prose">작가당 한 번에 하나의 후원 프로젝트만 운영할 수 있어요. 〈{e.openProject?.title}〉을 완성하거나 종료하면 새 후원을 모집할 수 있어요.</p>
            <div style={{ marginTop: 14 }}><ButtonLink to="/me/studio/support" block>진행 중인 프로젝트 관리</ButtonLink></div>
          </Pad>
        )}
      </>
    )
  }

  const errs = {
    title: !title.trim() ? '제목을 입력해 주세요' : undefined,
    direction: direction.trim().length < 20 ? '방향을 20자 이상 적어 주세요' : undefined,
    ms: ms.some(m => !m.goal.trim()) ? '모든 단계의 목표를 적어 주세요'
      : ms.some((m, i) => m.dueDate <= (i ? ms[i - 1].dueDate : today())) ? '제시일은 오늘 이후, 앞 단계보다 늦어야 해요' : undefined,
  }
  const submit = () => {
    setTouched(true)
    if (Object.values(errs).some(Boolean)) return
    create.mutate({ title: title.trim(), direction: direction.trim(), coverUrl: cover[0], milestones: ms, rewards: rewards.filter(r => r.text.trim()) })
  }

  return (
    <>
      {head}
      <Pad>
        <Field label="프로젝트 제목" required error={touched ? errs.title : undefined}>{id => <input id={id} className={inputCls} value={title} onChange={ev => setTitle(ev.target.value)} placeholder="예: 〈물가의 오후〉 연작" />}</Field>
        <Field label="이 작품이 나아갈 방향" required error={touched ? errs.direction : undefined} hint="어떤 작품이 될지, 무엇을 시도하려는지, 완성된 모습을 상상할 수 있게">{(id, d) => (
          <textarea id={id} aria-describedby={d} className={inputCls} style={{ minHeight: 120 }} value={direction} onChange={ev => setDirection(ev.target.value)} />
        )}</Field>
        <ImagePicker label="대표 이미지" max={1} value={cover} onChange={setCover} />

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>완성까지 마일스톤 횟수 <span style={{ color: 'var(--accent)' }}>*</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Stepper label="마일스톤 횟수" value={ms.length} min={2} max={10} unit="회" onChange={n => setMs(prev => defaultMilestones(n, prev))} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>마지막 회차가 완성이에요</span>
          </div>
        </div>
        <fieldset style={{ border: 0, marginBottom: 14 }}>
          <legend style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>회차별 목표와 제시일</legend>
          {ms.map((m, i) => (
            <div key={i} className={s.msRow}>
              <span className={s.msN}>{i + 1}</span>
              <input className={inputCls} aria-label={`${i + 1}단계 목표`} placeholder={GOAL_HINTS[i] ?? '목표'} value={m.goal} readOnly={i === ms.length - 1}
                onChange={ev => setMs(prev => prev.map((x, j) => (j === i ? { ...x, goal: ev.target.value } : x)))} />
              <input className={inputCls} type="date" aria-label={`${i + 1}단계 제시일`} value={m.dueDate} min={today()}
                onChange={ev => setMs(prev => prev.map((x, j) => (j === i ? { ...x, dueDate: ev.target.value } : x)))} />
            </div>
          ))}
          <span style={{ fontSize: 11.5, color: touched && errs.ms ? 'var(--danger)' : 'var(--muted)' }} role={touched && errs.ms ? 'alert' : undefined}>
            {touched && errs.ms ? errs.ms : '제시일에 결과물을 올리지 않으면 다음 후원금이 결제되지 않아요.'}
          </span>
        </fieldset>
        <fieldset style={{ border: 0, marginBottom: 14 }}>
          <legend style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>회당 금액별 혜택</legend>
          {rewards.map((r, i) => (
            <div key={r.amount} className={s.rewardRow}>
              <span className="won">₩{r.amount.toLocaleString()}</span>
              <input className={inputCls} aria-label={`${r.amount}원 혜택`} placeholder="예: 작업노트 열람, 이름 기록" value={r.text}
                onChange={ev => setRewards(prev => prev.map((x, j) => (j === i ? { ...x, text: ev.target.value } : x)))} />
            </div>
          ))}
        </fieldset>
        <Gate flush tone="plain" title="운영 규칙">
          결과물 공개 후 7일 동안 후원자가 지속/이탈을 선택해요(미선택 시 자동 지속). 후원자가 모두 이탈하면 직접 종료해야 하고, 끝내기 전에는 새 후원을 모집할 수 없어요. 완성한 프로젝트는 경력에 자동 인증돼 남아요.
        </Gate>
      </Pad>
      <BottomBar><Button variant="patron" block disabled={create.isPending} onClick={submit}>프로젝트 열기</Button></BottomBar>
    </>
  )
}
