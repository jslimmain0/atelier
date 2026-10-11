// 14-2 관리자 · 항목 심사 (서류 확인 · 인증/반려 · 인증 취소)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { qk, useSettings } from '../shared/api/queries'
import { monthDay } from '../shared/lib/format'
import { CAREER_CATEGORY, VERIFY_STATUS } from '../shared/lib/labels'
import { Field, SheetDesc } from '../shared/ui/blocks'
import { checkCls, inputCls } from '../shared/ui/classes'
import { AppBar, Avatar, BackButton, BottomBar, Button, Chip, Empty, VerifiedBadge } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'
import { AdminGate } from './AdminGate'
import s from './admin.module.css'

const ACTION_LABEL = { verify: '인증', reject: '반려', revoke: '인증 취소' } as const

export function AdminReviewPage() {
  const { itemId = '' } = useParams()
  const navigate = useNavigate()
  const { openSheet } = useFeedback()
  const { data: settings } = useSettings()
  const review = useQuery({ queryKey: qk.review(itemId), queryFn: () => endpoints.review(itemId) })
  const logs = useQuery({ queryKey: qk.reviewLogs(itemId), queryFn: () => endpoints.reviewLogs(itemId) })
  const [checks, setChecks] = useState([false, false, false])
  const act = useApiMutation(({ id, action, reason }: { id: string; action: 'verify' | 'reject' | 'revoke'; reason?: string }) => endpoints.reviewAction(id, action, reason), {
    success: (r, v) => v.action === 'verify' && r.artist.isVerified && r.artist.verifiedCount === (settings?.verifiedBadgeThreshold ?? 5)
      ? `인증했어요 · ${r.artist.name}에게 인증 마크가 붙었어요` : `${ACTION_LABEL[v.action]} 처리했어요`,
    onSuccess: (_, v) => { if (v.id === itemId && v.action !== 'revoke') navigate('/admin/career-reviews') },
  })

  const reasonSheet = (id: string, action: 'reject' | 'revoke') => openSheet(<ReasonSheet action={action} onSubmit={reason => act.mutate({ id, action, reason })} />)

  return (
    <AdminGate title="항목 심사">
      <AppBar title="항목 심사" left={<BackButton />} />
      {review.isPending ? <Empty title="불러오는 중…" /> : !review.data ? <Empty title="항목을 찾을 수 없어요" /> : (() => {
        const { item, artist, otherItems } = review.data
        const st = VERIFY_STATUS[item.verifyStatus]
        return (
          <>
            <div className={s.pad}>
              <div className={s.who}>
                <Avatar name={artist.name} tone={artist.avatarTone} size={36} />
                <div><b>{artist.name}</b> <VerifiedBadge show={artist.isVerified} size={14} /><small>@{artist.handle} · 공개 인증 {artist.verifiedCount}/{settings?.verifiedBadgeThreshold ?? 5}</small></div>
                <Chip tone={st.tone}>{st.label}</Chip>
              </div>

              <h2 className="sec-t" style={{ marginTop: 20 }}>신청 항목</h2>
              <small className="muted">{CAREER_CATEGORY[item.category]} · {item.yearFrom}{item.yearTo ? `–${item.yearTo}` : ''}{!item.isPublic && ' · 비공개'}</small>
              <p className={s.itemTitle}>{item.text}</p>
              {item.requestNote && <p className={s.note}>작가 메모 · {item.requestNote}</p>}

              <h2 className="sec-t" style={{ marginTop: 20 }}>제출 서류</h2>
              {item.documents?.length ? item.documents.map(d => (
                <div key={d.id} className={s.doc}>
                  <span className={s.docPh}>{d.name.split('.').pop()?.toUpperCase()}</span>
                  <div><b>{d.name}</b><small>{monthDay(d.submittedAt)} 제출</small></div>
                  {d.url ? <a href={d.url} target="_blank" rel="noreferrer" className={s.docOpen}>열기</a> : <span className={s.docOpen} aria-disabled>원본 (mock)</span>}
                </div>
              )) : <p className="muted" style={{ fontSize: 13 }}>제출된 서류가 없어요.</p>}

              {item.verifyStatus === 'pending' && (
                <>
                  <h2 className="sec-t" style={{ marginTop: 20 }}>확인 체크리스트</h2>
                  {['서류의 이름이 작가 실명과 일치', '항목 문구(기관·연도·제목)와 서류 일치', '위변조 흔적 없음'].map((c, i) => (
                    <label key={c} className={checkCls}><input type="checkbox" checked={checks[i]} onChange={e => setChecks(prev => prev.map((x, j) => (j === i ? e.target.checked : x)))} />{c}</label>
                  ))}
                </>
              )}

              <h2 className="sec-t" style={{ marginTop: 20 }}>이 작가의 다른 항목</h2>
              {otherItems.map(o => (
                <div key={o.id} className={s.other}>
                  <span>{o.text}{!o.isPublic && ' (비공개)'}</span>
                  <Chip tone={VERIFY_STATUS[o.verifyStatus].tone}>{VERIFY_STATUS[o.verifyStatus].label}</Chip>
                  {o.verifyStatus === 'verified' && !o.auto && <Button size="sm" variant="ghost" onClick={() => reasonSheet(o.id, 'revoke')}>취소</Button>}
                </div>
              ))}

              {!!logs.data?.length && (
                <>
                  <h2 className="sec-t" style={{ marginTop: 20 }}>처리 이력</h2>
                  {logs.data.map((l, i) => <p key={i} className={s.log}>{l.at} · {ACTION_LABEL[l.action]}{l.reason ? ` · ${l.reason}` : ''}<br /><span>당시 문구: {l.textSnapshot}</span></p>)}
                </>
              )}
            </div>
            {item.verifyStatus === 'pending' ? (
              <BottomBar>
                <Button variant="danger" onClick={() => reasonSheet(item.id, 'reject')}>반려</Button>
                <Button style={{ flex: 1 }} disabled={!checks.every(Boolean) || act.isPending} onClick={() => act.mutate({ id: item.id, action: 'verify' })}>
                  {checks.every(Boolean) ? '인증' : '체크리스트를 확인해 주세요'}
                </Button>
              </BottomBar>
            ) : item.verifyStatus === 'verified' && !item.auto ? (
              <BottomBar><Button variant="danger" block onClick={() => reasonSheet(item.id, 'revoke')}>인증 취소</Button></BottomBar>
            ) : <div style={{ height: 24 }} />}
          </>
        )
      })()}
    </AdminGate>
  )
}

function ReasonSheet({ action, onSubmit }: { action: 'reject' | 'revoke'; onSubmit: (reason: string) => void }) {
  const { closeSheet } = useFeedback()
  const [reason, setReason] = useState('')
  return (
    <>
      <h2>{action === 'reject' ? '반려 사유' : '인증 취소 사유'}</h2>
      <SheetDesc>작가에게 그대로 전달되고, 처리 이력에 남아요.</SheetDesc>
      <Field label="사유" required>{id => <textarea id={id} className={inputCls} value={reason} onChange={e => setReason(e.target.value)} />}</Field>
      <Button variant="danger" block disabled={!reason.trim()} onClick={() => { onSubmit(reason.trim()); closeSheet() }}>{action === 'reject' ? '반려하기' : '인증 취소'}</Button>
    </>
  )
}
