# Reference-Scout 시스템 설계 (2026-05-27)

> RSS 폴링이 못 잡는 "라이브 레퍼런스(사이트·앱 화면·라이브 데모)"를 카테고리별 에이전트가 능동 탐색해서 매거진 콘텐츠 퀄리티를 보강한다. CTTD 매거진의 기존 글 흐름과 분리된 새 산출물 라인.

---

## 0. 왜 필요한가
- RSS는 *글*만 수집한다. 인터뷰·릴리즈 노트·블로그 글. **라이브 사이트·앱 화면·CodePen 데모는 RSS에 안 잡힌다.**
- 페르소나 비평에서 반복된 지적 — "화면 캡처가 없다", "장면 비교가 없다", "결정 근거가 본문에 안 보인다". 이건 글이 아니라 **레퍼런스 자체가 필요**한 케이스.
- 매거진은 글 위주지만, 좋은 글의 보강 자료(인용/캡처/장면)가 부족하면 퀄리티가 떨어진다. 그래서 매거진과 분리된 **레퍼런스 풀**을 별도로 운영한다.

## 1. 시스템 구조

```
주 1회 또는 사용자 트리거
        ↓
  reference-scout (스킬, 오케스트레이터)
        ↓ 병렬 호출
  ┌──────────────────────┬──────────────────────┬──────────────────────┐
  service-reference-scout  design-reference-scout  dev-reference-scout
  ↓                        ↓                        ↓
  Mobbin / Page Flows /    Awwwards / Siteinspire /   GitHub Trending /
  한국 이커머스 앱 캡처    Land-book / Lapa / Cosmos   Show HN / CodePen
  ↓                        ↓                        ↓
  runs/YYYY-MM-DD/references/{service,design,dev}.md
        ↓
  magazine-writer가 글 쓸 때 참고 (옵션)
  + 사용자 요청 시 "이번 주 레퍼런스 5선" 매거진 글로 승격 가능
```

## 2. 카테고리별 탐색 대상

### SERVICE
- **Mobbin** (mobbin.com) — 한국 이커머스 앱 화면 캡처. 패션·뷰티·종합몰 위주
- **Page Flows** (pageflows.com) — 결제·온보딩·검색 플로우 캡처
- **무신사·29CM·올리브영·카카오페이·토스·당근** 앱 직접 스냅샷 (상품탐색·결제·CRM 화면)
- **Awwwards** e-commerce 카테고리
- 발견 단서: 페르소나가 wish한 "한국 B2B SaaS 사이드바 재설계", "이커머스 멤버십 화면" 같은 키워드

### DESIGN
- **Awwwards** (awwwards.com) — Site of the Day, 카테고리별 nominee
- **Siteinspire** (siteinspire.com) — 최근 추가 + 카테고리별
- **Land-book** (land-book.com) — 랜딩 페이지 갤러리
- **Lapa Ninja** (lapa.ninja) — 랜딩·브랜드 사이트
- **Cosmos** (cosmos.so) — 시각 큐레이션
- 추출 정보: 사이트 URL, 카테고리, 시각 키워드(타이포·컬러·레이아웃·모션), 저장할 이유 한 줄

### DEV
- **GitHub Trending** (github.com/trending) — Web/TypeScript/CSS 카테고리
- **Show HN** (news.ycombinator.com) — frontend·CSS·web platform 키워드 필터
- **CodePen** (codepen.io/picks) — Editor Picks (인터랙션·CSS demo)
- **Frontend Mentor** (frontendmentor.io) — 도전 과제 솔루션 (실제 마크업)
- **CodeSandbox** picks
- 추출 정보: repo/pen URL, 무엇을 보여주는지, CSS/JS 어떤 기술 사용, 매거진 글에 어떻게 인용 가능한지

## 3. 산출물 형식 (모든 카테고리 공통)

`runs/YYYY-MM-DD/references/{service,design,dev}.md`

```markdown
# {CATEGORY} 레퍼런스 (YYYY-MM-DD 발견분)

## 1. {사이트/도구/repo 이름}
- **URL**: https://...
- **출처**: Awwwards SOTD 2026-05-25 / GitHub Trending (this week) / Mobbin 무신사
- **카테고리**: 랜딩 / 브랜드 / 커머스 / 컴포넌트 라이브러리 / CSS demo 등
- **왜 저장할 만한가** (1-2줄): 디자이너·기획자·퍼블리셔 관점에서 한 줄
- **포인트**: 레이아웃·타이포·컬러·모션·접근성·구현 기술 중 두세 가지
- **매거진 활용 후보**: 
  - (a) 향후 [어떤 주제] 글의 보강 자료로
  - (b) "이번 주 레퍼런스 5선" 매거진 글로 승격 가능 (★ 표시)
- **캡처 URL**: og:image 또는 스크린샷 (있을 때만)

## 2. ...
```

5~10개 항목 권장. 더 많아도 좋지만 한 항목당 정보 풍부도가 더 중요.

## 4. magazine-writer와의 통합 (옵션)

- magazine-writer가 글 쓸 때 같은 날짜의 `runs/YYYY-MM-DD/references/{category}.md`를 옵션으로 읽는다.
- 매거진 본문과 연결되는 레퍼런스가 있으면 *관련 레퍼런스* 섹션에 인용.
- 통합 강제 X — references가 없거나 매치 안 되면 그냥 글만 쓴다.
- 통합 명시는 `docs/magazine-writing-standard.md`에 한 줄 추가 (다음 단계).

## 5. 승격 흐름 ("이번 주 레퍼런스 5선" 매거진 글)

- 사용자 트리거: "이번 주 디자인 레퍼런스 5선 만들어줘"
- 또는 `runs/YYYY-MM-DD/references/design.md`에서 ★ 표시된 항목이 5개 이상이면 reference-scout가 자동 제안
- 발행 흐름:
  1. references/design.md 중 ★ 표시 5개 선정
  2. magazine-writer가 *5장 카드 형식*으로 한 매거진 글 작성 (각 카드: 사이트 + 캡처 + 한 줄 평)
  3. magazine-report.md에 한 항목으로 추가
  4. 기존 magazine-review → category-qa 흐름은 동일

## 6. 실행 빈도와 트리거

- **권장 주기**: 주 1회 (월요일 아침). 매 호 fetch는 너무 잦음.
- **트리거**:
  - 사용자 명시: "레퍼런스 수집", "이번주 레퍼런스 찾아줘", "디자인 레퍼런스 갤러리"
  - 자동: 별도 (지금은 안 함, 추후 CronCreate 검토 가능)
- 매 호 magazine-writer는 가장 최근 references/ 폴더를 참고 (없으면 무시)

## 7. 첫 단계 (이번 작업)

1. **이 설계 메모 사용자 검토 → OK** (이 단계)
2. **DESIGN 한 카테고리로 프로토타입**
   - `.claude/agents/design-reference-scout.md` 작성
   - `.claude/skills/reference-scout/SKILL.md` 작성 (DESIGN만 활성, SERVICE/DEV는 TODO)
   - 한 번 dry-run → `runs/2026-05-27/references/design.md` 생성
   - 결과 품질 검토
3. **OK면 SERVICE/DEV 에이전트 확장**
4. **magazine-writer 통합 (선택)** — magazine-writing-standard.md에 한 줄 추가
5. **승격 흐름 (선택)** — 별도 트리거 또는 스킬

## 8. 비용/리스크

- **토큰 소모**: 각 에이전트가 5~10개 사이트 WebFetch + 본문 읽기 → 한 카테고리당 ~20k 토큰 수준. 주 1회면 합리적.
- **봇 차단**: Awwwards/Mobbin은 봇 감지 가능. 초기 dry-run에서 확인 필요.
- **품질 검증**: 첫 dry-run 결과를 사람이 보고 "정말 좋은 레퍼런스인지" 판단. 에이전트가 좋은 사이트와 평범한 사이트를 구분하는지가 핵심.

## 9. 명시 안 한 것
- 자동 발행/뉴스레터 통합 — 안 한다. 기존 매거진 흐름만 그대로.
- Notion 동기화 — 안 한다.
- 매거진 글 자동 승격 — 사용자 트리거만. 자동 승격은 안 함.
