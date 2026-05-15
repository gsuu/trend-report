# PoC 실행 가이드 — 1주 1번, 채팅 한 마디

> 매주 한 마디로 매거진이 만들어집니다. ANTHROPIC_API_KEY 없이도 가능.

---

## TL;DR

```bash
# 처음 한 번만
npm install
```

```
# 매주 — Cowork 채팅에 한 마디
"이번 주 매거진 만들어줘"
```

끝.

---

## 동작 흐름 (사용자 시점)

```
사용자:  "이번 주 매거진 만들어줘"
   ↓
Claude:
   1) bash로 npm run collect:fetch 실행 → 19개 RSS 사이트에서 후보 수집
   2) tmp/collect/candidates.json 직접 읽기
   3) 우리 에이전시 컨텍스트로 후보 필터링·카테고리 분류 (관련도 ≥6)
   4) 상위 8~12건에 대해 풍부 에디토리얼 작성
      (takeawayHtml, deckHtml, sections, referenceLinks 포함)
   5) tmp/collect/issues.json 저장
   6) bash로 npm run collect:build 실행
      → src/data/weekly/{slug}.json + manifest + report.json 생성
   7) 결과 요약 + 다음 단계 안내
사용자:  git push
   ↓
Vercel 자동 배포
```

---

## 다른 사용 패턴 (필요할 때만)

| 채팅 표현 | 동작 | 언제 |
|---|---|---|
| **"이번 주 매거진 만들어줘"** | fetch + build (기본) | 매주 정기 발행 |
| "방금 만든 매거진 다시 빌드해줘" | candidates 재사용, 큐레이션만 다시 | 결과가 마음에 안 들어서 재생성 |
| "이번 주 매거진 미리보기만 보여줘" | RSS만 fetch, AI 안 씀 | 어떤 후보들이 잡혔는지 점검 |

---

## 모드 전체 비교

| 모드 | 트리거 | AI | 사람 노가다 |
|---|---|---|---|
| **Cowork 자동** | "이번 주 매거진 만들어줘" | Cowork(Claude) | 채팅 1회 |
| dry (구조 검증) | `npm run collect:dry` | 없음 (stub) | 명령 1회 |
| 외부 AI | `collect:fetch` → mega-prompt 붙여넣기 → `collect:build` | claude.ai 등 | 명령 2회 + 붙여넣기 1회 |
| full auto (API) | GitHub Actions cron 자동 | API 키 | 0회 (주 1회 자동) |

---

## 첫 실행 전 점검

```bash
npm install
npm run collect:dry       # AI 없이 RSS만 fetch — 19개 소스 응답 확인
```

dry 모드 출력 예시:
```
[collect] 후보 87건
          12건  Smashing Magazine — UX
          11건  CSS-Tricks
           8건  네이버 보도자료
           ...
```

소스가 0건이면 RSS URL 변경/봇 차단 가능성 — `config/sources.yaml` 갱신 필요.

---

## 외부 AI 모드 (claude.ai 웹 등에서 처리하고 싶을 때)

Cowork를 안 쓰고 외부 AI를 직접 쓰고 싶다면:

```bash
npm run collect:fetch
```

→ `tmp/collect/mega-prompt.md` 통째로 AI에 붙여넣기
→ AI 응답(JSON 배열)을 `tmp/collect/issues.json` 에 저장

```bash
npm run collect:build
```

→ `src/data/weekly/{slug}.json` + manifest + report.json 자동 생성

---

## 풀 자동화 (API 키 발급 후)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run collect          # 로컬 테스트
```

GitHub Actions secrets 등록:
- `ANTHROPIC_API_KEY`
- SMTP 5종: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (선택: `SMTP_PORT`, `SMTP_SECURE`, `MAIL_SITE_URL`)

→ 매주 월요일 06:00 KST 자동 실행 + 이메일 발송.

---

## 점검 체크리스트

| 항목 | 확인 방법 |
|---|---|
| 19개 소스 모두 응답 | `collect:dry` 또는 `collect:fetch` 로그의 소스별 카운트 |
| Vue 렌더링 정상 | `npm run dev` → 매거진 화면에서 첫 호 확인 |
| dedup 정확 | 같은 명령 두 번 → 두 번째는 신규 항목 0이어야 |
| 이미지 hotlink | 매거진 화면 이미지 정상 노출 |

---

## 구독자 파일 (이메일 발송용)

```
config/subscribers.service.txt
config/subscribers.design.txt
config/subscribers.dev.txt
```

한 줄에 이메일 한 개. 빈 줄과 `#` 주석은 무시.

---

## 알려진 제약

- Cowork 모드는 RSS 스니펫 기반 에디토리얼 (본문 fetch 미수행, 속도 우선). 풀 자동(API) 모드에서는 metascraper로 본문 보강.
- 외부 AI mega-prompt는 후보 수에 따라 30~80KB. claude.ai/ChatGPT는 OK, 일부 모델은 토큰 한계 초과 가능.
- `src/data/preview/`, `tmp/collect/` 는 .gitignore 처리 (커밋 X).
