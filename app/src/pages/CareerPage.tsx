// 13 경력 · 인증 (항목 단위 인증, DESIGN.md §4.8)
import { useState } from 'react'
import type { CareerCategory, CareerItem } from '../entities/types'
import { verifiedCount, wouldLoseBadge } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { useMe, useSettings } from '../shared/api/queries'
import type { UserView } from '../shared/api/types'
import { CAREER_CATEGORY, VERIFY_STATUS } from '../shared/lib/labels'
import { Field, FilePicker, Gate, Settle, SheetDesc, TxRow } from '../shared/ui/blocks'
import { inputCls, twoCls, checkCls } from '../shared/ui/classes'
import { Icon } from '../shared/ui/Icon'
import { ConfirmSheet } from '../shared/ui/ConfirmSheet'
import { AppBar, BackButton, Button, Chip, Empty } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'

export function CareerPage() {
  const { data: me, isPending } = useMe()
  const { data: settings } = useSettings()
  const { openSheet } = useFeedback()
  if (isPending) return <AppBar title="경력 · 인증" left={<BackButton />} />
  if (!me?.isArtist) return <><AppBar title="경력 · 인증" left={<BackButton />} /><Empty title="작가만 볼 수 있는 화면이에요">작품을 올리면 작가 기능이 열려요.</Empty></>

  const th = settings?.verifiedBadgeThreshold ?? 5
  const vc = verifiedCount(me.career)
  const ctx = { me, threshold: th }

  return (
    <>
      <AppBar title="경력 · 인증" left={<BackButton />} right={<button aria-label="경력 추가" onClick={() => openSheet(<CareerForm {...ctx} />)}><Icon name="plus" /></button>} />
      <Settle
        label={me.isVerified ? '인증 작가예요' : '인증 마크까지'}
        big={<>{vc} <span style={{ fontSize: 16, opacity: 0.7 }}>/ {th} 공개 인증 항목</span></>}
        rows={[[me.isVerified ? '혜택' : '남은 항목', me.isVerified ? '인증 마크 · 피드 노출 우대 · 후원 프로젝트 개설' : `${Math.max(0, th - vc)}개 더 인증되면 인증 마크`]]}
      />
      <div style={{ margin: '12px 0 4px' }}>
        <Gate tone="plain" icon="shield" title="인증은 항목마다 서류로 확인해요">
          인증된 항목을 수정하면 미인증으로 돌아가요. 비공개 항목은 인증돼 있어도 개수에서 빠져요.
        </Gate>
      </div>
      {me.career.length === 0 && <Empty title="아직 등록된 경력이 없어요" action={<Button size="sm" onClick={() => openSheet(<CareerForm {...ctx} />)}>경력 추가</Button>} />}
      {me.career.map(c => <CareerItemRow key={c.id} item={c} {...ctx} />)}
      <div style={{ height: 24 }} />
    </>
  )
}

type Ctx = { me: UserView; threshold: number }
const settingsOf = (th: number) => ({ verifiedBadgeThreshold: th, verifiedFeedBoost: 1, decisionWindowDays: 7, storageFreeMonths: 3 })

function CareerItemRow({ item: c, me, threshold }: Ctx & { item: CareerItem }) {
  const { openSheet } = useFeedback()
  const st = VERIFY_STATUS[c.verifyStatus]
  const togglePublic = useApiMutation((v: boolean) => endpoints.editCareer(c.id, { isPublic: v }), { success: (_, v) => (v ? '공개로 바꿨어요' : '비공개로 바꿨어요') })

  const onTogglePublic = () => {
    const next = me.career.map(x => (x.id === c.id ? { ...x, isPublic: !c.isPublic } : x))
    if (c.isPublic && wouldLoseBadge(me, next, settingsOf(threshold))) {
      openSheet(<ConfirmSheet title="비공개로 바꿀까요?" confirm="비공개로 바꾸기" onConfirm={() => togglePublic.mutate(false)}>
        공개된 인증 항목이 {threshold}개 아래로 줄어 <b>인증 마크가 해제</b>되고, 후원 프로젝트를 새로 열 수 없어요. 항목의 인증 상태는 유지돼요.
      </ConfirmSheet>)
    } else togglePublic.mutate(!c.isPublic)
  }

  return (
    <TxRow top
      art={<div style={{ width: 52, fontSize: 12, color: 'var(--muted)', lineHeight: 1.4, flex: 'none' }}>{c.yearFrom}<br />{CAREER_CATEGORY[c.category]}</div>}
      title={<span style={{ whiteSpace: 'normal' }}>{c.text}</span>}
      sub={<span style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
        <Chip tone={st.tone}>{st.label}</Chip>
        {!c.isPublic && <Chip>비공개 · 개수 제외</Chip>}
        {c.auto && <Chip tone="patron">플랫폼 기록 · 자동 인증</Chip>}
      </span>}
    >
      {c.verifyStatus === 'rejected' && c.rejectReason && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>반려 사유 · {c.rejectReason}</p>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {(c.verifyStatus === 'unverified' || c.verifyStatus === 'rejected') && (
          <Button size="sm" onClick={() => openSheet(<VerifySheet item={c} />)}>{c.verifyStatus === 'rejected' ? '보완해서 재신청' : '인증 신청'}</Button>
        )}
        {!c.auto && <Button size="sm" variant="ghost" onClick={() => openSheet(<CareerForm me={me} threshold={threshold} item={c} />)}>수정</Button>}
        <Button size="sm" variant="ghost" onClick={onTogglePublic} disabled={togglePublic.isPending}>{c.isPublic ? '비공개로' : '공개로'}</Button>
      </div>
    </TxRow>
  )
}

function CareerForm({ me, threshold, item }: Ctx & { item?: CareerItem }) {
  const { closeSheet } = useFeedback()
  const [category, setCategory] = useState<CareerCategory>(item?.category ?? 'exhibition')
  const [yearFrom, setYearFrom] = useState(String(item?.yearFrom ?? 2026))
  const [yearTo, setYearTo] = useState(item?.yearTo ? String(item.yearTo) : '')
  const [text, setText] = useState(item?.text ?? '')
  const [isPublic, setPublic] = useState(item?.isPublic ?? true)
  const [touched, setTouched] = useState(false)
  const verified = item?.verifyStatus === 'verified'
  const loseBadge = verified && item.isPublic && wouldLoseBadge(me, me.career.map(c => (c.id === item.id ? { ...c, verifyStatus: 'unverified' as const } : c)), settingsOf(threshold))
  const save = useApiMutation(
    (b: Parameters<typeof endpoints.addCareer>[0]) => (item ? endpoints.editCareer(item.id, b) : endpoints.addCareer(b)),
    { success: r => (item && verified && r.verifyStatus === 'unverified' ? '수정했어요. 인증이 해제됐어요' : item ? '저장했어요' : '경력을 추가했어요'), onSuccess: closeSheet },
  )
  const yearErr = !/^\d{4}$/.test(yearFrom) ? '연도 4자리' : yearTo && !/^\d{4}$/.test(yearTo) ? '연도 4자리' : undefined
  const textErr = !text.trim() ? '내용을 입력해 주세요' : undefined

  return (
    <form onSubmit={e => {
      e.preventDefault(); setTouched(true)
      if (yearErr || textErr) return
      save.mutate({ category, yearFrom: +yearFrom, yearTo: yearTo ? +yearTo : undefined, text: text.trim(), isPublic })
    }}>
      <h2>{item ? '경력 수정' : '경력 추가'}</h2>
      {verified && (
        <div style={{ margin: '10px 0 14px' }}>
          <Gate flush tone="warn" icon="alert" title="수정하면 인증이 해제돼요">
            내용을 바꾸면 미인증으로 돌아가고 다시 신청해야 해요.{loseBadge && <> <b>인증 마크도 함께 해제</b>돼요.</>}
          </Gate>
        </div>
      )}
      <div style={{ height: 8 }} />
      <Field label="분류">{id => (
        <select id={id} className={inputCls} value={category} onChange={e => setCategory(e.target.value as CareerCategory)}>
          {Object.entries(CAREER_CATEGORY).filter(([k]) => k !== 'support_project').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      )}</Field>
      <div className={twoCls}>
        <Field label="시작 연도" error={touched ? yearErr : undefined}>{id => <input id={id} className={inputCls} inputMode="numeric" value={yearFrom} onChange={e => setYearFrom(e.target.value)} />}</Field>
        <Field label="종료 연도">{id => <input id={id} className={inputCls} inputMode="numeric" value={yearTo} onChange={e => setYearTo(e.target.value)} placeholder="선택" />}</Field>
      </div>
      <Field label="내용" required hint="프로필에 그대로 보여요" error={touched ? textErr : undefined}>{(id, d) => (
        <input id={id} aria-describedby={d} className={inputCls} value={text} onChange={e => setText(e.target.value)} placeholder="예: 개인전 〈빛의 체류〉, 아트스페이스 휴" />
      )}</Field>
      <label className={checkCls} style={{ marginBottom: 14 }}><input type="checkbox" checked={isPublic} onChange={e => setPublic(e.target.checked)} />프로필에 공개</label>
      <Button type="submit" block disabled={save.isPending}>저장</Button>
    </form>
  )
}

function VerifySheet({ item }: { item: CareerItem }) {
  const { closeSheet } = useFeedback()
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [note, setNote] = useState('')
  const req = useApiMutation(() => endpoints.requestVerify(item.id, { documents: files, note: note.trim() || undefined }), { success: '인증을 신청했어요. 결과를 알려드릴게요', onSuccess: closeSheet })
  return (
    <>
      <h2>인증 신청</h2>
      <SheetDesc>“{item.text}”</SheetDesc>
      <FilePicker label="증빙 서류" value={files} onChange={setFiles} hint="졸업증명서 · 전시 도록 · 상장 등. 서류는 관리자만 볼 수 있어요." />
      <Field label="관리자에게 메모">{id => <textarea id={id} className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="예: 도록 12쪽에 이름이 있어요" />}</Field>
      <Button block disabled={!files.length || req.isPending} onClick={() => req.mutate(undefined)}>신청하기</Button>
    </>
  )
}
