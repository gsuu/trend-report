# 팀 보드 — 이번 주 (2026-05-27)

> reference-team 5 멤버가 모은 레퍼런스. 디자이너·퍼블리셔·기획자 누구도 *한 가지 흥미*는 가져갈 풀. 첫 회차.

## 오늘의 한 컷

**Codrops Product→Cart 인터랙션** — 1.8초 power2.inOut, stagger 0.04초로 *상품 카드가 카트로 흡수되는 한 동작*. UIUX 디자이너의 PDP 시안에 그대로 끌어올 수 있고, 퍼블리셔의 다음 스프린트에도 적용 가능하며, 기획자가 결제 직전 *카트 인지 신호 강화 안건*으로 PRD에 인용 가능. **5 멤버 시점 다 통과한 한 컷**. (`inspiration.md` #2 ★)

---

## 영역별 ★ TOP 2

### 🎨 디자인 — 실무 라이브 사이트 (10건, ★ 6)
*출처: `runs/2026-05-27/references/design.md` (v2 정정 — Hover States 60%)*
1. ★ **Serena Congiu** — 밀라노 메이크업 아티스트. 그리드 아닌 "Link to next page"로 작품마다 깊이 강제. K뷰티 아티스트 포트폴리오 직참
2. ★ **Any Given Moment** — Chanel/Guerlain/Prada 럭셔리 뷰티 캠페인 프로덕션. *다이얼 형태 회전 네비*

### 🛒 서비스 — 한국 화면·정책 (12건, ★ 5)
*출처: `runs/2026-05-27/references/service.md` (v2 — 한국 6 / 글로벌 6)*
1. ★ **하나은행 OneQ × Wily** — 시중은행 IA 패러다임 전환 16개월 케이스
2. ★ **무신사·29CM 회원제 강등 3개월 유예 자동** — 별도 신청 없이 시스템이 자동 감지. 올리브영 차기 멤버십 안건 직참

### 🛠 DEV — 라이브 데모 + 코드 (10건, ★ 5)
*출처: `runs/2026-05-27/references/dev.md` (v2 — 코드 위치 10/10)*
1. ★ **CSS `sibling-index()` / `sibling-count()`** — iOS Safari 26.2 stable. `width: calc(100% / sibling-count())` 한 줄로 패션 사이즈 옵션 탭·컬러 스왓치 균등 분배
2. ★ **CSS Gap Decorations** — Chrome blog + Microsoft Edge 14 데모. 대시보드 그리드 사이 선을 div 없이

### 📊 한국 트렌드 (7건, ★ 4)
*출처: `runs/2026-05-27/trend-radar.md`*
1. ★ **29CM 1조 4강 재편** — 패션 커머스 시장 재편 신호
2. ★ **올리브 멤버스 월간 승급** — 뷰티 멤버십 정책의 시간 단위 단축

### ✨ 영감·UIUX 인터랙션 (9건, ★ 5) — 신규
*출처: `runs/2026-05-27/team-board/inspiration.md` (v2 — UIUX 마이크로 인터랙션 중심)*
1. ★ **Codrops Product→Cart** — 1.8초 power2.inOut + stagger 0.04초. 상품 카드 → 카트 흡수 (오늘의 한 컷)
2. ★ **Codrops EaseReverse Clip Menu** — 닫힘 elastic.out 역재생으로 *열림과 다른 톤*
3. ★ **Shining / 302chanwoo** — 한국 디자이너의 Three.js WebGPU 스토리북

---

## 영역별 분포 + 메타

| 영역 | 항목 수 | ★ 수 | 한국 / 글로벌 |
|---|---|---|---|
| 디자인 | 10 | 6 | 0 / 10 |
| 서비스 | 12 | 5 | 6 / 6 |
| DEV | 10 | 5 | — (라이브 데모는 환경 무관) |
| 트렌드 | 7 | 4 | 7 / 0 |
| 영감 | 9 | 5 | 1 / 8 |
| **합계** | **48** | **25** | — |

### 신규 발견 매체 (이전 회차 없던 — 첫 회차라 전부 신규)
- **Hover States** (디자인 alternative web) · **Codrops Playground** (인터랙션) · **outstanding.kr** (트렌드) · **무신사 Tech Medium** (DEV) · **Toss Tech** (DEV)

### 영역간 교차 발견
- DEV #1 sibling-index ↔ 영감 #9 Volt 가격 슬라이드 = *컬러 스왓치·가격 변동 UI* 공통 시드
- 서비스 #2 당근알바 키즈케어 폼 입력 순서 역전 ↔ 영감 #7 Pay→Fingerprint Morph = *폼·결제 UX* 공통

---

## 회차 자체 평가 한 줄

**"디자이너 180·퍼블리셔 30·기획자 10 누구도 한 가지 흥미는 가져갈 만하다."** 영역 간 교차도 보이기 시작 — 다음 회차에 *교차 발견을 의도적으로* 매거진/제안 자료에 합치는 흐름 검토.

## 다음 회차 메모
- inspiration-scout v2 안정화 후 *시즌 키워드* (6월 = 초여름 캠페인) 결합
- 한국 디자인 매체 (design 영역) RSS 차단 회피 — Dezeen·Creative Review·Eye on Design는 RSS 죽음, 페이지 스크래핑 보강
- DEV 영역에서 한국 사례 비율을 더 올릴 채널 (토스/카카오/우아한 외)
- team-board history.json 누적 시작 — 중복 회피 신호로 활용
