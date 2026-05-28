# UIUX 인터랙션 영감 보드 (2026-05-27)

> inspiration-scout v2 수집. *마이크로 인터랙션 한 컷·UIUX 좋은 사례* 위주. 매거진 발행 X, 팀 라운지·점심 슬랙용. ★는 가장 화제거리 5건 이내.
>
> 수집 경로: Codrops Playground 3 · Awwwards Interactions/Microinteractions 4 · CodeMyUI 2 · WebSearch 5회. 13건 본문·데모 확인 / 9건 최종 선별.

---

## 1. Codrops — A Playful Clip Menu with GSAP's easeReverse ★

- **URL (글)**: https://tympanus.net/codrops/2026/04/22/a-playful-clip-menu-with-gsaps-easereverse/
- **URL (데모)**: https://tympanus.net/Development/EaseReverseClipMenu
- **유형**: 페이지 전환 / 메뉴 토글 마이크로 인터랙션
- **어디서 발견**: Codrops Playground (2026-04-22, RSS 최신)
- **움직임 한 컷**: 메뉴 버튼 클릭 시 0.7초 `expo.out`으로 커버 이미지들이 화면 중심에서 X·Y축 산개 + 회전 -30°~+30° + opacity 1→0, 그 위로 메뉴가 clip-path 마스크로 reveal. 닫기 트리거 시 동일 타임라인이 `easeReverse: er('elastic.out(0.3)')`로 역재생되어 elastic.out 특유의 *살짝 튀는 복귀감*을 부여 — 일반 reverse 대비 "복귀가 매끄럽고 민첩"하게 느껴짐.
- **왜 좋은가**: GSAP에서 "reverse 애니메이션이 항상 어색했던" 문제를 한 줄 옵션으로 해결한 케이스. 닫힘 모션도 *오픈만큼 의도적*으로 만들 수 있다는 게 디자이너에게 새 단서.
- **패션·뷰티 응용**: 모바일 GNB·필터 시트 닫힘에 elastic reverse 한 줄 얹으면 *닫힘이 의도적인 동작*으로 읽힘.
- **캡처 URL**: https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2026/04/ClipMenu_featured.webp

## 2. Codrops — From Product to Cart: Guiding Animations ★

- **URL (글)**: https://tympanus.net/codrops/2024/11/21/from-product-to-cart-adding-guiding-animations-to-the-shopping-experience/
- **URL (데모)**: https://tympanus.net/Tutorials/ShoppingCartAnimation
- **유형**: 마이크로 인터랙션 / 장바구니 담기 피드백
- **어디서 발견**: WebSearch "add to cart animation interaction 2026"
- **움직임 한 컷**: "Add to cart" 클릭 → 갤러리의 상품 카드들이 1.8초 `power2.inOut` 타임라인을 타고 헤더 카트 좌표로 수렴. 0~40% 구간은 *상단 행은 위로, 하단 행은 아래로 흩어진 뒤 화면 밖으로*, 40~100% 구간은 *카트 좌표로 축소 + opacity 0*. 카드 간 `stagger: { from: 'end', each: 0.04 }`로 *마지막 카드부터* 0.04초 간격 순차 발사 — 자연스러운 흐름 라인이 만들어짐.
- **왜 좋은가**: "어디서→어디로 갔는지"가 1.8초 안에 시선으로 추적됨. 단순 "+1 카운터 점멸"보다 *경로 자체*를 보여주는 패턴이라, 카트 위치를 잊지 않게 됨. 패션·뷰티 PDP에 그대로 가져올 가치 큼.
- **패션·뷰티 응용**: 29CM·W컨셉 PDP 좋아요/장바구니에 끌어옴직. *상품 썸네일이 직접 카트로 날아가는* 시퀀스라 룩북·옵션 단계와도 결합 가능.
- **캡처 URL**: 글 헤더 cover.jpg (https://tympanus.net/codrops/wp-content/uploads/2024/11/ProductToCart_featured.webp)

## 3. Codrops — On-Scroll 3D Carousel ★

- **URL (글)**: https://tympanus.net/codrops/2025/05/07/on-scroll-3d-carousel/
- **URL (데모)**: https://tympanus.net/Development/3DCarousel
- **유형**: 스크롤 효과 / 캐러셀
- **어디서 발견**: Codrops Playground
- **움직임 한 컷**: 페이지를 세로 스크롤할수록 카드 8장이 *수평축을 공통 회전축*으로 삼아 원통형으로 회전, 스크롤 양에 비례한 회전 각도가 0°→360°로 매핑됨. GSAP `SmoothScroller`로 스크롤 자체에 관성이 붙어 *놓아도 살짝 더 도는* 감각이 있고, `SplitText`로 캐러셀 옆 카피가 문자 단위로 들어왔다 나감.
- **왜 좋은가**: 스크롤 = 콘텐츠 *진행률*만이 아니라 *3D 카메라 회전*으로 매핑한 발상. 룩북·신상 8개 보여줄 때 *세로 스크롤 한 번으로 한 바퀴* 라는 단순한 사용 흐름이 강함.
- **패션·뷰티 응용**: 시즌 룩북 8~12장 캡슐 뷰. 카드 한 면=상품 컷, 회전축에 카메라 두면 모바일에서 *swipe 없이* 한 페이지에서 다 봄.
- **캡처 URL**: https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2025/05/scroll3dcarousel_featured_final.jpg

## 4. Razorpay Sprint 26 — Awwwards SOTD (2026-05-26)

- **URL (사이트)**: https://razorpay.com/sprint/26
- **URL (Awwwards)**: https://www.awwwards.com/sites/razorpay-sprint-26
- **유형**: 스크롤 효과 / 페이지 전환 (제품 업데이트 시퀀스)
- **어디서 발견**: Awwwards Interactions, Developer Award + Site Of The Day 2026-05-26
- **움직임 한 컷**: 단일 랜딩에 100+ 스크롤 트리거가 묶여 있고, 섹션마다 *제품 카드가 자동 빌드되는 시퀀스*가 흐름. "AI Payments" 섹션은 스크롤 진입 시 각 기능 카드가 1열로 등장 → 스택으로 합쳐졌다 → 가로로 펼쳐지는 3단 전환, "Agentic Stack" 섹션은 hover 시 카드별로 *다른 인터랙티브 디테일*(체크·로딩·코드 라인)이 살아남.
- **왜 좋은가**: 컨퍼런스/업데이트 랜딩의 *밀도*를 한 페이지에 욱여넣는 새 표준. 슬라이드 100장 대신 스크롤 1회로 끝나는 구성, 시니어 디자이너 회의 자료로 좋음.
- **패션·뷰티 응용**: 시즌 캠페인·브랜드 홈의 "이번 호 신상 100" 같은 *밀도 강한 랜딩*에 참고.
- **캡처 URL**: https://assets.awwwards.com/awards/submissions/2026/05/razorpay-sprint-26.png (Awwwards 페이지의 사이트 썸네일 영역)

## 5. Shining — 한국 디자이너 정찬우 (Three.js WebGPU) ★

- **URL (사이트)**: https://shining.302chanwoo.com/
- **URL (Awwwards)**: https://www.awwwards.com/sites/shining
- **유형**: 페이지 전환 / 3D 스토리북
- **어디서 발견**: Awwwards Interactions (한국 디자이너 작품)
- **움직임 한 컷**: 3D 인터랙티브 스토리북 — 페이지 넘김이 *책장 넘김 메타포의 spatial 전환*. WebGPU 렌더링으로 라이팅이 *씬마다 다른 광원으로 천천히 보간*되고(보통 1~1.5초), 진입할 때마다 *조명 방향과 셰도우 길이*가 달라져서 같은 캐릭터도 시간대가 다르게 보임. 스크롤이 아니라 *클릭/탭으로 페이지를 넘기는* 비전형적 진행.
- **왜 좋은가**: 한국 디자이너의 *능동 탐색 콘텐츠* 케이스. "스크롤 = 진행"이 아닌 *클릭 = 페이지 넘김*으로 회귀하면서도 3D 라이팅 모션으로 깊이를 줌. Three.js + WebGPU 조합도 화제거리.
- **패션·뷰티 응용**: (옵션) 브랜드 스토리·룩북 캠페인 페이지에 *씬마다 라이팅이 다른* 컷 컴포지션.
- **캡처 URL**: https://assets.awwwards.com/awards/submissions/2026/05/6a053354a760d926593465.png

## 6. CodeMyUI — Fly-In Shopping Cart with Tick (Aaron Iker)

- **URL**: https://codemyui.com/fly-in-shopping-cart-from-the-left-add-a-tick-and-fly-out-on-shopping-cart-button-click/
- **유형**: 마이크로 인터랙션 / 장바구니 피드백
- **어디서 발견**: WebSearch "add to cart animation 2026"
- **움직임 한 컷**: 장바구니 버튼 클릭 시 SVG 카트가 화면 좌측 밖에서 버튼 위로 *왼→오른쪽 슬라이드 인* (~0.4초, ease-out 추정), 카트 안에 *체크 아이콘이 0.2초 stroke draw*로 그려짐, 0.3초 hold 후 카트가 *동일 속도로 오른쪽 밖으로 슬라이드 아웃*. 버튼 라벨은 그 사이 "Add to cart" → "Added" → "Add to cart"로 페이드 교체.
- **왜 좋은가**: 버튼 1개로 *왔다·체크·갔다* 3단계 피드백이 1초 안에 끝남. 토스트 알림 없이 버튼 자체에서 피드백 완결.
- **패션·뷰티 응용**: 상품 카드 hover 시 보이는 *퀵 담기* 버튼에 그대로. 토스트 안 띄워서 모바일 화면 가림 줄임.
- **캡처 URL**: 페이지 상단 GIF (https://codemyui.com/wp-content/uploads/2018/09/Fly-In-Shopping-Cart-From-The-Left-Add-A-Tick-And-Fly-Out-On-Shopping-Cart-Button-Click.gif 형태로 게시됨)

## 7. CodeMyUI — Pay Button to Fingerprint Scanner Transition

- **URL**: https://codemyui.com/pay-button-to-animated-finger-print-scanner-transition/
- **유형**: 마이크로 인터랙션 / 결제 단계 morph
- **어디서 발견**: WebSearch "checkout flow microinteraction 2026"
- **움직임 한 컷**: "Pay" 버튼 클릭 → 버튼이 *원형으로 morph* (border-radius 8px → 100%, width 200px → 80px, ~0.3초 ease-in-out), 원 안에서 *지문 SVG가 path draw로 윤곽선 그려짐*(~0.5초), 그 위로 *스캐닝 라인이 위→아래 0.8초 무한 루프*. 인증 완료 시 지문이 체크로 morph.
- **왜 좋은가**: "결제 = 다른 화면으로 이동"이 아니라 *같은 자리에서 단계 morph*. CTA 위치가 안 바뀌어서 시선 이탈 0. 결제 단계 진행을 *한 컴포넌트의 변태*로 표현하는 좋은 사례.
- **패션·뷰티 응용**: 모바일 결제 1단계 인증·"빠른 결제" 패턴에 직결.
- **캡처 URL**: 페이지 상단 GIF

## 8. Luke Baffait — 포트폴리오 (WebGL + Scroll Storytelling)

- **URL (사이트)**: https://lukebaffait.fr/
- **URL (Awwwards)**: https://www.awwwards.com/sites/luke-baffait
- **유형**: 스크롤 효과 / cinematic page transition
- **어디서 발견**: Awwwards Interactions (2026-05)
- **움직임 한 컷**: 첫 진입 시 hero에 *대형 사진 한 컷이 WebGL 노이즈 distortion으로 픽셀 분해된 채* 시작 → 페이지 로드와 함께 *2초 동안 distortion 강도가 0으로 감쇠*하면서 사진이 또렷해짐. 스크롤 시작하면 카메라가 *위에서 아래로 천천히 이동하는* 시점이 되고, 섹션 경계에서는 GSAP timeline이 *다음 섹션 색상으로 배경이 1초 페이드*하면서 들어옴.
- **왜 좋은가**: 프리미엄 브랜드/하이엔드 룩북 톤의 정답. *분해→복원* 인트로는 이커머스 키비주얼에도 응용 강함.
- **패션·뷰티 응용**: 시즌 캠페인 키비주얼 진입에 distortion → settle 인트로 1컷.
- **캡처 URL**: https://assets.awwwards.com/awards/submissions/2026/05/6a050015e4d00254390556.jpg

## 9. Volt (voltlites.com) — 이커머스 마이크로 인터랙션 모음

- **URL (사이트)**: https://voltlites.com/gear/
- **URL (Awwwards)**: https://www.awwwards.com/sites/volt
- **유형**: 상품 그리드 hover / 페이지 전환
- **어디서 발견**: Awwwards Microinteractions 카테고리
- **움직임 한 컷**: 상품 그리드에서 카드 hover 시 카드 이미지가 *0.4초 동안 두 번째 컷으로 cross-fade* 전환되고, 동시에 *제품명 자간이 +1px 확장 + 가격 우측에서 슬라이드 인*. 카테고리 페이지 진입 시 *상단 헤더가 검정→투명으로 0.6초 페이드*하며 hero 비디오가 그 뒤에서 풀스크린 재생. 이커머스인데도 GSAP·WebGL 기반.
- **왜 좋은가**: 이커머스 카드 hover의 *교과서적 정답* — 두 번째 컷 cross-fade + 자간 확장 + 가격 슬라이드. 패션 PLP에 그대로 가져옴직.
- **패션·뷰티 응용**: 무신사·29CM PLP 카드 hover에 두 번째 컷(착장샷↔디테일컷) 0.4초 cross-fade.
- **캡처 URL**: Awwwards 페이지 사이트 썸네일

---

## 보고

- **수집 경로**: Codrops Playground RSS·페이지(3건 본문 확인, 3건 채택) / Awwwards Interactions·Microinteractions(8건 페이지 확인, 4건 채택) / CodeMyUI 마이크로 태그(2건 채택) / WebSearch 5회(채택 후보 발견·교차 검증용). **실패한 경로**: CodePen Picks(403)·CodePen Spark(403)·UI Movement(pageflows로 리다이렉트, 다른 서비스)·CollectUI(동적 로드로 본문 비어 있음) — 본문 확인 불가로 모두 제외, 채워넣기 없음.
- **카테고리 분포**: 마이크로 인터랙션 4(2·6·7·9) / 스크롤 효과 3(3·4·8) / 페이지 전환·메뉴 2(1·5). 패션 이커머스 PLP·PDP·체크아웃에 직접 응용 가능한 게 4건(2·6·7·9)으로 가장 두꺼움.
- **한국 vs 글로벌**: 한국 1 (5. Shining/302chanwoo) / 글로벌 8. 한국 디자이너 신작은 Awwwards 노출 기준 이 한 건이 가장 신선.
- **★ 수**: 5건 (1·2·3·5 + 별표 후보 1자리 비움 — Codrops 3건과 한국 케이스 1건이 *움직임 한 컷이 가장 또렷하게 글로 표현되는* 항목).
- **자체 평가**: 2번(Codrops product→cart, 1.8초 power2.inOut, 카드 stagger 0.04초) 하나만으로도 점심 슬랙에 던지면 "어 이거 우리 다음 PDP에 끌어와볼까?" 반응이 진짜 나온다고 본다. 7번 결제 morph도 결제 흐름 보던 기획자·디자이너 동시에 멈춰 세울 만함. 1·3은 GSAP 다루는 퍼블리셔에게, 5는 한국 디자이너 화제로, 8은 BX·시니어 디자이너에게 *각기 다른 동료*가 반응할 항목들.
