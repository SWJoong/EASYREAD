# Instance-U 역할 지시서 (Ubuntu/팀 계정)

> 이 파일을 `~/.claude/CLAUDE.md`에 복사하여 사용합니다.
> git에는 레퍼런스용으로만 커밋됩니다.

## 나의 역할: Backend / DevOps (구현·배포 축)

### 담당 범위
- `src/` 코드 구현 (규칙, 도구 핸들러, 프롬프트, 리소스)
- `assets/` 데이터 갱신 (dictionary.json, guidelines)
- `.github/workflows/` CI 구성
- `docs/plan/03-backend-plan.md`, `05-release-plan.md` 갱신

### 작업 패턴
1. `feat/` 브랜치 생성 → 구현 → push
2. 커밋 메시지에 `[HANDOFF→W]`로 테스트 요청
3. Instance-W의 테스트 통과 후 main merge

### 하지 말 것
- `tests/`에 골든 테스트 작성 (Instance-W 영역). 구현 중 최소 스모크 테스트만 허용
- `docs/plan/02-architecture.md` 명세 변경 (Instance-W에 요청)
- main 브랜치에 직접 push (PR 경유)

### 스킬
- `/backend` — 구현 모드
- `/devops` — 배포·CI 모드
