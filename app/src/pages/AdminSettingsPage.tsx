// 15 관리자 · 운영 설정
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation } from '../shared/api/mutations'
import { qk, useMe } from '../shared/api/queries'
import type { PlatformSettings } from '../entities/types'
import { Field, Gate, Pad } from '../shared/ui/blocks'
import { inputCls } from '../shared/ui/classes'
import { AppBar, BackButton, BottomBar, Button } from '../shared/ui/primitives'
import { AdminGate } from './AdminGate'

export function AdminSettingsPage() {
  const { data: me } = useMe()
  const settings = useQuery({ queryKey: qk.adminSettings, queryFn: endpoints.adminSettings, enabled: me?.role === 'admin' })
  return (
    <AdminGate title="운영 설정">
      <AppBar title="운영 설정" left={<BackButton />} />
      {settings.data && <SettingsForm initial={settings.data} />}
    </AdminGate>
  )
}

function SettingsForm({ initial }: { initial: PlatformSettings }) {
  const [threshold, setThreshold] = useState(String(initial.verifiedBadgeThreshold))
  const [boost, setBoost] = useState(String(initial.verifiedFeedBoost))
  const save = useApiMutation(endpoints.updateSettings, { success: '저장했어요 · 인증 마크와 피드에 바로 반영돼요' })
  const tErr = !/^\d+$/.test(threshold) || +threshold < 1 ? '1 이상의 정수' : undefined
  const bErr = !(+boost >= 1) ? '1.0 이상' : undefined
  return (
    <>
      <Pad>
        <Field label="인증 마크 기준 개수" error={tErr} hint="공개 + 인증된 경력 항목이 이 개수 이상이면 인증 작가">{(id, d) => <input id={id} aria-describedby={d} className={inputCls} inputMode="numeric" value={threshold} onChange={e => setThreshold(e.target.value)} />}</Field>
        <Field label="인증 작가 피드 노출 가중치" error={bErr} hint="추천 · 인기 탭 점수에 곱해요. 1.0이면 우대 없음">{(id, d) => <input id={id} aria-describedby={d} className={inputCls} inputMode="decimal" value={boost} onChange={e => setBoost(e.target.value)} />}</Field>
        <Gate flush tone="plain" title="고정값 (설계서 기준)">선택 기간 {initial.decisionWindowDays}일 · 수장고 무료 보관 {initial.storageFreeMonths}개월</Gate>
      </Pad>
      <BottomBar><Button block disabled={!!tErr || !!bErr || save.isPending} onClick={() => save.mutate({ verifiedBadgeThreshold: +threshold, verifiedFeedBoost: +boost })}>저장</Button></BottomBar>
    </>
  )
}
