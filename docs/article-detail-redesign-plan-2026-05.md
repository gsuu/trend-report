# 매거진 상세페이지 구성 리뉴얼 회의록 (2026-05-24)

> 첫 회의록 [docs/refactor-plan-2026-05.md](refactor-plan-2026-05.md)의 8개 안건이 모두 완료된 직후, 한국 이커머스 시니어 PM / UIUX 디자이너 / 퍼블리셔 페르소나로 매거진 상세페이지(`/articles/...`) 구성을 다시 짚는 회의.

## 현재 상세페이지 구성 (점검 자료)

```
<article class="article-layout">
  <header class="article-hero">
    <p.article-brand>{platform}</p>              ← 출처 이름 (오늘의집 뉴스룸 등)
    <h1>{takeawayHtml}</h1>                      ← 한 줄 결론
    <p.article-deck>{deckHtml}</p>               ← 1~2문장 deck
    <aside.meeting-question v-if=...>            ← 💬 클라이언트에게 묻기 (첫 회의 안건 6-A)
    <div.article-meta-row>
      <div.article-meta>{date} | {category} | 원문 바로보기</div>
      <button.article-share-button>             ← 공유 버튼
    </div>
    <aside.code-artifacts v-if=...>             ← 🛠️ 코드 산출물 (첫 회의 안건 5)
  </header>
  <div class="article-body">
    <div.article-gallery v-if 다중> ... </div>   ← 가로 스크롤 (첫 회의 안건 4)
    <figure.article-image v-else-if 단일>
    <section.article-section v-for>             ← 요약 / 인사이트 본문
  </div>
</article>
```

## 회의 안건 7개

### 안건 1. 정보 위계 — Hero 영역이 8개 슬롯으로 비대해짐

**편집장**: hero가 brand·h1·deck·meeting-question·meta·share·code-artifacts 7개 슬롯. 텍스트 블록이 위아래로 깔리는 모양.

**클라이언트 PM**: 회의 전 빠른 스캔에는 `meeting-question`이 가장 먼저 보여야 함. 현재는 h1 → deck → meeting-question 순서인데, **brand → h1 → meeting-question → deck → meta** 순서가 자연스럽다.

**비주얼 디자이너**: hero와 첫 이미지가 분리돼 스크롤 1.5번 필요. **hero 옆에 대표 이미지 split layout** (Mobbin·요즘IT 패턴).

**퍼블리셔**: 코드 산출물 chips는 hero보다 본문 가까이. 지금은 share 위쪽에 흘러 hero인지 본문인지 모호.

**시스템 운영자**: 모바일에서는 split 어려움 → 데스크탑만 split, 모바일은 세로.

**결론**:
- 데스크탑(≥980px): 2컬럼 hero — 왼쪽(brand/h1/meeting-question/deck/meta), 오른쪽(대표 이미지 또는 갤러리 첫 장).
- 모바일: 세로 흐름 유지하되 `brand → h1 → meeting-question → 대표 이미지 → deck → meta` 순서로 재배열.
- code-artifacts는 본문 진입 직전(`article-body` 첫 번째 요소 위)으로 이동.

---

### 안건 2. 회의 질문 박스 — sticky 여부

**클라이언트 PM**: 글 끝까지 화면에 떠 있으면 좋겠음. 본문 읽다가 회의 적용 질문 환기.

**비주얼 디자이너**: 모바일 sticky는 면적·가독성 문제. 데스크탑 sidebar에만 sticky.

**편집장**: 데스크탑 사이드바에 sticky meeting-question + 안건 5에서 논의할 사이드 모듈. 모바일은 hero 안 + 본문 마지막 `점검 질문` 섹션 자체 강조.

**퍼블리셔**: SERVICE 글만 메타 의무 → meeting-question 있을 때만 sidebar 렌더.

**결론**:
- 데스크탑: 우측 sticky sidebar 모듈로 `💬 클라이언트에게 묻기` 카드 (SERVICE 한정).
- 모바일: 현재 hero 안 위치 유지.
- 카드 클릭 시 본문 `점검 질문` 섹션으로 스크롤(deep-link).

---

### 안건 3. 본문 인사이트의 잠금 소제목 — 시각적 시그널 강화

**편집장**: `매거진 인사이트` 본문 4개 잠금셋(왜 지금 / 사용자는 무엇을 덜 해도 될까 / 설계 관점 / 점검 질문). 평문 `<h3>`라 위계가 안 보임.

**비주얼 디자이너**: 4개에 **번호 prefix**나 아이콘 배지. "01. 왜 지금", "02. 사용자는 무엇을". 4단 구조 자체를 인지시키기.

**퍼블리셔**: `<h3>` 그대로 두고 `counter-increment` + `::before` content로 번호 자동 부여.

**클라이언트 PM**: `설계 관점`과 `점검 질문` 둘만 PM 회의 인용 빈도가 3~5배. 별도 강조 (배경색 또는 좌측 보더).

**결론**:
- 4개 소제목 모두 번호 prefix (01~04, CSS counter).
- `설계 관점`·`점검 질문`은 좌측 검정 보더 + 베이지 배경 (meeting-question와 동일 톤).
- Design은 `왜 참고할 만한가 / 어디에 적용할 수 있을까 / 디자인 관점 / 점검 질문` 동일.
- DEV는 `왜 지금 / 구현 관점 / 실무에 어떻게 적용할 수 있을까 / 같이 보면 좋은 기술(옵션)` 동일.

---

### 안건 4. 갤러리 — Mobbin식 vs 본문 인라인

**비주얼 디자이너**: 첫 회의 안건 4의 가로 스크롤은 본문 시작 직전 1회만. 본문 중간 단락에서 추가 화면 비교가 필요할 때 같이 띄울 수 없음.

**편집장**: 본문 안 `![](url)` 마크다운 인라인 이미지가 답.

**퍼블리셔**: parser는 이미 `<img>` 흘려보냄. CSS만 — `.section-prose img { max-width: 100% }` 정리.

**클라이언트 PM**: 데스크탑 split layout(안건 1)에서 hero 옆 이미지 vs 본문 진입 후 갤러리 전체 — 중복 아니냐?

**비주얼 디자이너**: hero 옆은 도입 시각 단서, 본문 갤러리는 전체 흐름. 역할 분리. 중복 아님.

**결론**:
- 데스크탑: hero 우측에 첫 장만, 본문 진입 후 전체 갤러리 가로 스크롤.
- 모바일: 기존대로 hero 직후 갤러리 1회.
- 본문 안 인라인 이미지(`![]()`)는 그대로 + 반응형 CSS 추가.

---

### 안건 5. 사이드바 — 같은 브랜드·같은 flow·같은 회차 연관 글

**편집장**: 첫 회의 안건 3에서 만든 `brandNormalized` / `flow` / `changeType` 메타를 상세에서 재활용.

**클라이언트 PM**: 회의 중 "올리브영 다른 변화는?" 질문이 자주 나옴. 같은 브랜드 직전 글 1~3개 즉시 띄우면 강력.

**비주얼 디자이너**: "같은 flow 다른 브랜드" — `결제` 플로우로 무신사·컬리·올리브영 가로 비교. Mobbin 핵심 기능을 우리 자산으로 재현.

**시스템 운영자**: 사이드바에 3개 모듈 sticky:
1. 💬 클라이언트에게 묻기 (안건 2)
2. 같은 브랜드 — `brandNormalized` 같은 글 최근 3건
3. 같은 플로우 — `flow` 교집합 있는 글 최근 5건

**퍼블리셔**: 모바일은 사이드바 미노출 → 본문 마지막 `## 더 보기` 섹션으로 같은 모듈.

**결론**:
- 데스크탑(≥980px): 우측 sidebar 신설, 3개 모듈 sticky.
- 모바일: 본문 마지막 `## 더 보기` 섹션에 같은 모듈.
- 빈 모듈은 렌더 안 함.

---

### 안건 6. 출처·신뢰 — sourceTier 가시화 + 읽기 시간

**클라이언트 PM**: 글마다 "공식 뉴스룸인지 매거진인지" 한 줄에. 회의에서 "신세계 공식 발표"로 인용하려면 차이가 중요.

**시스템 운영자**: `sourceTier` 이미 article에 있음. 노출만. "🟢 공식 / 📚 발견 채널" 같은 작은 배지.

**비주얼 디자이너**: 색상 신중. 작은 회색 배지 + 라벨로 충분.

**퍼블리셔**: signalScore는 운영자용 — `aria-label` 보조 정보로만.

**클라이언트 PM**: **읽기 예상 시간**도 hero에 표시. "이건 3분짜리" 판단.

**결론**:
- meta-row에 `sourceTier` 배지 (verification: 진한 텍스트, discovery: 회색 + "발견 채널" 라벨).
- payload에 `readingMinutes` 필드 (본문 문자 수 / 350자, 최소 1분).
- signalScore는 `aria-label`에만 보조.
- 보조 출처(referenceLinks)는 sidebar로 이전 — 안건 5와 함께.

---

### 안건 7. 모바일 위계와 읽기 환경

**퍼블리셔**: 모바일에서 article-meta가 한 줄에 안 들어가 줄바꿈. `원문 바로보기`는 본문 끝 referenceLinks 영역에만, hero에서는 제거.

**클라이언트 PM**: visited 표시(이미 본 글) — 카드엔 있지만 상세 hero에는 없음.

**결론**:
- hero meta-row(모바일): 약 N분 + sourceTier 배지 + 날짜 + 카테고리(4개까지).
- `원문 바로보기`는 본문 끝 출처 영역에만.
- hero에 visited 작은 배지 "이미 본 글" 표시.

---

## 우선순위와 다음 액션

| 단계 | 안건 | 의존성 | 기간 | 영향 | 상태 |
|---|---|---|---|---|---|
| **1차 (즉시, 시각 강화)** | 안건 3: 본문 잠금 소제목 번호·강조 처리 | 없음 | 1일 | 본문 가독성 | ✅ Done (2026-05-24) |
| | 안건 6: sourceTier 배지 + 읽기 시간 | 없음 | 1일 | 신뢰 가시화 | ✅ Done (2026-05-24) |
| **2차 (구조 개편)** | 안건 1: 데스크탑 split hero + 정보 위계 재정렬 | 없음 | 2~3일 | 첫 화면 임팩트 | ✅ Done (2026-05-24) |
| | 안건 2: 회의 질문 sticky sidebar | 안건 1 | 1일 | PM 가치 | ✅ Done (2026-05-24) |
| | 안건 4: 인라인 이미지 CSS + 본문 갤러리 위치 | 안건 1 | 1일 | 시각 흐름 | ✅ Done (2026-05-24) |
| **3차 (자산 재활용)** | 안건 5: 사이드바 연관 글(같은 브랜드·같은 flow) | 안건 1, 안건 3 | 2일 | 누적 자산 활용도 폭발 | ✅ Done (2026-05-24) |
| **4차 (모바일)** | 안건 7: 모바일 meta-row 축약 + visited 배지 | 안건 1 | 1일 | 모바일 가독성 | ✅ Done (2026-05-24, visited 배지 + 모바일 정리) |

### 합의 사항 3가지

1. **데스크탑 상세는 2컬럼**(본문 + 우측 sticky sidebar). 모바일은 세로 흐름 유지하되 정보 순서 재정렬.
2. **사이드바는 첫 회의 안건 3 메타(brandNormalized·flow)를 1순위 사용처로** 활용. 같은 자산을 두 번 일하게.
3. **잠금 소제목 4개에 번호 prefix + 두 개(설계 관점·점검 질문)만 강조** — 본문 구조를 시각으로 학습시킴.
