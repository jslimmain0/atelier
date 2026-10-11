import { isRouteErrorResponse, useRouteError } from 'react-router'
import { AppBar, Button, ButtonLink, Empty } from '../shared/ui/primitives'

export function NotFoundPage() {
  return (
    <>
      <AppBar title="" />
      <Empty title="페이지를 찾을 수 없어요" action={<ButtonLink to="/" size="sm">피드로</ButtonLink>} />
    </>
  )
}

export function LoginPage() {
  return (
    <>
      <AppBar title="로그인" />
      <Empty title="로그인은 백엔드 단계에서 구현해요">지금은 왼쪽 아래 DEV 버튼에서 보기 계정을 바꿔 확인해요.</Empty>
    </>
  )
}

/** 화면 렌더 중 예외가 나면 전체가 하얗게 되지 않도록 */
export function RouteError() {
  const err = useRouteError()
  if (isRouteErrorResponse(err) && err.status === 404) return <NotFoundPage />
  return (
    <>
      <AppBar title="" />
      <Empty title="문제가 생겼어요" action={<div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}><Button size="sm" onClick={() => location.reload()}>다시 불러오기</Button><ButtonLink to="/" size="sm" variant="ghost">피드로</ButtonLink></div>}>
        잠시 후 다시 시도해 주세요.
        {import.meta.env.DEV && <pre style={{ fontSize: 11, textAlign: 'left', whiteSpace: 'pre-wrap', marginTop: 12 }}>{String(err instanceof Error ? err.stack : err)}</pre>}
      </Empty>
    </>
  )
}
