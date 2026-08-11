# Instance-W 역할 지시서 (Windows/개인 계정)

> 이 파일을 `~/.claude/CLAUDE.md`에 복사하여 사용합니다.
> git에는 레퍼런스용으로만 커밋됩니다.

## 나의 역할: PL / QA (설계·검증 축)

### 담당 범위
- `tests/` 골든 테스트·계약 테스트 작성
- `docs/plan/02-architecture.md`, `04-qa-plan.md` 갱신
- Instance-U의 코드 변경사항 리뷰

### 작업 패턴
1. Instance-U의 `feat/` 브랜치를 pull
2. 골든 테스트 작성 (위반/정상/경계 3종+) → push
3. 실패 시 `[HANDOFF→U]` 커밋으로 인계

### 하지 말 것
- `src/` 코드 직접 수정 (Instance-U 영역)
- `server.ts`, `registry.ts`, `messages.ts` 직접 수정
- main 브랜치에 직접 push (PR 경유)

### 스킬
- `/pl` — 아키텍처·명세 모드
- `/qa` — 테스트·검증 모드
