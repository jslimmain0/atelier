# atelier app

설계: [`../DESIGN.md`](../DESIGN.md) · 디자인 기준: [`../prototype.html`](../prototype.html) (화면 번호 01~15)

```bash
npm install
npm run dev      # http://localhost:5180 (루트의 .claude/launch.json 기준) — 기본 mock 모드
npm test         # 비즈니스 규칙 + API 계약 테스트 (27개)
npm run build
```

- **mock 모드**(기본): MSW가 `/api/*`를 가로채 `src/mocks`의 데이터로 응답(메모리, 새로고침 시 초기화).
  화면 왼쪽 아래 `DEV`: 보기 계정 전환 · 한지우 프로젝트 상태(정상/지연/후원자 0명) · 선택 기간 마감 처리.
- 실제 API: `VITE_USE_MOCK=false`. 이때만 PWA 서비스 워커를 등록한다(MSW와 scope 충돌 방지).

## 구조

| 경로 | 역할 |
|---|---|
| `src/entities/types.ts` | 도메인 타입 (DESIGN.md §5) = 백엔드 스키마 초안 |
| `src/domain/rules.ts` | 비즈니스 규칙(인증 마크, 피드 가중치, 후원 상태·개설 조건·자동 지속·정산, 구매 합계) + 테스트 |
| `src/mocks/handlers/` | 도메인별 mock API (works, users, orders, support, admin, dev) + `api.test.ts` 계약 테스트 |
| `src/mocks/data.ts` | fixture 데이터 |
| `src/shared/api/` | fetch 클라이언트, 엔드포인트, 응답 타입, react-query 훅 |
| `src/shared/ui/` | mockup 기반 공통 컴포넌트 (Icon, Art, Button, Chip, AppBar, Seg, Opt, BottomBar, Sheet, Toast) |
| `src/shared/styles/` | 디자인 토큰 · 전역 스타일 · mock 작품(CSS art) |
| `src/app/` | 셸, 탭바, 라우터, 화면 표(`screens.ts`) |
| `src/entities/` | 작품 포스트 · 그리드 · 프로젝트 카드 · 스토리 링 · 마일스톤 타임라인 |
| `src/pages/` | 화면 (화면 번호는 `src/app/screens.ts`, 연결은 `router.tsx`의 `PAGES`) |
