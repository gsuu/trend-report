---
날짜: 2026-05-11
태그: npm 공급망, GitHub Actions, pull_request_target, OIDC
국가: GLOBAL
카테고리: dev/security
직무 태그: 웹DEV
출처 유형: blog_opinion
출처: TanStack Blog
출처 URL: https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
이미지: 없음
이미지 설명: 없음
요약: TanStack은 2026년 5월 11일 19시 20분~26분 UTC, 약 6분 동안 42개 npm 패키지 84개 버전이 악성 코드로 오염된 사건의 사후 분석 보고서를 공개했다. `pull_request_target` 트리거와 GitHub Actions 캐시 중독, OIDC 토큰 탈취가 연쇄적으로 연결된 공격 경로를 해부한다.
---

### TanStack npm 공급망 침해: `pull_request_target` · 캐시 중독 · OIDC 토큰 탈취 연쇄 공격 사후 분석

##### 용어 설명

- `pull_request_target`: 포크 기반 PR을 처리할 때 base 저장소 권한으로 워크플로우를 실행하는 GitHub Actions 트리거. 기본 `pull_request`와 달리 외부 기여자의 코드가 저장소 시크릿과 캐시에 접근할 수 있어, 잘못 구성하면 "Pwn Request" 공격 벡터가 된다.
- OIDC 토큰: GitHub Actions가 워크플로우 실행 중 임시 발급하는 신원 증명 토큰. `id-token: write` 권한이 선언된 워크플로우에서는 npm 레지스트리에 직접 배포 권한을 얻는 데 사용할 수 있다.
- `pnpm-store`: pnpm 패키지 매니저가 패키지 바이너리를 캐시해 두는 로컬 저장소. GitHub Actions 캐시와 결합할 경우, 캐시 키가 같으면 서로 다른 워크플로우 실행 간에 동일한 캐시를 공유한다.

##### 요약

- 2026-05-10 공격자(GitHub 계정 zblgg)가 TanStack/router의 포크를 생성하고, `vite_setup.mjs`라는 약 3만 줄짜리 악성 번들 파일을 포함한 PR #7378을 제출했다. 커밋 작성자는 `claude@users.noreply.github.com`으로 위조했다.
- PR이 열리자 `bundle-size.yml` 워크플로우가 `pull_request_target` 트리거로 실행됐다. 이 워크플로우는 포크의 병합 커밋을 base 저장소 권한으로 체크아웃해 `pnpm nx run @benchmarks/bundle-size:build`를 실행했고, 악성 `vite_setup.mjs`가 실행되면서 pnpm-store 캐시(키: `Linux-pnpm-store-6f9233a50def742c09fde54f56553d6b449a535adf87d4083690539f49ae4da11`, 약 1.1 GB)가 오염됐다. 오염된 캐시는 `refs/heads/main` 스코프로 저장됐다.
- 2026-05-11 19:15, main 브랜치에 합법적인 PR #7369이 머지됐다. `release.yml`이 트리거됐고, `id-token: write` 권한으로 실행된 워크플로우는 앞서 오염된 캐시를 그대로 복원했다. 악성 바이너리는 `/proc/<pid>/mem`을 읽어 Runner 프로세스 메모리에서 OIDC 토큰을 추출한 뒤, 공식 Publish Packages 단계를 우회해 npm 레지스트리에 직접 배포했다. 이 과정이 19:20~19:26 UTC 사이 약 6분 만에 완료됐다.
- 영향받은 패키지는 42개, 악성 버전은 총 84개다. `@tanstack/query*`, `@tanstack/table*`, `@tanstack/form*`, `@tanstack/virtual*`, `@tanstack/store`, `@tanstack/start`(메타 패키지)는 침해되지 않았다.
- 악성 페이로드(`router_init.js`, 약 2.3 MB 난독화 파일)는 npm install 시 `prepare` 라이프사이클 스크립트를 통해 실행된다. AWS IMDS/Secrets Manager, GCP 메타데이터, Kubernetes 서비스 어카운트, Vault 토큰, `~/.npmrc`, GitHub 토큰, SSH 키 등 런타임 자격증명을 수집해 Session messenger 네트워크(`filev2.getsession.org`)로 유출한다.
- 외부 보안 연구자 ashishkurmi(StepSecurity)가 발행 약 20분 뒤인 19:50경 이슈 #7383으로 전체 IOC를 공유하면서 탐지됐다. TanStack 팀은 21:30까지 84개 버전 deprecated, tarball 제거 요청, 전체 저장소 캐시 삭제, `bundle-size.yml` 구조 변경(`repository_owner` 가드 추가, 써드파티 action refs SHA 고정)을 완료했다.
- 공격이 성공한 근본 원인은 세 취약점의 연쇄다. `pull_request_target` 단독으로는 캐시를 오염시키는 것까지이고, 캐시 중독 단독으로는 별도 배포 경로가 필요하며, OIDC 탈취 단독으로는 Runner에서 먼저 코드를 실행해야 한다. 세 고리가 맞아야 npm 직접 배포까지 도달했다.

##### 매거진 인사이트

> 3개의 알려진 취약점이 연쇄할 때 6분이면 42개 패키지가 오염된다. 각각을 혼자 놓아두면 위험해 보이지 않는다는 게 이 사건의 교훈이다.

###### 왜 지금 이 사건인가

이 사건을 단순한 외부 공격 사례로 읽으면 절반밖에 이해하지 못한다. TanStack 팀이 스스로 밝힌 것처럼, 세 가지 취약점(`pull_request_target` 남용, 캐시 공유 정책, `id-token: write` + 캐시 복원 조합) 중 어느 하나도 "모르는 취약점"이 아니었다. `pull_request_target` 위험성은 2024년 Adnan Khan이 "The Monsters in Your Build Cache"로 문서화했고, GitHub Security Lab도 "Preventing pwn requests"를 이미 공개했다. 2025년 3월 tj-actions/changed-files 침해에서 OIDC 토큰을 메모리에서 추출하는 Python 스크립트도 이미 공개된 tradecraft였다. 공격자는 알려진 기법을 재조합해 새 타깃에 적용했다. 내 저장소에 `pull_request_target`이 쓰인다면, 그 워크플로우가 캐시를 저장하고 있는지, 그 캐시가 배포 워크플로우와 공유되는지 지금 확인해야 한다.

###### 구현 관점

`pull_request_target`이 필요한 경우라도 두 가지 방어선을 동시에 적용해야 한다. 첫째, `repository_owner` 또는 `github.event.pull_request.head.repo.full_name` 조건으로 포크 PR에서 신뢰 경계를 명시적으로 끊는다. TanStack이 이번에 추가한 `repository_owner` 가드가 바로 이 방어선이다. 둘째, 포크 PR 워크플로우에서 쓰는 캐시 키와 배포 워크플로우에서 쓰는 캐시 키가 겹치지 않도록 범위를 분리한다. GitHub Actions 캐시는 같은 저장소 안에서 워크플로우 실행 간에 기본적으로 공유되므로, PR 빌드 캐시가 배포 워크플로우로 흘러들지 않도록 키 설계를 별도로 검토해야 한다.

`id-token: write` 권한은 필요한 워크플로우에만 선언하고, 해당 워크플로우에서 외부 캐시를 복원하는 단계가 있는지 함께 점검한다. 두 조건이 같은 job에 묶이는 순간 OIDC 토큰 추출 경로가 열린다. pnpm을 쓰는 환경이라면 `pnpm blockExoticSubdeps` 설정도 함께 확인한다. 이 설정은 `optionalDependencies`를 통해 GitHub 저장소 URL에서 직접 패키지를 받아오는 경로를 차단한다. 이번 공격의 최초 진입점인 `@tanstack/setup` orphan 커밋 fetch가 이 경로를 이용했다.

써드파티 GitHub Actions action의 ref를 `@v6.0.2`처럼 태그로 두면 공급망 위험이 한 단계 더 추가된다. SHA 핀닝(`uses: actions/checkout@<full-sha>`)으로 action 자체의 변조 가능성을 차단하는 것도 이번 TanStack 하드닝 조치에 포함됐다.

###### 실무에 어떻게 적용할 수 있을까

지금 당장 할 수 있는 점검은 세 가지다. CI 파이프라인 설정 파일에서 `pull_request_target`을 검색해 해당 워크플로우가 캐시를 저장하거나 복원하는지 확인한다. `id-token: write`가 선언된 워크플로우에서 캐시 복원 단계(`actions/cache`, `pnpm/action-setup --store` 등)가 있는지 확인한다. `optionalDependencies`에 GitHub URL 형태의 패키지가 있는지 확인한다.

2026-05-11에 `@tanstack/router`, `@tanstack/history` 등 해당 패키지를 설치한 환경이 있다면 AWS, GCP, Kubernetes, Vault, GitHub, npm, SSH 자격증명을 즉시 교체해야 한다. 영향받은 84개 버전 전체 목록은 GitHub Security Advisory GHSA-g7cv-rxg3-hmpx에서 확인할 수 있다.

이 사건이 제기하는 설계 질문은 하나다. CI 파이프라인에서 외부 코드(포크 PR)가 배포 권한에 닿는 경로가 캐시를 통해 간접적으로라도 열려 있는가?
