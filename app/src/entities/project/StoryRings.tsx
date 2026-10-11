import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { closedMilestoneCount } from '../../domain/rules'
import { endpoints } from '../../shared/api/endpoints'
import { qk, useMe } from '../../shared/api/queries'
import { Art } from '../../shared/ui/Art'
import { Icon } from '../../shared/ui/Icon'
import s from './project.module.css'

/** 피드 상단 링 = 진행 중 · 모집 중 후원 프로젝트. 채움 = 마일스톤 진행률 */
export function StoryRings() {
  const { data: me } = useMe()
  const { data: projects = [] } = useQuery({ queryKey: qk.projects, queryFn: endpoints.projects })
  const live = projects.filter(p => p.displayStatus === 'in_progress' || p.displayStatus === 'recruiting' || p.displayStatus === 'delayed')
  const myOpen = me && projects.find(p => p.artistId === me.id && p.status !== 'completed' && p.status !== 'ended')

  if (!live.length && !me?.isArtist) return null
  return (
    <div className={s.stories} role="list" aria-label="진행 중인 후원 프로젝트">
      {me?.isArtist && (
        <Link role="listitem" className={s.story} to={myOpen ? '/me/studio/support' : '/support/new'}>
          <div className={`${s.ring} ${s.me}`}><div><Icon name="plus" /></div></div>
          <b>{myOpen ? '결과물 올리기' : '후원 열기'}</b>
        </Link>
      )}
      {live.map(p => {
        const recruiting = p.displayStatus === 'recruiting'
        const pct = Math.round((closedMilestoneCount(p) / p.milestones.length) * 100)
        return (
          <Link role="listitem" key={p.id} className={s.story} to={`/support/${p.id}`} aria-label={`${p.artist.name} 〈${p.title}〉`}>
            <div className={`${s.ring} ${recruiting ? s.recruit : ''}`} style={{ ['--p' as string]: `${pct}%` }}>
              <Art url={p.coverUrl} />
            </div>
            <b>{p.artist.name}</b>
            <em className={recruiting ? s.emRecruit : undefined}>{recruiting ? '모집 중' : `${closedMilestoneCount(p)}/${p.milestones.length}단계`}</em>
          </Link>
        )
      })}
    </div>
  )
}
