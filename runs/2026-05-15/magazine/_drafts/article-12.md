- 날짜: 2026-05-15
- 태그: corner-shape, CSS, border-radius, clip-path
- 국가: GLOBAL
- 카테고리: dev/css
- 직무 태그: 웹DEV 웹디자인
- 출처 유형: guide
- 출처: CSS-Tricks
- 출처 URL: https://css-tricks.com/using-css-corner-shape-for-folded-corners/
- 이미지: https://i0.wp.com/css-tricks.com/wp-content/uploads/2026/04/s_4309AEC000A3E54B3EAE7D9665BB7D541E09DE1556E769AE721013146BE52BD2_1775704329444_6.png
- 이미지 설명: CSS-Tricks 원문 대표 이미지, corner-shape bevel로 구현한 폴드 카드 데모
- 요약: CSS `corner-shape` 속성으로 `clip-path` 없이 두 좌표값만으로 접힌 모서리 효과를 구현하는 방법을 안내한다. 현재 Chrome 전용이며, 미지원 브라우저는 `border-radius` 폴백으로 처리된다.

### CSS `corner-shape`로 접힌 모서리 구현하기 — CSS-Tricks 가이드

##### 용어 설명

- `corner-shape`: `border-radius`가 만드는 모서리의 곡률 방식을 제어하는 CSS 속성. `round`(기본값, 곡선)나 `bevel`(직선 대각) 같은 값으로 모서리 형태를 바꾼다.
- 컨테이너 스타일 쿼리(container style queries): CSS 변수 값을 조건으로 삼아 스타일을 조건부 적용하는 기능. 이 글에서는 두 좌표값의 대소 관계에 따라 폴드 형태를 자동 조정하는 데 쓰인다.

##### 요약

- `border-radius`는 내부적으로 `corner-shape: round`를 포함하고 있다. 각 모서리는 x축·y축 두 좌표로 정의되며, `corner-shape`는 이 두 좌표 사이를 어떤 곡률로 연결할지 지정한다.
- `corner-top-right-shape: bevel`을 쓰면 두 좌표 사이에 직선이 그어져 대각 절단 형태가 만들어진다. 여기에 CSS 변수 `--x-coord`·`--y-coord`를 `border-top-right-radius`에 연결하면 폴드 크기를 코드 한 곳에서 조정할 수 있다.
- 접힌 면처럼 보이는 삼각형은 `::before` 가상 요소로 만든다. `background: inherit`으로 배경을 상속하고, `box-shadow`에 `calc((var(--x-coord) + var(--y-coord)) / 3)` 식으로 그림자 깊이를 좌표 비율에 맞춰 자동 계산한다.
- 컨테이너 스타일 쿼리의 범위 구문으로 `--x-coord < --y-coord` 조건을 분기해, 좌표 비율에 따라 `::before`의 `border-bottom-left-radius` 값을 `100% calc(100% - var(--x-coord))`와 `calc(100% - var(--y-coord)) 100%` 중 하나로 자동 전환한다. 이 분기가 없으면 좌표 비율이 달라질 때 폴드 삼각형의 형태가 어색하게 틀어진다.
- 브라우저 지원은 현재 Chrome 전용이다. Safari·Firefox에서는 `corner-shape`가 무시되고 `border-radius`만 남아 둥근 모서리로 폴백된다. 지금 당장 전 브라우저에서 동작해야 한다면 `clip-path` 방식이 현실적 대안이다.
- `min()` 함수로 `--x-coord`·`--y-coord` 값이 요소 크기를 초과하지 않도록 보호하면 반응형 환경에서 모서리가 깨지는 상황을 막을 수 있다.

##### 매거진 인사이트

> `clip-path` 좌표를 직접 계산하던 방식 대신, 두 CSS 변수만으로 폴드 형태 전체가 결정되는 구조다. 단, Chrome 단독 지원이라는 조건이 프로덕션 도입 시점을 결정하는 핵심 변수다.

###### 왜 지금 이 기능인가

배지·태그·카드 컴포넌트에서 접힌 모서리 효과를 내려면 지금까지는 `clip-path`에 다각형 좌표를 직접 적거나, SVG 마스크를 쓰는 방법이 일반적이었다. `clip-path` 방식은 좌표가 요소 크기에 고정되기 때문에, 크기나 콘텐츠가 바뀔 때마다 좌표를 다시 계산해야 했다. `corner-shape: bevel`은 `border-radius` 위에 올라타기 때문에 `%` 단위와 CSS 변수를 그대로 활용할 수 있고, 폴드 크기를 변수 두 개로 제어하는 구조로 정리된다. 컨테이너 스타일 쿼리와 결합하면 좌표 비율에 따른 형태 분기까지 CSS 안에서 처리된다.

###### 구현 관점

핵심 제약은 브라우저 지원 범위다. `corner-shape`는 현재 Chrome에서만 동작하며, Safari와 Firefox에서는 속성 자체가 무시된다. `border-radius` 폴백이 자동으로 작동하기 때문에 레이아웃이 깨지지는 않지만, 폴드 효과 자체는 보이지 않는다. 컴포넌트에 접힌 모서리가 시각적 기능이 아니라 브랜드 표현이나 정보 구분 역할을 한다면, Chrome 단독 지원 상태에서 프로덕션에 올릴 때 비Chrome 사용자가 어떤 화면을 보게 되는지 먼저 정의해야 한다. `@supports (corner-shape: bevel)`로 지원 여부를 분기해 미지원 환경에 `clip-path` 버전을 유지하는 방식도 이 글이 제안하는 경로다. `::before` 가상 요소에 `overflow: clip`과 `position: relative`를 함께 써야 삼각형이 카드 경계 밖으로 넘치지 않는다는 점도 구현 시 확인이 필요한 조건이다.

###### 실무에 어떻게 적용할 수 있을까

상품 카드·배지·태그처럼 접힌 모서리가 반복 등장하는 컴포넌트라면, 우선 내부 툴이나 크롬 한정 어드민 화면에서 `corner-shape` 버전을 시험해볼 수 있다. 변수 두 개(`--x-coord`, `--y-coord`)만 바꾸면 폴드 비율이 달라지는 구조이므로, 디자인 토큰과 연결하기 수월하다. 사용자 브라우저가 Chrome 위주로 집중된 B2B 어드민이나 내부 대시보드라면 도입 리스크가 낮다. 반면 퍼블릭 이커머스 상품 카드처럼 Safari 비율이 높은 환경이라면, `@supports` 분기로 `clip-path` 폴백을 유지한 채 점진 적용하는 방식이 현실적이다. 점검할 질문: 현재 서비스에서 접힌 모서리 효과를 쓰는 컴포넌트가 `clip-path`로 구현되어 있다면, 그 좌표가 요소 크기 변화에 따라 깨지는 케이스가 있는가? 있다면 `corner-shape` 전환이 유지보수 비용을 줄이는 경로가 될 수 있다.
