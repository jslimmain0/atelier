// 07 후원 (프로젝트 목록)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ProjectCard } from '../entities/project/ProjectCard'
import { endpoints } from '../shared/api/endpoints'
import { qk } from '../shared/api/queries'
import type { ProjectView } from '../shared/api/types'
import { Gate } from '../shared/ui/blocks'
import { Icon } from '../shared/ui/Icon'
import { AppBar, Button, ButtonLink, Empty, Seg } from '../shared/ui/primitives'

type Tab = 'active' | 'recruiting' | 'closed'
const inTab = (t: Tab) => (p: ProjectView) =>
  t === 'active' ? ['in_progress', 'delayed', 'awaiting_close'].includes(p.displayStatus)
    : t === 'recruiting' ? p.displayStatus === 'recruiting'
    : ['completed', 'ended'].includes(p.displayStatus)

export function SupportListPage() {
  const [tab, setTab] = useState<Tab>('active')
  const projects = useQuery({ queryKey: qk.projects, queryFn: endpoints.projects })
  const list = projects.data?.filter(inTab(tab)) ?? []
  return (
    <>
      <AppBar title="후원" align="left" right={<ButtonLink to="/support/new" size="sm" variant="ghost"><Icon name="plus" size={16} />프로젝트 열기</ButtonLink>} />
      <Gate tone="plain" icon="sprout" title="완성보다 먼저, 과정을 만나요">
        인증 작가가 작품의 방향과 마일스톤을 제시하면, 회당 금액을 정해 후원해요. 결과물이 공개될 때마다 계속할지 정할 수 있어요.
      </Gate>
      <div style={{ height: 12 }} />
      <Seg<Tab> items={[['active', '진행 중'], ['recruiting', '모집 중'], ['closed', '지난 프로젝트']]} value={tab} onChange={setTab} />
      <div style={{ height: 12 }} />
      {projects.isPending ? <Empty title="불러오는 중…" />
        : projects.isError ? <Empty title="불러오지 못했어요" action={<Button size="sm" variant="ghost" onClick={() => projects.refetch()}>다시 시도</Button>} />
        : list.length ? list.map(p => <ProjectCard key={p.id} project={p} />)
        : <Empty title="해당하는 프로젝트가 없어요" />}
    </>
  )
}
