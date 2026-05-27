#### 12. Easily apply Copilot code review feedback with Copilot cloud agent

- **날짜**: 2026-05-19
- **태그**: Copilot, 코드리뷰, PR자동화, 클라우드에이전트
- **국가**: 미국
- **카테고리**: DEV / github_workflow
- **직무 태그**: 웹DEV
- **출처 유형**: 공식 changelog
- **출처**: GitHub Changelog
- **출처 URL**: https://github.blog/changelog/2026-05-19-easily-apply-copilot-code-review-feedback-with-copilot-cloud-agent
- **이미지**: (썸네일 없음)
- **이미지 설명**: -
- **요약**: GitHub이 Copilot 코드 리뷰의 "Implement suggestion" 버튼을 "Fix with Copilot"으로 바꾸면서, 적용 방식·모델·추가 지시를 고르는 다이얼로그를 끼워 넣었다. 일괄 처리 버튼도 같이 정비됐다.

**핵심 사실**

- Copilot 코드 리뷰의 단일 제안 적용 버튼이 `Implement suggestion`에서 `Fix with Copilot`으로 리네이밍됐다.
- `Fix with Copilot`을 누르면 다이얼로그가 뜬다. 현재 PR에 바로 적용할지 새 PR을 만들지 고르고, Copilot이 사용할 모델을 선택한 다음, 필요하면 변경 방향을 안내하는 추가 지시(optional additional instructions)를 적어 보낼 수 있다.
- 일괄 처리 버튼 `Implement all suggestions`는 `Fix batch with Copilot`으로 바뀌었다. PR 개요 코멘트에 붙어 있고, 여러 리뷰 코멘트를 한 번에 Copilot 클라우드 에이전트로 넘기되 어떤 코멘트를 적용할지 사용자가 골라 보낼 수 있다.
- 기존에는 코멘트에서 `@Copilot`을 자동으로 태깅해 처리가 시작됐지만, 이번 변경으로 명시적인 핸드오프 단계가 끼면서 어떤 모델로 어떤 지시를 함께 보낼지 매번 정해 누르게 됐다.

**개발 인사이트**

리뷰 코멘트를 코드로 옮기는 마지막 한 클릭이 그동안은 "그냥 적용"이었다. 이번 변경은 그 한 클릭을 다이얼로그로 한 번 끊는다. 모델을 고르고 추가 지시를 넣는 자리가 생긴다는 건, 같은 제안이라도 어떤 모델·어떤 톤으로 풀어낼지 PR 작성자가 매번 정해야 한다는 뜻이다. 자동 `@Copilot` 태깅에서 명시적 핸드오프로 바뀐 흐름은, 리뷰 코멘트→자동 수정 파이프라인을 한 번 더 사람 손으로 게이팅한다.

`Fix batch with Copilot`은 더 무겁다. 리뷰 코멘트 여러 개를 한 번에 클라우드 에이전트로 보내는 동작은 편하지만, 어떤 코멘트를 묶어 보내고 어떤 건 빼는지 고르는 단계가 함께 있다. 일괄로 보낼수록 모델·추가 지시·적용 위치를 누가 결정하는지가 팀 룰로 자리 잡아야 한다. 신입이 그냥 모두 체크해서 보내고 결과 PR을 받는 흐름이 되면, 리뷰 코멘트의 의도가 코드까지 따라오지 않을 가능성이 커진다.

**점검 질문**

- 우리 PR 리뷰 흐름에서 `Fix with Copilot` 다이얼로그의 모델 선택·추가 지시 입력을 누가 책임지고 게이팅하는가? 작성자에게 일임할지, 리뷰어가 코멘트에 모델·지시 가이드를 함께 남길지 룰이 있는가?
- `Fix batch with Copilot`로 여러 코멘트를 묶어 보낼 때 어떤 코멘트는 빼야 하는지(예: 설계 변경을 동반하는 제안) 판단 기준이 팀에 명문화돼 있는가, 아니면 매번 PR 작성자 감각에 맡기고 있는가?
