import { Link } from 'react-router'
import type { WorkView } from '../../shared/api/types'
import { shortWon } from '../../shared/lib/format'
import { Art } from '../../shared/ui/Art'
import s from './work.module.css'

/** 3열 그리드: 판매중이면 가격, 판매 완료·예약이면 라벨 */
export function WorkGrid({ works }: { works: WorkView[] }) {
  return (
    <div className={s.grid}>
      {works.map(w => (
        <Link key={w.id} to={`/works/${w.id}`} aria-label={w.title}>
          <Art url={w.images[0].url} className={s.cell}>
            {w.saleStatus === 'sold' && <span className={s.sold}>SOLD</span>}
            {w.saleStatus === 'reserved' && <span className={s.sold}>예약중</span>}
            {w.saleStatus === 'available' && w.price && <span className={s.px}>{shortWon(w.price)}</span>}
          </Art>
        </Link>
      ))}
    </div>
  )
}

export function WorkGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className={s.grid} aria-hidden>
      {Array.from({ length: count }, (_, i) => <div key={i} className={`${s.cell} ${s.skel}`} />)}
    </div>
  )
}
