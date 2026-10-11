import { Link } from 'react-router'
import { useRequireLogin, useToggleFollow, useToggleLike, useToggleSave } from '../../shared/api/mutations'
import type { WorkView } from '../../shared/api/types'
import { compact, truncate, won } from '../../shared/lib/format'
import { CATEGORY, SALE } from '../../shared/lib/labels'
import { Art } from '../../shared/ui/Art'
import { Icon } from '../../shared/ui/Icon'
import { Avatar, Chip, VerifiedBadge } from '../../shared/ui/primitives'
import { useFeedback } from '../../shared/ui/useFeedback'
import s from './work.module.css'

/** 피드 1열 포스트: 작가 헤더 · 작품 + 판매 칩 · 행동 · 제목/스펙 · 제작 스토리 */
export function WorkPost({ work: w }: { work: WorkView }) {
  const requireLogin = useRequireLogin()
  const like = useToggleLike()
  const save = useToggleSave()
  const follow = useToggleFollow()
  const { toast } = useFeedback()
  const sale = SALE[w.saleStatus]
  const artistTo = `/artists/${w.artist.handle}`

  return (
    <article className={s.post}>
      <div className={s.head}>
        <Link to={artistTo} aria-label={`${w.artist.name} 프로필`}><Avatar name={w.artist.name} tone={w.artist.avatarTone} /></Link>
        <Link to={artistTo} className={s.who}>
          <b>{w.artist.name}<VerifiedBadge show={w.artist.isVerified} size={14} /></b>
          <small>{CATEGORY[w.category]}{w.artist.place ? ` · ${w.artist.place}` : ''}</small>
        </Link>
        {!w.viewer.isMine && (
          <button
            className={s.follow} aria-pressed={w.viewer.followingArtist}
            onClick={() => requireLogin(() => follow.mutate({ artistId: w.artist.id, handle: w.artist.handle, name: w.artist.name, following: w.viewer.followingArtist }))}
          >
            {w.viewer.followingArtist ? '팔로잉' : '팔로우'}
          </button>
        )}
      </div>

      <Link to={`/works/${w.id}`} aria-label={`${w.title} 자세히 보기`}>
        <Art url={w.images[0].url} alt={w.title} className={s.art}>
          <Chip tone={w.saleStatus === 'available' ? 'sale' : 'line'} className={`${s.tag} ${w.saleStatus !== 'available' ? s.tagMuted : ''}`}>
            {sale.label}{w.saleStatus === 'available' && w.price ? ` · ${won(w.price)}` : ''}
          </Chip>
        </Art>
      </Link>

      <div className={s.actions}>
        <button className={w.viewer.liked ? s.liked : undefined} aria-pressed={w.viewer.liked} aria-label="좋아요" onClick={() => requireLogin(() => like.mutate(w))}>
          <Icon name="heart" filled={w.viewer.liked} />{compact(w.likes)}
        </button>
        <button aria-label="공유" onClick={() => { navigator.clipboard?.writeText(`${location.origin}/works/${w.id}`); toast('링크를 복사했어요') }}><Icon name="share" /></button>
        <span className={s.sp} />
        <button aria-pressed={w.viewer.saved} aria-label="저장" onClick={() => requireLogin(() => save.mutate(w))}>
          <Icon name="bookmark" filled={w.viewer.saved} />
        </button>
      </div>

      <div className={s.meta}>
        <h3>{w.title} {w.year && <small>{w.year}</small>}</h3>
        <div className={s.spec}>{[w.material, w.size].filter(Boolean).join(' · ')}</div>
      </div>

      {w.story && (
        <div className={s.quote}>
          <div className={s.quoteK}><Icon name="pen" size={13} />제작 스토리</div>
          {truncate(w.story, 60)} <Link to={`/works/${w.id}`}>더보기</Link>
        </div>
      )}
    </article>
  )
}

export function WorkPostSkeleton() {
  return (
    <div className={s.post} aria-hidden>
      <div className={s.head}><div className={s.skel} style={{ width: 36, height: 36, borderRadius: '50%' }} /><div className={s.skel} style={{ width: 120, height: 14, borderRadius: 4 }} /></div>
      <div className={`${s.skel} ${s.art}`} />
      <div className={s.meta} style={{ paddingTop: 14 }}><div className={s.skel} style={{ width: '60%', height: 18, borderRadius: 4 }} /></div>
    </div>
  )
}
