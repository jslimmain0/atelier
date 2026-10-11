// 02 작품 상세
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { endpoints } from '../shared/api/endpoints'
import { useRequireLogin, useToggleFollow, useToggleLike, useToggleSave } from '../shared/api/mutations'
import { qk } from '../shared/api/queries'
import { monthDay, won } from '../shared/lib/format'
import { CATEGORY, SALE } from '../shared/lib/labels'
import { Art } from '../shared/ui/Art'
import { Icon } from '../shared/ui/Icon'
import { AppBar, Avatar, BackButton, BottomBar, Button, ButtonLink, Chip, Empty, VerifiedBadge } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'
import s from './pages.module.css'

export function WorkPage() {
  const { workId = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useFeedback()
  const requireLogin = useRequireLogin()
  const like = useToggleLike()
  const save = useToggleSave()
  const follow = useToggleFollow()
  const { data: w, isPending, isError } = useQuery({ queryKey: qk.work(workId), queryFn: () => endpoints.work(workId) })

  if (isPending) return <><AppBar left={<BackButton />} /><div className={`${s.hero} ${s.skel}`} /></>
  if (isError || !w) return <><AppBar left={<BackButton />} /><Empty title="작품을 찾을 수 없어요" action={<ButtonLink to="/" size="sm">피드로</ButtonLink>} /></>

  const sale = SALE[w.saleStatus]
  const artistTo = `/artists/${w.artist.handle}`

  return (
    <>
      <div className={s.heroWrap}>
        <Art url={w.images[0].url} alt={w.title} className={s.hero} />
        <div className={s.heroBar}>
          <button className={s.circ} onClick={() => (history.length > 1 ? navigate(-1) : navigate('/'))} aria-label="뒤로"><Icon name="back" /></button>
          <span className={s.heroRight}>
            <button className={s.circ} aria-label="공유" onClick={() => { navigator.clipboard?.writeText(location.href); toast('링크를 복사했어요') }}><Icon name="share" size={16} /></button>
            <button className={s.circ} aria-label="저장" aria-pressed={w.viewer.saved} onClick={() => requireLogin(() => save.mutate(w))}><Icon name="bookmark" size={16} filled={w.viewer.saved} /></button>
            <button className={`${s.circ} ${w.viewer.liked ? s.circLiked : ''}`} aria-label={`좋아요 ${w.likes}`} aria-pressed={w.viewer.liked} onClick={() => requireLogin(() => like.mutate(w))}><Icon name="heart" size={16} filled={w.viewer.liked} /></button>
          </span>
        </div>
        {w.images.length > 1 && <div className={s.pager}>{w.images.map((_, i) => <i key={i} className={i === 0 ? s.on : undefined} />)}</div>}
      </div>

      <div className={s.dPad}>
        <div className={s.row} style={{ marginBottom: 10 }}>
          <Chip tone={sale.tone}>{sale.label}</Chip>
          {w.fromProjectId && <Link to={`/support/${w.fromProjectId}`}><Chip tone="patron"><Icon name="sprout" size={13} />후원으로 완성된 작품</Chip></Link>}
        </div>
        <h1 className={s.dTitle}>{w.title}</h1>
        <Link to={artistTo} className={s.dArtist}>
          <Avatar name={w.artist.name} tone={w.artist.avatarTone} size={22} />
          {w.artist.name}<VerifiedBadge show={w.artist.isVerified} size={14} />
          <span className="muted">· 작품 {w.artistInfo.works}점 · 판매 {w.artistInfo.sold}점</span>
          <Icon name="chev" size={16} className={s.chevR} />
        </Link>

        <div className={s.specs}>
          <div><small>재료</small>{w.material ?? '—'}</div>
          <div><small>크기</small>{w.size ?? '—'}</div>
          <div><small>제작</small>{w.madePeriod ?? w.year ?? '—'}</div>
          <div><small>유형</small>{CATEGORY[w.category]}</div>
        </div>

        {w.description && <section className={s.block}><h2 className="sec-t">작품 이야기</h2><p className="prose">{w.description}</p></section>}

        {(w.story || w.records.length > 0) && (
          <section className={s.block}>
            <h2 className="sec-t">제작 스토리{w.records.length ? ` · ${w.records.length}개의 기록` : ''}</h2>
            {w.story && <p className="prose" style={{ marginBottom: 14 }}>{w.story}</p>}
            {w.records.map(r => (
              <div key={r.title + r.date} className={s.tl}>
                <Art url={r.imageUrl} stage={r.stage} className={s.tlThumb} />
                <div className={s.tlText}><b>{r.title}<small>{monthDay(r.date)}</small></b>{r.note}</div>
              </div>
            ))}
          </section>
        )}

        <div className={s.artistCard}>
          <Link to={artistTo}><Avatar name={w.artist.name} tone={w.artist.avatarTone} size={44} /></Link>
          <Link to={artistTo} className={s.artistCardText}>
            <span className={s.row}><b>{w.artist.name}</b><VerifiedBadge show={w.artist.isVerified} size={14} /></span>
            {w.artistInfo.statement && <span>{w.artistInfo.statement}</span>}
          </Link>
          {!w.viewer.isMine && (
            <Button size="sm" variant={w.viewer.followingArtist ? 'ghost' : 'dark'}
              onClick={() => requireLogin(() => follow.mutate({ artistId: w.artist.id, handle: w.artist.handle, name: w.artist.name, following: w.viewer.followingArtist }))}>
              {w.viewer.followingArtist ? '팔로잉' : '팔로우'}
            </Button>
          )}
        </div>
      </div>

      <BottomBar>
        {w.viewer.isMine ? (
          <ButtonLink to="/upload" variant="ghost" block><Icon name="pen" size={16} />작품 정보 수정</ButtonLink>
        ) : w.saleStatus === 'available' && w.price ? (
          <>
            <div className={s.price}><small>작품가 · 배송/보관 선택 가능</small><b className="won">{won(w.price)}</b></div>
            <Button variant="accent" style={{ width: 132 }} onClick={() => requireLogin(() => navigate(`/checkout/${w.id}`))}>구매하기</Button>
          </>
        ) : (
          <>
            <div className={s.price}><small>{w.saleStatus === 'not_for_sale' ? '판매하지 않는 작품이에요' : w.saleStatus === 'reserved' ? '결제가 진행 중인 작품이에요' : '이미 소장자가 있어요'}</small><b>{sale.label}</b></div>
            <Button variant="ghost" disabled>구매 불가</Button>
          </>
        )}
      </BottomBar>
    </>
  )
}
