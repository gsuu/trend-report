# 다음 호 이월(carryover) — DEV

이 파일은 **다음 매거진 호에 포함할 DEV 후보**를 미리 보관하는 곳입니다.
다음 `/digest-collect` → `/magazine-write` 진행 시, 아래 블록을 해당 호의
`magazine-report.md` DEV 섹션에 합치고 그 호의 번호 체계에 맞춰 `####` 번호만 다시 매깁니다.
(아래 `#### 99` 번호는 자리표시자입니다. 발행 호에서 실제 순번으로 교체하세요.)
**주의:** 아래는 사용자가 던진 후보입니다. 발행 전 `source-verifier`로 원문을 다시 열어 구체 사실 3개 이상을 재확인하세요.

- 추가 요청일: 2026-06-08
- 사유: 사용자가 다음 주 DEV에 추가 요청.
- 원문 검증: 1차 확인(specification.website 직접 열람 — 13개 영역 구성 확인). 발행 호에서 재검증 필요.

---

#### 99. The Website Specification — 모던 웹사이트 베스트프랙티스 오픈 스펙

- 날짜: 2026-06-08
- 태그: 웹표준, 접근성, SEO, 성능, 보안, 에이전트레디니스
- 국가: GLOBAL
- 카테고리: (DEV categoryKey — 발행 호에서 확정)
- 직무 태그: 웹퍼블리셔, 프론트엔드
- 출처 유형: reference
- 출처: specification.website
- 출처 URL: https://specification.website/
- 요약: HTML 기초(doctype·charset·viewport·메타)부터 SEO·접근성(WCAG)·보안 헤더·`/.well-known/`·AI 에이전트 레디니스·Core Web Vitals 성능·프라이버시·복원력·국제화까지 13개 영역의 모던 웹사이트 베스트프랙티스를 플랫폼 무관하게 정리한 MIT 라이선스 오픈 스펙. 사람이 읽는 문서 + 머신용(Markdown·MCP·JSON) 포맷 동시 제공, GitHub 기여 오픈.
- 비고: 퍼블리셔 핸드오프 체크리스트·디자인 토큰/마크업 표준화 작업의 레퍼런스로 적합. "Agent Readiness" 섹션은 최근 AX 흐름과 연결해 부각할 포인트.

---

#### 99. GitHub's Plan for Agents — 에이전트 코드 폭증과 인프라 재설계 (Latent Space)

- 날짜: 2026-06-08
- 태그: AX, 에이전트, GitHub, 개발인프라, Copilot
- 국가: GLOBAL
- 카테고리: ai (AX 현장 — 발행 호에서 확정)
- 직무 태그: 프론트엔드, 웹퍼블리셔
- 출처 유형: reference
- 출처: Latent Space (Kyle Daigle, GitHub COO 인터뷰)
- 출처 URL: https://www.latent.space/p/github
- 요약: GitHub이 주 275M 커밋(연 14B 추정)·계정 2억 돌파 규모에서 에이전트가 만들어내는 코드량 폭증에 부딪혀 권한 레이어·MySQL·모노레포·잡 큐 등 10년 된 서비스를 근본 재작성해야 하는 상황을 다룸. 메가 스킬이 아니라 원자적 마이크로 스킬을 Teams·Slack·이메일·GitHub 컨텍스트에 통합하는 내부 AI 워크플로, Copilot의 앰비언트화, AI 생성 코드 신뢰는 기술이 아닌 사회적 문제라는 관점.
- 비고: AX 도입 현장기로 DEV `ai`에 부합(개론·벤치마크 아님). 팟캐스트 인터뷰이므로 발행 시 트랜스크립트/공식 GitHub 블로그로 구체 사실 보강 권장.

---

#### 99. Hermes Agent — 셀프임프루빙 데스크톱 AI 에이전트 (Nous Research)

- 날짜: 2026-06-08
- 태그: AX, AI에이전트, 데스크톱앱, 자동화, 오픈소스
- 국가: GLOBAL
- 카테고리: ai (AX 현장 — 발행 호에서 확정)
- 직무 태그: 프론트엔드, 웹퍼블리셔
- 출처 유형: reference
- 출처: Nous Research
- 출처 URL: https://hermes-agent.nousresearch.com (※ 사용자 제공 링크 hermes-ai.net은 비공식 커뮤니티 사이트 — 발행 시 공식 도메인을 최종 기준 원문으로 재검증)
- 요약: Nous Research가 만든 MIT 라이선스 데스크톱 AI 에이전트. Telegram·Discord·Slack·WhatsApp·Signal·이메일·CLI 등 다중 채널에서 동작하고, 프로젝트에서 학습해 새 기능을 자동 생성하는 지속 메모리, 자연어 스케줄링, 웹 검색·브라우저 자동화·비전·이미지 생성, Docker·SSH·Singularity 등 5종 샌드박스 실행을 지원. macOS 12+·Windows 10/11·Linux 제공.
- 비고: 현장 적용 가능한 AX 도구 사례. 비공식 링크 검증 주의(위 출처 URL 참고).
