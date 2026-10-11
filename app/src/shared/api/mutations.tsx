// 좋아요 · 저장 · 팔로우: 낙관적 업데이트 후 서버 응답으로 다시 맞춘다.
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useFeedback } from '../ui/useFeedback'
import { endpoints } from './endpoints'
import { useMe } from './queries'
import type { WorkView } from './types'

const WORK_KEYS = ['feed', 'works', 'work', 'saved', 'userWorks']

/** 캐시에 있는 모든 작품(목록 · 상세)에 patch 적용 */
function patchWorks(qc: QueryClient, match: (w: WorkView) => boolean, patch: (w: WorkView) => WorkView) {
  qc.setQueriesData<WorkView | WorkView[]>({ predicate: q => WORK_KEYS.includes(q.queryKey[0] as string) }, data => {
    if (!data) return data
    if (Array.isArray(data)) return data.map(w => (match(w) ? patch(w) : w))
    return match(data) ? patch(data) : data
  })
}

const refreshWorks = (qc: QueryClient) =>
  qc.invalidateQueries({ predicate: q => WORK_KEYS.includes(q.queryKey[0] as string) || q.queryKey[0] === 'user' })

/** 로그인이 필요한 행동을 감싼다. 비로그인이면 안내 시트 */
export function useRequireLogin() {
  const { data: me } = useMe()
  const { openSheet } = useFeedback()
  return (action: () => void) => {
    if (me) return action()
    openSheet(
      <>
        <h2>로그인이 필요해요</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          로그인은 백엔드 단계에서 붙여요. 지금은 왼쪽 아래 DEV 버튼에서 보기 계정을 바꿔 확인할 수 있어요.
        </p>
      </>,
    )
  }
}

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (w: WorkView) => endpoints.like(w.id, !w.viewer.liked),
    onMutate: w => patchWorks(qc, x => x.id === w.id, x => ({
      ...x, likes: x.likes + (w.viewer.liked ? -1 : 1), viewer: { ...x.viewer, liked: !w.viewer.liked },
    })),
    onSettled: () => refreshWorks(qc),
  })
}

export function useToggleSave() {
  const qc = useQueryClient()
  const { toast } = useFeedback()
  return useMutation({
    mutationFn: (w: WorkView) => endpoints.save(w.id, !w.viewer.saved),
    onMutate: w => {
      patchWorks(qc, x => x.id === w.id, x => ({ ...x, viewer: { ...x.viewer, saved: !w.viewer.saved } }))
      toast(w.viewer.saved ? '저장을 취소했어요' : '저장했어요')
    },
    onSettled: () => refreshWorks(qc),
  })
}

export function useToggleFollow() {
  const qc = useQueryClient()
  const { toast } = useFeedback()
  return useMutation({
    mutationFn: ({ handle, following }: { artistId: string; handle: string; name: string; following: boolean }) =>
      endpoints.follow(handle, !following),
    onMutate: ({ artistId, name, following }) => {
      patchWorks(qc, x => x.artist.id === artistId, x => ({ ...x, viewer: { ...x.viewer, followingArtist: !following } }))
      if (!following) toast(`${name} 작가를 팔로우해요`)
    },
    onSettled: () => refreshWorks(qc),
  })
}

/** 일반 변경 요청: 성공 시 캐시 전체 갱신, 실패 시 서버 메시지를 토스트로 */
export function useApiMutation<V, R>(fn: (v: V) => Promise<R>, opts: { success?: string | ((r: R, v: V) => string); onSuccess?: (r: R, v: V) => void } = {}) {
  const qc = useQueryClient()
  const { toast } = useFeedback()
  return useMutation({
    mutationFn: fn,
    onSuccess: async (r, v) => {
      await qc.invalidateQueries()
      if (opts.success) toast(typeof opts.success === 'function' ? opts.success(r, v) : opts.success)
      opts.onSuccess?.(r, v)
    },
    onError: e => toast(e instanceof Error ? e.message : '요청에 실패했어요'),
  })
}
