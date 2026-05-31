# 다음 호 이월(carryover) — DESIGN

이 파일은 **다음 매거진 호에 포함할 글**을 미리 보관하는 곳입니다.
다음 `/digest-collect` → `/magazine-write` 진행 시, 아래 블록을 해당 호의
`magazine-report.md` DESIGN 섹션에 합치고 그 호의 번호 체계에 맞춰 `####` 번호만 다시 매깁니다.
(아래 `#### 99` 번호는 자리표시자입니다. 발행 호에서 실제 순번으로 교체하세요.)

- 추가 요청일: 2026-05-31
- 사유: 2026-05-28 호는 이미 발송되어, 이 글은 다음 호로 이월.
- 원문 검증: 완료 (press.stripe.com 직접 확인 — 리빙 커버, 카탈로그 타이틀, 구매처 등)

---

#### 99. Stripe Press

- 날짜: 2026-05-31
- 태그: 리빙커버, 인터랙티브 북커버, 퍼블리싱, 에디토리얼
- 국가: GLOBAL
- 카테고리: global
- 직무 태그: 웹디자인
- 출처 유형: reference
- 출처: Stripe Press
- 출처 URL: https://press.stripe.com
- 이미지: https://images.stripeassets.com/fzn2n1nzq965/13zaWB3aiz08hqNr69CMW4/772586e910faef5d26d15e01edb9c010/social.png?q=80
- 이미지 설명: Stripe Press 공식 OG 이미지 — "Ideas for progress"
- 요약: Stripe의 출판 임프린트 Stripe Press가 "Ideas for progress"를 내걸고, 기술·경제·과학 발전을 다루는 책을 일관된 세로 스택 카탈로그로 정렬하면서도 책마다 고유한 인터랙티브 "리빙 커버(living cover)" 페이지를 두는 방식을 보여줍니다.
- 관련 링크 1: [케이스 출처] Stripe Press — Ideas for progress | https://press.stripe.com

##### 요약

- Stripe의 출판 임프린트 Stripe Press는 "Ideas for progress"를 내걸고 기술·경제·과학 발전을 다루는 책을 펴내며, 각 책마다 정적 표지 썸네일 대신 책 고유의 모션·질감을 입힌 인터랙티브 "리빙 커버(living cover)" 페이지를 둡니다.
- 카탈로그에는 The Scaling Era(Dwarkesh Patel), Working in Public(Nadia Eghbal), Scaling People(Claire Hughes Johnson), Poor Charlie's Almanack, The Art of Doing Science and Engineering(Richard W. Hamming) 등 20여 권이 세로 스택으로 정렬되고, 각 항목은 제목·저자·설명·구매처(Bookshop·Barnes & Noble·Amazon)·추천사·저자 소개·부록 PDF(zine)를 한 페이지에 일관된 구조로 담습니다.
- 다큐멘터리 We Are As Gods, 인프라를 다룬 팟캐스트 Beneath the Surface처럼 책이 아닌 프로젝트도 같은 편집 체계 안에 섞여 있고, 푸터의 뉴스레터 신청으로 마무리됩니다.

##### 디자인 인사이트

> 표지를 썸네일이 아니라 '살아 있는 화면'으로 다루면, 카탈로그의 각 항목이 그 자체로 하나의 랜딩이 됩니다.

Stripe Press의 핵심은 모든 책을 같은 카드 틀에 넣으면서도 표지만큼은 책마다 고유한 인터랙티브 화면(리빙 커버)으로 만든 결정입니다. 카탈로그는 일관된 세로 스택과 동일한 정보 구조(제목·저자·추천사·구매처)로 스캔 가능성을 유지하지만, 표지 페이지에 들어가면 책마다 다른 모션·질감·타이포가 펼쳐져 '균일한 목록'과 '개별 브랜딩'을 한 사이트 안에서 양립시킵니다. 패션 이커머스로 옮기면 상품 목록은 동일 그리드로 비교 가능성을 지키되, 시즌 핵심 상품이나 콜라보 라인의 PDP만 시그니처 히어로로 차별화하는 구조와 같습니다.

리빙 커버는 대개 Canvas·WebGL이나 셰이더로 구현돼 시각 임팩트가 크지만, 그만큼 모바일 성능·초기 로딩·접근성을 함께 설계해야 합니다. 표지가 정보가 아니라 장식으로 작동할 때 스크린리더에 어떻게 노출할지, 저사양 기기에서 정적 표지로 폴백할지, `prefers-reduced-motion`에서 모션을 끌지를 미리 정의하지 않으면 임팩트가 곧 이탈로 바뀝니다. 일관 템플릿 위에 '선택적 시그니처 레이어'를 얹는 방식이어서, 전 상품에 인터랙션을 깔지 않고도 소수의 핵심 화면에만 집중 투자할 수 있다는 점이 운영 관점의 강점입니다.

상품 상세를 모두 같은 템플릿으로 운영한다면 시즌 핵심 상품·콜라보 라인만 표지처럼 시그니처 인터랙션을 얹을 여지가 있는지를, 인터랙티브 히어로를 도입 중이라면 그 화면이 상품명·가격·CTA 같은 핵심 정보 전달을 가리지 않고 모바일 성능 임계점을 넘지 않는지 점검할 지점입니다.
