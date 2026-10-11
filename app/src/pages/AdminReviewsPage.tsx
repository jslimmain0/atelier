// 14 관리자 · 경력 인증 심사 (목록)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import type { CareerVerifyStatus } from '../entities/types'
import { endpoints } from '../shared/api/endpoints'
import { useMe, useSettings } from '../shared/api/queries'
import type { ReviewItem } from '../shared/api/types'
import { CAREER_CATEGORY } from '../shared/lib/labels'
import { Toggle } from '../shared/ui/blocks'
import { Icon } from '../shared/ui/Icon'
import { AppBar, Avatar, Chip, Empty, VerifiedBadge } from '../shared/ui/primitives'
import { AdminGate } from './AdminGate'
import s from './admin.module.css'

export function AdminReviewsPage() {
  const [status, setStatus] = useState<CareerVerifyStatus>('pending')
  const { data: me } = useMe()
  const { data: settings } = useSettings()
  const list = useQuery({ queryKey: ['admin', 'reviews', status], queryFn: () => endpoints.reviews(status), enabled: me?.role === 'admin' })

  const groups = new Map<string, ReviewItem[]>()
  list.data?.forEach(r => groups.set(r.artist.id, [...(groups.get(r.artist.id) ?? []), r]))

  return (
    <AdminGate title="경력 인증 심사">
      <AppBar title="경력 인증 심사" align="left" right={<Link to="/admin/settings" aria-label="운영 설정"><Icon name="settings" /></Link>} />
      <Toggle<CareerVerifyStatus> items={[['pending', `심사 대기${status === 'pending' && list.data ? ` ${list.data.length}` : ''}`], ['verified', '인증됨'], ['rejected', '반려']]} value={status} onChange={setStatus} />
      {list.isPending ? <Empty title="불러오는 중…" /> : !list.data?.length ? <Empty title={status === 'pending' ? '심사 대기 항목이 없어요' : '해당하는 항목이 없어요'} /> : (
        [...groups.values()].map(items => {
          const a = items[0].artist
          return (
            <section key={a.id} className={s.group}>
              <div className={s.groupHead}>
                <Avatar name={a.name} tone={a.avatarTone} size={26} /><b>{a.name}</b><VerifiedBadge show={a.isVerified} size={14} />
                <span>공개 인증 {a.verifiedCount}/{settings?.verifiedBadgeThreshold ?? 5}</span>
              </div>
              {items.map(r => (
                <Link key={r.item.id} to={`/admin/career-reviews/${r.item.id}`} className={s.item}>
                  <Chip>{CAREER_CATEGORY[r.item.category]}</Chip>
                  <span className={s.itemText}>{r.item.text}{!r.item.isPublic && ' (비공개)'}</span>
                  <Icon name="chev" size={16} />
                </Link>
              ))}
            </section>
          )
        })
      )}
    </AdminGate>
  )
}
