import { Link } from 'react-router'
import { decidingMilestone, nextMilestone } from '../../domain/rules'
import type { ProjectView } from '../../shared/api/types'
import { truncate } from '../../shared/lib/format'
import { PROJECT_STATUS } from '../../shared/lib/labels'
import { Art } from '../../shared/ui/Art'
import { MilestoneSteps } from '../../shared/ui/blocks'
import { Avatar, Chip, VerifiedBadge } from '../../shared/ui/primitives'
import s from './project.module.css'

/** 후원 프로젝트 카드 (mockup 06 wip-card) */
export function ProjectCard({ project: p }: { project: ProjectView }) {
  const st = PROJECT_STATUS[p.displayStatus]
  const closed = p.displayStatus === 'completed' || p.displayStatus === 'ended'
  const cur = decidingMilestone(p) ?? nextMilestone(p)
  const late = p.displayStatus === 'delayed' ? nextMilestone(p)?.id : undefined
  return (
    <Link to={`/support/${p.id}`} className={s.card}>
      <Art url={p.coverUrl} stage={p.displayStatus === 'completed' ? undefined : 'wip'} className={s.cardArt}>
        <Chip tone={st.tone} className={s.stage}>
          {st.label}{cur && (p.displayStatus === 'in_progress' || p.displayStatus === 'delayed') ? ` · ${cur.order}단계 ${cur.goal}` : ''}
        </Chip>
      </Art>
      <div className={s.cardBody}>
        <div className={s.cardHead}>
          <Avatar name={p.artist.name} tone={p.artist.avatarTone} size={24} />
          <b>{p.title}</b><VerifiedBadge show={p.artist.isVerified} size={14} />
          <small>{closed ? `후원자 ${p.totalBackers}명` : `후원 중 ${p.activeBackers}명`}</small>
        </div>
        <p>{truncate(p.direction, 64)}</p>
        <MilestoneSteps milestones={p.milestones} lateId={late} />
      </div>
    </Link>
  )
}
