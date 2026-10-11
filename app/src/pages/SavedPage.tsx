// 12 저장한 작품
import { useQuery } from '@tanstack/react-query'
import { WorkGrid, WorkGridSkeleton } from '../entities/work/WorkGrid'
import { endpoints } from '../shared/api/endpoints'
import { qk, useMe } from '../shared/api/queries'
import { AppBar, BackButton, ButtonLink, Empty } from '../shared/ui/primitives'

export function SavedPage() {
  const { data: me, isPending: mePending } = useMe()
  const saved = useQuery({ queryKey: qk.saved, queryFn: endpoints.saved, enabled: !!me })
  return (
    <>
      <AppBar title="저장한 작품" left={<BackButton />} />
      {!mePending && !me ? (
        <Empty title="로그인하면 저장한 작품을 볼 수 있어요">왼쪽 아래 DEV에서 보기 계정을 바꿔 보세요.</Empty>
      ) : saved.isPending ? <WorkGridSkeleton count={6} /> : saved.isError ? (
        <Empty title="불러오지 못했어요" />
      ) : saved.data.length ? (
        <WorkGrid works={saved.data} />
      ) : (
        <Empty title="마음이 가는 작품을 저장해 보세요" action={<ButtonLink to="/" size="sm">피드로</ButtonLink>} />
      )}
    </>
  )
}
