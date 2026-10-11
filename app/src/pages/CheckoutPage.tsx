// 05 구매하기 (수령 방식 · 부가 서비스 · 결제)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { checkoutTotal } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { qk, useMe } from '../shared/api/queries'
import type { OrderView } from '../shared/api/types'
import { won } from '../shared/lib/format'
import { Art } from '../shared/ui/Art'
import { Field, Sum } from '../shared/ui/blocks'
import { inputCls } from '../shared/ui/classes'
import { Icon, type IconName } from '../shared/ui/Icon'
import { AppBar, BackButton, BottomBar, Button, ButtonLink, Empty, Opt } from '../shared/ui/primitives'
import s from './checkout.module.css'

const ADDON_ICON: Record<string, IconName> = { frame: 'frame', install: 'home', care: 'care' }

export function CheckoutPage() {
  const { workId = '' } = useParams()
  const navigate = useNavigate()
  const { data: me, isPending: mePending } = useMe()
  const work = useQuery({ queryKey: qk.work(workId), queryFn: () => endpoints.work(workId) })
  const addOns = useQuery({ queryKey: qk.addOns, queryFn: endpoints.addOns, staleTime: Infinity })
  const pricing = useQuery({ queryKey: qk.pricing, queryFn: endpoints.pricing, staleTime: Infinity })
  const [fulfillment, setFulfillment] = useState<'delivery' | 'storage'>('delivery')
  const [months, setMonths] = useState(3)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [address, setAddress] = useState('')
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState<OrderView | null>(null)
  const order = useApiMutation(endpoints.createOrder, { onSuccess: setDone })

  const head = <AppBar title="주문하기" left={<BackButton />} />
  if (done) {
    return (
      <>
        <AppBar title="" />
        <Empty title="결제가 완료됐어요" action={<div className={s.doneBtns}><ButtonLink to="/me/history" size="sm">거래 내역</ButtonLink><ButtonLink to="/" size="sm" variant="ghost">계속 둘러보기</ButtonLink></div>}>
          <Art url={done.work.imageUrl} className={s.doneArt} />
          작가가 주문을 확인하면 알려드릴게요.<br />{done.fulfillment === 'storage' ? '작품은 아틀리에 수장고에 보관돼요.' : '배송 진행 상황은 거래 내역에서 볼 수 있어요.'}
        </Empty>
      </>
    )
  }
  if (work.isPending || mePending || !addOns.data || !pricing.data) return head
  if (!me) return <>{head}<Empty title="구매하려면 로그인해 주세요">왼쪽 아래 DEV에서 보기 계정을 바꿔 보세요.</Empty></>
  const w = work.data
  if (!w) return <>{head}<Empty title="작품을 찾을 수 없어요" /></>
  if (w.viewer.isMine || w.saleStatus !== 'available' || !w.price) {
    return <>{head}<Empty title={w.viewer.isMine ? '내 작품은 구매할 수 없어요' : '지금은 구매할 수 없는 작품이에요'} action={<Button size="sm" variant="ghost" onClick={() => navigate(`/works/${w.id}`)}>작품으로 돌아가기</Button>} /></>
  }

  const chosen = addOns.data.filter(a => selected.has(a.id))
  const t = checkoutTotal({
    workPrice: w.price, addOnPrices: chosen.map(a => a.price), fulfillment,
    shippingFee: pricing.data.shippingFee, storageMonths: months, storageMonthly: pricing.data.storageMonthly, storageFreeMonths: pricing.data.storageFreeMonths,
  })
  const addrErr = fulfillment === 'delivery' && !address.trim() ? '배송지를 입력해 주세요' : undefined
  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  return (
    <>
      {head}
      <div className={s.item}>
        <Art url={w.images[0].url} className={s.itemArt} />
        <div className={s.itemText}><b>{w.title}</b>{w.artist.name} · {w.material}<br />{w.size}<span className="won">{won(w.price)}</span></div>
      </div>
      <div className={s.hr} />

      <section className={s.sec}>
        <h2 className="sec-t">수령 방식</h2>
        <Opt checked={fulfillment === 'delivery'} onClick={() => setFulfillment('delivery')} title={<><Icon name="truck" size={16} />집으로 배송</>} right={won(pricing.data.shippingFee)}>
          미술품 전문 운송 · 무진동 차량 · 3–5일
        </Opt>
        <Opt checked={fulfillment === 'storage'} onClick={() => setFulfillment('storage')} title={<><Icon name="archive" size={16} />아틀리에 수장고 보관</>}
          right={<>월 {won(pricing.data.storageMonthly)}<br /><small className={s.free}>{pricing.data.storageFreeMonths}개월 무료</small></>}>
          항온항습 · 보험 포함 · 언제든 배송 요청 가능
        </Opt>
        {fulfillment === 'storage' && (
          <div className={s.months} role="radiogroup" aria-label="보관 기간">
            {[3, 6, 12].map(m => <button key={m} role="radio" aria-checked={months === m} onClick={() => setMonths(m)}>{m}개월</button>)}
          </div>
        )}
        {fulfillment === 'delivery' && (
          <Field label="배송지" required error={touched ? addrErr : undefined}>{id => <input id={id} className={inputCls} value={address} onChange={e => setAddress(e.target.value)} placeholder="주소 검색" />}</Field>
        )}
      </section>

      <section className={s.sec}>
        <h2 className="sec-t">추가 옵션</h2>
        {addOns.data.map(a => (
          <Opt key={a.id} type="checkbox" checked={selected.has(a.id)} onClick={() => toggle(a.id)} title={<><Icon name={ADDON_ICON[a.kind] ?? 'frame'} size={16} />{a.name}</>} right={won(a.price)}>
            {a.description}
          </Opt>
        ))}
      </section>

      <Sum
        rows={[
          { label: '작품가', value: won(t.work) },
          ...chosen.map(a => ({ label: a.name, value: won(a.price) })),
          fulfillment === 'delivery'
            ? { label: '배송비', value: won(t.fulfillment) }
            : { label: `수장고 보관 (${months}개월)`, value: t.fulfillment ? won(t.fulfillment) : '무료', free: !t.fulfillment },
        ]}
        total={['합계', won(t.total)]}
      />
      <div style={{ height: 16 }} />

      <BottomBar column>
        <small className={s.hint}><Icon name="shield" size={13} />작품 수령 확인 후 작가에게 정산돼요</small>
        <Button variant="accent" size="lg" disabled={order.isPending} onClick={() => {
          setTouched(true)
          if (addrErr) return
          order.mutate({ workId: w.id, addOnIds: [...selected], fulfillment, storageMonths: fulfillment === 'storage' ? months : undefined, address: address.trim() || undefined })
        }}>
          <span className="won">{won(t.total)}</span> 결제하기
        </Button>
      </BottomBar>
    </>
  )
}
