---
날짜: 2026-05-15
태그: install element, PWA, HTML, Origin Trial
국가: GLOBAL
카테고리: dev/pwa
직무 태그: 웹DEV
출처 유형: release_note
출처: Chrome Developers Blog
출처 URL: https://developer.chrome.com/blog/install-element-ot
이미지: https://developer.chrome.com/static/blog/install-element-ot/image/fig1.png
이미지 설명: Chrome Developers Blog 원문 본문 이미지
요약: Chrome과 Edge 148+에서 오리진 트라이얼 중인 `<install>` 요소를 사용하면 JavaScript 없이 HTML 한 줄로 PWA 설치 버튼을 삽입할 수 있다. 브라우저가 버튼 텍스트·언어·외형을 직접 제어하며, 지원하지 않는 브라우저에서는 자식 콘텐츠를 폴백으로 렌더링한다.
---

### Chrome/Edge의 `<install>` 요소 — HTML 선언만으로 PWA 설치 버튼을 삽입하는 오리진 트라이얼

##### 용어 설명

- **PWA(Progressive Web App)**: 웹 기술로 제작했지만 홈 화면에 설치하고 오프라인에서도 동작하는 앱. 네이티브 앱처럼 설치 아이콘·스플래시 화면·푸시 알림을 지원한다.
- **오리진 트라이얼(Origin Trial)**: 구글이 실험적 웹 API를 일반 공개 전에 실제 사이트에서 검증하는 제도. 신청 후 받은 토큰을 `<meta>` 태그나 HTTP 헤더에 심으면 지정 버전 범위 동안 기능을 활성화할 수 있다.

##### 요약

- `<install>` 요소는 Chrome·Edge 148+ 에서 지원하며, 오리진 트라이얼 기간은 148–153이다. 로컬 테스트는 `about://flags/#web-app-install-element` 플래그로 활성화한다.
- 현재 페이지 앱 설치는 `<install></install>` 한 줄로 충분하다. 현재 페이지의 매니페스트에 `id` 필드가 있어야 한다.
- 다른 출처 앱을 설치하려면 `installurl` 속성에 대상 앱의 오리진을 적고, 대상 앱 매니페스트에 `id` 필드가 없을 때는 `manifestid` 속성으로 매니페스트 ID를 직접 명시한다(`<install installurl="https://awesome-app.com/" manifestid="https://awesome-app.com/?source=pwa"></install>`).
- 설치 성공 시 `promptaction`, 사용자 취소 시 `promptdismiss`, 유효성 오류(예: `install_data_invalid`) 발생 시 `validationstatuschanged` 이벤트가 요소에서 발생한다.
- 브라우저 지원 감지는 `'HTMLInstallElement' in window`로 한다. 미지원 브라우저에서는 요소 내부에 넣은 자식 HTML이 그대로 렌더링되어 자연스러운 폴백이 가능하다.
- 버튼 텍스트·언어·외형은 브라우저가 제어한다. 개발자가 레이블을 직접 지정할 수 없다. 명령형 방식이 필요하면 `navigator.install()` API를 병행 검토한다.

##### 매거진 인사이트

> PWA 설치 진입점이 개발자 코드가 아니라 브라우저 표준으로 이동하면, 커스터마이징의 경계가 어디까지인지를 설계 단계에서 먼저 정해야 한다.

###### 왜 지금 이 기능인가

PWA 설치 버튼은 지금까지 브라우저마다 진입점 위치와 시점이 달라 개발자가 `beforeinstallprompt` 이벤트를 직접 잡아 사용자에게 노출하는 방식으로 구현했다. 설치 흐름이 개발자 코드에 의존하다 보니 브라우저 업데이트마다 동작 차이를 검증해야 했고, 신뢰 신호(버튼 레이블, 아이콘)도 서비스마다 제각각이었다. `<install>` 요소는 이 파편화를 선언형 HTML로 흡수해 브라우저가 설치 신뢰 신호를 직접 관리하도록 구조를 바꾼다. Chrome Developers 블로그는 이 배경을 "웹 앱 설치가 파편화되어 있다(Web app installation is fragmented)"고 명시하고 있다.

###### 구현 관점

오리진 트라이얼을 사용하려면 `/origintrials#/view_trial/506092008125759489`에서 신청해 받은 토큰을 `<meta>` 태그 또는 HTTP 응답 헤더에 삽입해야 한다. 트라이얼 없이 로컬 검증만 할 경우 `about://flags/#web-app-install-element`에서 플래그를 켠다.

매니페스트 `id` 필드가 없는 앱에 `<install>` 요소를 적용하면 `validationstatuschanged` 이벤트에서 `install_data_invalid` 오류가 발생한다. 현재 서비스의 `manifest.json`에 `id` 필드가 선언되어 있는지 지금 바로 확인이 필요하다.

미지원 브라우저 폴백은 요소 안에 대체 콘텐츠를 넣는 방식으로 처리한다. `<install>` 안에 기존 설치 유도 링크나 안내 문구를 자식 요소로 두면, 지원하지 않는 환경에서도 이 내용이 그대로 노출된다.

버튼 외형은 브라우저가 결정하므로 현재 디자인 시스템의 버튼 컴포넌트 스타일을 적용할 수 없다. 브랜드 버튼 디자인이 필수인 설치 CTA라면 `navigator.install()` API 쪽이 여전히 유일한 선택지다.

###### 실무에 어떻게 적용할 수 있을까

이커머스나 콘텐츠 서비스에서 PWA 설치를 유도하는 팝업·배너·인라인 CTA를 운영 중이라면, 오리진 트라이얼 기간(148–153)에 `<install>` 요소를 테스트 환경에서 먼저 붙여보는 것이 의미 있다. 단, 설치 버튼 레이블을 브랜드 문구로 제어해야 하는 요건이 있다면 이 요소로는 충족할 수 없다.

다른 앱(파트너사 PWA, 그룹사 앱 등)의 설치를 유도하는 크로스 프로모션 시나리오에서는 `installurl`과 `manifestid` 조합으로 해당 앱의 설치 흐름을 직접 연결할 수 있다. 이 경우 대상 앱 측 `manifest.json`의 `id` 필드 값을 사전에 확인해야 한다.

점검 질문:
- 현재 `manifest.json`에 `id` 필드가 선언되어 있는가?
- 설치 CTA의 버튼 레이블을 브라우저에 위임해도 서비스 UX 플로우에서 수용 가능한가?
- Chrome·Edge 외 브라우저(Safari, Firefox)에서 폴백이 의도한 대로 노출되는지 확인했는가?
- `promptaction` / `promptdismiss` 이벤트를 수집해 설치 전환율을 기존 방식과 비교할 계획이 있는가?
