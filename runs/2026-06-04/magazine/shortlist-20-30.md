# shortlist 2026-06-04

> 이 shortlist의 항목은 글쓰기 단계에서 4~7개로 임의 압축하지 않는다. 원문 부족·광고성·화면 미확인만 `수집했지만 제외한 것`으로 이동한다. 카테고리(SERVICE/DESIGN/DEV)는 한 풀에서 경쟁하지 않고 독립 선발한다.

- 검증 통과: SERVICE 6 / DESIGN 18 / DEV 22
- shortlist 선발: SERVICE 5 / DESIGN 18 / DEV 23 (합계 46) — 우아한공방 RAG 챗봇 건은 'AX 전환 사례'로 DEV에 재분류(번호 02 유지)

---

## SERVICE (6)

### 1. CJ온스타일, 대화형 AI 쇼핑 유입 4배↑... AI 기반 커머스 확장

- **분류**: Service · 검색 · `웹서비스기획` · core_ecommerce · **P0**
- **발행처**: CJ News Room (CJ온스타일) (2026-05-28)
- **원문**: https://cjnews.cj.net/cj온스타일-대화형-ai-쇼핑-유입-4배↑-ai-기반-커머스-확장/
- **헤드라인**: CJ온스타일이 ChatGPT 앱 안에서 상품 탐색→방송 확인→공식 앱 연결 플로우를 열고 상품 데이터를 GEO로 재구성했다
- **핵심 사실**:
   - ChatGPT Apps에 CJ온스타일 전용 앱을 5월 15일 출시 — 대화로 상품 탐색→방송 정보 확인→공식 앱 연결 플로우
   - 5월 1~25일 대화형 AI 유입이 1월 동기간 대비 4배 이상 증가
   - AI 최적화 상품 60만 개 완료(연내 100만 개 목표), 자체 앱 AI 추천 유입은 1~4월 전년比 37% 증가
   - 생성형 엔진 최적화(GEO) 전략으로 고객 검색 표현·리뷰 데이터를 반영해 상품 데이터를 재구성
- **점검 질문**: 고객 검색 표현·리뷰 데이터로 상품 데이터를 재구성(GEO)한다면, 외부 AI에서 상품상세로 넘어오는 전환 화면을 우리는 어떻게 설계할 것인가?
- **이미지**: https://img.cjnews.cj.net/wp-content/uploads/2026/05/CJ%EC%98%A8%EC%8A%A4%ED%83%80%EC%9D%BC-%EC%99%BC%EC%AA%BD%EB%B6%80%ED%84%B0-%EC%B1%97GPT-%EB%82%B4-CJ%EC%98%A8%EC%8A%A4%ED%83%80%EC%9D%BC-%EC%83%81%ED%92%88-%EC%B6%94%EC%B2%9C-%ED%99%94%EB%A9%B4-%EC%9E%90%EC%B2%B4-%EC%95%B1-%EB%82%B4-AI-%EA%B8%B0%EB%B0%98-%EA%B0%9C%EC%9D%B8%ED%99%94-%EC%B6%94%EC%B2%9C-%ED%99%94%EB%A9%B4-1024x633.png

### 2. 우아한공방의 새로운 동료, 시스템 맥락을 가진 챗봇서비스 개발기(feat. RAG)

- **분류**: Dev · AX 전환 사례 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: 권현아·성민제 (우아한형제들) (2026-05-22)
- **원문**: https://techblog.woowahan.com/26319/
- **헤드라인**: 배민이 디자인시스템 지식을 RAG 챗봇으로 묶어 컴포넌트 질문에 답하게 했다
- **핵심 사실**:
   - AWS Bedrock Knowledge Bases 기반 RAG + Amazon OpenSearch Serverless(AOSS) 벡터 스토어, DynamoDB 채팅 히스토리로 디자인시스템 챗봇 구성
   - `|ComponentName|` 형식의 메타데이터 필터링과 질문 유형별 동적 topK 튜닝으로 검색 범위를 제어
   - AWS Bedrock Guardrails로 인물 평가·디자인시스템 무관 질문을 차단하되, 비동기 SSE 스트리밍을 위해 output 검사를 비활성 처리
   - Storybook Composition 통합과 독립 npm 패키지 배포로 웹 챗봇·MCP 간 응답 품질을 통일
- **점검 질문**: 우리 디자인시스템 문서를 컴포넌트명 메타데이터로 색인하면 디자이너·퍼블리셔가 컴포넌트 사용법을 챗봇으로 바로 물어볼 수 있을까?
- **이미지**: https://techblog.woowahan.com/wp-content/uploads/2026/05/%EB%94%94%EC%9E%90%EC%9D%B8%EC%8B%9C%EC%8A%A4%ED%85%9C%ED%94%8C%EB%9E%AB%ED%8F%BC%ED%8C%80-%EC%9B%B9%ED%8C%8C%ED%8A%B8-750x422.png

### 3. 무신사, 'AI 트렌드 큐레이션' 도입··· "사용자가 찾기 전에 AI가 답한다"

- **분류**: Service · 추천 · `웹서비스기획` · core_ecommerce · **P1**
- **발행처**: 무신사 (2026-06-03)
- **원문**: https://newsroom.musinsa.com/newsroom-menu/2026-0603
- **헤드라인**: 무신사가 외부 실시간 트렌드를 선제 분석해 상품과 연결하는 '선제적 큐레이션'을 모자 카테고리에 깔았다
- **핵심 사실**:
   - 'AI 트렌드 큐레이션' 도입 — AI가 플랫폼 외부 실시간 글로벌 트렌드를 선제 분석해 상품과 연결하는 '선제적 큐레이션 모델'
   - 캡·야구모자 등 모자 카테고리에 우선 적용, 향후 패션·뷰티 전 영역으로 확대 예정
   - 프론트엔드는 단순 필터 버튼 UI로 노출하되 백엔드에서 복잡한 AI 데이터 파이프라인을 운영하는 구조
   - 구매 의도 미확정 방문객의 이탈률 감소와 CTR 상승을 목표로 함
- **점검 질문**: 우리 추천 영역을 단순 필터 버튼 UI로 노출하되 뒤단에서 트렌드 신호를 상품에 매핑한다면, 구매 의도 미확정 방문객의 이탈을 어디서 막을 것인가?
- **이미지**: https://cdn.prod.website-files.com/60a3629e04f26d12caff56df/6a20d4f62e7bdeb4682eda35_PR.png

### 4. 올리브영 미국 패서디나점 완벽 가이드: 매장·브랜드·온라인몰·멤버십 총정리

- **분류**: Service · 멤버십 · `웹서비스기획` · core_ecommerce · **P1**
- **발행처**: CJ News Room (올리브영) (2026-05-21)
- **원문**: https://cjnews.cj.net/올리브영-미국-패서디나점-완벽-가이드-매장·브랜/
- **헤드라인**: 올리브영이 미국 전용 온라인몰과 등급제 'OY멤버스'를 처음부터 새로 설계해 론칭했다
- **핵심 사실**:
   - 올리브영 첫 미국 매장과 함께 '미국 전용 독자 온라인몰' 론칭 — 배송 영업일 3~5일, $35 이상 무료배송, 캘리포니아 블루밍턴 물류센터 운영
   - 멤버십 'OY멤버스' 도입 — Friend(가입)/Green($350 이상)/Gold($600 이상) 등급, 가입·생일 혜택과 포인트 적립, 7월부터 매월 첫 7일 'O.Y 멤버스 위크' 운영
   - 스킨스캔 셀프 진단 기기, '더 뷰티 랩' 무료 스킨케어 레슨, 하프 접객 등 매장 서비스 운영
   - 약 400개 브랜드·5,000개 이상 상품(80% 이상 K뷰티·K웰니스)을 8개 카테고리로 구성
- **점검 질문**: Friend/Green/Gold 3단 등급과 가입·생일·멤버스위크 혜택을 우리 멤버십 화면에 옮긴다면 등급 승급 조건과 적립 동선을 어떻게 보여줄 것인가?
- **이미지**: https://img.cjnews.cj.net/wp-content/uploads/2026/05/CJSTORY_oliveyoung_20260521_01.jpg

### 5. Is agentic shopping the next big thing in beauty? Sephora and Ulta are betting yes

- **분류**: Service · 추천 · `웹서비스기획` · commerce_adjacent · **P1**
- **발행처**: Glossy Beauty Podcast (2026-05-28)
- **원문**: https://www.glossy.co/beauty/is-agentic-shopping-the-next-big-thing-in-beauty-sephora-and-ulta-are-betting-yes/
- **헤드라인**: 세포라·울타가 ChatGPT·Gemini 통합으로 뷰티 추천 개수와 대화 깊이를 서로 다르게 설계해 에이전틱 쇼핑에 베팅했다
- **핵심 사실**:
   - Sephora: 2026년 3월 ChatGPT 앱 통합 발표 — 얼굴 사진 업로드 기반 맞춤 추천, 3~4개 제품만 간결·대화식으로 제시
   - Ulta Beauty: 2026년 4월 Google Gemini 파트너십 통한 AI 통합 발표 — 11~12개 제품을 카테고리별 추천하고 팔로우업 질문 제공, 뷰티 외 질문은 거절
   - 두 회사 모두 Amazon의 뷰티 리테일 강화에 대응해 에이전틱 쇼핑/AI에 투자
- **점검 질문**: 추천 결과를 3~4개로 간결하게 줄일지, 11~12개로 카테고리별 제시할지 — 우리 뷰티 추천 화면의 적정 노출 개수와 후속 질문 동선은 어디인가?
- **이미지**: https://www.glossy.co/wp-content/uploads/sites/4/2026/05/Screenshot-2026-05-27-at-5.30.58-PM.png

### 추가 P2 후보 (디자인-개발 레퍼런스 풀, magazine-writer 자율 채택)

### 6. "여름 침구 미리 산다" 오늘의집, 여름 맞이 '냉감 패브릭' 검색량 급증

- **분류**: Service · 검색 · `웹서비스기획` · commerce_adjacent · **P2**
- **발행처**: 오늘의집(버킷플레이스) (2026-05-27)
- **원문**: https://ohstory.io/press/pressrelease/15350
- **헤드라인**: 오늘의집이 냉감 패브릭 검색량 급증 데이터로 시즌 수요를 읽었다
- **핵심 사실**:
   - 4월 대비 5월 검색량: '냉감이불세트' 249%, '냉감패드' 234%, '냉감이불' 220% 증가
   - '쿨매트' 전월 대비 153% 증가, 모달·시어서커 등 특정 소재 여름이불 검색도 상승
   - 5월 3주간 검색어 데이터 기준 분석, 기상청은 6~8월 기온이 평년보다 높을 확률 약 50~60%로 전망
   - 오늘의집 layer의 60수 순면 냉감이불세트 출시
- **점검 질문**: 검색어 증가율 데이터를 우리 검색 자동완성·시즌 기획전 우선순위에 반영한다면 어떤 소재 키워드를 먼저 끌어올릴 것인가?
- **이미지**: https://ohstory.io/wp-content/uploads/2026/05/%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-%EC%9D%B4%EB%AF%B8%EC%A7%80%EC%9E%90%EB%A3%8C-%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-layer%EC%9D%98-%EB%83%89%EA%B0%90%EC%9D%B4%EB%B6%88%EC%84%B8%ED%8A%B8.jpg

---

## DESIGN (18)

### 1. 5년 만의 사용성 고민? 구글 워크스페이스 아이콘 개편

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P0**
- **발행처**: DIGITAL iNSIGHT (2026-05-29)
- **원문**: https://ditoday.com/5년-만에-사용성-찾아-나서기-구글-워크스페이스-아이/
- **헤드라인**: 구글이 통일 4색 체계를 버리고 서비스별 고유 색·실루엣 강조·그라데이션으로 아이콘 변별력을 다시 짰다
- **핵심 사실**:
   - 구글 통일 4색 체계 폐지, 서비스별 고유 색(지메일 빨강, 캘린더 파랑, 미트 노랑 등) 부여
   - 아이콘을 감싸던 흰색 페이지 컨테이너 제거로 실루엣이 더 뚜렷해짐
   - 전 아이콘에 그라데이션 적용 — AI/제미나이 브랜드 전략 맥락으로 해석
- **점검 질문**: 통일 컬러로 서비스 구분이 흐려졌던 문제를 고유 색 복귀로 푼 결정을, 우리 프로덕트군 아이콘·BI 시스템의 식별성 검수에 어떻게 적용할 것인가?
- **이미지**: https://ditoday.com/wp-content/uploads/2026/05/0529.jpg

### 2. How To Make Your Design System AI-Ready

- **분류**: Design · 운영도구 · `웹디자인` · design_dev_reference · **P0**
- **발행처**: Smashing Magazine (Vitaly Friedman) (2026-06-03)
- **원문**: https://smashingmagazine.com/2026/06/how-make-design-system-ai-ready/
- **헤드라인**: 디자인 결정을 spec 파일·토큰·감사 스크립트 3계층으로 문서화해 디자인시스템을 AI가 읽게 만든다
- **핵심 사실**:
   - 디자인 결정을 인프라처럼 spec 파일(Markdown: 간격/색/컴포넌트 규칙)로 문서화
   - FigmaLint 플러그인 — detached instance·누락 상태·하드코딩 값 감지
   - spec 파일 + 토큰 레이어 + 감사 스크립트의 3계층 구조, Atlassian·Carbon(IBM)·Nordhealth의 AI-ready 명세 예시
- **점검 질문**: spec 파일(간격·색·컴포넌트 규칙)+토큰 레이어+FigmaLint 감사의 3계층 구조를 우리 디자인시스템에 세운다면 어디부터 명세화할 것인가?
- **이미지**: https://files.smashing.media/articles/how-make-design-system-ai-ready/1-traditional-llm-readable-design-systems.jpg

### 3. Office of Overview rebrands Odin, the Shopify for venture capital

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P1**
- **발행처**: The Brand Identity (Office of Overview / Avi Bamra) (2026-06-03)
- **원문**: https://the-brandidentity.com/project/office-of-overview-rebrands-odin-the-shopify-for-venture-capital
- **헤드라인**: Office of Overview가 오딘 신화 로고마크와 그리드+라운드 UI 패널로 'romance and rigour' 시스템을 짰다
- **핵심 사실**:
   - 오딘 신화(영원한 지식을 위해 한쪽 눈을 희생)에서 따온 눈 형태 로고마크
   - Mass Driver의 Thermochrome + Klim Type Foundry의 Die Grotesk 두 서체로 'romance and rigour' 운용
   - 생성 비주얼 작가 3인(Mariano Peccinetti, Gizem Akdag, Mac Baconai)과 협업한 'many worlds of progression', 단순 정방 그리드 + 라운드 UI 패널 기반 시스템
- **점검 질문**: 두 서체로 'romance and rigour'를 운용한 방식과 정방 그리드+라운드 패널 UI 시스템을 우리 브랜드 시스템 제안의 톤 양극 설계에 어떻게 참고할 것인가?
- **이미지**: https://the-brandidentity.com/uploads/articles/2026/06/office-of-overview-rebrands-odin-the-shopify-for-venture-capital/Odin-Office-of-Overview-04.jpeg

### 4. 극단적으로 좁아진 인터브랜드 워드마크

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P1**
- **발행처**: Design Compass (박종민) (2026-06-04)
- **원문**: https://designcompass.org/2026/06/04/interbrand-rebranding/
- **헤드라인**: 인터브랜드 내부 팀이 워드마크 커닝을 극단적으로 좁혀 작은 스케일 가독성 논쟁을 자초했다
- **핵심 사실**:
   - 워드마크가 소문자에서 대문자로 전환되고 커닝이 극단적으로 좁아져 일부 조합이 한 덩어리처럼 읽힘
   - 외부 스튜디오가 아니라 인터브랜드 내부 팀이 리브랜딩 진행
   - 좁은 커닝은 'Iconic Moves'·단단하고 압축된 조직 인상을 의도하나 앱 아이콘/소셜 프로필 등 작은 스케일에서 가독성 우려
- **점검 질문**: 압축된 커닝이 앱 아이콘·소셜 프로필 작은 크기에서 무너지는 문제를, 우리 워드마크 제안의 최소 노출 크기 검수에 어떻게 반영할 것인가?
- **이미지**: https://designcompass.org/wp-content/uploads/2026/06/Interbrand.jpg

### 5. Koto revives an 80-year-old wordmark to rebrand Norton Museum of Art

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P1**
- **발행처**: It's Nice That (Olivia Hingley) (2026-06-03)
- **원문**: https://www.itsnicethat.com/articles/koto-norton-museum-of-art-graphic-design-project-030626
- **헤드라인**: Koto가 80년 된 워드마크를 발굴·재드로잉하고 건축 원형 기하를 참조한 서체로 노턴 미술관을 리브랜딩했다
- **핵심 사실**:
   - 아카이브 문서 마스트헤드에서 발견한 80년 된 'Norton' 워드마크를 복원
   - 1941년 Paul Manship 조각 기반 Diana Seal을 가독성·축소 적용 위해 재드로잉
   - Sharp Type의 Centra No. 2 사용(Foster + Partners 2019 증축의 원형 기하 참조), 플로리다 풍경에서 딴 컬러 팔레트 + 'N'의 40도 사선 요소
- **점검 질문**: 축소·가독성을 위해 헤리티지 자산을 재드로잉한 방식과 건축 기하 참조 서체 선택을, 우리 리뉴얼 제안의 헤리티지 계승 논리에 어떻게 쓸 것인가?
- **이미지**: https://admin.itsnicethat.com/images/5IooqjxtedNKIE8j6w_3Ah9wUrE=/278761/width-1440/TheNortonMuseum_Koto_5.jpg

### 6. Ey Studio avoided ‘gourmet’ trends for something more authentic to rebrand Italy’s most iconic panettonne

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P1**
- **발행처**: It's Nice That (2026-06-01)
- **원문**: https://www.itsnicethat.com/articles/ey-studio-alemagna-branding-project-010625
- **헤드라인**: Ey Studio가 'gourmet' 트렌드를 거부하고 헤리티지 컬러·모더니즘 레터링으로 파네토네 브랜드를 다시 세웠다
- **핵심 사실**:
   - 이탈리아 Ey Studio가 밀라노 제과 브랜드 Alemagna(파네토네) 리브랜딩
   - 이탈리아 모더니즘 기반의 기하·핸드크래프트 레터링으로 활판 인쇄 서체 연상
   - Alemagna 헤리티지 ice blue + 볼드한 red-orange 조합으로 파스텔 베이커리 톤 탈피, 'gourmet/new-wave' 트렌드 거부
- **점검 질문**: 유행 톤(파스텔 베이커리)을 일부러 버리고 헤리티지 컬러 대비로 차별화한 결정을, 우리 식음료·뷰티 패키지 리뉴얼의 트렌드 거리두기 근거로 어떻게 쓸 것인가?
- **이미지**: https://admin.itsnicethat.com/images/eWiwWtWbQZ3euYAvPYD-LwYCOdY=/278578/width-1440/Post3.jpg

### 7. 네이버, 7월부터 플레이스 리뷰 평균 별점 공개한다

- **분류**: Design · 리뷰 · `웹디자인` · commerce_adjacent · **P1**
- **발행처**: DIGITAL iNSIGHT (2026-06-02)
- **원문**: https://ditoday.com/네이버-7월부터-플레이스-리뷰-평균-별점-공개한다/
- **헤드라인**: 네이버가 7월부터 플레이스 누적 평균 별점을 공개하되 사업주 ON/OFF 옵션을 함께 열었다
- **핵심 사실**:
   - 7월 9일부터 누적 평균 별점과 사용자별 개별 별점을 플레이스 리뷰 주요 영역에 노출
   - 사업주가 별점 공개 여부를 고르는 ON/OFF 옵션 도입(2021-10 이후 개업은 미노출 기본값)
   - 평균 별점은 2021-10-25 이전 누적 + 올해 신규 수집분 합산, 5점 척도 기반
- **점검 질문**: 평균 별점 공개에 사업주 ON/OFF 선택권을 준 정책을, 우리 리뷰 별점 노출·판매자 운영도구 설계의 통제권 분배에 어떻게 반영할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 8. How to Get Research Recommendations on the Roadmap

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P1**
- **발행처**: Nielsen Norman Group (Laura Klein) (2026-05-29)
- **원문**: https://www.nngroup.com/articles/research-recommendations-roadmap/
- **헤드라인**: 리서치 결과를 리텐션·전환 같은 PM 지표 언어로 번역해 로드맵에 올리는 법
- **핵심 사실**:
   - 솔루션이 테이블에 오르기 전 discovery 단계에서 합류해야 영향력이 커진다
   - 연구 결과를 PM 성과 지표(리텐션·전환·지원 문의량) 언어로 번역해 연결
   - 관찰을 명확한 권고로 전환('내비게이션 어려움 → step-3 이탈, 다음 테스트 제안')
- **점검 질문**: 관찰을 '내비 어려움→step-3 이탈'식 권고로 전환하고 PM 지표로 번역하는 방식을, 우리 UX 리서치 산출물의 의사결정 연결력을 높이는 데 어떻게 쓸 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 9. Your Prototype Is Not Being Honest With Your Users (And Here’s How To Fix It)

- **분류**: Design · 결제 · `웹디자인` · design_dev_reference · **P1**
- **발행처**: Smashing Magazine (Eric Joseph L.) (2026-05-25)
- **원문**: https://smashingmagazine.com/2026/05/prototype-users-fix-protopie/
- **헤드라인**: ProtoPie의 Input 레이어·변수·조건 로직으로 진짜 로그인 인증을 구현해 가짜 프로토타입의 테스트 오염을 없앤다
- **핵심 사실**:
   - 사용성 테스트에서 참가자가 인터랙션 화면에서 멈칫·시선 들기 → 실제 앱이 아님을 인지해 데이터 오염
   - ProtoPie의 Input 레이어·Text Password 속성·변수 바인딩·조건 로직으로 실제 로그인 인증 구현(하드코딩 자격증명 검증)
   - 자격증명 실패 시에만 뜨는 진짜 에러 메시지로 재시도·인증 전환 관찰 가능한 테스트 터치포인트 구성
- **점검 질문**: 하드코딩 자격증명 검증·실패 시 진짜 에러 메시지로 재시도를 관찰하는 방식을, 우리 사용성 테스트용 결제·로그인 프로토타입의 충실도 기준에 어떻게 적용할 것인가?
- **이미지**: https://files.smashing.media/articles/prototype-users-fix-protopie/Intro_fintech-tutorial-login-usecases-preview.gif

### 10. 결제는 가볍게, 영감은 가득히

- **분류**: Design · 결제 · `웹디자인` · core_ecommerce · **P1**
- **발행처**: Toss Blog (2026-05)
- **원문**: https://toss.im/tossfeed/article/booknic
- **헤드라인**: 토스가 매장 프론트를 바라보면 결제가 끝나는 FacePay로 카드 선택·단말 인식 단계를 통째로 없앴다
- **핵심 사실**:
   - FacePay — 매장 토스 프론트를 바라보면 결제 완료, 카드 선택·단말 인식 과정 생략
   - 서울숲 영풍문고 커뮤니티센터 '영감이 필요한 순간' 공간, 북크닉 키트(피크닉 박스·매트·거울·책) 최대 2시간 대여
   - 북크닉 이벤트 5월 22~31일 10일간 사전 예약제 운영
- **점검 질문**: 카드 선택·단말 인식 과정을 생략한 FacePay 결제 동선을, 우리 오프라인·앱 결제 플로우의 단계 축소 설계에 어떻게 옮길 것인가?
- **이미지**: https://resources-fe.toss.im/image-optimize/width=3840,quality=95/https%3A%2F%2Fstatic.toss.im%2Fphotos%2F_MG_0155.jpg

### 추가 P2 후보 (디자인-개발 레퍼런스 풀, magazine-writer 자율 채택)

### 11. 애플 디자인 어워드 2026, 올해의 앱과 게임 12개 공개

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: Design Compass (박종민) (2026-06-04)
- **원문**: https://designcompass.org/2026/06/04/apple-design-awards-2026/
- **헤드라인**: 애플이 6개 부문(포용성·인터랙션·비주얼 등) 기준으로 올해의 앱·게임 12개를 가렸다
- **핵심 사실**:
   - 6개 부문(Delight and Fun, Inclusivity, Innovation, Social Impact, Interaction, Visuals and Graphics)에서 앱·게임 각 1개씩 총 12개 수상
   - 전 세계 36개 최종 후보 중 선정, 수상 개발자는 WWDC26에서 공식 소개
   - 수상작 예: Innovation 앱 'NBA: Live Games & Scores'/게임 'Blue Prince', Visuals 게임 'Cyberpunk 2077: Ultimate Edition'
- **점검 질문**: 포용성·인터랙션·비주얼 6개 평가 부문을 우리 앱·웹 UIUX 품질 기준 체크리스트로 역참조한다면 어느 축이 비어 있는가?
- **이미지**: https://designcompass.org/wp-content/uploads/2026/06/wwdc-2026-design-award.jpg

### 12. 지금 가장 필요한 디자인 미학 세우기

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: Design Compass (박종민) (2026-06-01)
- **원문**: https://designcompass.org/2026/06/01/building-the-design-aesthetic-you-need-most-right-now/
- **헤드라인**: AI가 평균 품질을 끌어올릴수록 도구 숙련이 아닌 판단 기준이 디자이너의 차별화 요소라는 주장
- **핵심 사실**:
   - 뛰어난 디자이너는 정립된 미학 철학을 닻으로 삼아 트렌드 변화에 휩쓸리지 않는다는 주장
   - AI가 평균 품질을 끌어올릴수록 도구 숙련이 아니라 판단 기준이 차별화 요소가 된다
   - 레퍼런스 수집보다 '왜 끌리는지' 해석해야 개인 미학 프레임이 내재화된다
- **점검 질문**: 레퍼런스를 '왜 끌리는지' 해석해 개인 미학 프레임을 세운다는 논지를, 우리 디자이너 온보딩·리뷰 문화에 어떻게 녹일 것인가?
- **이미지**: https://designcompass.org/wp-content/uploads/2026/06/aethe-01.jpg

### 13. Daryn Roongrawewan doesn’t design logos, she crafts “ornamental icons”

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: It's Nice That (Ellis Tree) (2026-06-03)
- **원문**: https://www.itsnicethat.com/articles/daryn-roongrawewan-graphic-design-discover-030626
- **헤드라인**: 다린 룽그라위완이 자연 관찰·빈티지 레퍼런스에서 변형되는 'ornamental icon' 레터폼을 만든다
- **핵심 사실**:
   - 베를린 기반 디자이너, 디지털 시작 대신 빈티지 레퍼런스·자연 관찰에서 형태를 도출(Padma 로고의 P는 자연에서 관찰)
   - Atelier Lin 플라워숍 아이덴티티 — 장식적 곡선 + 금속처럼 단단한 모서리의 커스텀 레터폼, 'L'이 회전하며 꽃 드로잉으로 변형
   - 빅토리아·1920년대 영향의 정교한 'ornamental icon' 접근
- **점검 질문**: 글자가 회전하며 꽃 드로잉으로 변형되는 커스텀 레터폼 접근을, 우리 모션 로고·인터랙션 아이덴티티 제안의 변형 모티프 발상에 어떻게 참고할 것인가?
- **이미지**: https://admin.itsnicethat.com/images/TRSqbjt0TCF6KVYGWzTMK6k9EkM=/277998/width-1440/Daryn_Atelier_Lin_logo.jpg

### 14. Why design studio OnePlus treats branding like cultural excavation, not invention

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: It's Nice That (Ellis Tree) (2026-06-02)
- **원문**: https://www.itsnicethat.com/articles/oneplus-graphic-design-discover-020626
- **헤드라인**: 밀라노 스튜디오 OnePlus가 '발명이 아닌 발굴' 철학으로 주제의 문화 코어를 파내 브랜딩한다
- **핵심 사실**:
   - 밀라노 기반 스튜디오, 2023년 디자이너 6인(Pietro Avolio 등)이 설립
   - '발명이 아닌 발굴(excavation)' 철학 — 주제의 문화·시각 코어를 파내는 접근
   - 밀라노 필리핀 타파스 레스토랑 아이덴티티, 상실·기억을 다룬 책 디자인 등 포트폴리오
- **점검 질문**: '발굴' 접근으로 대상의 문화·시각 코어를 먼저 찾는 리서치 단계를, 우리 BX 제안의 초기 디스커버리 방법론에 어떻게 끼워 넣을 것인가?
- **이미지**: https://admin.itsnicethat.com/images/T0BIr2OUeMim1-YUxld5TC124_U=/277466/width-1440/1._Oneplus_-_Balay_1.jpg

### 15. Using RAS to Guide UX Research Resource Allocation and Strategy

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: Nielsen Norman Group (Brian Utesch, Tammi Fitzwater) (2026-05-29)
- **원문**: https://www.nngroup.com/articles/ras-research-resource-allocation/
- **헤드라인**: 권고 채택률(RAS)을 지표화해 리서치 자원 배분을 임팩트 기준으로 정당화한다
- **핵심 사실**:
   - RAS = Recommendation-Adoption Score — 권고 가치 중 실제 사용자에게 도달한 비율을 측정
   - 활동량이 아니라 임팩트 기준으로 리서치 인력·자원 배분을 정당화
   - recommendation velocity(3개월 월평균) + RAS 추세(6개월 롤링 기울기)를 결합해 STOP/CAUTION/CONTINUE 신호 산출
- **점검 질문**: 권고-채택 점수와 velocity 추세로 STOP/CAUTION/CONTINUE 신호를 내는 방식을, 우리 리서치 조직의 성과 측정 틀에 도입할 여지가 있는가?
- **이미지**: (글쓰기 단계 확보 필요)

### 16. The Case for Design Disposables

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: Nielsen Norman Group (Laura Klein) (2026-05-22)
- **원문**: https://www.nngroup.com/articles/design-disposables/
- **헤드라인**: 산출물을 '전달용 딜리버러블'과 '사고용 디스포저블'로 의도에 따라 갈라 매몰비용 함정을 피한다
- **핵심 사실**:
   - 디자인 디스포저블 = 전달이 아닌 '사고를 돕기 위해' 만드는 거친 산출물
   - 디스포저블/딜리버러블 구분은 산출물 자체가 아니라 '의도'에 있음(초기 스케치·브레인스토밍 메모·러프 프로토타입 등)
   - '누구를 위한 것인가?' 질문으로 내부용=디스포저블, 외부 이해관계자용=딜리버러블 판단 — 매몰비용 함정 회피
- **점검 질문**: '누구를 위한 것인가'로 내부용·외부용 산출물을 구분하는 기준을, 우리 디자인 산출물 투입 시간 관리에 어떻게 쓸 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 17. Closing the Loop: What to Do After a Design Critique Ends

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: Nielsen Norman Group (Rachel Krause) (2026-05-22)
- **원문**: https://www.nngroup.com/articles/after-design-critique/
- **헤드라인**: 크리틱 직후 리캡·before/after 주석·미반영 피드백 명시로 디자인 리뷰의 신뢰 루프를 닫는다
- **핵심 사실**:
   - 크리틱 직후 Slack/Teams로 '진행할 것·검토 중·하지 않기로 한 것' 요약 리캡 발송
   - 변경을 피드백에 연결한 before/after 주석 문서화('This changed because you said that')
   - 반영하지 않은 피드백을 명시·이유·다음 단계까지 투명하게 공유해 신뢰 유지
- **점검 질문**: 'This changed because you said that' 식 before/after 주석과 미반영 사유 공유를, 우리 디자인 리뷰 마무리 루틴에 어떻게 정착시킬 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 18. Four Levels Of Customer Understanding

- **분류**: Design · 없음 · `웹디자인` · design_dev_reference · **P2**
- **발행처**: Smashing Magazine (Vitaly Friedman) (2026-05-22)
- **원문**: https://smashingmagazine.com/2026/05/four-levels-customer-understanding/
- **헤드라인**: 고객 이해를 말하는 것·감정·행동·이유 4단계로 나누고 exposure hours로 직접 접촉을 제도화한다
- **핵심 사실**:
   - 고객 이해 4단계: ①말하는 것(설문, 신뢰 낮음) ②생각·감정(인터뷰) ③행동(분석·태스크 분석) ④이유(관찰·심층 인터뷰)
   - Exposure hours — 직원이 6~12주마다 고객과 2시간 이상 직접 접촉
   - 헬프데스크 불만 분기 분석, 사용자 공동 디자인(기능 랭킹) 등 방법 제시
- **점검 질문**: 설문(신뢰 낮음)에서 관찰·심층 인터뷰(이유)로 올라가는 4단계 모델을, 우리 고객 리서치 방법 믹스의 빈 단계 진단에 어떻게 쓸 것인가?
- **이미지**: https://files.smashing.media/articles/four-levels-customer-understanding/1-four-levels-customer-understanding.jpg

---

## DEV (22)

### 1. @function

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: Declan Chidlow, CSS-Tricks Almanac (2026-06-03)
- **원문**: https://css-tricks.com/almanac/rules/f/function/
- **헤드라인**: CSS @function이 인자를 받고 값을 반환하는 네이티브 커스텀 함수를 표준에 들였다
- **핵심 사실**:
   - @function은 인자를 받고 값을 반환하는 재사용 가능한 CSS 커스텀 함수를 정의하며, 구문은 @function --name(--param <length>) { result: ... } 형태
   - 파라미터는 --로 시작하는 dashed ident여야 하고 타입(<length>·<color> 등)·기본값·# 리스트 지원, result 디스크립터로 반환값 지정
   - CSS Custom Functions and Mixins Module Level 1(css-mixins-1) 명세 기반이며 현재 Chrome 148+에서 제한적 지원, @supports (at-rule(@function))로 기능 감지
- **점검 질문**: @function으로 토큰 계산 로직을 SCSS 함수 대신 순수 CSS로 옮긴다면, Chrome 148+ 제한 지원과 @supports 폴백을 어떻게 깔 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 2. Accessible (I Think) Split-Cell Table Headers

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: Eric Meyer, meyerweb.com (2026-05-28)
- **원문**: https://meyerweb.com/eric/thoughts/2026/05/28/accessible-i-think-split-cell-table-headers/
- **헤드라인**: 에릭 마이어가 대각선 분할 표 헤더를 rowspan·absolute·linear-gradient로 WCAG 1.3.3을 지키며 구현했다
- **핵심 사실**:
   - 대각선으로 분할된 표 헤더 셀을 컬럼 헤더는 rowspan="2"로 두 행을 걸치고, 두 번째 thead 행을 position: absolute; bottom:0; left:0로 첫 셀 위에 겹쳐 배치
   - 대각선은 첫 셀에 linear-gradient 배경으로 그리며, Alice Boxhall·Adrian Roselli가 불완전한 행이 WCAG 1.3.3을 위반한다고 지적해 rowspan 해법으로 수정
   - Safari가 thead에 relative positioning을 적용하지 않아 transform·display를 조정하는 벤더별 @supports 규칙으로 우회
- **점검 질문**: 불완전한 행의 WCAG 위반을 rowspan 해법으로 풀고 Safari positioning 차이를 @supports로 우회한 패턴을, 우리 복잡한 표 헤더 마크업 가드라인에 어떻게 넣을 것인가?
- **이미지**: https://meyerweb.com/eric/thoughts/wp-content/uploads/apollo_16-page_050-crop.png

### 3. ::search-text

- **분류**: DEV · 검색 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: CSS-Tricks (Sunkanmi Fafowora) (2026-06-02)
- **원문**: https://css-tricks.com/almanac/pseudo-selectors/s/search-text/
- **헤드라인**: ::search-text가 브라우저 '페이지 내 찾기' 일치 텍스트를 스타일링하는 의사 요소를 표준에 더했다
- **핵심 사실**:
   - ::search-text는 브라우저 '페이지 내 찾기'(Ctrl+F/⌘F) 일치 텍스트를 선택하는 하이라이트 의사 요소로, background-color·color·text-decoration·text-shadow·custom property만 지원하고 레이아웃 속성은 제외된다
   - ::search-text:current 조합으로 여러 일치 항목 중 현재 포커스된 항목만 별도 스타일링 가능, 속성은 트리 하위로 캐스케이드된다
   - CSS Pseudo-Elements Module Level 4에 정의된 기능으로 접근성상 색 대비 4.5:1 유지와 과한 색 변경 대신 text-decoration 권장
- **점검 질문**: ::search-text:current로 현재 일치 항목을 강조하되 대비 4.5:1과 text-decoration 권장을 지키는 방식을, 우리 긴 콘텐츠 페이지의 인페이지 검색 가독성에 어떻게 적용할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 4. New to the web platform in May

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: web.dev (Rachel Andrew) (2026-05-29)
- **원문**: https://web.dev/blog/web-platform-05-2026?hl=en
- **헤드라인**: :open 의사 클래스 Baseline, 이름 기반 컨테이너 쿼리, 미디어 lazy 로딩 등 5월 웹 플랫폼 신기능이 한 번에 들어왔다
- **핵심 사실**:
   - :open CSS 의사 클래스가 Safari 26.5에서 지원되며 details·dialog·picker 등 열림/닫힘 상태 스타일링을 details[open] 속성 선택자 대신 처리 (Baseline)
   - Chrome 148이 이름만 사용하는 컨테이너 쿼리(container-type 설정 불필요)와 video·audio의 loading="lazy" 네이티브 지연 로딩 지원 추가
   - Firefox 151이 @container의 style() 커스텀 프로퍼티 쿼리와 데스크톱 Document Picture-in-Picture API 도입
- **점검 질문**: :open으로 details/dialog 상태 스타일링을 단순화하고 container-type 없이 이름만으로 컨테이너 쿼리를 쓰는 변화를, 우리 컴포넌트 CSS 기준선 업데이트에 언제 반영할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 5. Algorithmic Theming Engines: Building Self-Correcting Color Systems With `contrast-color()`

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: Smashing Magazine (Durgesh Pawar) (2026-05-28)
- **원문**: https://smashingmagazine.com/2026/05/building-self-correcting-color-systems-contrast-color/
- **헤드라인**: contrast-color()가 브랜드 색에 맞춰 흑/백 텍스트를 자동 반환해 자가 교정 컬러 시스템을 짠다
- **핵심 사실**:
   - contrast-color() 함수는 색을 받아 검정 또는 흰색 중 대비가 높은 쪽을 반환(color: contrast-color(var(--brand-color))), 비율 숫자가 아닌 실제 색값 반환
   - Chrome 147(2026.4)·Firefox 146·Safari 26.0 안정판 구현, 2026년 4월 Baseline Newly Available 도달
   - WCAG 2.x 상대 휘도 수식 기반, 출력이 보간 불가능한 이산값이라 transition 시 색이 부드럽게 페이드되지 않고 약 18% 휘도 지점에서 스냅됨
- **점검 질문**: Baseline 도달한 contrast-color()로 토큰 기반 대비를 자동화하되, 출력이 이산값이라 transition 시 18% 휘도에서 스냅되는 한계를 우리 디자인 토큰 설계에서 어떻게 감안할 것인가?
- **이미지**: http://files.smashing.media/articles/building-self-correcting-color-systems-contrast-color/building-self-correcting-color-systems-contrast-color.jpg

### 6. Advanced Tree Counting: Mathematical Layouts With `sibling-index()` And `sibling-count()`

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: Smashing Magazine (Durgesh Pawar) (2026-05-21)
- **원문**: https://smashingmagazine.com/2026/05/mathematical-layouts-sibling-index-sibling-count/
- **헤드라인**: sibling-index()·sibling-count()가 :nth-child() 없이 스태거 애니메이션·수학적 레이아웃을 한 줄로 만든다
- **핵심 사실**:
   - sibling-index()는 1-based 위치, sibling-count()는 전체 자식 수를 <integer>로 반환해 calc()·min()·max()·삼각함수에서 사용 가능
   - animation-delay: calc(sibling-index() * 100ms) 한 줄로 :nth-child() 없이 5~5000개 항목 스태거 애니메이션 구현
   - Chrome/Edge 138(2025.6)·Safari 26.2 안정판 지원, Firefox 미구현이라 @supports 점진 향상 권장. display:none 요소도 sibling-count()에 포함되는 DOM 트리 기반 한계
- **점검 질문**: animation-delay: calc(sibling-index()*100ms)로 항목 수에 무관한 스태거를 짜되 Firefox 미구현·display:none 포함 한계를, 우리 리스트 모션 컴포넌트에 어떻게 점진 적용할 것인가?
- **이미지**: http://files.smashing.media/articles/mathematical-layouts-sibling-index-sibling-count/mathematical-layouts-sibling-index-sibling-count.jpg

### 7. The State of CSS Centering in 2026

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: CSS-Tricks (Temani Afif) (2026-05-22)
- **원문**: https://css-tricks.com/the-state-of-css-centering-in-2026/
- **헤드라인**: 2026년 CSS 가운데 정렬을 디스플레이별·안전 정렬·앵커 정렬까지 한 번에 정리했다
- **핵심 사실**:
   - grid/flex에서 place-content: center, block display에서 align-content·justify-items 조합 등 디스플레이별 정렬 방식 구분
   - place-content: safe center로 오버플로 시 콘텐츠 잘림을 막는 안전 정렬, anchor positioning의 place-self: end anchor-center 활용
   - inset:0 + place-self:center로 기존 absolute 정렬 대체하는 현대적 패턴 제시
- **점검 질문**: place-content: safe center로 오버플로 잘림을 막고 inset:0+place-self:center로 absolute 정렬을 대체하는 패턴을, 우리 정렬 유틸리티 클래스 정비에 어떻게 반영할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 8. Cross-Document View Transitions: Scaling Across Hundreds of Elements

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: CSS-Tricks (Durgesh Pawar) (2026-05-25)
- **원문**: https://css-tricks.com/cross-document-view-transitions-part-2/
- **헤드라인**: view-transition-class와 동적 명명으로 수백 개 요소의 크로스-도큐먼트 뷰 트랜지션을 셀렉터 폭증 없이 확장한다
- **핵심 사실**:
   - view-transition-name(고유 식별자)과 view-transition-class(스타일 훅)를 구분하고 ::view-transition-group(*.card) 와일드카드로 셀렉터 폭증 방지
   - stylesheet에 미리 이름 두지 않고 pageswap/pagereveal 라이프사이클에서 동적 명명해 상호작용 요소만 스냅샷, 성능 오버헤드 감소
   - 모든 애니메이션을 @media (prefers-reduced-motion: no-preference)로 감싸 접근성 보장, 미지원 브라우저는 일반 내비게이션으로 점진 향상
- **점검 질문**: pageswap/pagereveal에서 상호작용 요소만 동적 명명해 스냅샷하고 prefers-reduced-motion으로 감싸는 방식을, 우리 다중 페이지 전환 애니메이션 성능·접근성 기준에 어떻게 적용할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 9. Maybe Don’t Rely on Google’s “Modern Web Guidance”

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P0**
- **발행처**: Adrian Roselli (2026-05-25)
- **원문**: https://adrianroselli.com/2026/05/maybe-dont-rely-on-googles-modern-web-guidance.html
- **헤드라인**: Adrian Roselli이 구글 MWG의 접근성 누락과 LLM 생성 코드의 WCAG 위반을 실증으로 깠다
- **핵심 사실**:
   - MWG가 토스트 알림 등 흔한 인터랙티브 패턴의 접근성 가이드를 누락, 가이드가 흩어질수록 AI 에이전트가 누락할 가능성 지적
   - MWG로 생성한 아코디언 예제가 WCAG 위반 — Baseline·폴백 약속에도 Firefox에서 애니메이션이 동작하지 않는 오류 발견
   - LLM 비결정성으로 접근성 규칙 준수 보장 불가, Google 컨설턴트도 '어떤 프롬프트에 가이드가 쓰일지 보장 못 한다' 인정
- **점검 질문**: MWG로 생성한 아코디언이 WCAG를 위반하고 Firefox에서 깨진 사례를, 우리 AI 생성 마크업의 접근성 검수 가드라인 강화 근거로 어떻게 쓸 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 10. What’s missing in CSS layout?

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: Chris Coyier, Frontend Masters Blog (2026-06-02)
- **원문**: https://frontendmasters.com/blog/whats-missing-in-css-layout/
- **헤드라인**: Grid·Flex·Container query로도 메우지 못한 CSS 레이아웃의 '12가지 공백'을 짚는다
- **핵심 사실**:
   - Patrick Brosset의 분석을 인용해 CSS 레이아웃에 빠진 기능이 '족히 12가지(solid dozen)' 있다고 정리
   - CSS Grid·Flexbox·Container queries를 현행 레이아웃의 강력한 도구로 들면서도, 구체적으로 파고들면 여전한 공백이 드러난다고 지적
   - CSS가 이미 알고 있는 것보다 많은 기능을 담고 있어 부족함이 잘 안 느껴지지만, 세부 명세를 보면 한계가 보인다는 논지
- **점검 질문**: 현행 레이아웃 도구의 한계 12가지 중 우리가 매번 우회 코드로 때우는 항목은 무엇이고, 표준 진척을 어디까지 기다릴 것인가?
- **이미지**: https://i0.wp.com/frontendmasters.com/blog/wp-content/uploads/2026/06/pexels-photo-6991807.jpeg?fit=1024%2C682&ssl=1

### 11. offset-path

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: Geoff Graham, CSS-Tricks Almanac (2026-06-03)
- **원문**: https://css-tricks.com/almanac/properties/o/offset-path/
- **헤드라인**: offset-path가 motion-* 개명을 거쳐 경로 기반 애니메이션을 표준 속성으로 정리했다
- **핵심 사실**:
   - offset-path는 애니메이션 시 요소가 따라갈 이동 경로를 정의하며, 과거 motion-path였던 속성을 spec에서 motion-* → offset-*로 개명한 것
   - 지정 가능한 값은 path()·shape()·url()·circle()/ellipse()/inset()/polygon()/xywh()·none이지만 실제로 동작하는 건 사실상 path()와 none뿐
   - 관련 속성으로 offset-distance(경로 진행), offset-rotate(회전), offset-anchor(앵커 지점)가 함께 동작하며 @keyframes에서 offset-distance: 100%로 이동을 구동
- **점검 질문**: path()와 offset-distance/offset-rotate 조합으로 JS 없이 경로 애니메이션을 짠다면, 실제 동작하는 값이 path()·none뿐인 제약을 어디까지 감안할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 12. @custom-media

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: Declan Chidlow, CSS-Tricks Almanac (2026-06-03)
- **원문**: https://css-tricks.com/almanac/rules/c/custom-media/
- **헤드라인**: @custom-media가 미디어 쿼리에 이름을 붙여 브레이크포인트를 재사용 가능한 별칭으로 만든다
- **핵심 사실**:
   - @custom-media는 미디어 쿼리에 별칭을 만드는 at-rule로, @custom-media --tablet (min-width: 768px); 처럼 정의하고 @media (--tablet)로 사용
   - 별칭은 --로 시작하는 dashed ident(대소문자 구분)이며 전역 스코프, range 구문(768px <= width <= 1024px)과 다른 custom media 중첩 참조 지원
   - Media Queries Level 5(mediaqueries-5) 명세 정의이며 JS matchMedia()로는 접근 불가, 미지원 브라우저는 무시하고 PostCSS 플러그인으로 보완
- **점검 질문**: --tablet 같은 미디어 별칭을 우리 반응형 시스템에 둔다면, 브라우저 미지원·matchMedia 접근 불가를 PostCSS로 어떻게 보완할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 13. Angular v22 발표

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: Angular Team, blog.angular.dev (2026-06-03)
- **원문**: https://blog.angular.dev/announcing-angular-v22-c52bb83a4664
- **헤드라인**: Angular v22가 Signal Forms 정식 출시와 12개 UI 패턴 접근성 프리미티브 Angular Aria를 프로덕션에 올렸다
- **핵심 사실**:
   - Signal Forms가 정식 출시 — 반응형 폼·강타입·템플릿 폼·시그널 반응성을 결합한 선언적 폼 API
   - Angular Aria가 12개 UI 패턴을 다루는 접근성 프리미티브로 프로덕션 준비 완료, 테스트 하니스 포함하며 Signal Forms와 완전 연동
   - OnPush가 신규 앱 기본 변경 감지로 전환되고 ChangeDetectionStrategy.Default가 Eager로 개명, Router가 네이티브 Navigation API 통합, resource·httpResource 비동기 API 제공
- **점검 질문**: Signal Forms와 완전 연동되는 접근성 프리미티브(Angular Aria)가 12개 UI 패턴을 다루는 방식을, 우리 폼·접근성 컴포넌트 설계 레퍼런스로 어떻게 볼 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 14. Release Notes for Safari Technology Preview 244

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: WebKit Blog (2026-05-21)
- **원문**: https://webkit.org/blog/17962/release-notes-for-safari-technology-preview-244/
- **헤드라인**: Safari TP 244가 transform 인식 앵커 포지셔닝과 canvas 포커스 접근성 버그 수정을 실었다
- **핵심 사실**:
   - position-anchor CSS 속성에 normal·none 값 지원과 transform 인식 앵커 포지셔닝 추가
   - AnimationEvent·TransitionEvent 인터페이스에 animation 속성 추가, shared worker 내 dedicated worker 생성 지원
   - canvas drawFocusIfNeeded()의 VoiceOver 커서 위치 접근성 버그 수정, MathML 다중 문자 연산자 지원
- **점검 질문**: position-anchor의 normal·none 지원과 drawFocusIfNeeded VoiceOver 수정을, 우리 앵커 포지셔닝·canvas 접근성 구현의 Safari 대응 체크에 어떻게 넣을 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 15. Astro 6.4

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: Astro Blog (Erika) (2026-05-28)
- **원문**: https://astro.build/blog/astro-640/
- **헤드라인**: Astro 6.4가 markdown.processor 교체 API와 Rust 기반 프로세서로 대형 문서 사이트 빌드를 단축했다
- **핵심 사실**:
   - markdown.processor 설정 API 신설로 기본 unified 파이프라인을 통째로 교체 가능, 상위 deprecated 옵션은 Astro 8.0까지 processor별 설정으로 이전
   - @astrojs/markdown-satteri Rust 기반 마크다운 프로세서로 대형 문서 사이트에서 1분 이상 빌드 시간 단축
   - @astrojs/cloudflare의 cf() 헬퍼가 실험적 고급 라우팅의 SESSION KV 바인딩 주입·ASSETS 정적 자산 서빙을 자동 설정
- **점검 질문**: unified 파이프라인을 통째로 교체하는 processor API와 Rust 프로세서의 빌드 단축을, 우리 Astro 기반 문서·콘텐츠 사이트의 빌드 병목 해소에 어떻게 쓸 것인가?
- **이미지**: https://astro.build/_astro/blog-post-astro-6.4.DCu1d7BD_ZIhAJT.webp

### 16. Revealing Text With CSS letter-spacing

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: CSS-Tricks (Preethi) (2026-05-27)
- **원문**: https://css-tricks.com/revealing-text-with-css-letter-spacing/
- **헤드라인**: letter-spacing와 color 전환만으로 텍스트 리빌·숨김 효과를 만드는 타이포 테크닉
- **핵심 사실**:
   - letter-spacing: -1ch + color: transparent로 글자를 겹쳐 숨긴 뒤 letter-spacing: 0ch·color로 전환해 텍스트를 드러내는 리빌 효과
   - letter-spacing: -2ch + text-indent: -1.5ch + overflow: clip 조합으로 콘텐츠를 화면 밖으로 밀어내는 숨김/교체 효과
   - ::first-letter만 color: black으로 남겨 첫 글자만 표시, cubic-bezier(.8,-.5,.2,1.4) 바운스 타이밍으로 스태거 애니메이션
- **점검 질문**: letter-spacing 음수+transparent로 겹쳐 숨겼다 드러내는 리빌을, 우리 히어로 카피 인트로 모션에 한국어 타이포 기준으로 쓸 수 있는가?
- **이미지**: (글쓰기 단계 확보 필요)

### 17. What’s !important #12: Safari Testing, ::checkmark, HTML Anchor Positioning, and More

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: CSS-Tricks (Daniel Schwarz) (2026-05-29)
- **원문**: https://css-tricks.com/whats-important-12/
- **헤드라인**: ::checkmark·border-shape·HTML 앵커 포지셔닝 등 최신 CSS 신기능을 한 묶음으로 짚는다
- **핵심 사실**:
   - ::checkmark 의사 요소로 체크박스·라디오·select의 체크마크를 스타일링하는 신규 CSS 기능 소개
   - HTML anchor 속성이 빠진 대신 data 속성과 고급 attr() 함수로 앵커 연관을 관리하는 방식 시연
   - border-shape + shape() 함수로 clip-path보다 다양한 테두리 형태 생성, Firefox 151 컨테이너 스타일 쿼리 Baseline 진입
- **점검 질문**: ::checkmark로 체크박스·select 체크마크를 스타일링하고 border-shape로 clip-path를 대체하는 신기능 중, 우리 폼 컴포넌트에 먼저 들일 것은 무엇인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 18. Astro Markdown Component Utility for Any Framework

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P1**
- **발행처**: CSS-Tricks (Zell Liew) (2026-06-01)
- **원문**: https://css-tricks.com/astro-markdown-component-utility-any-framework/
- **헤드라인**: Astro 슬롯과 markdown 유틸로 들여쓰기 오인 문제 없이 마크다운을 HTML로 렌더하는 패턴
- **핵심 사실**:
   - @splendidlabz/utils 패키지의 markdown 유틸이 마크다운 텍스트를 HTML로 변환하며 inline 옵션으로 p 태그 제거 지원
   - 들여쓴 콘텐츠를 코드 블록(4칸 이상 → pre/code)으로 오해하는 표준 라이브러리 문제를 들여쓰기 무관하게 올바른 HTML 생성으로 해결
   - Astro에서 Astro.slots.render('default')로 슬롯을 캡처해 <Fragment set:html={html} />로 렌더, Svelte는 슬롯 동적 읽기 제약으로 prop + {@html} 사용
- **점검 질문**: Astro.slots.render+set:html로 슬롯 마크다운을 렌더하고 Svelte는 prop+{@html}로 우회하는 방식을, 우리 멀티프레임워크 콘텐츠 렌더링에 어떻게 적용할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 추가 P2 후보 (디자인-개발 레퍼런스 풀, magazine-writer 자율 채택)

### 19. PolyCSS — Render 3D Meshes in the DOM with CSS

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P2**
- **발행처**: Layoutit / PolyCSS (2026-06-03)
- **원문**: https://polycss.com/
- **헤드라인**: PolyCSS가 WebGL 없이 DOM 요소와 matrix3d로 3D 메시를 렌더링한다
- **핵심 사실**:
   - PolyCSS는 WebGL·canvas 없이 DOM에서 3D 텍스처 메시를 렌더링하는 라이브러리로, 각 폴리곤이 실제 DOM 요소이며 transform: matrix3d(...)로 배치
   - OBJ·glTF·GLB·MagicaVoxel VOX 파일을 로드하고, UV 텍스처 삼각형을 스프라이트 아틀라스로 묶어 CSS background-position으로 처리하며 3D 레이어링은 브라우저 컴포지터가 담당
   - 각 폴리곤에 클릭 핸들러·CSS 클래스·애니메이션 적용 가능, 커스텀 엘리먼트(<poly-camera>·<poly-scene>·<poly-mesh>)와 React/Vue 바인딩 제공, npm·esm.sh CDN 배포
- **점검 질문**: 각 폴리곤이 DOM 요소라 클릭·CSS 클래스·애니메이션이 붙는 구조를, 우리 인터랙티브 3D 표현의 접근성·성능 트레이드오프 검토에 어떻게 참고할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 20. Expanded technical preview availability for the GitHub Copilot app

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P2**
- **발행처**: GitHub Changelog (2026-06-02)
- **원문**: https://github.blog/changelog/2026-06-02-expanded-technical-preview-availability-for-the-github-copilot-app
- **헤드라인**: GitHub Copilot 데스크톱 앱 프리뷰가 확대되며 Canvases로 사람-에이전트 병렬 작업 표면을 연다
- **핵심 사실**:
   - GitHub Copilot 데스크톱 앱 기술 프리뷰를 기존 Copilot Pro·Pro+·Business·Enterprise 고객 전체로 확대, Free 사용자는 대기자 등록
   - Windows·macOS·Linux 지원, 이슈·PR·프롬프트에서 세션을 시작하고 격리 워크스페이스로 병렬 에이전트 세션 실행
   - Canvases(사람·에이전트 양방향 작업 표면)에서 에이전트 진행을 가시적으로 갱신하고 사용자가 편집·재배치·재지정 가능, 음성 대화·클라우드 세션·에이전틱 브라우징 포함
- **점검 질문**: 이슈·PR에서 세션을 시작하고 Canvases에서 에이전트 진행을 편집·재지정하는 워크플로우가 우리 프론트엔드 작업 흐름에 실제로 끼어드는 지점은 어디인가?
- **이미지**: (글쓰기 단계 확보 필요)

### 21. GitHub Copilot code review for Azure Repos is now in technical preview

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P2**
- **발행처**: GitHub Changelog (2026-06-02)
- **원문**: https://github.blog/changelog/2026-06-02-github-copilot-code-review-for-azure-repos-is-now-in-technical-preview
- **헤드라인**: GitHub Copilot 코드 리뷰가 Azure Repos PR에서 온디맨드 인라인 리뷰로 들어간다
- **핵심 사실**:
   - Azure Repos PR에서 Copilot 코드 리뷰를 온디맨드로 요청 가능, 조직·리포 레벨에서 각각 활성화 필요
   - 코드 변경 인라인에 리뷰 코멘트 추가·개선 제안·잠재 이슈 조기 식별, Azure DevOps 떠나지 않고 수행
   - GitHub Copilot 라이선스 불필요, GitHub AI 크레딧 종량제 과금(2026-06-02 시작)이며 기존 Copilot 포함 크레딧은 소진하지 않음
- **점검 질문**: Azure DevOps를 떠나지 않고 인라인 리뷰 코멘트를 받는 흐름이, 우리 코드 리뷰 단계에 끼어드는 실측 가치가 있는가?
- **이미지**: https://github.blog/wp-content/uploads/2026/07/599853265-fad52fdd-37e1-4628-9be5-8334932a1d7b.jpg

### 22. Signed URLs are now available for Vercel Blob

- **분류**: DEV · 없음 · `웹DEV` · design_dev_reference · **P2**
- **발행처**: Vercel (2026-06-02)
- **원문**: https://vercel.com/changelog/signed-urls-are-now-available-for-vercel-blob
- **헤드라인**: Vercel Blob 서명 URL로 브라우저가 서버 경유 없이 대용량 파일을 직접 스트리밍 업로드한다
- **핵심 사실**:
   - put·get·head·delete 단일 작업, 단일 pathname, 최대 7일 만료로 스코프된 시간 제한 서명 URL 생성
   - PUT URL은 multipart 지원으로 브라우저가 서버 경유 없이 대용량 파일을 Blob에 직접 스트리밍, delete는 ifMatch ETag 조건부 보호
   - @vercel/blob 2.4.0 이상 필요, OIDC 연동으로 BLOB_READ_WRITE_TOKEN이 서버를 떠나지 않음
- **점검 질문**: PUT 서명 URL+multipart로 클라이언트가 토큰 노출 없이 직접 업로드하는 패턴을, 우리 파일 업로드 프론트엔드 동선·보안 설계에 어떻게 적용할 것인가?
- **이미지**: (글쓰기 단계 확보 필요)

---

## 수집했지만 제외한 것

- **당근 비즈프로필 단골 1000만 시대…"지역 가게 연결 강화"** — 당근마켓 / Service / weak_promo / 사유: 단골 수 달성·캠페인·랜덤 지원금 등 프로모션·마케팅 성과 발표로, 비즈프로필 화면·플로우·정책 변화 증거가 본문에 없음.
- **Why minimalist aesthetics (smuggled in as the language of progress) are stifling truly Arab design** — It's Nice That (Moe Elhossieny) / Design / exclude / 사유: 지역 디자인 비평 칼럼으로 화면·브랜드 시스템·도구 등 CTTD 제작 실무에 옮길 구체 결정 근거가 없음.
- **“Music venues are the engine of the creative industries”: lessons from the graphic ephemera of our lost clubs and pubs** — It's Nice That / Design / exclude / 사유: 전시 소개·문화 아카이브 기사로 디자인 시스템·화면 제작 실무에 옮길 구체 결정이 없음.

> 추가 제외(원문 부족·미확인)는 `source-verification-*.json`의 `원문 부족`/`원문 미확인` 항목 참조. 주요: Canva 뉴스룸 3건·uxdesign.cc(Medium) 7건은 본문 열람 차단으로 보류(재시도 시 통과 가능), Vercel/OpenAI 인프라 단신·shadcn 패치 단건은 원문 부족.
