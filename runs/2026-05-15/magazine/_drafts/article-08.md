---
날짜: 2026-05-15
태그: CSS, attr(), calc(), Baseline
국가: GLOBAL
카테고리: dev/css
직무 태그: 웹DEV
출처 유형: blog_opinion
출처: CSS-Tricks
출처 URL: https://css-tricks.com/computing-and-displaying-discounted-prices-in-css/
이미지: https://i0.wp.com/css-tricks.com/wp-content/uploads/2026/04/s_7E3C7C97B7D8D52C02F5092EAFB87771069C4AA5BAFDB9C502DA16E57E7200D2_1776091945816_gsp-sale-prices.png
이미지 설명: CSS-Tricks 원문 대표 이미지 — CSS로 할인가를 계산하고 표시하는 예시 화면
요약: HTML `data-` 속성에 담긴 숫자를 CSS `attr()`, `calc()`, `mod()`, `round()`, `counter-set`만으로 읽어 할인가를 계산하고 달러 기호·소수점까지 포맷팅하는 방법을 단계별로 설명한다. `attr()` 타입 파싱은 아직 Baseline 미달성이며, 브라우저 전체 지원을 기다려야 실무에 쓸 수 있다.
---

### CSS `attr()`·`calc()`로 할인가를 직접 계산하고 포맷팅하기

##### 용어 설명

- **Baseline**: MDN과 여러 브라우저 벤더가 공동으로 정의하는 웹 기능 지원 상태 지표다. "Baseline 달성"은 Chrome·Firefox·Safari 등 주요 브라우저에서 모두 안정적으로 동작한다는 뜻이며, 달성 전 기능은 프로덕션 도입 시 폴백을 별도로 준비해야 한다.
- **`counter-set` / `content`**: CSS 카운터 속성으로 정수값을 저장하고, `content` 속성에서 해당 카운터를 문자열 형태로 렌더링하는 데 쓰인다.

##### 요약

- `attr(data-price number)` 문법처럼 HTML 데이터 속성을 숫자 타입으로 직접 파싱하는 기능은 `attr(<name> <type>)` 확장 명세에 해당한다. 기존 `attr()`은 `content` 속성에서만 동작했으나, 이 확장 명세는 어떤 CSS 속성에서도 속성값을 읽어올 수 있게 한다.
- 마크업은 `<div class="ott-price" data-price="7.99" data-discount="0.2">$7.99</div>` 형태로 원가와 할인율을 데이터 속성에 둔다. CSS에서는 `--n: calc(attr(data-price number) * (1 - attr(data-discount number)));`로 할인가를 바로 계산한다.
- 소수점 분리는 두 개의 수식으로 처리한다. `calc(round(down, var(--n)))`으로 정수 부분(달러)을 추출하고, `calc((mod(var(--n), 1)) * 100)`으로 소수 부분(센트)을 꺼낸다. `mod()`는 최근 Baseline을 달성했다.
- 가격 문자열 포맷팅은 `counter-set`과 `content`를 조합한다. 정수와 소수 부분을 각각 별도 카운터(`a`, `b`)에 저장한 뒤 `content: "\2000\2000$" counter(a) "." counter(b, decimal-leading-zero);`로 달러 기호·소수점 포함 문자열을 CSS만으로 만든다. CSS 카운터가 소수를 직접 다루지 못하는 제약을 이 방식으로 우회한다.
- `attr()` 타입 파싱 확장은 현재 Baseline 미달성이다. 글 작성 시점 기준으로 모든 브라우저에서 동작하지 않는다. `mod()`와 `round()`, `calc()`는 지원 범위가 넓다.

##### 매거진 인사이트

###### 왜 지금 이 기능인가

CSS 수학 함수군(`calc()`, `mod()`, `round()`)의 브라우저 지원 범위가 빠르게 넓어지면서, HTML 데이터 속성과 CSS 계산을 연결하는 `attr()` 타입 파싱이 다음 단계로 주목받고 있다. `mod()`가 최근 Baseline을 달성한 것이 이 글의 출발점이다. 아직 `attr()` 타입 파싱은 Baseline 미달성이지만, 지원이 확정되면 가격 표시처럼 JS로 처리하던 단순 계산 로직 일부를 CSS 레이어로 옮길 수 있는 가능성이 열린다. 브라우저 지원 일정을 caniuse나 MDN Baseline 추적 페이지로 주기적으로 확인해야 할 시점이다.

###### 구현 관점

현재 `attr()` 타입 파싱은 실험적 단계이므로, 상품 상세·목록 화면에 바로 적용하면 지원하지 않는 브라우저에서 가격이 표시되지 않는 장애로 이어진다. 폴백 전략이 필요하다. 소수점이 불필요한 정수 가격 표시라면 `counter-set: price calc(var(--n)); content: counter(price);`처럼 단순화할 수 있다. `mod()`와 `round()`는 이미 Baseline을 달성했으므로, 폴백 범위를 `attr()` 타입 파싱에 집중해 설계할 수 있다. 컴포넌트 단위로 기능 감지(`@supports`)를 붙여 `attr()` 지원 환경과 JS 계산 환경을 분기하는 방식이 현실적이다.

###### 실무에 어떻게 적용할 수 있을까

지금 당장 프로덕션 전환은 아직 이르다. 확인할 질문은 이렇다. 현재 상품 목록·상세에서 할인가를 JS나 서버 템플릿으로 계산해 렌더링하고 있다면, `attr()` Baseline 달성 이후 CSS 전환 시 어떤 컴포넌트가 영향을 받는지 미리 파악해 두었는가? `@supports`로 기능 감지를 조건부로 붙이는 방식으로 점진적 전환 경로를 설계할 수 있는 구조인가? 가격 포맷팅 로직이 여러 컴포넌트에 중복 분산되어 있다면, CSS 변수 기반으로 단일화해 두는 것이 나중 전환 비용을 줄이는 사전 정리가 된다.
