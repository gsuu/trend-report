# DESIGN 레퍼런스 (2026-05-27 발견분 · v2)

> design-reference-scout v2 능동 탐색. 매거진 본문이 아니라 *보강 자료 풀*. 매거진 글 쓸 때 관련 주제면 인용 가능. ★ 표시는 "이번 주 레퍼런스 5선" 매거진 글 승격 후보.
>
> 탐색 경로: Hover States(24건 추출) · Typewolf(캐시 옛것, 시드 0) · Minimal Gallery(10건) · Godly(403 차단) · ProductHunt(7건) · Show HN(5건) · Codrops(6건, 인용 사이트 위주) · Awwwards Nominee(메타 없음) · Siteinspire(15건) · Lapa Ninja(15건).
>
> 11개 경로 중 8개 fetch 성공. 추출된 사이트 URL 시도 ~30개 / 본문 확인 성공 17개 / 최종 선별 10개 / 봇 차단 2건(Godly, Doodles).
>
> v1 7개(Razorpay Sprint 26, Floema, Happly, Polar, Julia Noni, Mennour, Make Good)는 제외. v2 10개 중 **갤러리 미공개(Hover States/Show HN 발견)는 6개, Awwwards/Siteinspire/Lapa 등재는 4개** — v1의 "전부 Awwwards/Siteinspire 100%"에서 큐레이션 매체 비중을 60%로 끌어올림.

---

## 1. Serena Congiu ★

- **URL**: https://www.serenacongiu.com/
- **어디서 발견**: Hover States 2026-05-18 feature `/features/serena-congiu/` — "tactile scale scroll and simple navigation" 본문에서 메인 추천
- **갤러리 노출 여부**: Awwwards SOTD 미등재 · Siteinspire 미등재 (큐레이션 매체 발견)
- **카테고리**: 포트폴리오 (밀라노 기반 메이크업 아티스트)
- **저장할 이유**: 메이크업 아티스트 포트폴리오가 보통 빠지는 "비포·애프터 그리드 + 인스타 임베드" 패턴 대신, Home/Information/Projects/Archive 4섹션 + 이미지별 "Link to the next page" CTA로 *작품 하나당 한 페이지* 깊이를 강제한다. K뷰티 아티스트 포트폴리오(쏘메이크업·정샘물 무빙 비주얼 등)가 그리드 외 깊이를 만드는 방식의 직접 참조점.
- **Look & Feel 포인트**: 화이트 베이스 · 검정 텍스트 추정 · Prismic CMS 기반 / 네비게이션 4섹션 / 비디오 태그 통합 (영상 포함 작품) / `rect, w, fit` 파라미터로 반응형 이미지 자동 최적화
- **장면 디테일**: 각 이미지 하단에 "Link to the next page" 텍스트 — 그리드 스크롤이 아니라 이미지마다 다음 작품 페이지로 이동시키는 강제 시퀀스
- **응용 후보**: 한국 메이크업 아티스트(쏘메이크업·정샘물·이사배) 개인 포트폴리오, K뷰티 캠페인 메이킹 페이지, 헤어 디자이너 포트폴리오, 패션 스타일리스트 사이트
- **캡처 URL**: og:image 명시 없음 — serenacongiu.com 홈 그리드 직접 캡처

## 2. Any Given Moment ★

- **URL**: https://www.anygivenmoment.co/
- **어디서 발견**: Hover States 2026-05-17 feature `/features/any-given-moment/` — "dial navigation providing a luxurious, mechanical feel" 메인 추천
- **갤러리 노출 여부**: Awwwards SOTD 미등재 · Siteinspire 미등재 (큐레이션 매체 발견)
- **카테고리**: 포트폴리오 (럭셔리 뷰티·패션 캠페인 프로덕션)
- **저장할 이유**: Chanel·Guerlain·Prada·L'Oréal·Kenzo·Byredo 등 럭셔리 캠페인 작업을 *카드 그리드*가 아니라 **다이얼 형태의 회전 네비게이션**으로 풀어낸다. 다이얼이 시계·카메라 다이얼 같은 기계식 감각을 주어, 럭셔리 뷰티의 "장인정신" 코드와 정확히 맞아떨어진다. 국내 뷰티 프로덕션·필름 에이전시가 캐러셀·그리드 외 새로운 인덱싱을 시도할 때 참조 1순위.
- **Look & Feel 포인트**: Index/Vignettes/Profile 3섹션 네비 / 고해상도 이미지(`q=75&auto=format` 최적화) / 대형 썸네일 + 다이얼 인디케이터 / 미니멀 럭셔리 베이스
- **장면 디테일**: 다이얼을 돌리면 캠페인 카드가 회전 정렬 — 클릭이 아니라 *돌리는* 인터랙션
- **응용 후보**: 한국 뷰티 프로덕션(돌채·다래미디어), 럭셔리 캠페인 에이전시, 패션 필름 디렉터 포트폴리오, 모델 에이전시 룩북
- **캡처 URL**: og:image 명시 없음 — anygivenmoment.co 홈의 다이얼 컴포넌트 직접 캡처

## 3. Ballet National de Marseille ★

- **URL**: https://www.ballet-de-marseille.com/
- **어디서 발견**: Hover States 2026-05 features 본문 — "sticky layered homepage choreography with CSS 3D title effects"
- **갤러리 노출 여부**: Awwwards SOTD 미등재 (큐레이션 매체 발견)
- **카테고리**: 브랜드 / 문화기관 (마르세유 국립 발레단, 1972년 Roland Petit 창립 → 2019년 (LA)HORDE 디렉팅)
- **저장할 이유**: 발레·무용단 사이트가 보통 "공연 일정 + 단원 사진 그리드"에서 끝나는 데 비해, 커스텀 폰트 *BNM Lunch*(Alice Gavin 제작)로 기관 정체성을 폰트 그 자체로 풀어내고 CSS 3D title 효과로 무용단의 "키네틱" 코드를 타이포에 내장한다. 국내 국공립 문화기관(국립현대무용단·예술의전당·LG아트센터) 사이트가 정적 일정표를 벗어나는 결정적 참조점.
- **Look & Feel 포인트**: 커스텀 산세리프 BNM Lunch / 대형 헤드라인 / CSS 3D 제목 변형 / sticky 레이어드 홈 (스크롤 중에도 컨텍스트 유지) / 뉴스 → 활동 → 작가 → 일정 정보 위계
- **장면 디테일**: 홈 스크롤 중에 헤드라인이 3D로 회전·기울기 — 정지 텍스트가 아니라 *움직이는 타이틀*로 무용수의 회전을 타이포에 옮김
- **응용 후보**: 국립현대무용단·국립발레단·LG아트센터 시즌 페이지, 서울시립교향악단·예술의전당 캠페인, 패션 위크 사이트, 컨템포러리 아트 페어
- **캡처 URL**: og:image 명시 없음 — ballet-de-marseille.com 홈 헤드라인 모션 캡처

## 4. LIDO Festival Siteplan ★

- **URL**: https://siteplan.lidofestival.co.uk/
- **어디서 발견**: Hover States 2026-05 features — "architectural feel and time-lapse construction reveal"
- **갤러리 노출 여부**: Awwwards SOTD 미등재 (큐레이션 매체 발견)
- **카테고리**: 캠페인 / 페스티벌 사이트맵 (LIDO Festival 2025, London Victoria Park, 6월 6일~15일)
- **저장할 이유**: 페스티벌 사이트맵이 보통 "PDF 다운로드" 또는 "정적 그리드 이미지"인 데 비해, **물리 좌표(51°32'6.846'' N, 0°2'25.9044'' W)를 헤더에 박고 무대(Main/Stage 2/Stage 3) 위치를 SVG 도형으로 그려 3D 항공뷰처럼 풀어낸다.** 카운트다운 타이머가 시간을 압박하고, 사용자가 무대별·날짜별로 드릴다운하며 라인업을 *발견*하게 만든다. 국내 페스티벌·전시·박람회 사이트맵의 패러다임 전환점.
- **Look & Feel 포인트**: 모듈러·기하학적 / 무대 SVG 도형 / 좌표 표기를 디자인 요소로 / 시간 슬롯 `HH:MM—HH:MM` 형식 / Day-based 네비게이션(6월 6일~15일) / 카운트다운 타이머
- **장면 디테일**: 무대 도형 클릭 → 해당 무대 라인업만 시간순으로 확장 (전체 한 번에 보여주지 않고 단계적 노출)
- **응용 후보**: 펜타포트락페스티벌·뷰티풀민트라이프 라인업 사이트, BIFAN·BIFF 같은 영화제 상영관 안내, 코엑스·킨텍스 박람회 부스맵, 스타필드·롯데월드 시설 가이드
- **캡처 URL**: og:image 명시 없음 — siteplan.lidofestival.co.uk 무대 SVG 도면 직접 캡처

## 5. Bécane Paris ★

- **URL**: https://www.becaneparis.com/
- **어디서 발견**: Hover States 2026-05 features — "futuristic shop with 3D frame viewers and orchestrated transitions"
- **갤러리 노출 여부**: Awwwards SOTD 미등재 (큐레이션 매체 발견)
- **카테고리**: 커머스 / 여성 모터사이클 의류·액세서리 D2C (Paris)
- **저장할 이유**: "기술적·보호적·당당한 페미닌(technical, protective, and assertively feminine)" 포지셔닝을 14개 제품·4개 스토리 카운터(`Products 14, Stories 04`) + 3D 프레임 뷰어 + 오케스트레이션된 전환으로 풀어낸다. 보호장구라는 *남성 코드 카테고리*를 여성성으로 재해석하는 비주얼 전략이 명확. 국내 여성 라이프스타일 브랜드(특히 아웃도어·테크웨어·캠핑 카테고리)가 "여성용 = 핑크/플로럴" 클리셰를 깨는 직접 참조점.
- **Look & Feel 포인트**: 정제된 미니멀 + 상단 네비 / 3D 제품 뷰어 / 컬렉션 간 부드러운 페이드·슬라이드 전환 / 제품 카운터를 메인 메뉴 라벨에 노출 / 에디토리얼 톤(Stories 섹션)
- **장면 디테일**: 제품 페이지에서 헬멧·재킷을 3D 회전 가능 — 정적 사진이 아닌 360도 인스펙션
- **응용 후보**: 한국 여성 캠핑·아웃도어 브랜드(헬리녹스 여성 라인·블랙야크 자매 라인), 테크웨어 D2C, 헬멧·라이딩 기어 브랜드, 여성 워크웨어 스타트업
- **캡처 URL**: og:image 명시 없음 — becaneparis.com 홈 3D 헬멧 뷰어 캡처

## 6. Burn Studio ★

- **URL**: https://burnstudio.co/
- **어디서 발견**: Hover States 2026-05 features — "draggable navigation functioning as controller"
- **갤러리 노출 여부**: Awwwards SOTD 미등재 (큐레이션 매체 발견)
- **카테고리**: 포트폴리오 / 멀티플랫폼 크리에이티브 프로덕션 ("Cinematic Worlds For Brands")
- **저장할 이유**: 영상 프로덕션 포트폴리오가 흔히 빠지는 "유튜브 임베드 그리드"에서 벗어나, 프로젝트 번호(`23.CS`, `00.XX`) + All/Commercial/Cinematic Social 필터 + 6명 감독·크리에이터 명단 + 다크/라이트 토글로 *영상 자체*가 아닌 *제작팀*을 콘텐츠 단위로 만든다. 국내 영상 프로덕션(돌고래유괴단·블루독·미디어DNA)이 "릴 영상 나열"에서 벗어나는 참조점.
- **Look & Feel 포인트**: 미니멀 타이포 + 프로젝트 넘버링 / 모노크롬 + 고콘트라스트 / 대규모 이미지 그리드 / 다크/라이트 토글 / 비디오 플레이어 통합(mute/play 컨트롤)
- **장면 디테일**: 네비게이션 자체가 드래그 가능한 컨트롤러 — 마우스로 잡아당겨 카테고리 사이를 이동
- **응용 후보**: 한국 영상 프로덕션 포트폴리오(돌고래유괴단·블루독), 광고 에이전시 시즌 사이트, 모션 디자이너 개인 포트폴리오, 콘텐츠 스튜디오 채용 사이트
- **캡처 URL**: og:image 명시 없음 — burnstudio.co 홈 그리드 + 다크 토글 캡처

## 7. Dawn

- **URL**: https://joindawn.com/
- **어디서 발견**: Lapa Ninja Health & Fitness 카테고리 최근 추가
- **갤러리 노출 여부**: Lapa Ninja 등재 · Awwwards SOTD 미등재
- **카테고리**: 앱 / AI 멘탈 헬스 컴패니언 (Harvard·Stanford 연구진, CBT·DBT·ACT 기반)
- **저장할 이유**: AI 멘탈 헬스 카테고리가 흔히 빠지는 "차가운 블루 그라데이션 + 뇌 일러스트"를 정면으로 거부하고 따뜻한 베이지·피치·오렌지 그라데이션 + "Pills, Wait, Talk" 루프 다이어그램으로 *기존 멘탈 헬스 사이클의 부재*를 시각화한다. 국내 멘탈 헬스 서비스(트로스트·마인드카페·테라마인드)가 의료적 톤에서 벗어나는 직접 참조점.
- **Look & Feel 포인트**: 베이지·피치·오렌지 그라데이션 + 쿨 블루 액센트 / 깨끗한 산세리프 / 단일 컬럼 반응형 + 넉넉한 여백 / 회전하는 원형 그래픽 / 햇살 받은 여성 OG 이미지(접근성·따뜻함·희망)
- **장면 디테일**: "Pills, Wait, Talk" 텍스트가 원형으로 무한 회전 — 기존 멘탈 헬스 사이클이 *반복되며 끝나지 않는다*는 메시지를 모션 자체로 전달
- **응용 후보**: 트로스트·마인드카페 리브랜딩, 정신과 직접 진료 앱(닥터나우 멘탈헬스), 직장 EAP 서비스, 명상·수면 앱 랜딩
- **캡처 URL**: cdn.prod.website-files.com/6923dbcf09c8c9bc1c34abd7/6923f47d9785cb305b0728fe_image-bottom%202.avif

## 8. KÖPPEN

- **URL**: https://www.koppen.co/
- **어디서 발견**: Siteinspire E-Commerce 카테고리 최근 추가
- **갤러리 노출 여부**: Siteinspire 등재 · Awwwards SOTD 미등재
- **카테고리**: 커머스 / 프리미엄 구강케어 시스템 D2C (Detox / Protect / Support / System)
- **저장할 이유**: 구강케어가 보통 "치과 의료 화이트 + 민트 그린" 클리셰에 갇혀 있는데, 트래버틴(travertine) 돌 받침대·구리(copper) 디테일·앰버 글래스 보틀을 *재료 자체*로 노출해 구강케어를 럭셔리 라이프스타일로 재포지셔닝한다. Hydroxyapatite·Papain·Copper 같은 성분 캐러셀이 K뷰티의 성분 마케팅 패턴과 정확히 겹쳐, 국내 오럴케어 브랜드(LG생활건강 페리오 프리미엄 라인·이노스이엔지 직판) 응용에 직접 사용 가능.
- **Look & Feel 포인트**: 베이지·크림·화이트 베이스 + 소프트 그레이/그린 액센트 / 깨끗한 산세리프 / 카드 기반 제품 묶음(번들 3종 + 시스템) / 플랫레이 성분 중심 사진 / 정량 캐러셀 인디케이터 (`/ 3 NEXT`)
- **장면 디테일**: 성분 캐러셀 — Hydroxyapatite → Papain → Copper 등 성분 자체를 카드로 노출, 제품이 아니라 *재료*가 hero
- **응용 후보**: 한국 프리미엄 오럴케어 D2C(LG생활건강 페리오·아모레퍼시픽 미장센), 헤어·바디 케어 럭셔리 라인, 정기구독 K뷰티 D2C, 비건 뷰티 브랜드
- **캡처 URL**: 트래버틴 받침대 + 앰버 글래스 보틀 플랫레이 — koppen.co 홈 직접 캡처

## 9. Museum of Money

- **URL**: https://www.museumofmoney.com/
- **어디서 발견**: Lapa Ninja Corporate 카테고리 최근 추가
- **갤러리 노출 여부**: Lapa Ninja 등재 · Awwwards SOTD 미등재
- **카테고리**: 캠페인 / 체험형 미술관 사이트 (돈을 주제로 한 인터랙티브 박물관, "Cash Shower" "Laser Room" 등)
- **저장할 이유**: 박물관·전시 사이트가 보통 빠지는 "엄숙한 화이트 + 작품 그리드" 톤을 거부하고 **보라 사이니지 + 오렌지 리셉션 데스크**의 강한 컬러 블록 + 번호 아코디언(`▼ 01`, `▼ 02`)으로 점진적 공개를 한다. "사진 찍기 좋은 순간"을 명시적으로 강조해 인스타그램 UGC를 디자인 결정의 출발점으로 삼는다. 국내 팝업 전시·체험형 미술관(피크닉·디뮤지엄·해녀의부엌) 사이트가 SNS 친화도를 끌어올리는 직접 참조점.
- **Look & Feel 포인트**: 보라 + 오렌지 컬러 블로킹 / 번호 아코디언 (`▼ 01`, `▼ 02`) / 게이미파이 메시지 / "Two floors of hands-on exhibits" 명시적 약속 / Next.js 이미지 최적화
- **장면 디테일**: 메인 카피 *"transforming the most serious topic in your life into the most fun afternoon"* — 박물관의 무게감을 정면으로 부정하는 톤 / 보라 사이니지 + 오렌지 데스크가 첫 hero 스크롤에서 풀스크린으로 등장
- **응용 후보**: 피크닉·디뮤지엄·동대문DDP 팝업 전시 사이트, 카페노티드·노티드월드 같은 F&B 체험관, 어반브레이크·서울리빙디자인페어 페어 사이트, MZ 타깃 박물관 리뉴얼
- **캡처 URL**: 보라 + 오렌지 컬러 블록 hero — museumofmoney.com 직접 캡처

## 10. Frequency Breathwork

- **URL**: https://frequencybreathwork.com/
- **어디서 발견**: Lapa Ninja Wellness 카테고리 최근 추가
- **갤러리 노출 여부**: Lapa Ninja 등재 · Awwwards SOTD 미등재
- **카테고리**: 앱 / 호흡 명상 (12개 가이드 세션, HRV 임상 결과 노출)
- **저장할 이유**: 호흡·명상 앱이 흔히 빠지는 "스피리추얼 단독 톤"이나 "딱딱한 의료 톤" 양극단을 *동시에* 안고 간다. 블랙·화이트·자연 그린 베이스에 "HEALING BEGINS WITH THE BREATH" 같은 큰 헤드라인은 영성, 그 옆 HRV 메트릭·임상 결과는 과학 — 같은 페이지에서 두 톤이 충돌 없이 공존. 국내 명상 앱(마보·코끼리·헤이)이 "감성 vs 데이터" 사이에서 결정 못 하는 문제의 답.
- **Look & Feel 포인트**: 블랙(로고·아이콘·텍스트) + 화이트/투명 배경 + 자연 그린 액센트 / 깨끗한 모던 산세리프 / 넉넉한 여백 / 좌측 정렬 + 1-7 번호 메뉴 위계 / 12개 호흡 세션 카드(확장형) / 잎사귀·물방울 자연 이미지 + 임상 데이터 동거
- **장면 디테일**: 큰 헤드라인 "HEALING BEGINS WITH THE BREATH" 바로 아래 임상 HRV 차트 — 스피리추얼 카피와 데이터 차트가 *같은 hero 안에* 공존
- **응용 후보**: 마보·코끼리·헤이 같은 한국 명상 앱 리뉴얼, 정신건강 EAP B2B, 요가·필라테스 스튜디오 브랜드, 수면·웰니스 D2C(슬립도쿄 한국 진출)
- **캡처 URL**: "HEALING BEGINS WITH THE BREATH" hero — frequencybreathwork.com 직접 캡처

---

## 탐색 중 발견했지만 확인 불가

다음 사이트들은 시드는 흥미로웠으나 본문 fetch가 막히거나 정보 부족으로 항목 채택 안 함. 다음 회차 재시도 후보.

- https://godly.website/ — Godly 갤러리 자체가 HTTP 403 (봇 차단). v2에서 시드 0개. 다음 회차 다른 fetch 헤더 시도.
- https://www.doodles.app/ — Lapa Ninja Illustration 카테고리, HTTP 429 Too Many Requests
- https://www.serenacongiu.com/about — 404 (about 페이지 없거나 다른 경로). 메인 페이지 정보로만 항목 작성.
- https://typewolf.com/feed — RSS 캐시가 2025년 9~12월에 멈춤, 최근 데이터 0건. RSS 대신 사이트 직접 fetch도 SOTD 직접 URL 없이 typewolf 글 URL만 나옴 — 다음 회차에 typewolf 글 페이지 1-depth 더 들어가 보기.
- https://www.anaiis.world/ — Hover States 추천이지만 본문 fetch가 너무 비어 디자인 디테일 추출 실패
- https://threezerofive.studio/ — Hover States 추천(라이브 wind speed 활용)이지만 본문 fetch에서 wind speed 동작 못 잡음

---

## 추가 후보 (선별 기준 1개만 충족, 보강 자료로만 보관)

본문은 확인됐지만 "갤러리 미공개 / Look & Feel 뚜렷 / 응용 가능 / 신선함 / 결정 근거" 중 1개만 충족해 본 항목에 올리지 않았다. 다음 회차 참고용.

- https://www.cosmos.so/ — 디자이너 무드보드 도구, 컬러 검색·시각 유사도·AI 콘텐츠 필터. 디자이너에겐 잘 알려진 서비스라 신선도 낮음.
- https://cofounder.co/ — AI 에이전트 오케스트레이션 SaaS, hero GIF + 모듈러 카드. AI 에이전트 카테고리가 너무 흔해짐, 차별점 약함.
- https://www.cenee-paris.com/ — 럭셔리 코스메틱 D2C(Paris), Teint/Yeux/Lèvres/Ongles 카테고리. 표준적 럭셔리 화장품 패턴, 신선함 부족.
- https://wakawaka.world/ — LA 기반 목공 가구 작가 Shin Okuda 스튜디오, "LARGER/SMALLER" 줌 기능. 본문 정보 부족 + 작가 단독 사이트로 응용처 좁음.
- https://drawonamap.com/ — Show HN, URL에 지도 드로잉 데이터 저장. 컨셉은 신선하나 시각 디테일 정보 부족, 다음 회차 직접 시도 후보.
- https://www.ballet-de-marseille.com 외 Hover States의 Bécane/Burn 등은 본 항목으로 승격됨.
- https://www.minimal.gallery/ 추출 10건(Double You/Hyper Effekt/Adcker/Rig AI 등) — 대부분 에이전시 포트폴리오로 한국 응용처 좁아 다음 회차 시드로만 보관.

---

> v1 대비 핵심 개선 — 갤러리(Awwwards/Siteinspire/Lapa) 100% → 큐레이션 매체(Hover States) 60%로 비중 이동. v1의 "디자이너라면 다 아는" 7개 대신 v2는 메이크업 아티스트 포트폴리오(Serena Congiu), 럭셔리 캠페인 프로덕션 다이얼 네비(Any Given Moment), 발레단 커스텀 폰트(Ballet de Marseille), 페스티벌 SVG 사이트맵(LIDO), 여성 모터사이클 D2C(Bécane), 영상 프로덕션 드래거블 네비(Burn) 등 한국 디자이너 슬랙에 *처음 던질 만한* 6건이 갤러리 미공개에서 발굴됨.
