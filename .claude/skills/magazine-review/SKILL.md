---
name: magazine-review
description: magazine-report.md의 모든 글을 원문 대조로 검수한다. magazine-reviewer 에이전트에 글마다 위임하고, 마지막에 category-qa 에이전트로 라우팅·번호 정합성을 점검한다. 트리거 — "리뷰 진행", "원고 검수", "매거진 검수", "발행 전 점검". 통과 후 magazine.json 재생성까지 수행.
---

# magazine-review — 매거진 검수 오케스트레이터

[docs/magazine-agent-workflow.md](../../../docs/magazine-agent-workflow.md) 11단계 중 **7~9단계 (리뷰 / 이미지·미디어 검수 / 카테고리·라우팅 QA)**를 수행한다. 발송 직전 단계까지 안전성을 확인한다.

## Phase 0: 입력 점검

1. 날짜 지정이 없으면 가장 최근 `runs/YYYY-MM-DD/magazine/magazine-report.md`. 한 줄 고지.
2. 다음 파일 필수:
   - `runs/YYYY-MM-DD/magazine/magazine-report.md`
   - `runs/YYYY-MM-DD/magazine/source-verification.json`

## Phase 1: 글별 리뷰 위임

`magazine-report.md`를 article 단위로 분리한 뒤, 각 글을 `magazine-reviewer` 서브에이전트에 위임한다. 같은 카테고리의 글들은 병렬 호출.

위임 시 명시:
- 검수 대상 글의 markdown 블록과 위치 (라인 범위)
- 최종 기준 원문 URL
- (선택) source-verification.json의 해당 항목

magazine-reviewer는 9개 점검 항목으로 검수하고 `통과 / 수정 필요 / 제외` 중 하나로 판정한다. `수정 필요`는 수정 루프(최대 2회) 후 다시 판정. magazine-reviewer가 `Edit`로 직접 수정한 결과는 `magazine-report.md`에 반영된다.

## Phase 2: 제외 항목 정리

magazine-reviewer가 `제외`로 올린 항목은 본문에서 제거하고 `## 수집했지만 제외한 것` 섹션에 옮긴다. 제외 사유와 다시 볼 조건을 함께 적는다.

article 번호가 끊긴 경우는 다음 Phase에서 정리.

## Phase 3: 이미지/미디어 검수

각 글의 `이미지` URL이 다음 기준을 충족하는지 확인한다 ([docs/magazine-agent-workflow.md](../../../docs/magazine-agent-workflow.md) §8):
- 최종 기준 원문, 공식 뉴스룸, 앱스토어/플레이스토어, 공식 블로그 출처인가
- 단순 OG 이미지/분위기 이미지가 아니라 UI·제품 상태를 보여주는가
- `https`로 접근 가능한가

이미지가 비어 있으면 `npm run` 호출 대신 `scripts/tracking/fill_missing_images.py`를 실행해 보강한다 (자동 탐색은 출처 URL/명시된 이미지 출처만). 그래도 못 채우면 `이미지 확보 메모`만 남기고 임의 대체 이미지를 넣지 않는다.

## Phase 4: category-qa 위임

`category-qa` 서브에이전트를 호출해 라우트·번호·areaKey 정합성을 점검한다.

category-qa가 "보고만" 한 항목(카테고리 자체 오류 등)은 magazine-reviewer에게 다시 돌려 수정하거나 사용자에게 명시 보고한다.

## Phase 5: magazine.json 재생성

전 단계가 통과하면:

```bash
npm run magazine:export-json
```

실행해 `public/data/magazine.json`을 새로 만든다.

## Phase 6: 사용자 보고

- 검수한 글 수
- `통과 / 수정 후 통과 / 제외` 분포
- category-qa 자동 수정 / 보고 필요 건수
- magazine.json 갱신 여부
- 다음 단계: `발송으로 진행하려면 /newsletter-send YYYY-MM-DD`

## 하지 않을 일

- 원문 검증을 다시 하지 않는다 (이미 source-verifier가 끝낸 일).
- shortlist 자체를 다시 만들지 않는다.
- Notion 업로드하지 않는다.
- 검수 통과 전에 `magazine:export-json`을 실행하지 않는다.
