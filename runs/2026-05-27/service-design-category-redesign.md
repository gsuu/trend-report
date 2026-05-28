# SERVICE / DESIGN 카테고리 재설계안 (2026-05-27)

> 작성 배경 — DEV 재설계와 같은 흐름. 페르소나 진단(이미 받음) + 5/26 raw 데이터 분석 + 채널 확장. 비율 강제 없음. "좋은 글이면 다 싣고, 없으면 비운다" 원칙 유지.

---

## 0. 진단 요약

### SERVICE 현 상태 (5/26 raw 21 후보)
- **채널 7개 모두 KR 뉴스룸·이벤트 보도자료 발신처**: 신세계 6, 쿠팡 4, SSG 이벤트 4, 무신사 3, 컬리 2, 우아한형제들 1, 오픈서베이 1
- **화면 분석 매체 0개** — 후보가 100% 보도자료에서 시작하므로 결과물도 보도자료 톤 PR 글이 됨
- 페르소나가 본 매거진(누적 54건)에서: 오픈서베이 4건 자기복제, 오늘의집 2건 회고/MD, 올리브영 IR성, G마켓 멤버십 PR

### DESIGN 현 상태 (5/26 raw 19 후보)
- **DIGITAL iNSIGHT 10건 = 53%**: 단일 매체 의존
- 그 외: NN/g 3, Canva 2, DesignDB 1, pxd 1, The Brand Identity 1, Smashing UX 1
- 페르소나가 본 매거진에서: IT'S NICE THAT 4건 쏠림, 디자인 시스템+AI 가드레일 주제 #17·#19·#21·#24 중복
- inspiration 채널(Mobbin/Awwwards/IT'S NICE THAT/Muzli) 풍성한데 페르소나 평가는 "무드보드, 웹 관점 약함"

### 양 카테고리 공통
- **PR/무드보드형 글 자동 컷 룰 부재** — 매출/거래액/기획전 출시/리포트 다운로드 같은 키워드 자동 컷이 없음
- **자기복제 시리즈 묶음 처리 부재** — 오픈서베이 청년 1인가구 ①②, 디지털 갑질 ① 같이 같은 데이터/같은 필자의 시리즈가 여러 호에 흩어져 나옴
- 비율 강제 대신 **(1) 화면 분석 매체 추가 (2) PR/무드보드 자동 컷 강화 (3) 자기복제 시리즈 묶음 통합** 세 가지로 처방. **같은 매체에서 4건 5건 다 좋은 글이면 다 싣는다** — 단일 매체 수량 한도는 두지 않음

---

## 1. SERVICE 채널 보강 (+3, 모두 화면·플로우 분석 가능 출처)

| 채널 | RSS | 채택 이유 |
|---|---|---|
| **29CM** | `medium.com/feed/29cm` | 이커머스 화면·CRM·큐레이션 사례 직접 발신. 5/26 #08 선물하기 글의 출처 |
| **무신사 Tech** | `medium.com/feed/musinsa-tech` | 멀티스토어/추천/검색 화면 변경 사례 직접 발신 |
| **쿠팡 엔지니어링** | `medium.com/feed/coupang-engineering` | 결제/마이페이지/추천 화면 변경 사례 |

SERVICE 채널 7 → 10. 모두 KR 이커머스 직접 발신처지만 **뉴스룸 보도자료가 아니라 자기 화면 변경기**라 톤이 다름.

---

## 2. DESIGN 채널 보강 (+3, 한국 디자인 분석 + 글로벌 UX 깊이)

| 채널 | RSS | 채택 이유 |
|---|---|---|
| **Toss Blog** | `blog.toss.im/rss.xml` | 토스 디자인팀의 컴포넌트·시스템 운영기 (이미 DEV의 Toss Tech와 다름. 이건 design+service 중심) |
| **UX Design (Medium)** | `uxdesign.cc/feed` | 글로벌 UX 시니어들의 화면 분석·인터랙션 사례 (NN/g보다 실무 톤) |
| **UX Matters** | `uxmatters.com/index.xml` | 클래식 UX 매체. 화면 단위 분석·접근성·내비게이션 사례 |

DESIGN 채널 9 → 12. **DIGITAL iNSIGHT 의존 자연 감소**.

---

## 3. SERVICE 자동 컷 룰 강화 (`docs/service-digest-agent-prompt.md`)

### 추가할 자동 컷 키워드 (제목 기반)
```
리포트 다운로드 | 보고서 발간 | 트렌드 리포트 | 인포그래픽 | 
N% 증가 | N% 성장 | N억 매출 | N만 명 돌파 | N% 신장 | 사상 최대 |
기획전 (오픈|런칭|시작) | 단독 (오픈|런칭) | 신규 매장 (오픈|런칭) | 
제휴 (체결|발표|확대) | 콜라보 (발표|런칭) | 누적 (다운로드|판매|시청)
```

→ 위 키워드가 제목에 있으면 본문 검토 전 자동 제외. 같은 매체에서 4건 이상 통과 시 `target-fit-classifier-agent.md`에서 재검토 권고 (강제 아님, 권고).

### 자기복제 시리즈 묶음 처리 (수량 한도 아님)
> **시리즈/연재 글은 묶음 1건**: 제목에 `①②③ N편 N부` 또는 같은 데이터의 후속 분석이 같은 호에 여럿 등장하면, 매거진 1건으로 통합해서 발행한다(대표 원문 + 보조 출처 형태). 자기복제 시리즈인지 판단은 콘텐츠 차원 — 같은 매체라도 다른 콘텐츠면 모두 채택. 단일 매체 수량 한도는 없음.

---

## 4. DESIGN 자동 컷 룰 강화 (`docs/design-digest-agent-prompt.md`)

### 추가할 자동 컷 키워드 (제목 기반)
```
mood board | moodboard | inspiration round-up | weekly inspiration | 
this week in design | best of | top \d+ websites | logos of the week |
brand spotlight (?!.*case study|.*리뉴얼|.*시스템)
```

### 무드보드형 매체 보강 룰
IT'S NICE THAT / The Brand Identity / Muzli 같은 inspiration 매체는:
- ✅ **케이스 스터디·리뉴얼·시스템 운영기** 글이면 P0~P1
- ⚠️ **단순 "이번 주의 영감" 큐레이션 글**이면 P2 또는 제외
- "원문 본문이 인터뷰/제작 과정/사용한 도구/디자인 결정 근거를 포함하는가" 체크 통과 못하면 제외

### 자기복제 시리즈 묶음 처리
> SERVICE와 같음. DIGITAL iNSIGHT의 "참을 수 없는 UX의 저렴함 ①②③" 같은 연재는 1건으로 통합. IT'S NICE THAT의 같은 주의 영감 시리즈도 동일. 단일 매체 수량 한도는 없음.

---

## 5. `target-fit-classifier-agent.md` SERVICE/DESIGN 부분 정밀화

### SERVICE P0/P1/P2 (수정 제안)
```diff
**SERVICE 내 우선순위:**
- 1. `P0`: core_ecommerce 중 화면·플로우·정책 변화가 확인된 후보
+ 1. `P0`: core_ecommerce 중 (a) 화면·플로우·정책 변화가 원문에서 확인되고 (b) 자기 회사가 아닌 외부 시각(분석·리서치·사용자 반응)도 함께 보이는 후보
- 2. `P1`: commerce_adjacent 중 이커머스에 바로 대입할 수 있는 후보
+ 2. `P1`: core_ecommerce지만 자기 회사 PR 톤이 강해 외부 시각이 약한 후보, 또는 commerce_adjacent 후보
  3. `P2`: 시장/리서치 맥락은 강하지만 화면 변화가 직접 확인되지 않는 후보
- 4. `제외`: weak_promo 또는 exclude
+ 4. `제외`: weak_promo, exclude, 매출/거래액/기획전 출시/리포트 다운로드 단순 알림
+
+ 한 호에서 같은 발행처 후보가 4건 이상 통과하면 두 번째 패스에서 모두 P0인지 재검토(권고). 자기복제·시리즈 리포트는 묶음 1건으로 통합.
```

### DESIGN P0/P1/P2 (수정 제안)
```diff
**DESIGN 내 우선순위:**
- 1. `P0`: 화면·브랜드 시스템 변화가 확인되고 CTTD 제작 실무에 즉시 연결되는 후보
+ 1. `P0`: (a) 화면·브랜드 시스템 변화가 확인되고 (b) 원문이 인터뷰/제작 과정/디자인 결정 근거/사용한 도구 중 하나 이상을 다루는 후보. 한국 사례면 가산점 +1
  2. `P1`: 디자인 시스템·비주얼 레퍼런스로 바로 참고할 수 있는 후보
- 3. `P2`: 맥락은 있지만 화면 증거가 부족한 후보
+ 3. `P2`: 화면 증거는 있는데 본문이 "이번 주의 영감" 류 무드보드 큐레이션에 머무르는 후보
- 4. `제외`: weak_promo 또는 exclude
+ 4. `제외`: weak_promo, exclude, mood board/inspiration round-up/best of N 등 단순 영감 모음
+
+ 자기복제 시리즈(같은 매체의 연재 ①②, 같은 데이터 후속 분석)는 콘텐츠 차원에서 묶음 1건으로 통합한다. 단일 매체 수량 한도는 없음.
```

---

## 6. 적용 순서

1. **이 문서 검토 → OK 사인**
2. patch 4종 동시 적용
   - `news-tracking/service-sources.json` — 채널 +3 + excludeTitlePatterns 강화
   - `news-tracking/design-sources.json` — 채널 +3 + excludeTitlePatterns 강화
   - `docs/service-digest-agent-prompt.md` — 자동 컷 키워드 + 시리즈 묶음 통합
   - `docs/design-digest-agent-prompt.md` — 무드보드형 컷 룰 + 시리즈 묶음 통합
   - `docs/target-fit-classifier-agent.md` — SERVICE/DESIGN P0/P1 정밀화
3. `npm run fetch:service` + `npm run fetch:design` 실행, DEV처럼 5/26 vs 5/27 비교
4. 1~2주 후 페르소나 다시 진단

---

## 7. 이번 5/26 호 즉시 컷 후보 (선택)

페르소나 양쪽 합의 Cut + 새 룰이라면 자동 컷되었을 글. 사용자 결정에 따라 사이트에서 내릴 수 있음.

| 호·번호 | 출처 | 새 룰에서의 판정 |
|---|---|---|
| #02 5/26 K-푸드 트렌드 | 오픈서베이 | 리포트 다운로드 유도 → 제외 |
| #01 5/15 로컬의 선택 144종 | 오늘의집 | 기획전 출시 + N% 매출 → 제외 |
| #13 5/6 청년 1인가구 | 오픈서베이 | 자기복제 시리즈 → 묶음 통합 또는 제외 |
| #03 5/15 청년 1인가구 가전 | 오픈서베이 | 위와 같음 |
| #12 5/6 페스타 JAPAN 258% | 올리브영 | N% 매출 PR → 제외 |
| #03 5/6 G마켓 꼭 멤버십 | 신세계 | 멤버십 출시 PR → 제외 |
| #08 4/28 Ffern 향수 | IT'S NICE THAT | inspiration 무드보드 → P2/제외 |
| #03 4/28 Casi 캠페인 | IT'S NICE THAT | 무드보드 → P2/제외 |
| #04 4/28 NYT Magazine 리디자인 | IT'S NICE THAT | 인터뷰 회상기, 디자인 결정 근거 약함 → P2 |

5/26 호 14건에서 SERVICE 6건 즉시 컷 가능. DESIGN은 4/28 호 3건이 P2/제외 후보. 사용자 결정.

---

## 부록 A. 페르소나 wish list (다시 환기)

**시니어 디자이너 wish (DESIGN/SERVICE)**:
- 국내 회사(토스 외) 디자인 시스템 거버넌스 운영기
- AI 결과 검수 단계의 디자이너 워크플로우
- 한국 B2B SaaS의 IA·내비게이션 재설계
- 디자이너 채용 시장과 조직 변화

**시니어 퍼블리셔 wish (DEV는 별도 문서 반영, SERVICE/DESIGN 시각)**:
- 한국 회사의 접근성 실측 케이스 (SERVICE: 화면 변경 + DESIGN: 디자인 결정)
- 디자이너-개발 핸드오프 도구 변화 (한국 팀 후기)
