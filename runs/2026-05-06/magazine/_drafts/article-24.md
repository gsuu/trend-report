### 24. What's !important #10 — `sizes=auto`와 HTML-in-Canvas가 동시에 흔드는 이미지 표준

- 날짜: 2026-05-01
- 태그: `sizes=auto` `HTML-in-Canvas` `image-set()` `Rekindle`
- 국가: GLOBAL
- 카테고리: dev
- 직무 태그: `웹디자인` `웹DEV`
- 출처 유형: news
- 출처: CSS-Tricks (Daniel Schwarz)
- 출처 URL: https://css-tricks.com/whats-important-10/
- 이미지: CSS-Tricks 본문 hero (발행 시 직접 캡처 권장)
- 이미지 설명: CSS-Tricks 큐레이션 시리즈 'What's !important #10' 본문 상단 이미지
- 요약: CSS-Tricks의 큐레이션 시리즈 10회차가 `sizes=auto`, HTML-in-Canvas, CSS `content` 속성으로 본 이미지 처리 표준의 변화를 한 자리에 모았다.

##### 용어 설명

- HTML-in-Canvas: `<canvas>` 안에 시맨틱 HTML 노드를 그대로 렌더링하면서 캔버스의 비주얼 효과를 적용할 수 있게 하는 새 API. 현재는 실험 단계로 Chrome 146에서 `chrome://flags/#canvas-draw-element` 플래그를 켜야 시도할 수 있다.
- Rekindle: Kindle, Kobo, Boox 같은 e-ink 단말의 저사양 전용 브라우저를 위한 웹 기반 OS. 흑백 인터페이스와 애니메이션 제거를 기본으로 한다. (https://rekindle.ink/)

##### 요약

- `sizes=auto`는 lazy-loaded `<img>`에 한해 브라우저가 실제 렌더 크기를 보고 적합한 `srcset` 후보를 직접 고르게 한다. 반응형 브레이크포인트마다 sizes 미디어 쿼리 문자열을 손으로 짜던 작업을 줄이는 새 속성이다.
- HTML-in-Canvas는 시맨틱 HTML을 `<canvas>`에 그릴 수 있게 하는 새 API다. Chrome 146에서 `chrome://flags/#canvas-draw-element` 플래그를 켜야 시도할 수 있고, 캔버스 비주얼 효과를 텍스트나 인터랙티브 노드에 그대로 입힐 수 있다.
- CSS `content` 속성은 `img { content: url(new-image.png) / "New alt text"; }` 형태로 마크업을 바꾸지 않고 `<img>` 소스와 alt 텍스트를 동시에 교체할 수 있다. Baseline 11년 차이지만 잘 알려져 있지 않다는 점을 짚었고, `image-set(url("image.png") 1x, url("image-2x.png") 2x)`와 함께 쓰면 해상도별 이미지 분기까지 CSS에서 끝난다.
- e-ink 전용 OS Rekindle을 함께 소개하며, 흑백·무애니메이션·저사양 브라우저라는 환경 제약이 다시 주목받는 흐름을 짚었다.

##### 매거진 인사이트

> 이미지 마크업 바깥에서 결정되던 분기들이 한 번에 CSS·브라우저 쪽으로 돌아오는 회차다.

###### 왜 지금 이 업데이트인가

`sizes=auto`는 lazy-loading 속성과 묶여야만 동작하기 때문에, 이미 lazy로 내려가 있는 PDP 캐러셀 후순위 슬라이드부터 효과가 가장 크다. 첫 슬라이드는 LCP 후보라 보통 eager로 두기 때문에 기존 sizes 정의를 유지하고, 두 번째 이후 슬라이드와 추천 영역에서만 `sizes=auto`로 바꾸면 미디어 쿼리 문자열 한 세트를 통째로 들어낼 수 있다. HTML-in-Canvas와 CSS `content`는 모두 "마크업을 바꾸지 않고 출력 결과만 바꾼다"는 같은 결을 가진다. 디자이너·기획자가 이미지 자산이나 alt를 교체할 때 개발자에게 마크업 작업을 요청하지 않아도 되는 분기점이다.

###### 구현 관점

`sizes=auto`를 적용할 때 가장 먼저 점검할 곳은 PDP 이미지 캐러셀과 추천 그리드다. 첫 슬라이드는 기존 sizes 식을 유지하고, lazy 처리된 이후 슬라이드와 썸네일 그리드에서만 `sizes="auto"`로 바꾸는 식으로 분리해야 LCP 회귀를 피할 수 있다. 검증은 Lighthouse·CrUX의 LCP, INP와 함께 네트워크 패널에서 실제로 다운로드된 후보 해상도가 화면 폭에 맞는지를 본다. CSS `content`로 alt까지 교체하는 패턴은 디자인 시스템 토큰으로 대체 이미지를 다룰 때 유용하지만, 스크린리더에서 alt가 어떻게 읽히는지 NVDA·VoiceOver 양쪽에서 확인해야 한다. HTML-in-Canvas는 플래그 단계라 프로덕션 투입은 이르고, 사내 데모나 모션 R&D에서 가능성만 가늠하는 단계가 적당하다.

###### 실무에 어떻게 적용할 수 있을까

이번 회차에서 당장 옮길 수 있는 카드는 `sizes=auto` 한 개다. PDP 캐러셀의 두 번째 슬라이드부터 시범 적용해 LCP가 어떻게 움직이는지, 빌드 시점 sizes 문자열 생성 로직을 얼마나 들어낼 수 있는지부터 측정한다. 효과가 확인되면 PLP 카드, 리뷰 썸네일 그리드처럼 스크롤 아래 영역으로 차례로 확장한다. CSS `content`/`image-set()` 조합은 캠페인 시즌 배너나 다크 모드 분기에서 마크업을 손대지 않고 자산만 갈아끼우는 운영 옵션으로 두면 된다. HTML-in-Canvas와 Rekindle은 지금은 북마크해두는 항목으로 보고, 다음 분기 디자인 시스템 회고나 접근성 점검 때 다시 꺼낸다.

###### 같이 보면 좋은 기술

- `loading="lazy"` — `sizes=auto`는 lazy-loaded `<img>`에서만 동작하므로, 어느 영역까지 lazy로 내릴지 정의가 선행되어야 한다.
- `srcset` / `<picture>` — `sizes=auto`가 후보 해상도를 고르는 입력 자체이므로 srcset 후보 폭 설계가 그대로 결과 품질을 결정한다.
- `prefers-color-scheme` — CSS `content`/`image-set()`로 다크 모드용 자산을 마크업 변경 없이 분기할 때 묶어 쓴다.
- `OffscreenCanvas` / `Canvas 2D` — HTML-in-Canvas가 안정화될 때 기존 캔버스 파이프라인과 어떻게 합쳐 쓸지 미리 그려두기 좋다.
