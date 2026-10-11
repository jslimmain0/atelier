// 06 거래 내역 (구매 · 판매 · 후원)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import type { OrderStatus } from '../entities/types'
import { decidingMilestone, PLATFORM_FEE_RATE } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { qk, useMe } from '../shared/api/queries'
import type { OrderView } from '../shared/api/types'
import { won } from '../shared/lib/format'
import { ORDER_STATUS } from '../shared/lib/labels'
import { Art } from '../shared/ui/Art'
import { Field, Settle, SheetDesc, Toggle, Track, TxRow } from '../shared/ui/blocks'
import { inputCls, txArtCls } from '../shared/ui/classes'
import { AppBar, BackButton, Button, ButtonLink, Chip, Empty } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'
import s from './pages.module.css'

type Tab = 'buy' | 'sell' | 'support'
const TRACK_DELIVERY: [OrderStatus, string][] = [['paid', '결제'], ['confirmed', '작가확인'], ['shipping', '운송중'], ['delivered', '배송완료'], ['completed', '구매확정']]
const TRACK_STORAGE: [OrderStatus, string][] = [['paid', '결제'], ['confirmed', '작가확인'], ['stored', '보관중'], ['completed', '구매확정']]

function OrderTrack({ o }: { o: OrderView }) {
  const t = o.fulfillment === 'storage' ? TRACK_STORAGE : TRACK_DELIVERY
  return <Track steps={t.map(x => x[1])} current={t.findIndex(x => x[0] === o.status)} />
}

export function HistoryPage() {
  const { data: me, isPending } = useMe()
  const [tabState, setTab] = useState<Tab>('buy')
  const tab: Tab = tabState === 'sell' && !me?.isArtist ? 'buy' : tabState
  const buys = useQuery({ queryKey: qk.orders('buyer'), queryFn: () => endpoints.myOrders('buyer'), enabled: !!me })
  const sells = useQuery({ queryKey: qk.orders('seller'), queryFn: () => endpoints.myOrders('seller'), enabled: !!me?.isArtist })
  const backings = useQuery({ queryKey: qk.backings, queryFn: endpoints.myBackings, enabled: !!me })

  const head = <AppBar title="거래 내역" left={<BackButton />} />
  if (isPending) return head
  if (!me) return <>{head}<Empty title="거래 내역을 보려면 로그인해 주세요">왼쪽 아래 DEV에서 보기 계정을 바꿔 보세요.</Empty></>

  const tabs: [Tab, string][] = [['buy', `구매 ${buys.data?.length ?? ''}`], ...(me.isArtist ? [['sell', `판매 ${sells.data?.length ?? ''}`] as [Tab, string]] : []), ['support', `후원 ${backings.data?.length ?? ''}`]]
  return (
    <>
      {head}
      <Toggle items={tabs} value={tab} onChange={setTab} />
      {tab === 'buy' && <BuyList orders={buys.data} />}
      {tab === 'sell' && <SellList orders={sells.data} />}
      {tab === 'support' && <SupportList />}
      <div style={{ height: 24 }} />
    </>
  )
}

function BuyList({ orders }: { orders?: OrderView[] }) {
  const { toast } = useFeedback()
  const confirm = useApiMutation((id: string) => endpoints.updateOrder(id, 'completed'), { success: '구매를 확정했어요' })
  if (!orders) return null
  if (!orders.length) return <Empty title="아직 구매한 작품이 없어요" action={<ButtonLink to="/" size="sm">작품 둘러보기</ButtonLink>} />
  return orders.map(o => {
    const st = ORDER_STATUS[o.status]
    return (
      <TxRow key={o.id} top
        art={<Link to={`/works/${o.work.id}`} aria-label={`${o.work.title} 작품 보기`}><Art url={o.work.imageUrl} className={txArtCls} /></Link>}
        title={o.work.title}
        sub={`${o.seller.name} · ${o.createdAt.slice(5).replace('-', '.')} · ${o.fulfillment === 'storage' ? `보관 ${o.storageMonths}개월` : '배송'}`}
        right={<>
          <b className="won">{won(o.amounts.total)}</b><Chip tone={st.tone}>{st.label}</Chip>
          {o.status === 'delivered' && <Button size="sm" disabled={confirm.isPending} onClick={() => confirm.mutate(o.id)}>구매 확정</Button>}
          {o.status === 'stored' && <Button size="sm" variant="ghost" onClick={() => toast('배송 요청을 접수했어요')}>배송 요청</Button>}
        </>}
      >
        {o.status !== 'completed' && o.status !== 'stored' && <OrderTrack o={o} />}
      </TxRow>
    )
  })
}

type SellFilter = 'all' | 'active' | 'stored' | 'done'
function SellList({ orders }: { orders?: OrderView[] }) {
  const { openSheet } = useFeedback()
  const [filter, setFilter] = useState<SellFilter>('all')
  const update = useApiMutation(({ id, status }: { id: string; status: OrderStatus }) => endpoints.updateOrder(id, status), {
    success: (_, v) => ({ confirmed: '주문을 확인했어요. 구매자에게 알림이 가요', shipping: '송장을 입력했어요', stored: '수장고로 입고했어요', delivered: '배송 완료로 바꿨어요' } as Record<string, string>)[v.status] ?? '변경했어요',
  })
  if (!orders) return null
  const net = (o: OrderView) => Math.round(o.amounts.work * (1 - PLATFORM_FEE_RATE))
  const pending = orders.filter(o => o.status !== 'completed').reduce((n, o) => n + net(o), 0)
  const match = (o: OrderView) => filter === 'all' || (filter === 'stored' ? o.status === 'stored' : filter === 'done' ? o.status === 'completed' : !['stored', 'completed'].includes(o.status))
  const counts = { active: orders.filter(o => !['stored', 'completed'].includes(o.status)).length, stored: orders.filter(o => o.status === 'stored').length }

  return (
    <>
      <Settle label="정산 예정 금액" big={won(pending)} rows={[['판매', `${orders.length}건`], ['수수료', `${PLATFORM_FEE_RATE * 100}%`], ['정산일', '매월 25일']]} />
      <div className={s.chips} role="radiogroup" aria-label="상태">
        {([['all', '전체'], ['active', `진행중 ${counts.active}`], ['stored', `보관중 ${counts.stored}`], ['done', '정산완료']] as [SellFilter, string][]).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={filter === k} onClick={() => setFilter(k)}><Chip tone={filter === k ? 'sale' : 'line'}>{l}</Chip></button>
        ))}
      </div>
      {!orders.filter(match).length && <Empty title="해당하는 판매 내역이 없어요" />}
      {orders.filter(match).map(o => {
        const st = ORDER_STATUS[o.status]
        return (
          <TxRow key={o.id} top
            art={<Art url={o.work.imageUrl} className={txArtCls} />}
            title={o.work.title}
            sub={`구매자 @${o.buyer.handle} · ${o.createdAt.slice(5).replace('-', '.')} · ${o.fulfillment === 'storage' ? '수장고 보관' : '배송'}`}
            right={<>
              <b className="won">{won(o.amounts.work)}</b><Chip tone={st.tone}>{st.label}</Chip>
              {o.status === 'paid' && <Button size="sm" onClick={() => update.mutate({ id: o.id, status: 'confirmed' })}>주문 확인</Button>}
              {o.status === 'confirmed' && o.fulfillment === 'delivery' && <Button size="sm" variant="ghost" onClick={() => openSheet(<TrackingSheet onSave={() => update.mutate({ id: o.id, status: 'shipping' })} />)}>송장 입력</Button>}
              {o.status === 'confirmed' && o.fulfillment === 'storage' && <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: o.id, status: 'stored' })}>수장고 입고</Button>}
              {o.status === 'shipping' && <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: o.id, status: 'delivered' })}>배송 완료 (mock)</Button>}
            </>}
          >
            <small className="muted" style={{ fontSize: 11.5 }}>정산 예정 {won(net(o))}</small>
            {o.status !== 'completed' && o.status !== 'stored' && <OrderTrack o={o} />}
          </TxRow>
        )
      })}
    </>
  )
}

function TrackingSheet({ onSave }: { onSave: () => void }) {
  const { closeSheet } = useFeedback()
  const [no, setNo] = useState('')
  return (
    <>
      <h2>송장 입력</h2>
      <SheetDesc>입력하면 구매자에게 운송 시작 알림이 가요.</SheetDesc>
      <Field label="운송사">{id => <select id={id} className={inputCls}><option>미술품 전문 운송</option><option>CJ대한통운</option></select>}</Field>
      <Field label="송장 번호" required>{id => <input id={id} className={inputCls} inputMode="numeric" value={no} onChange={e => setNo(e.target.value)} />}</Field>
      <Button block disabled={!no.trim()} onClick={() => { onSave(); closeSheet() }}>저장</Button>
    </>
  )
}

function SupportList() {
  const backings = useQuery({ queryKey: qk.backings, queryFn: endpoints.myBackings })
  if (!backings.data) return null
  const list = backings.data
  if (!list.length) return <Empty title="후원한 프로젝트가 없어요" action={<ButtonLink to="/support" size="sm" variant="patron">후원 둘러보기</ButtonLink>} />
  return (
    <>
      <Settle patron label="지금까지 후원한 금액" big={won(list.reduce((n, b) => n + b.paidTotal, 0))}
        rows={[['후원 중', `${list.filter(b => b.status === 'active').length}개`], ['완성까지 함께함', `${list.filter(b => b.status === 'finished').length}개`]]} />
      <div style={{ height: 8 }} />
      {list.map(b => {
        const dm = decidingMilestone(b.project)
        const need = b.status === 'active' && dm && !b.decisions[dm.id]
        return (
          <TxRow key={b.id}
            art={<Link to={`/support/${b.projectId}`} aria-label={`${b.project.title} 프로젝트 보기`}><Art url={b.project.coverUrl} className={txArtCls} /></Link>}
            title={b.project.title}
            sub={`${b.project.artist.name} · 회당 ${won(b.amountPerMilestone)} · 누적 ${won(b.paidTotal)}`}
            right={need
              ? <ButtonLink to={`/support/${b.projectId}/milestones/${dm.order}`} size="sm" variant="patron">지속/이탈 선택</ButtonLink>
              : <Chip tone={b.status === 'active' ? 'patron' : b.status === 'finished' ? 'ok' : 'line'}>{{ active: '후원 중', left: '이탈', finished: '완료' }[b.status]}</Chip>}
          />
        )
      })}
    </>
  )
}
