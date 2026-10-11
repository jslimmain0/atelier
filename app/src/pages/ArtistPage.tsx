// 03 작가 프로필 (개인 브랜딩 공간)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { CareerItem } from '../entities/types'
import { ProjectCard } from '../entities/project/ProjectCard'
import { WorkGrid, WorkGridSkeleton } from '../entities/work/WorkGrid'
import { isClosedProject } from '../domain/rules'
import { endpoints } from '../shared/api/endpoints'
import { useApiMutation, useRequireLogin, useToggleFollow } from '../shared/api/mutations'
import { qk, useSettings } from '../shared/api/queries'
import type { UserView } from '../shared/api/types'
import { compact } from '../shared/lib/format'
import { CAREER_CATEGORY } from '../shared/lib/labels'
import { Art } from '../shared/ui/Art'
import { Field, Gate, ListLink } from '../shared/ui/blocks'
import { inputCls } from '../shared/ui/classes'
import { Icon } from '../shared/ui/Icon'
import { AppBar, Avatar, BackButton, Button, ButtonLink, Chip, Empty, Seg, VerifiedBadge } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'
import s from './profile.module.css'

type Tab = 'works' | 'sale' | 'projects' | 'about' | 'collection'

export function ArtistPage() {
  const { handle = '' } = useParams()
  const navigate = useNavigate()
  const { openSheet, toast } = useFeedback()
  const requireLogin = useRequireLogin()
  const follow = useToggleFollow()
  const { data: settings } = useSettings()
  const user = useQuery({ queryKey: qk.user(handle), queryFn: () => endpoints.user(handle) })
  const u = user.data
  const works = useQuery({ queryKey: qk.userWorks(handle), queryFn: () => endpoints.userWorks(handle), enabled: !!u?.isArtist })
  const projects = useQuery({ queryKey: qk.userProjects(handle), queryFn: () => endpoints.userProjects(handle), enabled: !!u?.isArtist })
  const collection = useQuery({ queryKey: qk.userCollection(handle), queryFn: () => endpoints.userCollection(handle), enabled: !!u && !u.isArtist })
  const [tabState, setTab] = useState<Tab | null>(null)

  if (user.isPending) return <><AppBar left={<BackButton />} /><div className={s.coverSkel} /></>
  if (user.isError || !u) return <><AppBar left={<BackButton />} /><Empty title="작가를 찾을 수 없어요" action={<ButtonLink to="/" size="sm">피드로</ButtonLink>} /></>

  const self = u.viewer.isSelf
  const threshold = settings?.verifiedBadgeThreshold ?? 5
  const tab: Tab = tabState ?? (u.isArtist ? 'works' : 'collection')
  const ws = works.data ?? []
  const ps = projects.data ?? []
  const open = ps.find(p => !isClosedProject(p))
  const tabs: [Tab, string][] = u.isArtist
    ? [['works', `작품 ${ws.length}`], ['sale', `판매중 ${ws.filter(w => w.saleStatus === 'available').length}`], ['projects', '후원'], ['about', '소개']]
    : [['collection', '소장품'], ['about', '소개']]

  return (
    <>
      <div className={s.coverWrap}>
        <Art url={u.coverUrl ?? 'art:a8'} className={s.cover} />
        <div className={s.coverBar}>
          {self ? <span /> : <button className={s.circ} onClick={() => navigate(-1)} aria-label="뒤로"><Icon name="back" /></button>}
          <button className={s.circ} aria-label={self ? '메뉴' : '더보기'}
            onClick={() => (self ? openSheet(<ProfileMenu user={u} threshold={threshold} />) : toast('신고 · 차단은 다음 단계에서 열려요'))}>
            <Icon name={self ? 'menu' : 'more'} />
          </button>
        </div>
      </div>
      <Avatar name={u.name} tone={u.avatarTone} size={84} className={s.av} />

      <div className={s.head}>
        <h1 className={s.name}>{u.name}<VerifiedBadge show={u.isVerified} /></h1>
        <div className={s.handle}>@{u.handle}{u.place && ` · ${u.place}`}</div>
        {u.statement && <p className={s.statement}>“{u.statement}”</p>}
        {u.tags.length > 0 && <div className={s.tags}>{u.tags.map(t => <Chip key={t}>{t}</Chip>)}</div>}
      </div>

      {u.isArtist && (
        <dl className={s.stats}>
          <div><dt>작품</dt><dd>{ws.length}</dd></div>
          <div><dt>팔로워</dt><dd>{compact(u.stats.followers)}</dd></div>
          <div><dt>판매</dt><dd>{ws.filter(w => w.saleStatus === 'sold').length}</dd></div>
          <div><dt>후원자</dt><dd>{ps.reduce((n, p) => n + p.totalBackers, 0)}</dd></div>
        </dl>
      )}

      <div className={s.btns}>
        {self ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => openSheet(<EditProfileSheet user={u} />)}>프로필 편집</Button>
            {u.isArtist
              ? <ButtonLink to="/me/career" variant="ghost" size="sm"><Icon name="shield" size={16} />{u.isVerified ? '경력 · 인증' : `인증 ${u.verifiedCount}/${threshold}`}</ButtonLink>
              : <ButtonLink to="/me/history" variant="ghost" size="sm"><Icon name="receipt" size={16} />거래 내역</ButtonLink>}
          </>
        ) : (
          <>
            <Button size="sm" variant={u.viewer.isFollowing ? 'ghost' : 'dark'}
              onClick={() => requireLogin(() => follow.mutate({ artistId: u.id, handle: u.handle, name: u.name, following: u.viewer.isFollowing }))}>
              {u.viewer.isFollowing ? '팔로잉' : '팔로우'}
            </Button>
            {open
              ? <ButtonLink to={`/support/${open.id}`} variant="ghost" size="sm"><span className={s.patron}><Icon name="sprout" size={16} />후원하기</span></ButtonLink>
              : <Button variant="ghost" size="sm" disabled><Icon name="sprout" size={16} />진행 중인 후원 없음</Button>}
          </>
        )}
      </div>

      {self && u.isArtist && !u.isVerified && (
        <div style={{ marginBottom: 12 }}>
          <Gate icon="shield" title={`공개된 인증 항목 ${u.verifiedCount} / ${threshold}`}>
            {threshold - u.verifiedCount}개 더 인증되면 인증 마크가 붙고 후원 프로젝트를 열 수 있어요.
          </Gate>
        </div>
      )}

      <Seg<Tab> items={tabs} value={tab} onChange={setTab} />

      {tab === 'works' && (works.isPending ? <WorkGridSkeleton /> : ws.length ? <WorkGrid works={ws} /> : (
        <Empty title="아직 올린 작품이 없어요" action={self ? <ButtonLink to="/upload" size="sm">첫 작품 올리기</ButtonLink> : undefined} />
      ))}
      {tab === 'sale' && (ws.some(w => w.saleStatus === 'available') ? <WorkGrid works={ws.filter(w => w.saleStatus === 'available')} /> : <Empty title="판매 중인 작품이 없어요" />)}
      {tab === 'projects' && (
        <div style={{ paddingTop: 12 }}>
          {ps.length ? ps.map(p => <ProjectCard key={p.id} project={p} />) : <Empty title="후원 프로젝트 이력이 없어요" />}
        </div>
      )}
      {tab === 'collection' && (collection.data?.length ? <WorkGrid works={collection.data} /> : <Empty title="아직 소장한 작품이 없어요" />)}
      {tab === 'about' && <About user={u} threshold={threshold} />}
    </>
  )
}

function About({ user: u, threshold }: { user: UserView; threshold: number }) {
  const self = u.viewer.isSelf
  const items = [...u.career].sort((a, b) => Number(b.verifyStatus === 'verified') - Number(a.verifyStatus === 'verified') || b.yearFrom - a.yearFrom)
  return (
    <div className={s.about}>
      <h2 className="sec-t">작가 소개</h2>
      <p className="prose">{u.statement || '아직 소개가 없어요.'}</p>
      {u.isArtist && (
        <>
          <div className={s.aboutHead}>
            <h2 className="sec-t" style={{ margin: 0 }}>경력</h2>
            {self && <ButtonLink to="/me/career" variant="ghost" size="sm">경력 · 인증 관리</ButtonLink>}
          </div>
          <div className={s.verifyBox}>
            {u.isVerified
              ? <><VerifiedBadge show size={18} /><span>작가 소개 중 <b>{u.verifiedCount}개 항목</b>을 atelier가 서류로 확인했어요.</span></>
              : <><Icon name="shield" size={16} /><span>인증된 항목 {u.verifiedCount}개 (인증 마크 기준 {threshold}개) · 표시가 없는 항목은 작가가 직접 작성한 내용이에요.</span></>}
          </div>
          {items.length ? <ul className={s.career}>{items.map(c => <CareerRow key={c.id} item={c} self={self} />)}</ul> : <Empty title="등록된 경력이 없어요" />}
        </>
      )}
    </div>
  )
}

function CareerRow({ item: c, self }: { item: CareerItem; self: boolean }) {
  return (
    <li>
      <span className={s.yr}>{c.yearFrom}{c.yearTo ? `–${String(c.yearTo).slice(2)}` : ''}</span>
      <div><span className={s.cat}>{CAREER_CATEGORY[c.category]}</span>{c.text}{self && !c.isPublic && <> <Chip>비공개</Chip></>}</div>
      <div>
        {c.verifyStatus === 'verified' ? <span className={s.ok}><VerifiedBadge show size={15} />인증</span>
          : self && c.verifyStatus === 'pending' ? <Chip tone="warn">심사 중</Chip>
          : self && c.verifyStatus === 'rejected' ? <Chip tone="danger">반려</Chip> : null}
      </div>
    </li>
  )
}

function ProfileMenu({ user: u, threshold }: { user: UserView; threshold: number }) {
  const { closeSheet } = useFeedback()
  return (
    <>
      <h2>{u.name}</h2>
      <div className={s.menu}>
        <ListLink to="/me/history" onClick={closeSheet} icon="receipt">거래 내역</ListLink>
        <ListLink to="/me/saved" onClick={closeSheet} icon="bookmark">저장한 작품</ListLink>
        {u.isArtist && <ListLink to="/me/studio/support" onClick={closeSheet} icon="sprout">내 후원 프로젝트</ListLink>}
        {u.isArtist && <ListLink to="/me/career" onClick={closeSheet} icon="shield" right={`${u.verifiedCount}/${threshold}`}>경력 · 인증</ListLink>}
        <ListLink to="/upload" onClick={closeSheet} icon="plus">작품 올리기</ListLink>
      </div>
    </>
  )
}

function EditProfileSheet({ user: u }: { user: UserView }) {
  const { closeSheet } = useFeedback()
  const [name, setName] = useState(u.name)
  const [statement, setStatement] = useState(u.statement ?? '')
  const [place, setPlace] = useState(u.place ?? '')
  const [tags, setTags] = useState(u.tags.join(', '))
  const save = useApiMutation(endpoints.updateMe, { success: '프로필을 저장했어요', onSuccess: closeSheet })
  return (
    <form onSubmit={e => { e.preventDefault(); save.mutate({ name: name.trim(), statement: statement.trim(), place: place.trim(), tags: tags.split(',').map(t => t.trim()).filter(Boolean) }) }}>
      <h2>프로필 편집</h2>
      <div style={{ height: 10 }} />
      <Field label="이름" required error={!name.trim() ? '이름을 입력해 주세요' : undefined}>{id => <input id={id} className={inputCls} value={name} onChange={e => setName(e.target.value)} />}</Field>
      <Field label="작가노트 (한 줄 소개)" hint="경력(학력·전시·수상)은 '경력 · 인증'에서 항목별로 관리해요">{(id, d) => <textarea id={id} aria-describedby={d} className={inputCls} value={statement} onChange={e => setStatement(e.target.value)} />}</Field>
      <Field label="작업실 위치">{id => <input id={id} className={inputCls} value={place} onChange={e => setPlace(e.target.value)} placeholder="예: 서울 성수 작업실" />}</Field>
      <Field label="태그" hint="쉼표로 구분">{(id, d) => <input id={id} aria-describedby={d} className={inputCls} value={tags} onChange={e => setTags(e.target.value)} />}</Field>
      <Button type="submit" block disabled={!name.trim() || save.isPending}>저장</Button>
    </form>
  )
}
