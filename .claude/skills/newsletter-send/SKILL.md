---
name: newsletter-send
description: 검수 통과한 매거진을 audience(service/design/dev)별 뉴스레터로 발송한다. 반드시 jisuk@cttd.co.kr 테스트 메일 → 사용자 명시 확인 → cxd@cttd.co.kr 최종 발송 순서를 지킨다. 트리거 — "뉴스레터 보내줘", "메일 발송", "테스트 메일", "최종 발송". 절대 규칙 위반 시 작업 거부.
---

# newsletter-send — 뉴스레터 발송 오케스트레이터

[AGENTS.md](../../../AGENTS.md) Newsletter Approval Flow와 [CLAUDE.md](../../../CLAUDE.md) 절대 규칙 1을 기준으로 동작한다. **이 스킬은 사용자 명시 확인 없이는 절대 최종 발송으로 넘어가지 않는다.**

## Phase 0: 사전 점검

1. 대상 날짜가 명시되지 않았으면 가장 최근 `runs/YYYY-MM-DD/magazine/magazine-report.md`.
2. 사용자에게 발송할 audience 확인. 옵션: `service` / `design` / `dev`. 명시 없으면 묻는다 — **추측하지 않는다**.
3. 다음 사전 조건 확인:
   - `runs/YYYY-MM-DD/magazine/magazine-report.md`가 존재하고 magazine-review 통과 상태인가
   - `public/data/magazine.json`이 최신인가 (없으면 `npm run magazine:export-json` 먼저)
   - `MAGAZINE_BASE_URL`은 `https://magazine.cttd.co.kr`로 설정 (또는 `--magazine-base-url` 인자로 전달)
4. 한 줄 고지: `newsletter-send — 날짜 YYYY-MM-DD / audience [service|design|dev]`.

## Phase 1: 사이트 데이터 push

테스트 메일을 보내기 전에 사이트 데이터를 배포 브랜치에 반영해야 메일 안 링크가 살아있다. 사용자에게 확인:

> "현재 `public/data/magazine.json`을 push해야 메일 안 링크가 작동합니다. push 진행해도 될까요?"

승인 후:

```bash
git status
git diff public/data/magazine.json
# 사용자 승인 후
git add public/data/magazine.json runs/YYYY-MM-DD/magazine/magazine-report.md
git commit -m "..."
git push
```

배포 완료(또는 사용자가 "이미 push 끝났다"고 확인)까지 다음 Phase로 가지 않는다.

## Phase 2: 테스트 메일 발송

```bash
python scripts/newsletter/send_newsletter.py \
  --stage test \
  --audience [service|design|dev] \
  --magazine-base-url https://magazine.cttd.co.kr \
  --send
```

`--stage test`는 `TEST_RECIPIENT = jisuk@cttd.co.kr`로만 발송한다 (스크립트가 강제). 다른 수신자 추가 금지.

발송 후 사용자에게 보고:
- 발송 성공 여부
- 수신자: `jisuk@cttd.co.kr`
- audience
- 매거진 base URL

## Phase 3: 사용자 명시 확인 대기

**이 단계가 핵심.** 다음 메시지를 사용자에게 그대로 보낸다:

> "테스트 메일을 jisuk@cttd.co.kr로 발송했습니다.
> 메일 내용·링크·이미지가 모두 정상인지 확인해주세요.
> 최종 발송을 진행해도 좋다면 **명시적으로 확인**해주세요 (예: "최종 발송 진행", "ok send final").
> 수정이 필요하면 어디를 고쳐야 할지 알려주세요."

사용자가 "ok", "확인", "진행" 등 **명시 승인**을 줄 때까지 다음 Phase로 넘어가지 않는다. 자동 진행, 시간 경과, 다른 작업 응답 모두 승인이 아니다. 의심스러우면 다시 묻는다.

수정 요청이 들어오면 magazine-review 단계로 돌려보내고 이 스킬을 처음부터 다시 시작한다.

## Phase 4: 최종 발송

승인 후:

```bash
python scripts/newsletter/send_newsletter.py \
  --stage final \
  --audience [service|design|dev] \
  --magazine-base-url https://magazine.cttd.co.kr \
  --approved \
  --send
```

`--stage final`은 audience별 최종 수신자(cxd@cttd.co.kr 포함)에게 발송된다. `--approved` 플래그는 스크립트의 안전 게이트가 요구한다.

## Phase 5: 사용자 보고

- 발송 audience와 수신자 수
- 발송 시각
- 다음 발송 예정이 있으면 audience와 함께 안내

## 절대 금지

- `--stage final`을 `--stage test` 없이 먼저 실행하지 않는다.
- 사용자 명시 승인 없이 Phase 4로 넘어가지 않는다. "한 번 승인했으니 다음에도 자동" 금지.
- `--approved` 없이 `--stage final` 실행하지 않는다.
- 테스트 메일 수신자를 `jisuk@cttd.co.kr` 외로 바꾸지 않는다.
- magazine-review 통과 전에 발송하지 않는다.
- 사용자 미요청 audience를 추가 발송하지 않는다.
