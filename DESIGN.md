# atelier 서비스 설계서

> 상태: v1.1 (2026-10-11) · 프론트 M0~M6 완료 → 다음: 백엔드 설계
> 진행 방식: **프론트엔드 먼저** 만들고, 프론트에서 확정된 화면·데이터 구조를 근거로 백엔드를 설계한다.
> 표시: ✅ 확정 · 💡 제안(검토 필요) · ❓ 미결정

---

## 1. 개요

개인 작가가 자신의 미술작품을 올리고 판매할 수 있는 앱. 인스타그램처럼 작가의 작품을 둘러보고, 작품의 이야기를 읽고, 소장(구매)하거나 작업 과정을 후원할 수 있다.

### 1.1 핵심 기능 ✅

| # | 기능 | 한 줄 정의 |
|---|------|-----------|
| F1 | 작업실 (개인 브랜딩) | 작가 프로필 + 작품 목록 + 작가 소개/작업 노트 |
| F2 | 피드 (발견하기) | 관심 작가·인기 작품을 모아 보고, 작품 설명과 제작 스토리를 함께 읽음 |
| F3 | 소장 · 판매 | 작품 구매/판매, 거래 내역 관리. 구매 시 액자·보관 등 부가 서비스 제공 |
| F4 | 과정 후원 (크라우드 펀딩) | 인증 작가가 작품의 미래 방향을 제시하고 마일스톤별로 중간 결과물을 공개. 후원자는 마일스톤마다 정기 후원을 이어갈지 결정 |
| F5 | 작가 인증 | 관리자가 작가 소개의 경력 항목을 하나씩 서류로 확인. 인증 항목이 기준 개수 이상이면 프로필에 인증 마크 |

### 1.2 디자인 기준 · 산출물

- `atelier-mockup.html`: **디자인 기준 시안**. 인스타그램형 모바일 앱, 핵심 화면 6종.
  - 색: Paper `#FAF8F4` / Ink `#1B1A17` / **Vermilion `#C2412A` = 구매·좋아요** / **Ultramarine `#2F3E8F` = 후원**. 진행(황토 `#B07A1C`) · 완료(그린 `#3E7A55`)
  - 서체: 작품 제목·작가노트 Noto Serif KR, 디스플레이 Fraunces Italic, UI 본문 Pretendard
  - 형태: 둥근 모서리(12~18px), 칩, 하단 고정 바(가격+행동), 3열 그리드, 상단 스토리 링(= 진행 중인 후원 프로젝트)
- `prototype.html`: **설계서 기준 클릭 시안**. 위 디자인으로 전체 화면(01~15)을 구성. 보기 계정 전환, 상태 시뮬레이션, 화면별 설계 메모. 피드백은 화면 번호로 주고받는다.
- `atelier/` 폴더의 `yeobaek*.html` 등은 **다른 결과물로 사용하지 않는다.**

---

## 2. 사용자와 역할

한 계정이 감상자/소장자/작가 역할을 모두 가질 수 있다 (인스타그램처럼 별도 "작가 계정" 전환 없이).

| 역할 | 할 수 있는 일 |
|------|--------------|
| 비로그인 방문자 | 피드·작품 상세·작가 작업실 열람 |
| 회원 (감상자/소장자) | 좋아요, 찜, 팔로우, 구매, 후원, 중간 결과물 확인 후 계속/중단 선택 |
| 작가 | 위 전부 + 작품 등록/판매, 중간 결과물 업로드, 정산 확인, 경력 항목 인증 신청 |
| 인증 작가 | 인증된 경력 항목이 기준(기본 5개) 이상 → 프로필·작품 카드에 **인증 마크** 표시, **후원 프로젝트 개설 가능** |
| 관리자 | 경력 항목별 인증 심사(인증/반려/취소), 인증 마크 기준 개수 설정 |

- 💡 작가 기능은 "작가 정보(정산 계좌 등) 등록" 시 활성화. 판매 전까지는 누구나 작품을 올릴 수 있음.
- ✅ 작품 판매에 인증은 **필수가 아님** (승인제 대신 인증 마크 방식).
- ✅ **후원 프로젝트 개설은 인증 작가만** 가능.

---

## 3. 정보 구조 (IA) / 라우트

💡 시안의 메뉴명을 유지한다.

```
/                        발견하기 (피드)
/works/:workId           작품 상세
/artists/:handle         작가 프로필
/me/saved                저장한 작품
/support                 작가 후원하기 (후원 프로젝트 목록)
/support/:projectId      후원 프로젝트 상세 (중간 결과물 타임라인)
/support/:projectId/milestones/:order 중간 결과물 확인 · 지속/이탈 선택
/support/new             후원 프로젝트 개설 (인증 작가, 진행 중 프로젝트 없을 때)
/me/studio/support       내 후원 프로젝트 관리 (결과물 업로드, 종료)
/checkout/:workId        소장하기 (구매 플로우)
/me/history              소장 · 판매 · 후원 내역 (탭)
/me/history/orders/:id   주문 상세
/me/studio               작업실 관리 (작품/판매/정산)
/me/settings             프로필·계정 설정
/upload                  새 작품 올리기
/search                  검색
/me/settings/career     경력 항목 관리 · 항목별 인증 신청/상태
/login, /signup          로그인 · 회원가입

# 관리자 (별도 레이아웃, 관리자 권한만 접근)
/admin/career-reviews            인증 대기 경력 항목 목록 (작가별/상태 필터)
/admin/career-reviews/:itemId    항목 상세 · 서류 확인 · 인증/반려
/admin/artists/:id               작가 경력 전체 · 인증 이력 · 인증 취소
/admin/settings                  인증 마크 기준 개수 등 운영 설정
```

### 내비게이션

- 💡 **모바일 앱형 웹** (atelier-mockup 기준): 하단 탭 5개 `피드 · 탐색 · (+) 올리기 · 후원 · 프로필`
- 상단 앱바: 피드는 로고 + 검색 + 알림, 하위 화면은 뒤로 + 제목
- 거래 내역 · 저장한 작품 · 내 후원 프로젝트 · 경력/인증 · 설정은 **프로필 오른쪽 위 메뉴**에서 진입
- 관리자 계정은 프로필 탭 자리에 `관리`
- 데스크톱 레이아웃(넓은 화면)은 ❓ 미결정. 현재 시안은 폰 폭 기준

---

## 4. 화면 설계

각 화면은 **구성 요소 / 데이터 / 주요 액션 / 상태(빈·로딩·에러)** 순서로 정리한다. 이 표가 곧 백엔드 API 요구사항이 된다.

### 4.1 발견하기 (피드) — F2

- **구성**: 앱바(로고·검색·알림) · 상단 탭 `추천 | 팔로잉 | 인기` · **스토리 링**(진행 중/모집 중 후원 프로젝트, 링 채움 = 마일스톤 진행률) · 포스트 목록
- **포스트**: 작가 헤더(팔로우) · 작품 이미지 + 판매 칩(가격) · 좋아요/공유/저장 · 제목(세리프)·스펙 · **제작 스토리** 블록
- 필터(유형 등)와 검색은 `탐색` 탭으로 분리
- **카드**: 작품 이미지, 제목, 작가(인증 시 마크), 가격/판매 상태, 좋아요 수, 찜 버튼
- **액션**: 카드 클릭 → 작품 상세, 좋아요, 찜, 작가 팔로우, 무한 스크롤
- **상태**: 팔로잉 0명이면 추천 작가 노출 / 필터 결과 없음 → "조건에 맞는 작품이 없어요" + 필터 초기화
- ✅ 피드 형태: **1열 포스트 ↔ 3열 그리드 전환** 토글. 선택한 보기는 기기에 기억(localStorage).
- ❓ "인기" 기준: 기간 내 좋아요 수? 찜 수? 가중치?
- ✅ **인증 작가 노출 가중치**: `추천`·`인기` 탭에서 인증 마크가 있는 작가의 작품은 노출 확률을 높임 (점수 × 가중치, 기본 💡 1.3배). 가중치는 관리자 설정값. `팔로잉` 탭은 영향 없음(시간순)

### 4.2 작품 상세 — F2, F3

- **구성**: 이미지 갤러리(여러 장, 확대) · 제목/작가/가격 · 재료, 크기, 제작연도 · **작품 이야기**(설명) · **작업 노트**(제작 스토리, 과정 사진) · 같은 작가의 다른 작품
- **액션**: 좋아요, 찜, 공유, `이 작품 소장하기` → 체크아웃, 작가 팔로우, (후원 프로젝트와 연결된 작품이면) 과정 보기
- **판매 상태**: `소장 가능` · `예약 중` · `소장 완료` · `비매품(전시용)`
- 💡 댓글은 MVP 제외(커뮤니티 운영 부담), 좋아요/찜만.

### 4.3 작가 작업실 (프로필) — F1

- **구성**: 커버 이미지, 아바타, 이름/핸들 + **인증 마크**(인증 항목 ≥ 기준 개수일 때), 한 줄 소개, 팔로워·팔로잉·작품 수 · 작가 소개(작업 철학 글) · **경력**(학력·전시·수상·소속 항목 목록, 항목마다 `인증됨` / 미인증 구분 표시, 인증 항목 먼저) · 탭 `작품 | 후원 프로젝트(진행 중 + 지난 프로젝트) | 소장품(공개 시)`
- **작품 정렬**: 💡 작가가 직접 순서 고정(대표작 pin) + 최신순
- **본인일 때**: `프로필 편집`, `작품 올리기`, 작품별 판매 상태 변경
- ❓ 소장품 공개 기능 (소장자 프로필에 "내가 소장한 작품" 노출) 여부

### 4.4 작품 올리기 / 수정 — F1, F3

| 필드 | 필수 | 비고 |
|------|------|------|
| 이미지 (1~10장) | ✅ | 첫 장이 대표 |
| 제목 | ✅ | |
| 작품 유형 | ✅ | 회화 / 드로잉 / 판화 / 사진 / 조각 / 도자 / 디지털 / 기타 |
| 재료 | | |
| 크기 (가로×세로×깊이, cm) | | 호수 자동 표기 💡 |
| 제작연도 | | |
| 작품 이야기 (설명) | | |
| 작업 노트 (제작 스토리) | | 과정 사진 첨부 가능 |
| 판매 여부 / 가격 | | 판매 시 가격 필수 |
| 에디션 | | 원화 1점 / 한정판 N점 ❓ |
| 배송 가능 여부·방법 | | 판매 시 |

- 상태: 임시저장(draft) / 게시
- 검증 에러는 필드 옆에 표시 (시안 규칙 유지)

### 4.5 소장하기 (체크아웃) — F3

단계: `작품 확인 → 부가 서비스 선택 → 배송 정보 → 결제 → 완료`

- **부가 서비스** (구매 시 사이트 지원):
  - 액자 제작/설치
  - 작품 보관 (아트 스토리지, 월 단위) — 배송 대신 보관 선택 가능
  - 관리 키트 / 보존 관리 안내
  - ✅ "화구 및 보관 지원" = **구매자용 부가 서비스** (액자·보관·관리)
- **금액 표시**: 작품가 + 부가 서비스 + 배송비 = 합계 (시안: 480,000 + 65,000 + 18,000)
- 💡 프론트 단계에서는 결제를 mock으로 처리, PG 연동은 백엔드 단계에서 결정

### 4.6 소장 · 판매 · 후원 내역 — F3, F4

- 탭: `구매 내역 | 판매 내역 | 후원 내역`
- **주문 상태 흐름**:
  ```
  결제완료 → 작가확인 → 포장/배송중 → 배송완료 → 구매확정
                       ↘ 보관중 (보관 선택 시)
  (취소/환불 분기)
  ```
- **판매 내역(작가)**: 주문 확인 버튼, 송장 입력, 정산 예정/완료 금액, 수수료
- **후원 내역**: 후원한 프로젝트, 단계별 집행 상태, 받은 리워드
- ❓ 플랫폼 수수료율, 구매확정 자동 기간(예: 배송완료 7일 후)

### 4.7 과정 후원 (크라우드 펀딩) — F4

시안 문구: "완성보다 먼저, 과정을 만나요."

작가가 **작품의 미래 방향**을 제시하고, 후원자들이 그 과정을 마일스톤마다 확인하며 정기 후원을 이어가는 크라우드 펀딩.

**개설 조건** ✅
- **인증 작가만** 개설 가능 (§4.8)
- **작가당 진행 중인 프로젝트는 1개**. 이전 프로젝트를 끝내지(완성 또는 종료) 않으면 새 후원을 모집할 수 없음

**흐름** ✅
1. 작가가 프로젝트 개설
   - 작품의 미래 방향(어떤 작품이 될지, 의도, 참고 이미지)
   - **마일스톤 횟수** 선택 (완성까지 몇 번 공개할지, 💡 2~10회) + 마일스톤별 **제시일**과 간단한 목표 (예: 1차 스케치 11/1 → 2차 밑색 11/20 → 3차 완성 12/15)
   - 리워드 (후원자 이름 기록, 완성작 우선 구매권 등)
2. 사용자는 **정기 후원 금액**을 설정하고 참여 (₩10,000 / 30,000 / 50,000 / 직접 입력)
   - 💡 정기 후원 = **마일스톤 1회당** 금액. 결과물이 공개되고 지속을 선택(또는 자동 지속)할 때마다 그 금액이 결제됨
   - 💡 진행 중에도 참여 가능 (다음 마일스톤부터 적용)
3. 작가가 **제시일**에 중간 결과물 업로드 (사진 + 작업 노트)
4. 후원자는 **지속 / 이탈** 결정
   - 선택 기간 7일, 무응답 시 **자동 지속**
   - 지속 → 이번 회차 정기 후원금 결제 → 작가에게 정산, 다음 마일스톤까지 후원 유지
   - 이탈 → 이후 결제 없음. 이미 결제된 회차는 유지
   - 선택은 후원자 개인 단위
5. 마지막 마일스톤(완성) 공개 → 프로젝트 **완성**, 리워드 지급, 완성작을 작품으로 연결(판매 가능)

**예외 규칙** ✅
- **결과물을 올리지 않으면 다음 후원은 없음**. 제시일이 지나면 `지연` 표시, 업로드 전까지 결제 발생하지 않음
- **후원자가 한 명도 남지 않으면** 프로젝트는 더 진행할 수 없고, 작가가 **직접 종료**해야 함
- 작가는 언제든 프로젝트를 **중도 종료** 가능 (사유 입력). 종료 시 이후 결제 없음
- 종료(완성/중도 종료)하지 않은 프로젝트가 있으면 **새 후원 프로젝트 모집 불가**

**프로젝트 상태**
```
모집 중 ─▶ 진행 중 ─(마일스톤 반복: 업로드 → 7일 선택 → 결제)─▶ 완성
              │  ├─ 제시일 경과·미업로드 → 지연 (업로드하면 진행 중으로 복귀)
              │  └─ 후원자 0명 → 종료 대기 (작가가 종료해야 함)
              └─ 작가가 직접 종료 ─▶ 중도 종료
완성 / 중도 종료 = 끝난 프로젝트 → 새 프로젝트 개설 가능
```

**후원 이력 = 작가 경력** ✅
- 끝난 프로젝트는 작가 프로필 `후원 프로젝트` 탭에 이력으로 남음: 결과(완성/중도 종료), 마일스톤 달성 수, 후원자 수, 마지막까지 함께한 후원자 비율
- 💡 **완성한 프로젝트는 경력 항목에 자동 추가**(분류 `후원 프로젝트`). 플랫폼 기록이므로 별도 서류 없이 `인증됨` 처리
- 중도 종료 이력도 숨기지 않고 표시 (신뢰 지표)

**화면**
- 후원 목록: 모집/진행 중 프로젝트 카드 (작가·인증 마크, 미래 방향 요약, 마일스톤 진척 `2 / 4`, 현재 후원자 수, 다음 제시일)
- 프로젝트 상세: 미래 방향, 마일스톤 타임라인(제시일·결과물·지속 인원), 후원하기
- 후원하기 모달: 정기 후원 금액 설정, 결제 방식 안내 ("결과물이 공개될 때마다 결제돼요")
- 결과물 보기 + `지속 / 이탈` 선택 (남은 선택 기간 표시)
- 작가 관리 화면: 개설 폼(마일스톤 횟수·제시일 설정), 결과물 업로드, 후원자 현황, 프로젝트 종료
- 개설 불가 안내: 인증 안 된 작가 → "인증 작가만 열 수 있어요 (공개 인증 항목 3/5)", 끝나지 않은 프로젝트 있음 → "진행 중인 프로젝트를 먼저 마무리해 주세요"

- ❓ 정기 후원 단위: 마일스톤 1회당(💡) / 월 단위
- ❓ 제시일 변경(연기) 허용 여부와 횟수
- ❓ 이탈한 후원자에게 리워드 일부(이름 기록 등) 유지 여부
- ❓ 목표 금액/최소 후원자 수를 둘지 (모집 실패 개념)

### 4.8 작가 인증 — F5

인증 마크는 **하나**이며, "작가 소개(경력)의 내용을 관리자가 확인했다"는 의미로 쓴다. 인증은 **경력 항목 단위**로 이루어진다.

**규칙** ✅
- 작가 소개의 경력은 **항목 단위**로 작성 (예: "2020 OO대학교 서양화과 졸업", "2024 개인전 〈빛의 기록〉, OO갤러리")
- 각 항목은 관리자가 서류로 확인하면 `인증됨` 상태가 됨
- 작가가 **인증된 항목을 수정하면 즉시 미인증으로 돌아감** → 다시 인증 신청 → 관리자 인증 시 다시 `인증됨`
- 프로필의 세부 소개(경력)에는 **인증된 항목 / 인증 안 된 항목을 구분**해서 보여줌
- **공개 상태인 인증 항목이 5개 이상**이면 프로필에 인증 마크 표시. 비공개 항목은 인증되어 있어도 개수에서 제외. 5개 아래로 떨어지면(수정·삭제·취소·비공개 전환) 마크 자동 해제
- 인증 마크가 있으면 피드 노출 확률이 높아짐 (§4.1)
- 기준 개수 5는 **관리자 설정값** (나중에 변경 가능, 코드에 고정하지 않음)

**경력 항목 상태**
```
작성(미인증) ──인증 신청(서류 첨부)──▶ 심사 중 ──관리자 인증──▶ 인증됨
                                        └─관리자 반려(사유)──▶ 반려 → 보완 후 재신청
인증됨 ──작가가 내용 수정──▶ 미인증 (서류 재첨부 후 재신청)
인증됨 ──관리자 인증 취소(사유)──▶ 미인증
```

**경력 항목 필드**

| 항목 | 필수 | 비고 |
|------|------|------|
| 분류 | ✅ | 학력 / 전시 / 수상 / 소속·활동 / 후원 프로젝트(자동) / 기타 |
| 연도 (시작~종료) | ✅ | |
| 내용 | ✅ | 프로필에 그대로 노출되는 문구 |
| 증빙 서류 | 신청 시 ✅ | 졸업증명서, 전시 도록·포스터, 수상 증명 등 (PDF/이미지). **관리자만 열람** |
| 공개 여부 | | 비공개 항목은 프로필에 안 보이고 **인증 개수에서 제외** ✅ (인증 상태 자체는 유지, 다시 공개하면 개수에 포함) |

**작가 화면 (`/me/settings/career`)**
- 경력 항목 목록: 항목별 상태 뱃지(`미인증` `심사 중` `인증됨` `반려`) + 반려 사유
- 상단 진척 표시: "공개된 인증 항목 3 / 5 · 2개 더 있으면 인증 마크가 붙어요"
- 인증 항목을 비공개로 바꿀 때 마크가 빠지게 되면 "비공개로 바꾸면 인증 마크가 해제돼요" 확인창
- 항목 추가/수정/삭제, 정렬. 인증된 항목 수정 시 "수정하면 인증이 해제돼요" 확인창
- 항목별 `인증 신청` (서류 첨부) 또는 여러 항목 한 번에 신청

**프로필 표시**
- 이름 옆 인증 마크 (조건 충족 시). 누르면 "작가 소개 중 N개 항목을 atelier가 확인했어요" 안내
- 경력 목록: 인증 항목에 작은 체크 표시, 미인증 항목은 표시 없이 일반 텍스트 (심사 중·반려 상태는 본인에게만 보임)

**관리자 화면 (`/admin/...`)**
- 심사 대기 목록: 경력 항목 단위, 작가별 묶어 보기, 신청일 순
- 항목 상세: 항목 문구 ↔ 제출 서류 나란히 보기, 같은 작가의 다른 항목 상태, 관리자 메모
- 액션: `인증` / `반려`(사유 필수) / 인증된 항목 `인증 취소`(사유 필수)
- 운영 설정: 인증 마크 기준 개수 (기본 5), 인증 작가 피드 노출 가중치 (기본 1.3)
- 모든 처리는 이력으로 남김 (누가, 언제, 어떤 항목을, 무엇으로)

- ✅ 인증 작가 우대 = 피드 노출 가중치 (§4.1). 수수료 할인 등은 없음
- 💡 관리자 화면도 프론트 단계에서 mock으로 함께 만든다 (백엔드 권한 설계의 근거)

### 4.9 마음에 담은 작품 (찜)

- 찜한 작품 그리드, 판매 상태 변경 알림(💡 "가격 변경", "판매 완료")
- 빈 상태: "마음이 가는 작품을 담아보세요." + 발견하기 이동

### 4.10 공통

- 검색: 작품명·작가·재료·태그
- 알림(💡 MVP 후순위): 팔로우한 작가 새 작품, 주문 상태, 후원 중간 결과물 업로드(계속/중단 선택 요청), 공개 예정일 임박
- 밝은/어두운 테마, 모바일 우선 반응형, 키보드 접근성 (시안 기준 유지)

---

## 5. 프론트엔드 도메인 모델 (→ 백엔드 스키마 초안)

프론트에서 쓰는 타입을 먼저 확정하고, 이것을 백엔드 DB/API 설계의 출발점으로 삼는다.

```ts
type ID = string;

interface User {
  id: ID;
  handle: string;          // @handle
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;            // 한 줄 소개
  about?: string;          // 작가 소개(긴 글)
  isArtist: boolean;       // 판매/후원 기능 활성화 여부
  role: 'user' | 'admin';
  career: CareerItem[];    // 타인에게는 공개 항목만, 심사 상태는 verified 여부만 노출
  isVerified: boolean;     // 공개 + 인증된 항목 수 ≥ 설정 기준 (서버 계산값)
  stats: { followers: number; following: number; works: number };
  viewer?: { isFollowing: boolean };   // 현재 로그인 사용자 기준
}

type WorkCategory = 'painting' | 'drawing' | 'print' | 'photo'
  | 'sculpture' | 'ceramic' | 'digital' | 'etc';
type SaleStatus = 'available' | 'reserved' | 'sold' | 'not_for_sale';

interface Work {
  id: ID;
  artist: Pick<User, 'id' | 'handle' | 'name' | 'avatarUrl'>;
  title: string;
  images: { url: string; width: number; height: number; alt?: string }[];
  category: WorkCategory;
  material?: string;
  size?: { w: number; h: number; d?: number; unit: 'cm' };
  year?: number;
  description?: string;    // 작품 이야기
  story?: string;          // 작업 노트(제작 스토리)
  processImages?: string[];
  price?: number;          // KRW
  saleStatus: SaleStatus;
  likes: number;
  viewer?: { liked: boolean; saved: boolean };
  status: 'draft' | 'published';
  createdAt: string;
}

type CareerCategory = 'education' | 'exhibition' | 'award' | 'affiliation' | 'support_project' | 'etc';
// support_project: 완성한 후원 프로젝트, 자동 생성 + 자동 인증
type CareerVerifyStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface CareerItem {
  id: ID;
  category: CareerCategory;
  yearFrom: number;
  yearTo?: number;
  text: string;                  // 프로필에 노출되는 문구
  isPublic: boolean;
  order: number;
  verifyStatus: CareerVerifyStatus;   // 내용 수정 시 'unverified'로 초기화
  verifiedAt?: string;
  rejectReason?: string;         // 본인에게만
  documents?: { id: ID; fileUrl: string; name: string }[];  // 본인 + 관리자만
}

interface CareerReviewLog {      // 관리자 처리 이력
  careerItemId: ID;
  adminId: ID;
  action: 'verify' | 'reject' | 'revoke';
  reason?: string;
  textSnapshot: string;          // 인증 당시 문구 (수정 전후 비교용)
  at: string;
}

interface PlatformSettings {     // 관리자 설정
  verifiedBadgeThreshold: number; // 기본 5
  verifiedFeedBoost: number;      // 인증 작가 피드 노출 가중치, 기본 1.3
}

interface AddOnOption {      // 부가 서비스
  id: ID;
  kind: 'frame' | 'storage' | 'care';
  name: string;
  price: number;
  unit?: 'once' | 'month';
}

type OrderStatus = 'paid' | 'confirmed' | 'shipping' | 'delivered'
  | 'stored' | 'completed' | 'cancelled' | 'refunded';

interface Order {
  id: ID;
  work: Pick<Work, 'id' | 'title' | 'images' | 'artist'>;
  buyer: Pick<User, 'id' | 'name'>;
  addOns: AddOnOption[];
  amounts: { work: number; addOns: number; shipping: number; total: number };
  fulfillment: 'delivery' | 'storage';
  shipping?: { name: string; phone: string; address: string; trackingNo?: string };
  status: OrderStatus;
  createdAt: string;
}

interface SupportProject {
  id: ID;
  artist: Pick<User, 'id' | 'handle' | 'name' | 'avatarUrl' | 'isVerified'>;
  title: string;
  direction: string;       // 작품의 미래 방향
  referenceImages?: string[];
  coverUrl: string;
  milestones: Milestone[]; // 작가가 정한 횟수만큼
  rewards?: string[];
  activeBackers: number;   // 현재 지속 중인 후원자
  totalBackers: number;    // 누적
  totalFunded: number;     // 누적 결제액
  linkedWorkId?: ID;       // 완성 후 작품으로 연결
  status: 'recruiting' | 'in_progress' | 'delayed' | 'awaiting_close' | 'completed' | 'ended';
  endReason?: string;      // 중도 종료 사유
  createdAt: string;
  closedAt?: string;
}

interface Milestone {
  id: ID;
  order: number;           // 1..N
  goal: string;            // 이번 회차 목표 (스케치, 밑색, 완성 …)
  dueDate: string;         // 제시일
  isFinal: boolean;        // 마지막 = 완성
  submission?: { images: string[]; note: string; submittedAt: string };
  decisionDeadline?: string;   // 업로드 + 7일, 이후 무응답자는 자동 지속
  decisions?: { continued: number; left: number; pending: number };
  status: 'upcoming' | 'overdue' | 'deciding' | 'closed';
}

interface Backing {        // 후원자 1명의 참여
  id: ID;
  projectId: ID;
  backer: Pick<User, 'id' | 'name'>;
  amountPerMilestone: number;  // 정기 후원 금액
  paidTotal: number;
  joinedAtMilestone: number;
  status: 'active' | 'left' | 'finished';
  leftAtMilestoneId?: ID;
}

interface BackerDecision {
  milestoneId: ID;
  backingId: ID;
  choice: 'continue' | 'leave';
  source: 'backer' | 'auto';   // auto = 7일 무응답 자동 지속
  decidedAt: string;
}
```

---

## 6. 프론트엔드 아키텍처 💡

### 6.1 원칙

- **백엔드 없이 완전히 동작하는 프론트**: 모든 데이터 접근은 `api/` 레이어를 거치고, 지금은 mock이 응답한다. 나중에 mock만 실제 서버로 교체.
- mock 핸들러 = API 명세 초안. 백엔드 설계 시 그대로 옮긴다.
- `atelier-mockup.html`의 디자인 토큰(:root 변수)과 컴포넌트(칩, 버튼, opt, seg, 하단 바 등)를 그대로 이관해 재사용.

### 6.2 기술 스택 ✅ (M0에서 확정)

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React 19 + TypeScript + Vite 8, PWA(vite-plugin-pwa) | 가볍고, 타입이 곧 백엔드 계약 |
| 라우팅 | React Router 8 | §3 라우트 구조 그대로 |
| 서버 상태 | TanStack Query | 캐싱·무한스크롤·낙관적 업데이트(좋아요/찜) |
| Mock API | MSW 3 (Mock Service Worker) | 실제 `fetch`를 가로채므로 백엔드 붙일 때 코드 변경 최소. 인증은 `x-mock-user` 헤더로 흉내 |
| 스타일 | CSS Modules + CSS 변수 | 시안 CSS 재사용, 의존성 최소 |
| 폼 | React Hook Form + Zod 4 | Zod 스키마를 백엔드 검증에도 재사용 가능 |
| 테스트 | Vitest | `src/domain/rules.ts` 비즈니스 규칙 |

✅ 플랫폼: **반응형 웹앱** (모바일 우선). 필요 시 PWA로 홈 화면 설치 지원.

### 6.3 폴더 구조 (`app/src`, M0 기준)

```
src/
  app/            셸(AppShell), 하단 탭, 라우터, 화면 표 screens.ts (화면 번호 ↔ 경로 ↔ 탭)
  pages/          화면 컴포넌트 (구현 전은 ScreenStub)
  domain/         비즈니스 규칙 rules.ts + rules.test.ts
  entities/       도메인 타입 types.ts
  shared/
    api/          fetch 클라이언트, 엔드포인트, 응답 뷰 타입, react-query 훅
    ui/           Icon, Art, Button, Chip, Avatar, VerifiedBadge, AppBar, Seg, Opt, BottomBar, Sheet/Toast
    styles/       tokens.css · base.css · art.css (atelier-mockup 이관)
    lib/          mock 세션(보기 계정)
  mocks/          MSW handlers + fixture 데이터 (= API 명세 초안)
```
- 화면 단위 로직이 커지면 `features/`(like, save, checkout, back, decide …)로 분리한다.

### 6.4 API 명세 초안 ✅ (mock 구현 = `app/src/mocks/handlers/`, 계약 테스트 = `app/src/mocks/api.test.ts`)

인증: 실제 로그인 전까지 `x-mock-user` 헤더. 401 = 로그인 필요, 403 = 권한 없음, 400 = 규칙 위반(메시지 = 사용자 안내 문구).

```
# 사용자
GET    /me                            PATCH /me  { name, statement, place, tags }
GET    /settings
GET    /users/:handle                 (타인에게는 공개 경력만, 심사 상태는 인증 여부만)
GET    /users/:handle/works           GET /users/:handle/projects      GET /users/:handle/collection
POST   /users/:handle/follow          DELETE /users/:handle/follow

# 작품
GET    /feed?tab=foryou|following|popular
GET    /works?q=&category=            (탐색 · 검색)
GET    /works/:id                     (+ artistInfo: 작가노트, 작품 수, 판매 수)
POST   /works                         { title, category, material, size, year, description, story, price?, imageUrls }
POST   /works/:id/like                DELETE /works/:id/like
POST   /works/:id/save                DELETE /works/:id/save
GET    /me/saved

# 경력 · 인증
POST   /me/career                     PATCH /me/career/:id (내용 변경 시 unverified)   DELETE /me/career/:id
POST   /me/career/:id/verify-request  { documents[], note? }

# 구매
GET    /addons                        GET /pricing
POST   /orders                        { workId, addOnIds, fulfillment, storageMonths?, address? }  → 작품 reserved
GET    /me/orders?role=buyer|seller
PATCH  /orders/:id  { status }        판매자: paid→confirmed→shipping|stored, (shipping→delivered: 운송사 연동 자리)
                                       구매자: delivered→completed (completed·stored 시 작품 sold)

# 후원
GET    /support-projects              GET /support-projects/:id  (+ displayStatus, viewer.backing)
GET    /me/support-eligibility        { ok, reasons, verifiedCount, threshold, openProject }
POST   /support-projects              (인증 작가 + 끝나지 않은 프로젝트 없음, 마일스톤 2~10)
POST   /support-projects/:id/backings { amountPerMilestone }  (시작 · 금액 변경)
GET    /me/backings
POST   /milestones/:id/decision       { choice: 'continue' | 'leave' | null }  (선택 기간 안에는 변경 · 취소 가능)
POST   /milestones/:id/submission     { note, imageUrls }  (다음 단계만, 선택 기간 중이면 불가. 마지막 단계 → 완성 + 경력 자동 인증)
POST   /support-projects/:id/close    { reason? }

# 관리자 (role=admin)
GET    /admin/career-reviews?status=pending|verified|rejected
GET    /admin/career-reviews/:itemId  GET /admin/career-reviews/:itemId/logs
POST   /admin/career-reviews/:itemId/verify | reject {reason} | revoke {reason}
GET    /admin/settings                PATCH /admin/settings  { verifiedBadgeThreshold, verifiedFeedBoost }

# mock 전용 (백엔드에서는 배치 작업으로 대체)
GET|POST /__dev/scenario              POST /__dev/close-decisions  (선택 기간 마감 = 7일 경과 처리)
```

**백엔드에서 필요한 배치 작업**: 선택 기간 마감 시 무응답 자동 지속 + 정산(`domain/rules.ts` `settleMilestone`), 제시일 경과 지연 표시, 구매확정 자동 처리(기간 미결정).

---

## 7. 개발 단계 (프론트)

| 단계 | 범위 | 완료 기준 |
|------|------|----------|
| M0 ✅ | 프로젝트 세팅(`app/`), 토큰 이관, 셸·하단 탭, 공통 컴포넌트, 라우팅(전 화면 stub), MSW + fixture, 도메인 규칙 + 테스트 15개 | 완료 (2026-10-11) |
| M1 ✅ | 01 피드(추천·팔로잉·인기, 스토리 링, 1열↔그리드) · 01-2 탐색(검색·유형) · 02 작품 상세 · 12 저장 + 좋아요/저장/팔로우(낙관적 업데이트) | 완료 (2026-10-11) |
| M2 ✅ | 03 작가 프로필(작품·판매중·후원·소개/경력, 메뉴, 편집) · 04 작품 올리기(RHF+Zod) · 13 경력 · 인증 | 완료 |
| M3 ✅ | 05 구매하기(배송/보관·부가 서비스·합계) · 06 거래 내역(구매·판매·후원, 상태 전이) | 완료 |
| M4 ✅ | 07 목록 · 08 상세(정기 후원 시작·변경) · 09 지속/이탈(변경 가능) · 10 개설(조건 체크) · 11 작가 관리(업로드·종료, 지연·0명 상태) | 완료 |
| M5 ✅ | 14 인증 심사 목록·상세(체크리스트, 인증/반려/취소, 처리 이력) · 15 운영 설정 | 완료 |
| M6 ✅ | 라우트 에러 경계, 화면별 문서 제목, 시트 포커스 트랩, 접근성 이름 점검(전 화면 × 5계정), 화면별 코드 분할, PWA 아이콘 | 완료 (2026-10-11) |
| → | **백엔드 설계** | §5 타입 + `mocks/` 핸들러 기준 |

---

## 8. 미결정 사항 체크리스트

- [x] 플랫폼 → 반응형 웹앱
- [x] 후원 모델 → 크라우드 펀딩형 마일스톤 후원, 정기 후원 금액, 인증 작가만 개설, 작가당 진행 1개
- [x] 중간 평가 → 점수 없이 후원자 개인이 지속/이탈만 선택
- [x] 선택 기간 7일, 무응답 → 자동 계속 / 미업로드 → 다음 단계 금액 보류
- [x] 미업로드 → 결제 자체가 발생하지 않음(결과물 공개 후 결제 방식)
- [ ] 정기 후원 단위, 제시일 연기, 목표 금액 여부
- [x] 화구 지원 → 구매자용 부가 서비스(액자·보관·관리)
- [x] 작가 승인제 → 승인제 없음, 관리자 심사 기반 **인증 마크**(선택)
- [x] 인증 마크 → 단일 마크, 경력 항목별 인증, 인증 항목 5개(설정 가능) 이상 시 표시, 수정 시 미인증
- [x] 비공개 경력 항목 → 인증 개수에서 제외
- [x] 인증 작가 우대 → 피드 노출 가중치(관리자 설정)
- [ ] 에디션(한정판) 판매 지원 여부
- [ ] 댓글 기능 MVP 포함 여부
- [x] 피드 형태 → 그리드/1열 전환
- [ ] 인기 작품 산정 기준
- [ ] 수수료율(앱은 임시 10%: `PLATFORM_FEE_RATE`), 구매확정 기간, 환불 정책
- [ ] 소장품 공개 기능

- [ ] 넓은 화면(데스크톱) 레이아웃: 현재는 폰 폭 컬럼을 가운데 배치
- [ ] 실제 결제(PG) · 로그인 방식 · 이미지 저장소 (백엔드 단계)
- [ ] 작품 수정/삭제, 제작 기록(날짜별) 추가 화면, 알림
---

## 변경 이력

- v1.1 (2026-10-11): 프론트 M2~M6 완료. API 명세(§6.4)를 mock 구현 기준으로 확정, 계약 테스트 추가.
- v1.0 (2026-10-11): 프론트 M0 완료. 라우트 확정(`/artists/:handle`, `/me/saved`, 마일스톤은 order로). 기술 스택 버전 확정.
- v0.9 (2026-10-11): 디자인 기준을 `atelier-mockup.html`(인스타형 모바일)로 확정, 내비게이션을 하단 탭 구조로 변경. 브랜드명 atelier.
- v0.8 (2026-10-11): 후원을 크라우드 펀딩형으로 재정의. 정기 후원 금액, 작가가 마일스톤 횟수 선택, 후원자 0명 시 작가 종료, 미종료 시 신규 모집 불가, 인증 작가만 개설, 후원 이력을 경력으로.
- v0.7 (2026-10-11): 비공개 경력 항목은 인증 개수 제외. 인증 작가 피드 노출 가중치(관리자 설정, 기본 1.3) 추가.
- v0.6 (2026-10-11): 작가 인증을 경력 항목 단위로 변경. 인증 항목 ≥ 5(관리자 설정)일 때 단일 마크, 인증 항목 수정 시 미인증 전환.
- v0.5 (2026-10-11): F5 작가 인증(관리자 서류 심사 → 인증 마크) 추가. 관리자 역할·화면·API 추가.
- v0.4 (2026-10-11): 미업로드 시 다음 후원 보류, 선택 기간 7일 + 무응답 자동 계속 확정.
- v0.3 (2026-10-11): 중간 평가를 점수 평가에서 후원자의 계속/중단 선택으로 변경. 체크포인트에 공개 예정일 추가.
- v0.2 (2026-10-11): 플랫폼(웹앱), 후원(마일스톤), 화구 지원(구매자 부가서비스), 피드(보기 전환) 확정.
- v0.1 (2026-10-11): 초안. 당시 참고 시안 기반으로 IA·화면·도메인 모델·프론트 아키텍처 정리.
