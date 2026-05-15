# 2026-05-15 수집/분류 브리프

이 파일은 자동 수집 결과입니다. 여기서는 채택/보류/제외, 제목 보정, 매거진 인사이트 작성을 하지 않습니다.

## AI 편집 기준

- [scripts/tracking/new_collection.py](scripts/tracking/new_collection.py)
- [docs/data-collection-strategy.md](docs/data-collection-strategy.md)
- [docs/service-digest-agent-prompt.md](docs/service-digest-agent-prompt.md)
- [docs/design-digest-agent-prompt.md](docs/design-digest-agent-prompt.md)
- [docs/dev-digest-agent-prompt.md](docs/dev-digest-agent-prompt.md)
- [docs/target-fit-classifier-agent.md](docs/target-fit-classifier-agent.md)
- [docs/editorial-style-guide.md](docs/editorial-style-guide.md)
- [docs/magazine-writing-standard.md](docs/magazine-writing-standard.md)

AI 편집 단계에서 할 일:

- `scripts/tracking/new_collection.py`의 카테고리별 관찰 포인트와 DEV 필수 수집 원칙을 읽습니다.
- `docs/data-collection-strategy.md` 기준으로 후보 발견 출처와 최종 기준 원문을 분리합니다.
- `docs/target-fit-classifier-agent.md` 기준으로 후보를 `core_ecommerce / commerce_adjacent / design_dev_reference / weak_promo / exclude`로 먼저 분류합니다.
- `docs/editorial-style-guide.md` 기준으로 타겟이 궁금해할 정보만 남깁니다.
- 각 후보를 `채택 / 보류 / 제외`로 판단하고 사유를 남깁니다.
- 최종 원고 작성 기준 후보는 이커머스 core 후보를 최우선으로 20~30개 사이 `shortlist-20-30.md`에 정리합니다.
- `shortlist-20-30.md`는 다시 4~7개로 줄이는 예비 목록이 아니라, 원문 검증 후 그대로 `magazine-report.md`로 작성할 기준 목록입니다.
- 카드 제휴, 쿠폰/e쿠폰, 콘텐츠 제휴, 외부 AI 연동, 멤버십 프로모션은 원문에서 화면·플로우·정책 변화가 확인될 때만 채택합니다.
- Service 후보는 `왜 웹서비스 전문가가 주목해야 하는지`와 `우리 서비스에 적용할 때 고려할 화면·정책·플로우 조건`이 둘 다 보일 때만 채택합니다.
- `혜택 조건을 쉽게`, `결제 후 다음 거래`, `추천을 안전하게 연결`처럼 어느 서비스에도 붙는 일반론만 남는 후보는 제외합니다.
- 같은 브랜드 후보가 많을 때는 AI 편집 단계에서 독자 가치가 큰 항목 최대 2개만 채택합니다.
- shortlist 항목 중 원문 부족, 광고성, 화면·서비스·구현 변화 미확인 항목만 제외 메모로 옮기고, 통과 항목은 `magazine-report.md`로 작성한 뒤 Notion 업로드를 진행합니다.

## 수집 요약

- 전체 수집: 97
- AI 검토 후보: 66
- 자동 제외: 31

### 원자료 파일

- runs/2026-05-15/raw/service-articles.json
- runs/2026-05-15/raw/design-articles.json
- runs/2026-05-15/raw/dev-articles.json

### 수집 리포트 파일

- runs/2026-05-15/raw/service-fetch-report.json
- runs/2026-05-15/raw/design-fetch-report.json
- runs/2026-05-15/raw/dev-fetch-report.json

### 대분류별 수집 수

- Design: 26
- DEV: 12
- Service: 59

### 타겟 판정별 수

- commerce_adjacent: 6
- core_ecommerce: 2
- design_dev_reference: 38
- exclude: 31
- weak_promo: 20

## Service

### 01. [신세계그룹 뉴스룸] 스타벅스, ‘한국의 미(美)’ 재해석한 ‘코리아 라온’ 상품 3종 출시

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: core_ecommerce
- shortlist 우선순위: P0
- 적합성 메모: 상품 탐색, 구매, 결제, 멤버십, 리뷰, 추천 등 이커머스 여정에 직접 연결되는 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 신세계그룹 뉴스룸
- 후보 발견 URL: https://www.shinsegaegroupnewsroom.com/starbucks-korea-raon-new-merchandise-collection-5/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: commerce_core
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2026/05/20260514-%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4-%EC%82%AC%EC%A7%84%EC%9E%90%EB%A3%8C4_%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4-%E2%80%98%ED%95%9C%EA%B5%AD%EC%9D%98-%EB%AF%B8%E7%BE%8E-%EC%9E%AC%ED%95%B4%EC%84%9D%ED%95%9C-%E2%80%98%EC%BD%94%EB%A6%AC%EC%95%84-%EB%9D%BC%EC%98%A8-%EC%83%81%ED%92%88-3%EC%A2%85-%EC%B6%9C%EC%8B%9C.jpg

스타벅스, ‘한국의 미(美)’ 재해석한 ‘코리아 라온’ 상품 3종 출시

### 02. [오늘의집 뉴스룸] “멀리 가지 않아도 만나는 전국의 취향”... 오늘의집, 전국 로컬 애착템 144종 모은 ‘로컬의 선택’ 기획전 진행

- 날짜: 2026-05-10
- 대분류: Service
- 카테고리: lifestyle_commerce
- 타겟 적합성: core_ecommerce
- shortlist 우선순위: P0
- 적합성 메모: 상품 탐색, 구매, 결제, 멤버십, 리뷰, 추천 등 이커머스 여정에 직접 연결되는 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 오늘의집 뉴스룸
- 후보 발견 URL: https://ohstory.io/press/pressrelease/15331
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: commerce_core, search_discovery
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://ohstory.io/wp-content/uploads/2026/05/%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-%EB%B3%B4%EB%8F%84%EC%9E%90%EB%A3%8C-%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-%EC%A0%84%EA%B5%AD-%EB%A1%9C%EC%BB%AC-%EC%95%A0%EC%B0%A9%ED%85%9C-144%EC%A2%85-%EB%AA%A8%EC%9D%80-%E2%80%98%EB%A1%9C%EC%BB%AC%EC%9D%98-%EC%84%A0%ED%83%9D-%EA%B8%B0%ED%9A%8D%EC%A0%84-%EC%A7%84%ED%96%89.png

‘멀리 가지 않아도, 로컬 애착템 144’라는 서브타이틀로 진행되는 이번 오늘의집 &#039;로컬의 선택&#039; 캠페인은 단순한 지역 특산품 판매를 넘어 ‘로컬’ 자체를 하나의 브랜딩 및 큐레이션 기준으로 제안하는 것이 특징이다.

### 03. [쿠팡 뉴스룸] 날개를 달아주는 사람들, 쿠팡 애즈 SMB 팀 인터뷰

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: commerce_adjacent
- shortlist 우선순위: P1
- 적합성 메모: 이커머스가 아니어도 신뢰, 결제, 추천, 운영 UX처럼 고객 여정에 대입 가능한 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 쿠팡 뉴스룸
- 후보 발견 URL: https://news.coupang.com/archives/62238/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: seller_operation
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://news.coupang.com/wp-content/uploads/2026/05/coupang-ads-smb-team-employee-interview-260513-01-e1778721524657.jpg

쿠팡 애즈 SMB(중소상공인) 팀을 만났습니다. 광고, 마케팅은 물론, 포지셔닝, 마진율, 상세 페이지, 재고 관리까지. 쿠팡 광고, 마케팅 전문가들이 잠재력 있는 중소상공인 판매자에게 맞춤 컨설팅을 해드립니다.

### 04. [당근 보도자료] 당근마켓, 공공-지역주민 소통채널 '공공프로필' 출시

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: commerce_adjacent
- shortlist 우선순위: P1
- 적합성 메모: 이커머스가 아니어도 신뢰, 결제, 추천, 운영 UX처럼 고객 여정에 대입 가능한 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EA%B3%B5%EA%B3%B5%ED%94%84%EB%A1%9C%ED%95%84-%EC%B6%9C%EC%8B%9C/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: review_trust
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/c4bd4dfb-5713-4ae7-8154-ad737ee588f2_%EA%B3%B5%EA%B3%B5%ED%94%84%EB%A1%9C%ED%95%84_%EB%B3%B4%EB%8F%84%EC%9E%90%EB%A3%8C_%EC%9D%B4%EB%AF%B8%EC%A7%80_01.jpg?auto=compress%2Cformat&rect=0%2C2%2C1440%2C810&w=1200&h=630&fit=max&q=100&fm=png

지역 공공기관-주민간 전용 소통 채널 ‘공공프로필’ 베타 서비스 오픈

### 05. [당근 보도자료] 당근마켓, 음식별 현지인 추천 맛집 많은 동네 순위 공개

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: commerce_adjacent
- shortlist 우선순위: P1
- 적합성 메모: 이커머스가 아니어도 신뢰, 결제, 추천, 운영 UX처럼 고객 여정에 대입 가능한 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EB%8B%B9%EA%B7%BC%EC%A7%80%EB%8F%84-%EB%A7%9B%EC%A7%91/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: search_discovery
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/e54d105b-e90e-4b89-8899-4407ff8f3211_prthumb_05.png?auto=compress%2Cformat&rect=0%2C0%2C3841%2C2161&w=1200&h=630&fit=max&q=100&fm=png

당근마켓, 당근지도에 등록된 현지민 추천 식당 데이터 분석… 한국인이 사랑하는 대표 음식별 추천 맛집 밀집 지역 순위 집계

### 06. [당근 보도자료] 당근마켓, 당근이 웹툰 ‘당근이당' 1화 공개

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: commerce_adjacent
- shortlist 우선순위: P1
- 적합성 메모: 이커머스가 아니어도 신뢰, 결제, 추천, 운영 UX처럼 고객 여정에 대입 가능한 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EB%8B%B9%EA%B7%BC%EC%9D%B4-%EC%9B%B9%ED%88%B0-%EB%8B%B9%EA%B7%BC%EC%9D%B4%EB%8B%B9-1%ED%99%94-%EA%B3%B5%EA%B0%9C/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: review_trust
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/2a2cef46-2267-4bfd-be5e-57e16a7ca175_PR_daangnitoon+%EB%B3%B5%EC%82%AC.jpg?auto=compress%2Cformat&rect=0%2C2%2C1440%2C810&w=1200&h=630&fit=max&q=100&fm=png

당근이 공식 비즈프로필 및 인스타그램 채널 오픈.. 다양한 콘텐츠로 이용자와 소통하는 창구 될 것

### 07. [오픈서베이 블로그] 일본 Z세대 트렌드 리포트 2026

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: research
- 타겟 적합성: commerce_adjacent
- shortlist 우선순위: P1
- 적합성 메모: 이커머스가 아니어도 신뢰, 결제, 추천, 운영 UX처럼 고객 여정에 대입 가능한 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: 오픈서베이 블로그
- 후보 발견 URL: https://blog.opensurvey.co.kr/trendreport/generationz-jp-ko-2026/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: research_signal
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: https://blog.opensurvey.co.kr/wp-content/uploads/2026/05/26_thumbnail_trendreport_JP_01.png

워라밸·보상·자기이해까지, 일본 Z세대가 불확실한 시대를 헤쳐나가는 방식을 소비·가치관·관심사 데이터로 확인하세요.

### 08. [오픈서베이 블로그] 오피스텔 자취러는 왜 오늘의집을 선택할까? 거주 형태별로 달라지는 청년 1인가구 소비 트렌드

- 날짜: 2026-05-11
- 대분류: Service
- 카테고리: research
- 타겟 적합성: commerce_adjacent
- shortlist 우선순위: P1
- 적합성 메모: 이커머스가 아니어도 신뢰, 결제, 추천, 운영 UX처럼 고객 여정에 대입 가능한 후보입니다.
- 직무 태그: 웹서비스기획
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: 오픈서베이 블로그
- 후보 발견 URL: https://blog.opensurvey.co.kr/article/youth-soloeconomy-2026-2/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: research_signal
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: https://i0.wp.com/blog.opensurvey.co.kr/wp-content/uploads/2026/05/26_thumbnail_article_10.png?fit=1400%2C1400&ssl=1

독립 1년차와 10년차의 소비는 얼마나 다를까요? 오피스텔 자취러는 왜 가전도 오늘의집에서 구매할까요? 독립 기간·거주 형태·성별로 갈리는 청년 1인가구 소비 트렌드를 데이터로 풀어냅니다.

### 09. [신세계그룹 뉴스룸] SSG닷컴, 소상공인 동반성장 사업설명회 성료… “데이터 기반 ‘성장 방정식’ 제안한다”

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 신세계그룹 뉴스룸
- 후보 발견 URL: https://www.shinsegaegroupnewsroom.com/ssg-com-successfully-concludes-business-briefing-for-shared-growth-with-small-business-owners/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: seller_operation
- 위험 단서 태그: offline_only, business_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2026/05/NR_Press_List-85.png

SSG닷컴이 입점 소상공인을 만나 동반성장을 위한 계획을 공유하는 시간을 가졌다. 올해는 판매 데이터에 기반해 최적화된 매출 확대 전략을 제안할 방침이다. SSG닷컴은 13일 오후 신세계남산 트리니티홀에서 ‘소상공인 동반성장 사업설명회’를 진행했다고 15일 밝혔다. 이날 행사에서는 중소벤처기업부, 한국중소벤처기업유통원과 함께 운영하는 ‘온라인 브랜드 소상공인 육성사업(TOPS)’과 ‘소상공인

### 10. [신세계그룹 뉴스룸] 여름 휴가 준비 빨라졌다… W컨셉, ‘바캉스룩’ 매출 전년비 40% ‘껑충’

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 신세계그룹 뉴스룸
- 후보 발견 URL: https://www.shinsegaegroupnewsroom.com/w-concepts-vacation-look-sales-jump-40-year-on-year/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: commerce_core
- 위험 단서 태그: business_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2026/05/NR_Press_List-84.png

패션 플랫폼 W컨셉이 본격적인 여름철을 앞두고 얼리 휴가족이 증가하면서 바캉스룩 수요가 급증하고 있다고 15일 밝혔다. W컨셉이 이달 1일부터 14일까지 2주간 판매 데이터를 분석한 결과, 수영복, 비치타월 등 바캉스 관련 상품 매출이 전년 동기 대비 40% 신장했다. 예년보다 일찍 찾아온 더위와 함께

### 11. [신세계그룹 뉴스룸] 고환율도 비켜갔다…”해외보다 싼 와인” 이마트, 상반기 최대 규모 ‘와인장터’ 개최

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 신세계그룹 뉴스룸
- 후보 발견 URL: https://www.shinsegaegroupnewsroom.com/e-mart-hosts-largest-wine-market-of-the-first-half/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: weak_promo, offline_only, business_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2026/05/NR_Press_List-82.png

이마트가 5월 20일(수)까지 상반기 최대 규모 와인 할인 행사인 ‘와인장터’를 진행한다. 이마트 와인 매출은 2025년 한 해 동안 2024년 대비 약 4% 신장하며 성장세를 보였다. 와인 수요가 꾸준히 확대되는 가운데, 이마트는 고환율로 커진 고객 부담을 낮추기 위해 대규모 할인 행사에

### 12. [신세계그룹 뉴스룸] 고기, 과일, 와인까지&#8230; 이마트와 호주가 만났다! 이마트, 호주 대표 먹거리 최대 50% 할인

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 신세계그룹 뉴스룸
- 후보 발견 URL: https://www.shinsegaegroupnewsroom.com/e-mart-offers-up-to-50-off-popular-australian-foods/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: commerce_core, payment_checkout
- 위험 단서 태그: weak_promo, offline_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2026/05/NR_Press_List-81.png

이마트가 5월 14일(목)부터 5월 20일(수)까지 ‘호주 페스티벌’ 행사를 열고, 양고기, 소고기, 와인 등 호주산 인기 품목을 최대 50% 할인한다. 먼저 호주산 프리미엄 양고기는 행사카드 결제 시, 20% 할인 판매한다. 대표 상품인 ‘블랙 램’은 얼굴과 귀, 다리가 검은색인 ‘햄프셔 다운’ 품종으로

### 13. [신세계그룹 뉴스룸] K-웰니스 아이템 쟁여둘 타이밍&#8230;’자주 장날’로 장보러 오세요

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 신세계그룹 뉴스룸
- 후보 발견 URL: https://www.shinsegaegroupnewsroom.com/come-shop-at-jaju-market-day/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: commerce_core
- 위험 단서 태그: weak_promo, offline_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2026/05/NR_Press_List-80.png

(주)신세계까사의 라이프스타일 브랜드 ‘자주(JAJU)’가 오는 27일까지 자주의 인기 제품을 할인 판매하는 ‘자주 장날’ 행사를 연다. 자주 장날은 자주가 연 2회 진행하는 대규모 할인 행사로 패션 ∙ 잡화부터 뷰티 ∙ 생활용품 ∙ 주방용품 등 약 200여종의 인기 상품들을 최대 30% 할인된

### 14. [컬리 뉴스룸] “성장&수익성 다 잡았다”…컬리, 1분기 매출 28%↑, 영업이익 13배 ‘껑충’

- 날짜: 2026-05-11
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 컬리 뉴스룸
- 후보 발견 URL: https://newsroom.kurlycorp.com/kurly-2026-1q-earnings-call/?utm_source=rss&utm_medium=rss&utm_campaign=kurly-2026-1q-earnings-call
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: business_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://img-newsroom.kurlycorp.com/wp-content/uploads/2026/05/%EA%B7%B8%EB%9E%98%ED%94%841-%EC%84%B1%EC%9E%A5%EC%88%98%EC%9D%B5%EC%84%B1-%EB%8B%A4-%EC%9E%A1%EC%95%98%EB%8B%A4%E2%80%A6%EC%BB%AC%EB%A6%AC-1%EB%B6%84%EA%B8%B0-%EB%A7%A4%EC%B6%9C-28%E2%86%91-%EC%98%81%EC%97%85%EC%9D%B4%EC%9D%B5-13%EB%B0%B0-%E2%80%98%EA%BB%91%EC%B6%A9-1.jpg

리테일 테크 기업 컬리가 올 1분기에 전년 동기 대비 13배 증가한 영업이익을 거두며 창사 이래 분기 최대 실적을 기록했다. 업계 평균 성장률을 뛰어넘는 압도적 성장과 함께 수익성도 대폭 개선됐다. 컬리는 26년 1분기에 지난해 같은 기간 대비 28.4% 증가한 매출(이하 연결기준) 7

### 15. [Spotify Newsroom] Spotify Brings Nashville’s Songwriting Community Together for Mental Health Summit &#8212; Spotify

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: global_service_ux
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: Spotify Newsroom
- 후보 발견 URL: https://newsroom.spotify.com/2026-05-14/nashville-songwriting-mental-health-summit/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://storage.googleapis.com/pr-newsroom-wp/1/2026/05/HEADER-247928374-scaled.jpg

Spotify recently welcomed songwriters, artists, executives, and music students to Nashville for a Mental Health & Songwriter Summit. The event was an extension of our ongoing Heart & Soul, Mental Health for Creators initiative, which offers tools, care, and space to reflect on the emotional side of creative life. The summit at Belmont University’s Fisher...

### 16. [Spotify Newsroom] It’s Your Party of the Year(s): A Look Back at Your Entire Music History on Spotify &#8212; Spotify

- 날짜: 2026-05-12
- 대분류: Service
- 카테고리: global_service_ux
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: Spotify Newsroom
- 후보 발견 URL: https://newsroom.spotify.com/2026-05-12/spotify-20-personal-music-retrospective/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: search_discovery
- 위험 단서 태그: business_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://storage.googleapis.com/pr-newsroom-wp/1/2026/05/SPT20_FTR_Header_Anim_1440x820-2348729587394857.gif

Spotify is where fans and artists come together, turning discovery into something personal, moments into movements, and listening into community. To celebrate 20 years, we’ve been revealing surprising insights into our collective listening habits. And now, we’re capping off the festivities with a special gift just for you. Meet Spotify 20: Your Party of the…

### 17. [Spotify Newsroom] Pelo Spotify, artistas brasileiros geraram aproximadamente R$ 2 bilhões em royalties em 2025 &#8212; Spotify

- 날짜: 2026-05-11
- 대분류: Service
- 카테고리: global_service_ux
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: Spotify Newsroom
- 후보 발견 URL: https://newsroom.spotify.com/2026-05-11/artistas-brasileiros-alto-e-claro/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: business_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://storage.googleapis.com/pr-newsroom-wp/1/2026/03/LC26-16x9-1-1024x576.png

Pela primeira vez na história, o Brasil figura entre os oito maiores mercados de música gravada do mundo, de acordo com o Relatório Global de Música da IFPI 2026. Isso é o reflexo de décadas de talento, de uma indústria que soube se reinventar e de um ecossistema que está produzindo, distribuindo e exportando música...

### 18. [당근 보도자료] 당근마켓-공정위 MOU 체결

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-x-%EA%B3%B5%EC%A0%95%EC%9C%84-%EA%B1%B4%EA%B0%95%ED%95%9C-c2c-%EC%83%9D%ED%83%9C%EA%B3%84-%EC%A1%B0%EC%84%B1-%EB%A7%9E%EC%86%90/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: partnership_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/dd4d0e6c-db8b-4391-b365-73e91bb62c78_image+%285%29.png?auto=compress%2Cformat&rect=146%2C0%2C3193%2C1796&w=1200&h=630&fit=max&q=100&fm=png

더욱 강력한 이용자 안전망 구축 나선다

### 19. [당근 보도자료] 당근마켓 캐릭터 ‘당근이' 공식 채널 오픈 기념, 단골 이웃 시루떡 돌리기 이벤트 진행

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EC%9D%B4%EA%B0%80-%EC%9D%B4%EC%9B%83%EB%93%A4%EA%B3%BC-%EC%8B%9C%EB%A3%A8%EB%96%A1%EC%9D%84-%EB%82%98%EB%88%A0%EC%9A%94/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/df142c5d-07b7-4f00-89e8-b2f939b148f1_%5B%EC%9D%B4%EB%AF%B8%EC%A7%801%5D+%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93_+%E2%80%98%EB%8B%B9%EA%B7%BC%EC%9D%B4%EA%B0%80+%EC%8B%9C%EB%A3%A8%EB%96%A1+%EB%8F%8C%EB%A6%B0%EB%8B%B9%E2%80%99+%EC%9D%B4%EB%B2%A4%ED%8A%B8+%EC%A7%84%ED%96%89.jpg?auto=compress%2Cformat&rect=0%2C9%2C5760%2C3240&w=1200&h=630&fit=max&q=100&fm=png

당근이 공식 채널 활성화 기념 ‘당근이가 시루떡 돌린당’ 이벤트 개최

### 20. [당근 보도자료] 당근마켓, ‘대박집 비법노트 공유’ 이벤트 진행

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EB%8B%B9%EA%B7%BC%EB%B9%84%EC%A6%88%EB%8B%88%EC%8A%A4-%EB%8F%99%EB%84%A4%EA%B0%80%EA%B2%8C/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/d2622aa5-85bd-40b8-b32f-e378fd371422_%5B%ED%81%AC%EA%B8%B0%EB%B3%80%ED%99%98%5D%5B%EC%9D%B4%EB%AF%B8%EC%A7%801%5D+%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93_+%E2%80%98%EB%B9%84%EB%B2%95%EB%85%B8%ED%8A%B8+%EA%B3%B5%EC%9C%A0%E2%80%99+%EC%9D%B4%EB%B2%A4%ED%8A%B8+%EC%A7%84%ED%96%89.jpg?auto=compress%2Cformat&rect=0%2C0%2C560%2C315&w=1200&h=630&fit=max&q=100&fm=png

당근마켓, 오는 6월 25일(월)까지 동네 가게 사장님들에게 도움주는 ‘대박집 비법노트 공유’ 이벤트 진행

### 21. [당근 보도자료] 당근마켓, 세계 환경의 날 맞아 ‘당근 사생대회’ 연다

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EC%84%B8%EA%B3%84-%ED%99%98%EA%B2%BD%EC%9D%98-%EB%82%A0-%EB%A7%9E%EC%95%84-%EB%8B%B9%EA%B7%BC-%EC%82%AC%EC%83%9D%EB%8C%80%ED%9A%8C-%EC%97%B0%EB%8B%A4/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/75499191-f93b-4b02-b025-e975feb92d10_PR_%E1%84%92%E1%85%AA%E1%86%AB%E1%84%80%E1%85%A7%E1%86%BC%E1%84%8B%E1%85%B4%E1%84%82%E1%85%A1%E1%86%AF2023.jpg?auto=compress%2Cformat&rect=0%2C0%2C1920%2C1080&w=1200&h=630&fit=max&q=100&fm=png

내가 생각하는 나눔을 주제로 이벤트 개최

### 22. [당근 보도자료] 당근알바, 동네 가게 사장님 위한 당근알바 공유 이벤트

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94-%EB%8F%99%EB%84%A4-%EA%B0%80%EA%B2%8C-%EC%82%AC%EC%9E%A5%EB%8B%98-%EC%9C%84%ED%95%9C-%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94-%EA%B3%B5%EC%9C%A0-%EC%9D%B4%EB%B2%A4%ED%8A%B8/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: seller_operation
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/ca81388c-4142-4f6c-833d-62c63294db9d_%5B%EC%9D%B4%EB%AF%B8%EC%A7%801%5D+%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94_+%27%EB%8F%99%EB%84%A4+%EA%B0%80%EA%B2%8C+%EC%82%AC%EC%9E%A5%EB%8B%98+%EC%9C%84%ED%95%9C+%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94+%EA%B3%B5%EC%9C%A0%27+%EC%9D%B4%EB%B2%A4%ED%8A%B8+%EC%A7%84%ED%96%89.jpg?auto=compress%2Cformat&rect=0%2C0%2C1440%2C810&w=1200&h=630&fit=max&q=100&fm=png

이벤트 초대 링크 통해 첫 구인공고 글 올리면, 광고 지원금 3만 원 받을 수 있어

### 23. [당근 보도자료] 당근마켓, ‘당근비즈니스’ 공식 유튜브 ‘사장님이 해냄’ 출연자 모집!

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EB%8B%B9%EA%B7%BC%EB%B9%84%EC%A6%88%EB%8B%88%EC%8A%A4-%EC%82%AC%EC%9E%A5%EB%8B%98%EC%9D%B4%ED%95%B4%EB%83%84/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/e63581b6-4e2b-4a30-a1fb-94092665785a_prthumb_03.png?auto=compress%2Cformat&rect=0%2C0%2C3841%2C2161&w=1200&h=630&fit=max&q=100&fm=png

당근마켓, 오는 5월 16일까지 당근비즈니스 유튜브 내 ‘사장님이 해냄’ 시리즈 출연자 모집 이벤트 진행

### 24. [당근 보도자료] 당근마켓, 광주 광산구와 업무협약 체결

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EA%B4%91%EC%A3%BC-%EA%B4%91%EC%82%B0%EA%B5%AC%EC%99%80-%EC%97%85%EB%AC%B4%ED%98%91%EC%95%BD-%EC%B2%B4%EA%B2%B0/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: partnership_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/5b715544-e108-4155-bb23-db33967b6678_%5B%EC%9D%B4%EB%AF%B8%EC%A7%802%5D+%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93_+%EA%B4%91%EC%A3%BC+%EA%B4%91%EC%82%B0%EA%B5%AC%EC%99%80+%EC%97%85%EB%AC%B4%ED%98%91%EC%95%BD+%EC%B2%B4%EA%B2%B0.jpg?auto=compress%2Cformat&rect=0%2C156%2C3000%2C1688&w=1200&h=630&fit=max&q=100&fm=png

당근마켓 X 광주 광산구 MOU 체결, 공공 일자리 연결 활성화

### 25. [당근 보도자료] 당근마켓 X 에스알, 승차권 부정 거래 방지 협약 체결

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-x-%EC%97%90%EC%8A%A4%EC%95%8C-%EC%8A%B9%EC%B0%A8%EA%B6%8C-%EB%B6%80%EC%A0%95-%EA%B1%B0%EB%9E%98-%EB%B0%A9%EC%A7%80-%ED%98%91%EC%95%BD-%EC%B2%B4%EA%B2%B0/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: partnership_only
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/8f0b0243-567e-4e77-94da-3bb30ef5ac81_%E1%84%86%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A1%E1%84%8C%E1%85%B5%E1%86%AB.JPG?auto=compress%2Cformat&fit=max&q=100&w=1200&h=630&fm=png

올바른 승차권 거래 문화 조성 위해 상호 협력

### 26. [당근 보도자료] 당근마켓, 광고캠페인 진행… 동네 자영업자·마케터 대상 이벤트도

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EB%8B%B9%EA%B7%BC%EA%B4%91%EA%B3%A0-%EC%82%AC%EC%9E%A5%EB%8B%98%EC%9D%B4%ED%95%B4%EB%83%84-%EB%B9%84%EC%A6%88%ED%94%84%EB%A1%9C%ED%95%84/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: seller_operation
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/1386322e-ee07-47c8-a393-6422ab683d1f_%5B%EC%9D%B4%EB%AF%B8%EC%A7%801%5D+%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93_+%E2%80%98%EB%8B%B9%EA%B7%BC%EC%97%90+%EA%B4%91%EA%B3%A0%ED%96%88%EC%9D%84+%EB%BF%90%EC%9D%B8%EB%8D%B0%E2%80%99+%EC%BA%A0%ED%8E%98%EC%9D%B8+%EC%A7%84%ED%96%89.jpg?auto=compress%2Cformat&rect=0%2C54%2C580%2C326&w=1200&h=630&fit=max&q=100&fm=png

당근마켓, 오는 4월 12일까지 ‘당근에 광고했을 뿐인데’ 캠페인 진행… 영상 공개와 풍성한 이벤트 선보여

### 27. [당근 보도자료] 당근알바, ‘사업자 인증’ 프로모션 진행

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 제휴, 프로모션, 쿠폰, 콘텐츠/AI 연동 성격이 강합니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94-%EC%82%AC%EC%97%85%EC%9E%90-%EC%9D%B8%EC%A6%9D-%ED%94%84%EB%A1%9C%EB%AA%A8%EC%85%98-%EC%A7%84%ED%96%89/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: review_trust
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/a6e00f85-17e9-4cc2-9a3b-5f27e9c0ab56_prthumb_04.png?auto=compress%2Cformat&rect=0%2C5%2C2880%2C1620&w=1200&h=630&fit=max&q=100&fm=png

에 발맞춰 ‘사업자 인증’ 프로모션 실시

### 28. [당근 보도자료] 당근마켓, ‘알바 지원금 받기’ 이벤트 진행

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: weak_promo
- shortlist 우선순위: 제외 검토
- 적합성 메모: 수집 단계에서 제휴, 오프라인, 실적, 채용/ESG 등 위험 단서가 감지됐습니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EC%95%8C%EB%B0%94-%EC%A7%80%EC%9B%90%EA%B8%88-%EB%B0%9B%EA%B8%B0-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EC%A7%84%ED%96%89/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/cae8a49b-3d6f-4d6f-84e8-eff7d25d07a8_%5B%EC%9D%B4%EB%AF%B8%EC%A7%801%5D+%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93_+%E2%80%98%EC%95%8C%EB%B0%94+%EC%A7%80%EC%9B%90%EA%B8%88+%EB%B0%9B%EA%B8%B0%E2%80%99+%EC%9D%B4%EB%B2%A4%ED%8A%B8+%EC%A7%84%ED%96%89.jpg?auto=compress%2Cformat&rect=0%2C2%2C1440%2C810&w=1200&h=630&fit=max&q=100&fm=png

지역 기반 구인구직 서비스 당근알바, 3월 10일(금)까지 ‘알바 지원금 받기’ 이벤트 실시

## Design

### 01. [Canva Newsroom] Canva study: AI is in. Now comes the hard part – earning consumer trust

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: ai
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: Canva Newsroom
- 후보 발견 URL: https://www.canva.com/newsroom/news/marketing-ai-report-2026/
- 최종 기준 원문 필요: no
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: design_ai_workflow
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://content-management-files.canva.com/0fbce1a1-4a6a-470f-9212-4e6c59a09f84/MarketingAIReport2026.png

Canva’s 2026 State of Marketing & AI report finds AI now standard in marketing, but consumer trust, authenticity, and transparency are becoming the real challenge.

### 02. [It's Nice That] More of the same: how creative rituals can help you break free from the idea echo chamber

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: ai
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: It's Nice That
- 후보 발견 URL: https://www.itsnicethat.com/features/more-of-the-same-creative-routines-in-depth-everyday-edition-140526
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: visual_trend, design_ai_workflow
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://admin.itsnicethat.com/images/Oj_HTr6TopT8UBQ9lgLfuDJte4U=/277546/width-1440%7Cformat-jpeg/INT_InDepth_Meta_u9ofoRy.png

Why inspiration feels harder to come by and how three types of creative ritual could be our strongest defence against the slow erosion of taste, attention, and intention.

### 03. [It's Nice That] Most creative work is made to a brief – so is fake art in film actually ‘fake’?

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: ai
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: It's Nice That
- 후보 발견 URL: https://www.itsnicethat.com/articles/the-christophers-barnaby-gorton-film-art-gary-grimes-culture-column-140526
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: design_ai_workflow
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://admin.itsnicethat.com/images/6euSpW52GBD_p14MpZt14N7eU9Q=/278175/width-1440/CHRIS_POSTER_LARGE.webp

The Christophers, a new Ian McKellan-starring film includes 16 ‘fake’ artworks by painter Barnaby Gorton. Our culture columnist Gary Grimes argues that this body of work isn’t so different from the pieces that hang in our galleries.

### 04. [Land-book] ChatLabs — AI Product Photography & Brand Creative Studio on Landbook

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: ai
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: Land-book
- 후보 발견 URL: https://land-book.com/websites/94720-chatlabs-ai-product-photography-and-brand-creative-studio
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: web_reference, look_and_feel, brand_expression, visual_reference, design_ai_workflow
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://cdn.land-book.com/website/94720/94720-chatlabs-ai-product-photography-and-brand-1778745048-og-image.webp

ChatLabs — AI Product Photography & Brand Creative Studio on Landbook - get inspired by landing design and more

### 05. [The Brand Identity] The Brand Identity – Home of the Greatest in Graphic & Brand Design

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: ai
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: The Brand Identity
- 후보 발견 URL: https://the-brandidentity.com/project/saint-urbains-identity-emmy-squared-pizza-revolves-around-strange-little-pizza-cannibals
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: look_and_feel, brand_expression, visual_reference, design_ai_workflow
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://the-brandidentity.com/uploads/articles/2021/02/saint-urbains-identity-emmy-squared-pizza-revolves-around-strange-little-pizza-cannibals/EmmyPizza-SaintUrbain-6.jpg

Launched in New York in 2016 as an extension of Emily and Matthew Hyland’s Pizza Loves Emily family of restaurants, Emmy Squared Pizza is the duo’s take on classic Detroit-stye pizza – a rectangular-shaped cousin of the traditional circular base we know and love with a crispy bottom, fluffy dough, cheesy ‘frico’ crust and stripes of sauce. The restaurant ch…

### 06. [DesignDB - Design News] 국가유산 콘텐츠 세계 무대서 통했다… ‘iF 디자인 어워드’·‘K-디자인 어워드’ 동시 수상

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_design_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: reference
- 후보 발견 출처: DesignDB - Design News
- 후보 발견 URL: https://www.designdb.com/?menuno=792&bbsno=40603&siteno=15&page=1&order=new&period=&act=view&ztag=rO0ABXQAOTxjYWxsIHR5cGU9ImJvYXJkIiBubz0iNTk3IiBza2luPSJwaG90b19iYnNfMjAxOSI%2bPC9jYWxsPg%3d%3d&writer=&search_type=&keyword=&key=community&sphereCode=
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: brand_expression
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: http://www.designdb.com/usr/upload/board_thumb/zboardphotogallery182/20260515093827588_4543.0.jpg

국가유산청(청장 허민)과 국가유산청 산하 국가유산진흥원(원장 이귀영)이 함께 추진하는 ‘국가유산 방문 캠페인’의 미디어 아트 영상이 세계적 권위의 디자인 어워드에서 연이어 수상했다. ‘iF 디자인 어워드’·...

### 07. [DesignDB - Design News] 62명 배우 사진전 ‘Face to Face’ 개최… 사진에 생명 불어넣은 AI 영상 화제

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_design_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: reference
- 후보 발견 출처: DesignDB - Design News
- 후보 발견 URL: https://www.designdb.com/?menuno=792&bbsno=40602&siteno=15&page=1&order=new&period=&act=view&ztag=rO0ABXQAOTxjYWxsIHR5cGU9ImJvYXJkIiBubz0iNTk3IiBza2luPSJwaG90b19iYnNfMjAxOSI%2bPC9jYWxsPg%3d%3d&writer=&search_type=&keyword=&key=community&sphereCode=
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_reference, design_ai_workflow
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: http://www.designdb.com/usr/upload/board_thumb/zboardphotogallery182/20260515093539932_6077.0.jpg

모피어스 스튜디오는 서울 동대문디자인플라자(DDP) 이간수문 전시장에서 개최된 한국의 포토그래퍼 김영준과 일본의 아트 디렉터 요시다 유니의 협업 사진전 ‘Face to Face’에서 자사가 제작에 참여한 두 작...

### 08. [DesignDB - Design News] 현대자동차그룹, 양재사옥에서 ‘로비 스토리 타운홀’ 개최

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_design_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: reference
- 후보 발견 출처: DesignDB - Design News
- 후보 발견 URL: https://www.designdb.com/?menuno=792&bbsno=40601&siteno=15&page=1&order=new&period=&act=view&ztag=rO0ABXQAOTxjYWxsIHR5cGU9ImJvYXJkIiBubz0iNTk3IiBza2luPSJwaG90b19iYnNfMjAxOSI%2bPC9jYWxsPg%3d%3d&writer=&search_type=&keyword=&key=community&sphereCode=
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: promotion_event_design
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: http://www.designdb.com/usr/upload/board_thumb/zboardphotogallery182/20260515092004251_5268.0.jpg

현대자동차그룹 정의선 회장은 14일 현대차그룹 양재사옥 로비 리노베이션의 철학과 방향성을 임직원과 공유하는 자리로 마련된 ‘로비 스토리 타운홀’ 행사에서 이같이 말했다. 정의선 회장(왼쪽)이 현대차그룹 양재...

### 09. [DesignDB - Design News] 모노타입, 고담 서체 25주년 기념 ‘고담 배리어블’ 출시… 브랜드 디자인을 위한 유연한 서체 시스템으로 확장

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_design_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: reference
- 후보 발견 출처: DesignDB - Design News
- 후보 발견 URL: https://www.designdb.com/?menuno=792&bbsno=40599&siteno=15&page=1&order=new&period=&act=view&ztag=rO0ABXQAOTxjYWxsIHR5cGU9ImJvYXJkIiBubz0iNTk3IiBza2luPSJwaG90b19iYnNfMjAxOSI%2bPC9jYWxsPg%3d%3d&writer=&search_type=&keyword=&key=community&sphereCode=
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: brand_expression, design_system, visual_reference
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: http://www.designdb.com/usr/upload/board_thumb/zboardphotogallery182/20260514101137460_6822.0.png

서체 및 폰트 기술 분야의 글로벌 리더 모노타입(Monotype)은 고담(Gotham®) 서체를 가변 서체로 확장한 ‘고담 배리어블(Gotham® Variable)’을 출시했다고 밝혔다. 고담 배리어블은 디자이...

### 10. [DIGITAL iNSIGHT] AI 에이전트로 쇼핑몰 운영… 아임웹, ‘AI 툴킷’ 공개

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/ai-%ec%97%90%ec%9d%b4%ec%a0%84%ed%8a%b8%eb%a1%9c-%ec%87%bc%ed%95%91%eb%aa%b0-%ec%9a%b4%ec%98%81-%ec%95%84%ec%9e%84%ec%9b%b9-ai-%ed%88%b4%ed%82%b7-%ea%b3%b5%ea%b0%9c/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: commerce_design, korean_uiux_case, design_ai_workflow
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

클로드 등 AI 도구로 자연어 제작 지원 The post AI 에이전트로 쇼핑몰 운영… 아임웹, ‘AI 툴킷’ 공개 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 11. [DIGITAL iNSIGHT] 산돌, 1분기 별도 영업이익 59% 성장… AI 콘텐츠 시장 확대 대응 본격화

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%ec%82%b0%eb%8f%8c-1%eb%b6%84%ea%b8%b0-%eb%b3%84%eb%8f%84-%ec%98%81%ec%97%85%ec%9d%b4%ec%9d%b5-59-%ec%84%b1%ec%9e%a5-ai-%ec%bd%98%ed%85%90%ec%b8%a0-%ec%8b%9c%ec%9e%a5-%ed%99%95%eb%8c%80-%eb%8c%80/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_uiux_case, design_ai_workflow
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

AI 기반 콘텐츠 제작 환경 확대에 따른 폰트 수요 증가 관찰돼 The post 산돌, 1분기 별도 영업이익 59% 성장… AI 콘텐츠 시장 확대 대응 본격화 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 12. [DIGITAL iNSIGHT] 커뮤니케이션 개선 초점… 카카오톡, 대화 ·이모티콘 사용자 경험 강화 발표

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%ec%bb%a4%eb%ae%a4%eb%8b%88%ec%bc%80%ec%9d%b4%ec%85%98-%ea%b0%9c%ec%84%a0-%ec%b4%88%ec%a0%90-%ec%b9%b4%ec%b9%b4%ec%98%a4%ed%86%a1-%eb%8c%80%ed%99%94-%c2%b7%ec%9d%b4%eb%aa%a8%ed%8b%b0%ec%bd%98/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_reference, korean_uiux_case
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

더욱 자연스러운 대화와 다양한 상황, 감정 표현 지원 The post 커뮤니케이션 개선 초점… 카카오톡, 대화 ·이모티콘 사용자 경험 강화 발표 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 13. [DIGITAL iNSIGHT] 더에스엠씨, 크리에이터 찾아주는 AI 솔루션 ‘Lens’ 공개

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%eb%8d%94%ec%97%90%ec%8a%a4%ec%97%a0%ec%94%a8-%ed%81%ac%eb%a6%ac%ec%97%90%ec%9d%b4%ed%84%b0-%ec%b0%be%ec%95%84%ec%a3%bc%eb%8a%94-ai-%ec%86%94%eb%a3%a8%ec%85%98-lens-%ea%b3%b5%ea%b0%9c/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: brand_expression, korean_uiux_case, design_ai_workflow
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

데이터 기반 크리에이터 선별... 캠페인 적합도 판단 The post 더에스엠씨, 크리에이터 찾아주는 AI 솔루션 ‘Lens’ 공개 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 14. [DIGITAL iNSIGHT] 미국서도 라쿠텐·메루카리 쇼핑… 사줘, 미국 서비스 개시

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%eb%af%b8%ea%b5%ad%ec%84%9c%eb%8f%84-%eb%9d%bc%ec%bf%a0%ed%85%90%c2%b7%eb%a9%94%eb%a3%a8%ec%b9%b4%eb%a6%ac-%ec%87%bc%ed%95%91-%ec%82%ac%ec%a4%98-%eb%af%b8%ea%b5%ad-%ec%84%9c%eb%b9%84%ec%8a%a4/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: commerce_design, korean_uiux_case
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

향후 영미권 지역까지 서비스 범위 확장 The post 미국서도 라쿠텐·메루카리 쇼핑… 사줘, 미국 서비스 개시 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 15. [DIGITAL iNSIGHT] 펜타브리드, 혼마골프 ‘BeZEAL 4’ 신제품 디지털 캠페인 전개

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%ed%8e%9c%ed%83%80%eb%b8%8c%eb%a6%ac%eb%93%9c-%ed%98%bc%eb%a7%88%ea%b3%a8%ed%94%84-bezeal-4-%ec%8b%a0%ec%a0%9c%ed%92%88-%eb%94%94%ec%a7%80%ed%84%b8-%ec%ba%a0%ed%8e%98%ec%9d%b8/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: brand_expression, korean_uiux_case, visual_reference, design_ai_workflow
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

“골프 비즐이지~” 재치 있는 카피와 AI 송으로 브랜드 각인 The post 펜타브리드, 혼마골프 ‘BeZEAL 4’ 신제품 디지털 캠페인 전개 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 16. [It's Nice That] Why a 53-year-old travel brand is going back to guerrilla print: Lonely Planet on its pocket-sized zine, Artifact

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: tool
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: It's Nice That
- 후보 발견 URL: https://www.itsnicethat.com/articles/lonely-planet-artifact-publication-project-140526
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: brand_expression, korean_uiux_case, visual_reference
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://admin.itsnicethat.com/images/n28lq6esbhDZYB2bUgvqgUA8_0U=/277878/width-1440/LP_Zine_Credit_Lonely_Planet.jpg

Despite everything existing in the digital, the world’s most popular travel guide publisher is sticking close to its roots with a new DIY print offshoot that seeks to connect us with what it truly means to escape.

### 17. [It's Nice That] Melt into Steph Hardy’s soft illustrations of sweet treats and “bad day” snacks

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: tool
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: It's Nice That
- 후보 발견 URL: https://www.itsnicethat.com/articles/steph-hardy-illustration-project-140526
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: look_and_feel, visual_reference
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://admin.itsnicethat.com/images/D-fCMkLwwuAS2bPjz-zqp3Mw9go=/277343/width-1440/Steph_Hardy_-_Sweet_Gestures.jpg

Pulling away from a focus on plants, the artist has turned her brush to a number of tasty visual treats of late, all in her signature fuzzy style.

### 18. [SSG - Events] 현대카드 행사 안내

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_promotion_design
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: SSG - Events
- 후보 발견 URL: https://event.ssg.com/eventDetail.ssg?nevntId=1000000022628&domainSiteNo=6005&_mpop=new
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: layout_pattern, korean_reference, promotion_event_design
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://sstatic.ssgcdn.com/promo/event/ssg/202401/35398994348967458.jpg

2026.05.15 ~ 2026.05.15 8% 뷰티쓱세일 청구할인 현대카드 ssg.com

### 19. [SSG - Events] 5/20 쿼드쎄라 라이브

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_promotion_design
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: SSG - Events
- 후보 발견 URL: https://event.ssg.com/eventDetail.ssg?nevntId=1000000022639&domainSiteNo=6005&_mpop=new
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_reference, promotion_event_design
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://sstatic.ssgcdn.com/promo/event/ssg/202605/46320348249723498.jpg

5/20 20시 쿼드쎄라 쓱라이브 최대 61% 할인+10만 3천원 증정품 찬스까지 일명 '완판템' 프리미엄 뷰티기기 쿼드쎄라 LIVE ssg.com

### 20. [SSG - Events] 5/19 폴레드 쓱라이브

- 날짜: 2026-05-15
- 대분류: Design
- 카테고리: kr_promotion_design
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: inspiration
- 후보 발견 출처: SSG - Events
- 후보 발견 URL: https://event.ssg.com/eventDetail.ssg?nevntId=1000000022582&domainSiteNo=6005&_mpop=new
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: layout_pattern, korean_reference, promotion_event_design
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://sstatic.ssgcdn.com/promo/event/ssg/202605/46819372610241895.jpg

5/19 11시 폴레드 쓱라이브 신제품 에어러브5 출시기념 최대 57% 할인 최대 52% 즉시할인+5%적립+5%카드청구+증정품까지 ssg.com

### 21. [DIGITAL iNSIGHT] 모노타입, 고담 서체 25주년 기념 ‘고담 배리어블’ 출시

- 날짜: 2026-05-14
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%eb%aa%a8%eb%85%b8%ed%83%80%ec%9e%85-%ea%b3%a0%eb%8b%b4-%ec%84%9c%ec%b2%b4-25%ec%a3%bc%eb%85%84-%ea%b8%b0%eb%85%90-%ea%b3%a0%eb%8b%b4-%eb%b0%b0%eb%a6%ac%ec%96%b4%eb%b8%94-%ec%b6%9c/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_uiux_case
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

특유의 인상을 유지하면서 현대 디자인 환경에 필요한 유연성 더해 The post 모노타입, 고담 서체 25주년 기념 ‘고담 배리어블’ 출시 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 22. [DIGITAL iNSIGHT] 산돌, AI 기반 글자놀이 이벤트 ‘글자로 놀자!’ 진행

- 날짜: 2026-05-14
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%ec%82%b0%eb%8f%8c-ai-%ea%b8%b0%eb%b0%98-%ea%b8%80%ec%9e%90%eb%86%80%ec%9d%b4-%ec%9d%b4%eb%b2%a4%ed%8a%b8-%ea%b8%80%ec%9e%90%eb%a1%9c-%eb%86%80%ec%9e%90-%ec%a7%84%ed%96%89/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: promotion_event_design, korean_uiux_case, design_ai_workflow
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

다양한 글자 스타일 제작하며 산돌구름의 AI 기술과 폰트 경험을 자연스럽게 유도 The post 산돌, AI 기반 글자놀이 이벤트 ‘글자로 놀자!’ 진행 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 23. [DIGITAL iNSIGHT] [신간]’디자인 트리거’ 출간

- 날짜: 2026-05-14
- 대분류: Design
- 카테고리: kr_uiux_media
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: DIGITAL iNSIGHT
- 후보 발견 URL: https://ditoday.com/%ec%8b%a0%ea%b0%84%eb%94%94%ec%9e%90%ec%9d%b8-%ed%8a%b8%eb%a6%ac%ea%b1%b0-%ec%b6%9c%ea%b0%84/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_uiux_case, design_ai_workflow
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

AI 시대 올바른 사용자 경험 디자인을 위한 나침반 The post [신간]’디자인 트리거’ 출간 appeared first on DIGITAL iNSIGHT 디지털 인사이트.

### 24. [Smashing Magazine - UX Design] Practical Interface Patterns For AI Transparency (Part 2)

- 날짜: 2026-05-13
- 대분류: Design
- 카테고리: ux_practice
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: reference
- 후보 발견 출처: Smashing Magazine - UX Design
- 후보 발견 URL: https://smashingmagazine.com/2026/05/practical-interface-patterns-ai-transparency/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_uiux_case, design_ai_workflow
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: http://files.smashing.media/articles/practical-interface-patterns-ai-transparency/practical-interface-patterns-ai-transparency.jpg

Why traditional loading patterns like spinners fail in agentic AI experiences, and how interface patterns that reveal the system’s process, status, and decision-making can improve transparency and build user trust.

### 25. [Nielsen Norman Group] Designing AI Agents: 4 Lessons from China’s Qwen Agent

- 날짜: 2026-05-08
- 대분류: Design
- 카테고리: ux_research
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: reference
- 후보 발견 출처: Nielsen Norman Group
- 후보 발견 URL: https://www.nngroup.com/articles/designing-ai-agents/?utm_source=rss&utm_medium=feed&utm_campaign=rss-syndication
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: design_ai_workflow, ux_method
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: 없음

A study of Qwen's AI agent reveals 4 design lessons: support discoverability, reuse familiar patterns, handle personal data carefully, and protect user autonomy.

### 26. [Nielsen Norman Group] UX Writing: FAQs from Practitioners

- 날짜: 2026-05-08
- 대분류: Design
- 카테고리: ux_research
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: reference
- 후보 발견 출처: Nielsen Norman Group
- 후보 발견 URL: https://www.nngroup.com/articles/ux-writing-faqs/?utm_source=rss&utm_medium=feed&utm_campaign=rss-syndication
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: korean_uiux_case
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: 없음

Get answers to frequently asked questions about UX writing from attendees of NN/G’s Writing Compelling Digital Copy course.

## DEV

### 01. [Syntax.fm] 1004: TanHacked

- 날짜: 2026-05-13
- 대분류: DEV
- 카테고리: ai
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P2
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: media_or_unknown
- 출처 역할: 미지정
- 후보 발견 출처: Syntax.fm
- 후보 발견 URL: https://syntax.fm/1004
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: 없음

Scott and Wes break down the “Mini Shai-Hulud” supply chain attack that compromised TanStack and other popular npm packages through a clever GitHub Actions cache poisoning exploit; a self-propagating worm that stole credentials and persisted through Claude Code hooks and VS Code tasks. They also cover how developers can protect themselves using pnpm’s secur…

### 02. [CSS-Tricks] Computing and Displaying Discounted Prices in CSS

- 날짜: 2026-05-14
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: CSS-Tricks
- 후보 발견 URL: https://css-tricks.com/computing-and-displaying-discounted-prices-in-css/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

A clever use of CSS to calculate and display a discounted product price by providing a base price and discount amount, featuring modern CSS features like attr(), mod(), and round(). Computing and Displaying Discounted Prices in CSS originally handwritten and published with love on CSS-Tricks. You should really get the newsletter as well.

### 03. [CSS-Tricks] rotateX()

- 날짜: 2026-05-13
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: CSS-Tricks
- 후보 발견 URL: https://css-tricks.com/almanac/functions/r/rotatex/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

The rotateX() function rotates an element around the x-axis in a three-dimensional space rotateX() originally handwritten and published with love on CSS-Tricks. You should really get the newsletter as well.

### 04. [CSS-Tricks] rotateY()

- 날짜: 2026-05-13
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: CSS-Tricks
- 후보 발견 URL: https://css-tricks.com/almanac/functions/r/rotatey/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

The rotateY() function rotates an element around its vertical y-axis. rotateY() originally handwritten and published with love on CSS-Tricks. You should really get the newsletter as well.

### 05. [CSS-Tricks] rotateZ()

- 날짜: 2026-05-13
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: CSS-Tricks
- 후보 발견 URL: https://css-tricks.com/almanac/functions/r/rotatez/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

The rotateZ() function rotates an element around its z-axis, so clockwise or counterclockwise. rotateZ() originally handwritten and published with love on CSS-Tricks. You should really get the newsletter as well.

### 06. [CSS-Tricks] rotate()

- 날짜: 2026-05-13
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: CSS-Tricks
- 후보 발견 URL: https://css-tricks.com/almanac/functions/r/rotate/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

The rotate() function spins an element either clockwise or counterclockwise in a 2D plane. rotate() originally handwritten and published with love on CSS-Tricks. You should really get the newsletter as well.

### 07. [Frontend Focus] A new HTML element for installing web apps

- 날짜: 2026-05-13
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: newsletter
- 출처 역할: 미지정
- 후보 발견 출처: Frontend Focus
- 후보 발견 URL: https://frontendfoc.us/issues/741
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 후보 발견 출처입니다. 뉴스레터 안의 원문 링크를 따라 최종 기준 원문을 분리하세요.
- 이미지 후보: 없음

🚀 Frontend Focus #​741 — May 13, 2026 | Read on the web Safari 26.5 Released: Here's the WebKit Features — Beyond the usual polish, 26.5 includes support for the :open pseudo-class, improvements to the CSS random() function, anchor positioning fixes, support for color-interpolation in SVG gradients, and Origin API support. Jen Simmons 🧭 In related Safari…

### 08. [CSS-Tricks] Soon We Can Finally Banish JavaScript to the ShadowRealm

- 날짜: 2026-05-12
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: CSS-Tricks
- 후보 발견 URL: https://css-tricks.com/soon-we-can-finally-banish-javascript-to-the-shadowrealm/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

The proposed ShadowRealm API introduces a new kind of realm specifically designed for isolation, and only that. Soon We Can Finally Banish JavaScript to the ShadowRealm originally handwritten and published with love on CSS-Tricks. You should really get the newsletter as well.

### 09. [JavaScript Weekly] Cryptographically valid malware hits npm

- 날짜: 2026-05-12
- 대분류: DEV
- 카테고리: javascript
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: newsletter
- 출처 역할: 미지정
- 후보 발견 출처: JavaScript Weekly
- 후보 발견 URL: https://javascriptweekly.com/issues/785
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 후보 발견 출처입니다. 뉴스레터 안의 원문 링크를 따라 최종 기준 원문을 분리하세요.
- 이미지 후보: 없음

#​785 — May 12, 2026 Read on the Web JavaScript Weekly Anatomy of the TanStack npm Compromise — A new strain of the Shai-Hulud worm pushed malicious versions of TanStack packages to npm yesterday (containing a tripwire that would delete files if it detected token revocation), though it hit ~170 other packages too. Maintainer credentials weren’t stolen, with…

### 10. [Syntax.fm] 1003: Skills Skills Skills

- 날짜: 2026-05-11
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: media_or_unknown
- 출처 역할: 미지정
- 후보 발견 출처: Syntax.fm
- 후보 발견 URL: https://syntax.fm/1003
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: 없음

Scott and Wes chat all things agent skills for web developers, sharing their favorites for everything from CSS animations and HTML generation to logo extraction, marketing copy, and video creation. Whether you’re just getting started with AI-powered development or looking to level up your workflow, this episode is packed with practical skills you can put to…

### 11. [CSS Weekly] How To Build Polished WooCommerce Sites Fast with Blocksy

- 날짜: 2026-05-09
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: newsletter
- 출처 역할: 미지정
- 후보 발견 출처: CSS Weekly
- 후보 발견 URL: https://feedpress.me/link/24028/17338167/how-to-build-polished-woocommerce-sites-fast-with-blocksy
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 후보 발견 출처입니다. 뉴스레터 안의 원문 링크를 따라 최종 기준 원문을 분리하세요.
- 이미지 후보: 없음

Learn how to build polished WooCommerce and business sites fast with Blocksy WordPress theme.

### 12. [CSS-Tricks] Using CSS corner-shape For Folded Corners

- 날짜: 2026-05-08
- 대분류: DEV
- 카테고리: css
- 타겟 적합성: design_dev_reference
- shortlist 우선순위: P1
- 적합성 메모: 디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.
- 직무 태그: 웹DEV
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: CSS-Tricks
- 후보 발견 URL: https://css-tricks.com/using-css-corner-shape-for-folded-corners/
- 최종 기준 원문 필요: yes
- 기계 상태: candidate
- 기계 메모: AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

I came across Kitty Giraudel’s folded corners technique. I’ve been on a bit of a corner-shape kick lately, so I figured that corner-shape could be used to create folded corners as well. Using CSS corner-shape For Folded Corners originally handwritten and published with love on CSS-Tricks. You should really get the newsletter as well.

## 자동 제외된 항목

### 01. [신세계그룹 뉴스룸] 세종의 창조 정신, 미디어아트로 재탄생…신세계百, 국가유산청과 ‘신세계스퀘어 미디어아트 어워즈’ 개최

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 신세계그룹 뉴스룸
- 후보 발견 URL: https://www.shinsegaegroupnewsroom.com/shinsegae-department-store-hosts-shinsegae-square-media-art-awards-with-national-heritage-administration/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com/wp-content/uploads/2026/05/NR_Press_List-83.png

국가유산의 큐레이터인 신세계백화점이 국가유산청과 새로운 프로젝트를 선보인다. 신세계백화점은 국가유산청(청장 허민)과 함께 대한민국 국가유산을 현대적으로 재해석하는 제1회 ‘신세계스퀘어 미디어아트 어워즈‘를 개최한다고 밝혔다. 이번 프로젝트는 국가유산청이 보유한 국가유산 3D 디지털 자산을 활용해 크리에이터들이 새로운 형태의 미디어아트를 제작하고 신세계 본점 신세계스퀘어에서 상영하는 협업

### 02. [쿠팡 뉴스룸] [보도자료] 쿠팡, 맞춤형 긴급 구호 키트로 전국 재난현장 구호 나선다 해롤드 로저스 임시대표 “전국 로켓 물류망 활용해 실질적 지원”

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 쿠팡 뉴스룸
- 후보 발견 URL: https://news.coupang.com/archives/62255/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://news.coupang.com/wp-content/uploads/2026/05/coupang-emergency-relief-hope-box-disaster-260514-01-scaled.jpg

쿠팡이 국내 재난·재해 발생 시 이재민들에게 로켓배송으로 구호물품을 즉시 전달하는 ‘긴급구호 쿠팡희망박스’ 프로그램을 시작한다. 쿠팡은 물류 인프라를 활용해 긴급 구호 물품을 상시 비축할 계획이다.

### 03. [컬리 뉴스룸] [김시광의 일하는 마음] 통제할 수 없고 정답도 없는 문제를 해결하려면

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 컬리 뉴스룸
- 후보 발견 URL: https://newsroom.kurlycorp.com/k-government-relations/?utm_source=rss&utm_medium=rss&utm_campaign=k-government-relations
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://img-newsroom.kurlycorp.com/wp-content/uploads/2026/05/%EA%B9%80%EC%8B%9C%EA%B4%91-6.jpg

“51%의 확신이 생기면 일단 움직여요. 움직이면서 나머지 49%를 채워가는 거죠.” 📍 들어가기 전에 성장의 꽃길, 사람이 만듭니다 Q. 식품, 플랫폼, IT, 물류까지 리테일의 모든 과정을 담당하고 있는 컬리는 다양한 환경의 영향을 받습니다. 이러한 복잡한 상황을 관리해야 하는 대외

### 04. [쿠팡 뉴스룸] "초록 이끼 만지고, 아로마 향 맡으며 명상” 쿠팡풀필먼트센터의 마음챙김 시간

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 쿠팡 뉴스룸
- 후보 발견 URL: https://news.coupang.com/archives/62097/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://news.coupang.com/wp-content/uploads/2026/05/coupang-care-center-fulfillment-service-employee-welfare-260508-02.jpg

구성원들의 고민을 함께 나누기 위해, 올봄 쿠팡케어센터 멘탈웰빙팀은 ‘현장으로 찾아가는 마음챙김 프로그램’을 기획해 전국 주요센터로 향했습니다. 따뜻한 봄날, 다채롭게 펼쳐진 힐링의 현장을 소개합니다.

### 05. [쿠팡 뉴스룸] [보도자료] 쿠팡, ‘베이비&키즈쇼’에서 육아용품 8000개 할인 판매

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: exclude
- shortlist 우선순위: P2/제외 검토
- 적합성 메모: CTTD 이커머스 고객 회의에서 바로 쓸 화면·모듈·정책 질문이 남는지 추가 확인이 필요합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 쿠팡 뉴스룸
- 후보 발견 URL: https://news.coupang.com/archives/62235/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: CTTD 이커머스 고객 회의에서 바로 쓸 화면·모듈·정책 질문이 남는지 추가 확인이 필요합니다.
- 수집 단서 태그: membership_retention
- 위험 단서 태그: weak_promo
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://news.coupang.com/wp-content/uploads/2026/05/coupang-baby-kids-show-parenting-products-sale-260513-01.jpg

쿠팡은 다양한 육아용품을 한데 모아 파격적인 혜택으로 선보이는 ‘베이비&키즈쇼’를 오는 17일까지 진행한다고 13일 밝혔다. 쿠팡은 새벽배송부터 로켓배송까지 빠른 배송 서비스로 육아용품을 다음 날 바로 받아볼 수 있다.

### 06. [쿠팡 뉴스룸] [보도자료] 쿠팡·쿠팡이츠서비스, 경희대와 산학협력 체결

- 날짜: 2026-05-12
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 쿠팡 뉴스룸
- 후보 발견 URL: https://news.coupang.com/archives/62208/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://news.coupang.com/wp-content/uploads/2026/05/coupang-eats-kyung-hee-university-industry-academia-cooperation-traditional-market-digital-transformation-support-260512-01-scaled.jpg

쿠팡과 쿠팡이츠서비스(CES)가 전통시장의 디지털 경쟁력 강화를 위해 경희대학교와 협력해 청량리전통시장 상권의 온라인 활성화를 지원하며 실무형 인재 양성을 동시에 추진한다. 이를 통해 지역 상권 활성화와 청년 인재 양성을 함께 도모한다.

### 07. [쿠팡 뉴스룸] [보도자료] 쿠팡, 고당도 ‘우곡그린수박’ 1만 5000통 새벽배송…지역 농가와 ‘상생 행보’

- 날짜: 2026-05-12
- 대분류: Service
- 카테고리: ecommerce
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 쿠팡 뉴스룸
- 후보 발견 URL: https://news.coupang.com/archives/62197/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://news.coupang.com/wp-content/uploads/2026/05/coupang-high-sugar-ugok-green-watermelon-dawn-delivery-local-farm-shared-growth-260512.jpg

쿠팡이 새벽배송 서비스인 로켓프레시를 통해 경북 고령군의 특산물인 ‘우곡그린수박’ 매입을 3배 늘려 판매한다.쿠팡은 지난해 5000여통 수준인 우박그린수박 매입 물량을 올해 3배인 1만5000여통으로 확대해 전국 새벽배송으로 판매한다고 12일 밝혔다.

### 08. [무신사 뉴스룸] 29CM, 1호점 흥행 이어 '이구키즈 서울숲' 출격… “성수 일대 아우른 키즈 랜드마크로 입지 확대”

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: fashion
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 무신사 뉴스룸
- 후보 발견 URL: https://newsroom.musinsa.com/newsroom-menu/2026-0514-29cm
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://cdn.prod.website-files.com/60a3629e04f26d12caff56df/6a055da2fc50cec678a88a40_%5B29CM%20%EC%82%AC%EC%A7%84%EC%9E%90%EB%A3%8C%5D%20%EC%9D%B4%EA%B5%AC%ED%82%A4%EC%A6%88%20%EC%84%9C%EC%9A%B8%EC%88%B2%20%EB%A7%A4%EC%9E%A5%20%EB%9E%9C%EB%8D%94%EB%A7%81%20%EC%9D%B4%EB%AF%B8%EC%A7%80.jpg

2026.05.14

### 09. [Spotify Newsroom] Spotify Expands Music Access for Young Listeners, Extending Managed Accounts to Free Tier &#8212; Spotify

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: global_service_ux
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: Spotify Newsroom
- 후보 발견 URL: https://newsroom.spotify.com/2026-05-13/managed-accounts-free-tier-expansion/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://storage.googleapis.com/pr-newsroom-wp/1/2026/05/FTR-Header-Managed-Accounts239482093480248-scaled.jpg

At Spotify, we&#8217;re focused on making every listening experience feel intentional, personal, and rewarding—ensuring time spent with us feels positive. That commitment extends to all users, including parents and families. Nearly two years ago, we introduced managed accounts to Premium Family users in select markets, and today we’re excited to expand mana…

### 10. [Spotify Newsroom] Eurovision at 70: The Biggest Hits, Artists, and Trends From the Iconic Song Competition &#8212; Spotify

- 날짜: 2026-05-11
- 대분류: Service
- 카테고리: global_service_ux
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: Spotify Newsroom
- 후보 발견 URL: https://newsroom.spotify.com/2026-05-11/eurovision-top-song-entry-artist-data/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://storage.googleapis.com/pr-newsroom-wp/1/2026/05/eurovision-2026-cover-99346.jpg

As Eurovision fans gear up to celebrate the 70th anniversary of the iconic song contest, Spotify is diving into the data to explore how listeners engage with the songs and artists that have come out of the competition. Year after year, Eurovision remains a beloved cultural moment. In the past 12 months alone, listeners in...

### 11. [The Changelog] Automation at the speed of Swamp (Friends)

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: ai
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: media_or_unknown
- 출처 역할: 미지정
- 후보 발견 출처: The Changelog
- 후보 발견 URL: https://changelog.com/friends/130
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: 없음

This week I'm talking with Adam Jacob, founder of System Initiative and creator of Swamp, about what happens when AI agents change the entire shape of software development. We discuss how he went from an 18-person team down to five and shipped Swamp 900 times in four weeks, why he brought User Acceptance Testing (UAT) testing back from the 90s, why software…

### 12. [당근 보도자료] 당근알바, 건강한 구인구직 환경 조성 위한 신규 기능 업데이트

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94-%EA%B1%B4%EA%B0%95%ED%95%9C-%EA%B5%AC%EC%9D%B8%EA%B5%AC%EC%A7%81-%ED%99%98%EA%B2%BD-%EC%A1%B0%EC%84%B1-%EC%9C%84%ED%95%9C-%EC%8B%A0%EA%B7%9C-%EA%B8%B0%EB%8A%A5-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/7fd2be4c-155a-4853-bee5-383f6af76422_1_PR_UI_Image.jpg?auto=compress%2Cformat&rect=0%2C0%2C3840%2C2160&w=1200&h=630&fit=max&q=100&fm=png

'월급, 일급까지 법정 최저 임금 자동 계산 가이드', ‘연휴 단기알바 모아보기’ 기능 제공

### 13. [당근 보도자료] 당근마켓, ‘2023 썸머테크 인턴십’ 실시

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-2023-%EC%8D%B8%EB%A8%B8%ED%85%8C%ED%81%AC-%EC%9D%B8%ED%84%B4%EC%8B%AD-%EC%8B%A4%EC%8B%9C/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/1d385af3-5093-47ca-ad40-9155a8a47bdc_pr_23Summertech.png?auto=compress%2Cformat&rect=0%2C0%2C6668%2C3751&w=1200&h=630&fit=max&q=100&fm=png

당근마켓, ‘썸머테크 인턴십’ 실시… 5개 개발 직군 지원자 모집

### 14. [당근 보도자료] 당근마켓에서 이웃간 가장 많이 공유된 생활 정보는?

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93%EC%97%90%EC%84%9C-%EC%9D%B4%EC%9B%83%EA%B0%84-%EA%B0%80%EC%9E%A5-%EB%A7%8E%EC%9D%B4-%EA%B3%B5%EC%9C%A0%EB%90%9C-%EC%83%9D%ED%99%9C-%EC%A0%95%EB%B3%B4%EB%8A%94/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/2f2f7032-effc-471c-820b-06214f0676b0_%E1%84%83%E1%85%A9%E1%86%BC%E1%84%82%E1%85%A6%E1%84%89%E1%85%A2%E1%86%BC%E1%84%92%E1%85%AA%E1%86%AF.png?auto=compress%2Cformat&rect=0%2C2%2C1440%2C810&w=1200&h=630&fit=max&q=100&fm=png

1위는 맛집.. 이어 병원, 반려동물, 운동, 이사 상위권 랭크

### 15. [당근 보도자료] 당근마켓, 중고차 직거래 지역정비소, 전문가 연결 기능 오픈

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: exclude
- shortlist 우선순위: P2/제외 검토
- 적합성 메모: CTTD 이커머스 고객 회의에서 바로 쓸 화면·모듈·정책 질문이 남는지 추가 확인이 필요합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93-%EC%A4%91%EA%B3%A0%EC%B0%A8-%EC%A7%81%EA%B1%B0%EB%9E%98-%EC%A7%80%EC%97%AD-%EC%A0%95%EB%B9%84%EC%86%8C-%EC%A0%84%EB%AC%B8%EA%B0%80-%EC%97%B0%EA%B2%B0-%EA%B8%B0%EB%8A%A5-%EC%98%A4%ED%94%88/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: CTTD 이커머스 고객 회의에서 바로 쓸 화면·모듈·정책 질문이 남는지 추가 확인이 필요합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/f1e9c461-e880-445b-963e-41f331a13aa7_%5B%EC%9D%B4%EB%AF%B8%EC%A7%801%5D+%EB%8B%B9%EA%B7%BC%EB%A7%88%EC%BC%93_+%EC%A4%91%EA%B3%A0%EC%B0%A8+%EC%A7%81%EA%B1%B0%EB%9E%98+_%EC%A0%95%EB%B9%84%EC%86%8C%2C+%EC%A0%84%EB%AC%B8%EA%B0%80+%EB%8F%99%ED%96%89_+%EA%B8%B0%EB%8A%A5+%EC%98%A4%ED%94%88.jpg?auto=compress%2Cformat&rect=0%2C0%2C580%2C326&w=1200&h=630&fit=max&q=100&fm=png

당근마켓 중고차 직거래, 구매 전 차량 점검할 수 있도록 전문가 연결하는 ‘정비소, 전문가 동행’ 기능 출시

### 16. [당근 보도자료] 당근알바, 단기알바 10명 중 7명 1시간 이내 연결

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94-%EB%8B%A8%EA%B8%B0%EC%95%8C%EB%B0%94-10%EB%AA%85-%EC%A4%91-7%EB%AA%85-1%EC%8B%9C%EA%B0%84-%EC%9D%B4%EB%82%B4-%EC%97%B0%EA%B2%B0/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/1f721bc8-7f34-4dc2-bf3c-9e917e31c554_PR_%EB%8B%B9%EA%B7%BC%EC%95%8C%EB%B0%94.jpg?auto=compress%2Cformat&rect=0%2C0%2C1920%2C1080&w=1200&h=630&fit=max&q=100&fm=png

단기알바 구인 공고 67.6% 1시간 내 지원자 나타나… 10분 내 지원도 42.5% 달해

### 17. [당근 보도자료] ‘당근비즈니스’ 유튜브, 자영업자 성공기 담은 ‘사장님이 해냄’ 순차 공개

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: local_service
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: official
- 출처 역할: official
- 후보 발견 출처: 당근 보도자료
- 후보 발견 URL: https://about.daangn.com/company/pr/archive/%EB%8B%B9%EA%B7%BC%EB%B9%84%EC%A6%88%EB%8B%88%EC%8A%A4-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EC%9E%90%EC%98%81%EC%97%85%EC%9E%90-%EC%84%B1%EA%B3%B5%EA%B8%B0-%EB%8B%B4%EC%9D%80-%EC%82%AC%EC%9E%A5%EB%8B%98%EC%9D%B4-%ED%95%B4%EB%83%84-%EC%88%9C%EC%B0%A8-%EA%B3%B5%EA%B0%9C/
- 최종 기준 원문 필요: no
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.
- 이미지 후보: https://prismic-image-proxy.krrt.io/karrot/e9aad15c-920c-448a-afd0-3a0ab53c72b5_%E1%84%89%E1%85%A1%E1%84%8C%E1%85%A1%E1%86%BC%E1%84%82%E1%85%B5%E1%86%B7%E1%84%8B%E1%85%B5+%E1%84%92%E1%85%A2%E1%84%82%E1%85%A2%E1%86%B7+5%E1%84%92%E1%85%AA+%E1%84%8A%E1%85%A5%E1%86%B7%E1%84%82%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AF.png?auto=compress%2Cformat&fit=max&q=100&w=1200&h=630&fm=png

동네 단골만 300명 이상 모은 자영업자들 비법 담았다!

### 18. [Careet] &#50948;&#44256;&#48708; &#45824;&#49888; &#52380;&#50672; &#50948;&#44256;&#48708;? &#13;&#10;&#44544;&#47196;&#48268; Z&#49464;&#45824; &#51200;&#44201;&#54620; &#54868;&#51228;&#51032; &#50976;&#54665;&#53596; 4

- 날짜: 2026-05-15
- 대분류: Service
- 카테고리: trend_curation
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: media_or_unknown
- 출처 역할: discovery
- 후보 발견 출처: Careet
- 후보 발견 URL: https://www.careet.net/1908
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: https://s3.ap-northeast-2.amazonaws.com/univ-careet/FileData/Picture/202605/c267cb4c-c4f3-465f-afd8-8f5554a8c03f_770x426.png

트렌드를 읽는 가장 빠른 방법

### 19. [Dev.to - Accessibility] New Equa11y Plugin for SuperCLI

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/javimosch/new-equa11y-plugin-for-supercli-4hep
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

New Equa11y Plugin for SuperCLI Stream-lined command line tool for running accessibility testing with axe-core and puppeteer by oslabs-beta npm install -g equa11y Verify: equa11y --version supercli plugins install ./plugins/Equa11y --on-conflict replace --json Plugin Source: https://github.com/oslabs-beta/Equa11y SuperCLI Repository: https://github.com/javi…

### 20. [Dev.to - Accessibility] MedScan Assistant — AI medication label reader for seniors, powered by Gemma 4

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/msadlok/medscan-assistant-ai-medication-label-reader-for-seniors-powered-by-gemma-4-3kc6
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

This is a submission for the Gemma 4 Challenge: Build with Gemma 4 MedScan Assistant helps elderly and visually impaired people understand their medication labels. Half of all medication errors happen because patients misread or misunderstand the label — especially people with low vision or cognitive decline. Point your phone at any medication label → Gemma…

### 21. [Dev.to - Accessibility] Why Businesses Are Focusing More on Website Accessibility in 2026

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/eccomback/why-businesses-are-focusing-more-on-website-accessibility-in-2026-377a
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

Website accessibility has become one of the most important digital priorities for businesses in 2026. As more companies expand their online presence, the need to create inclusive and accessible websites continues growing across industries. Businesses are increasingly recognizing that accessibility is not only about compliance but also about improving user e…

### 22. [Dev.to - Accessibility] Theming in the Modern Age

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: css
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/shaynaproductions/theming-in-the-modern-age-51ke
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

Prologue A while ago, I decided to develop a fully accessible main navigation component in React and write a series of articles documenting the steps it took to create a non-trivial accessible component. In the last article, the focus was on the operability of foundational components that render valid HTML elements. This article focuses on screen perceivabi…

### 23. [Dev.to - Accessibility] Trying this out for accessibility testing!

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/daniel_morgan_23/trying-this-out-for-accessibility-testing-4i67
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

Been exploring accessibility tools recently and came across A11yInspect. Looks interesting for testing accessibility directly while building and also getting guidance without switching between too many tools. They’re offering Pro access free for 1 year for GAAD, so I signed up for the waitlist. Sharing in case it helps someone else here build more accessibl…

### 24. [Dev.to - Accessibility] Your Site Probably Blocks Pinch-to-Zoom on Mobile. That Is a Lawsuit Risk.

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/agentkit/your-site-probably-blocks-pinch-to-zoom-on-mobile-that-is-a-lawsuit-risk-1lni
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

Open your website on a phone right now. Take two fingers and try to pinch-to-zoom on the body text. If the page resists, snaps back, or simply ignores you, your site has a problem that almost every accessibility consultant flags inside the first ten minutes of an audit. It is one of the easiest accessibility failures to ship by accident and one of the easie…

### 25. [Dev.to - Accessibility] React and User Preferences: Respect the OS Settings Your Users Already Picked

- 날짜: 2026-05-14
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/childrentime/react-and-user-preferences-respect-the-os-settings-your-users-already-picked-5hdp
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

React and User Preferences: Respect the OS Settings Your Users Already Picked Every modern operating system asks the user, at some point, what kind of UI they want. Dark mode or light. High contrast or normal. Animations on or stripped down. Left-to-right or right-to-left. Preferred language. The user picks once, in System Settings, and from that moment on…

### 26. [Dev.to - Accessibility] Why pure Klein blue disappears on dark ground — and how I routed around it

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/palo_alto_ai/why-pure-klein-blue-disappears-on-dark-ground-and-how-i-routed-around-it-41ce
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

Spend a few hours in Claude Code and you notice something most terminal themes ignore: the screen is mostly prose. Tool output, reasoning traces, permission prompts — paragraphs of English, not syntax-highlighted code. Every theme I tried was tuned for the wrong workload. So I built klein-void around a different target: comfortable body-size prose legibilit…

### 27. [Dev.to - Accessibility] Keyboard Navigation Testing: A Developer Complete Guide to WCAG Operability

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/toolkitonline/keyboard-navigation-testing-a-developer-complete-guide-to-wcag-operability-454d
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

Keyboard accessibility is one of the most important — and most neglected — aspects of web accessibility. An estimated 2.5 million Americans have motor disabilities that prevent mouse use. If your site can't be operated entirely by keyboard, you're excluding them completely. WCAG 2.2 Principle 2 (Operable) contains the keyboard requirements: 2.1.1 Keyboard (…

### 28. [Dev.to - Accessibility] Accessible and Functional Quantity Spinbutton Pattern

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/micaavigliano/accessible-and-functional-quantity-spinbutton-pattern-3f40
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

Hey! This is Mica writing, a human not an AI agent (nothing against them, not discrimination of any kind is allowed here). Just a brief disclaimer before starting: this post was non AI-generated (I am not going to lie, I tried to use it for some research but since the errors I found were not properly documented the AI invented answers, lol) because I felt t…

### 29. [Dev.to - Accessibility] Focus indicators that fail WCAG 1.4.11: real cases and exact fixes

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/a11ysolutions/focus-indicators-that-fail-wcag-1411-real-cases-and-exact-fixes-4aeo
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

What is a focus indicator — and why does WCAG regulate it? When a user navigates a website using a keyboard, they need to know where they are on the page at all times. The focus indicator is the visual signal that answers that question: the outline, highlight, or state change that appears on the element currently receiving keyboard focus. WCAG Success Crite…

### 30. [Dev.to - Accessibility] Online Course Accessibility: A Non-Developer's Guide to Teachable, Kajabi, and Thinkific

- 날짜: 2026-05-13
- 대분류: Service
- 카테고리: web_accessibility
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획, 웹디자인
- 출처 유형: magazine_or_blog
- 출처 역할: 미지정
- 후보 발견 출처: Dev.to - Accessibility
- 후보 발견 URL: https://dev.to/agentkit/online-course-accessibility-a-non-developers-guide-to-teachable-kajabi-and-thinkific-db0
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.
- 이미지 후보: 없음

If you sell online courses, the first thing that usually surprises you is how much accessibility responsibility still belongs to you after you have chosen a platform. Teachable, Kajabi, Thinkific, Podia, LearnWorlds, and Mighty Networks all market themselves as production-ready. They are, for the parts they control. But the parts you upload -- your video le…

### 31. [ShopTalk Show] 714: Camping, Burnout, and Chris’ CSS Talk

- 날짜: 2026-05-11
- 대분류: Service
- 카테고리: css
- 타겟 적합성: exclude
- shortlist 우선순위: 자동 제외
- 적합성 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 직무 태그: 웹서비스기획
- 출처 유형: media_or_unknown
- 출처 역할: 미지정
- 후보 발견 출처: ShopTalk Show
- 후보 발견 URL: https://shoptalkshow.com/714/
- 최종 기준 원문 필요: yes
- 기계 상태: auto_excluded
- 기계 메모: 웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.
- 수집 단서 태그: 없음
- 위험 단서 태그: 없음
- 디자인 가치 태그: 없음
- 출처 확인 메모: 출처 신뢰도를 AI가 재확인해야 합니다.
- 이미지 후보: 없음

Show Description How responsible should you be for fixing your own website for others, Dave's got a blacklog of blog posts, Chris got a camper van, debating burnout even when you love your work, a weekly AI doomer check in, and Chris has a talk for Smashing Magazine happening by the time you hear this. Listen on Website Watch on YouTube Links Winnebago Reve…
