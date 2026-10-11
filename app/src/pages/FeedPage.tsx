// 01 피드
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { StoryRings } from '../entities/project/StoryRings'
import { WorkGrid, WorkGridSkeleton } from '../entities/work/WorkGrid'
import { WorkPost, WorkPostSkeleton } from '../entities/work/WorkPost'
import { endpoints } from '../shared/api/endpoints'
import { qk, useMe } from '../shared/api/queries'
import type { FeedTab } from '../shared/api/types'
import { readLocal, writeLocal } from '../shared/lib/storage'
import { Icon } from '../shared/ui/Icon'
import { AppBar, Button, ButtonLink, Empty, Seg } from '../shared/ui/primitives'
import { useFeedback } from '../shared/ui/useFeedback'
import s from './pages.module.css'

type View = 'post' | 'grid'
const VIEW_KEY = 'atl-feed-view'

export function FeedPage() {
  const { data: me } = useMe()
  const { toast } = useFeedback()
  const [tab, setTab] = useState<FeedTab>('foryou')
  const [view, setView] = useState<View>(() => readLocal<View>(VIEW_KEY, 'post', ['post', 'grid']))
  const feed = useQuery({ queryKey: qk.feed(tab), queryFn: () => endpoints.feed(tab), enabled: tab !== 'following' || !!me })

  const changeView = (v: View) => { setView(v); writeLocal(VIEW_KEY, v) }

  return (
    <>
      <AppBar logo right={<>
        <Link to="/explore" aria-label="검색"><Icon name="search" /></Link>
        <button aria-label="알림" onClick={() => toast('알림은 다음 단계에서 열려요')}><Icon name="bell" /></button>
      </>} />
      <Seg<FeedTab>
        items={[['foryou', '추천'], ['following', '팔로잉'], ['popular', '인기']]}
        value={tab} onChange={setTab}
        extra={<>
          <button className={s.viewBtn} aria-pressed={view === 'post'} aria-label="한 줄로 보기" onClick={() => changeView('post')}><Icon name="post" size={18} /></button>
          <button className={s.viewBtn} aria-pressed={view === 'grid'} aria-label="그리드로 보기" onClick={() => changeView('grid')}><Icon name="grid" size={18} /></button>
        </>}
      />
      <StoryRings />

      {tab === 'following' && !me ? (
        <Empty title="로그인하면 팔로우한 작가의 새 작품을 볼 수 있어요">왼쪽 아래 DEV에서 보기 계정을 바꿔 보세요.</Empty>
      ) : feed.isPending ? (
        view === 'grid' ? <WorkGridSkeleton /> : <><WorkPostSkeleton /><WorkPostSkeleton /></>
      ) : feed.isError ? (
        <Empty title="피드를 불러오지 못했어요" action={<Button size="sm" variant="ghost" onClick={() => feed.refetch()}>다시 시도</Button>} />
      ) : !feed.data.length ? (
        <Empty title="팔로우한 작가의 새 작품이 없어요" action={<ButtonLink to="/explore" size="sm" variant="ghost">작가 찾아보기</ButtonLink>}>
          추천 탭이나 탐색에서 마음에 드는 작가를 팔로우해 보세요.
        </Empty>
      ) : view === 'grid' ? (
        <WorkGrid works={feed.data} />
      ) : (
        feed.data.map(w => <WorkPost key={w.id} work={w} />)
      )}
    </>
  )
}
