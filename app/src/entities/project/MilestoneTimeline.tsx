import { Link } from 'react-router'
import { daysBetween } from '../../domain/rules'
import type { ProjectView } from '../../shared/api/types'
import { monthDay } from '../../shared/lib/format'
import { Art } from '../../shared/ui/Art'
import { Icon } from '../../shared/ui/Icon'
import { ButtonLink, Chip } from '../../shared/ui/primitives'
import s from './project.module.css'

/** 마일스톤 타임라인: 제시일 · 공개일 · 지속/이탈 인원 · 선택 기간 */
export function MilestoneTimeline({ project: p, today }: { project: ProjectView; today: string }) {
  const next = p.milestones.find(m => m.status === 'upcoming')
  const backing = p.viewer.backing
  if (p.milestones.length > 6) {
    const done = p.milestones.filter(m => m.status === 'closed').length
    return <p className={s.msMany}>마일스톤 {p.milestones.length}개 중 {done}개 완료</p>
  }
  return (
    <ol className={s.ms}>
      {p.milestones.map((m, i) => {
        const late = p.displayStatus === 'delayed' && m === next
        const cls = m.status === 'closed' ? s.dotDone : m.status === 'deciding' ? s.dotNow : late ? s.dotLate : ''
        return (
          <li key={m.id} className={s.msItem}>
            <div className={s.rail}>
              <span className={`${s.dot} ${cls}`} aria-hidden>{m.status === 'closed' ? <Icon name="check" size={12} /> : m.order}</span>
              {i < p.milestones.length - 1 && <span className={s.line} />}
            </div>
            <div className={s.msBody}>
              <b>{m.order}단계 · {m.goal}{m.isFinal ? ' (완성)' : ''}</b>
              <small>
                제시일 {monthDay(m.dueDate)}
                {m.submission && ` · ${monthDay(m.submission.submittedAt)} 공개`}
                {m.decisions && ` · 지속 ${m.decisions.continued} · 이탈 ${m.decisions.left}${m.decisions.pending ? ` · 대기 ${m.decisions.pending}` : ''}`}
              </small>
              {m.submission && (
                <>
                  <p>{m.submission.note}</p>
                  <div className={s.msThumbs}>{m.submission.imageUrls.map(u => <Art key={u} url={u} stage={m.submission?.stage} className={s.msThumb} />)}</div>
                </>
              )}
              {m.status === 'deciding' && m.decisionDeadline && (
                <div className={s.msAct}>
                  <Chip tone="warn"><Icon name="clock" size={13} />선택 기간 {Math.max(0, daysBetween(today, m.decisionDeadline))}일 남음</Chip>
                  {backing?.status === 'active' && (
                    <ButtonLink to={`/support/${p.id}/milestones/${m.order}`} size="sm" variant="patron">{backing.decisions[m.id] ? '내 선택 보기' : '보고 선택하기'}</ButtonLink>
                  )}
                  {!backing && <Link to={`/support/${p.id}/milestones/${m.order}`} className={s.msLink}>결과물 보기</Link>}
                </div>
              )}
              {late && <p className={s.msLate}>제시일이 지났지만 결과물이 아직 없어요. 올라오기 전까지 결제되지 않아요.</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
