---
날짜: 2026-05-14
태그: Gotham Variable, 가변 서체, 타이포그래피, Monotype
국가: GLOBAL
카테고리: design/typography
직무 태그: 웹디자인, 웹DEV
출처 유형: news
출처: 한국디자인진흥원 디자인DB
출처 URL: https://www.designdb.com/?menuno=792&bbsno=40599&siteno=15&page=1&order=new&period=&act=view&ztag=rO0ABXQAOTxjYWxsIHR5cGU9ImJvYXJkIiBubz0iNTk3IiBza2luPSJwaG90b19iYnNfMjAxOSI%2bPC9jYWxsPg%3d%3d&writer=&search_type=&keyword=&key=community&sphereCode=
이미지: http://www.designdb.com/usr/upload/board_thumb/zboardphotogallery182/20260514101137460_6822.0.png
이미지 설명: 한국디자인진흥원 디자인DB, Gotham Variable 출시 소개 이미지
요약: Monotype이 고담(Gotham) 출시 25주년을 맞아 Weight·Width 두 축을 자유롭게 조정할 수 있는 가변 서체 Gotham Variable을 공개했다. 54종 스타일 추가, 베트남어 지원, 파일 구조 간소화로 브랜드 타이포그래피 시스템의 운용 방식이 달라진다.
---

## 고담이 가변 서체가 됐다 — Gotham Variable 출시와 브랜드 타이포그래피 파일 전략의 변화

##### 요약

- 2001년 1월 GQ 매거진 표지로 처음 공개된 고담(Gotham)이 25주년을 맞아 Gotham Variable로 전환됐다. Jonathan Hoefler와 Tobias Frere-Jones가 원설계하고, 이번 업데이트는 리드 디자이너 Sara Soskolne이 이끌었다.
- Weight(굵기)·Width(폭) 두 축을 독립적으로 조정할 수 있어, 고정 웨이트 파일 여러 개를 쌓아두던 방식 대신 단일 파일로 표현 범위를 다룰 수 있다.
- 패밀리에 54종의 새로운 스타일이 추가됐다. 기존 고담 패밀리를 쓰던 브랜드는 이번 확장으로 선택 가능한 무게·폭 조합이 크게 늘어났다.
- 베트남어 지원이 새로 들어갔다. 복합 발음 구별 기호(diacritical marks)와 성조 표기(tonal notation)를 고담의 구조 안에서 표현할 수 있게 됐다.
- 파일 구조를 간소화해 로딩 시간을 줄였다. Monotype은 이를 "One flexible typeface system"으로 설명하며, 여러 파일을 불러오던 기존 방식의 대안으로 제시했다.
- Netflix, Coca-Cola, USPS, Saturday Night Live, Barack Obama 2008년 캠페인 등이 대표적인 사용 브랜드다. Monotype Fonts™와 Monotype Connect™ 플랫폼에서 이용할 수 있다.

##### 디자인 인사이트

> 가변 서체 전환은 웹폰트 파일 수를 줄이는 선택이 아니라, 브랜드 타이포그래피 시스템을 어떻게 관리할 것인가에 대한 결정이다.

###### 왜 참고할 만한가

고담처럼 수십 년 역사를 가진 브랜드 서체가 가변 서체로 전환하는 일은 흔하지 않다. 이번 전환이 주목할 만한 이유는 기술 업그레이드보다 시스템 구조의 변화에 있다. 기존에는 Light·Regular·Medium·Bold 같은 고정 웨이트 파일을 용도별로 따로 불러왔다. Gotham Variable은 그 여러 파일을 하나의 가변 파일로 대체하면서, 브랜드가 실제 사용하는 웨이트·폭 조합을 훨씬 유연하게 정의할 수 있는 구조로 옮겨간다. 디자인 시스템 관점에서 보면, 서체 파일 수를 줄이는 동시에 허용 값의 범위를 더 세밀하게 통제할 수 있다는 뜻이다.

###### 어디에 적용할 수 있을까

웹폰트를 여러 벌 불러오는 랜딩 페이지나 상세 페이지에서 가변 서체를 검토할 시점이다. 특히 Light·Regular·Bold 세 가지 이상을 쓰는 브랜드 사이트나 디자인 시스템 문서에서는, 기존 고정 폰트 파일을 가변 서체 한 파일로 교체할 때 CSS `font-variation-settings`를 통해 Weight와 Width 축 값을 직접 지정해야 한다. 브랜드 캠페인 페이지나 에디토리얼 섹션처럼 타이포그래피 표현 폭이 중요한 영역에서는 Width 축을 활용해 같은 서체 안에서 Condensed에서 Extended까지 연속적인 폭 조정을 시도해볼 수 있다.

###### 디자인 관점

가변 서체 도입은 파일 수가 줄어드는 데서 끝나지 않는다. 디자인 시스템 안에서 어떤 Weight·Width 조합을 허용할 것인지 기준을 새로 잡아야 한다. 고정 파일 시절에는 서체 파일 목록 자체가 허용 범위를 제한했지만, 가변 서체는 이론적으로 무한한 조합을 허용한다. 그만큼 브랜드 가이드에 `font-weight` 허용 값과 `font-stretch` 범위를 명시적으로 정해두지 않으면, 조직 안에서 제각각 다른 조합을 쓰게 된다. Sara Soskolne이 "새 스타일이 고담의 정체성과 자연스럽게 통합되도록" 설계에 집중했다는 점을 고려하면, 무분별한 축 조합보다 브랜드 정의 범위 안에서의 유연성이 핵심이다.

###### 점검 질문

- 현재 서비스에서 불러오는 웹폰트 파일이 몇 가지인가? 가변 서체 한 파일로 통합했을 때 로딩 전략과 FOUT(Flash of Unstyled Text) 처리 방식이 어떻게 달라지는가?
- CSS `font-variation-settings`를 적용할 경우, 디자인 시스템 토큰에 Weight·Width 값을 어떤 단위로 정의할 것인가?
- 브랜드 가이드에 가변 서체의 허용 범위(최소·최대 Weight, 허용 Width 값)를 명시하지 않으면 디자이너와 개발자 사이에서 어떤 불일치가 생길 수 있는가?
