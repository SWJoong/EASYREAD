# EASYREAD — 프로젝트 컨텍스트

## 프로젝트 개요
발달장애인·저문해력 사용자를 위한 한국어 쉬운 정보 검증 MCP 서버 (TypeScript + Node.js 22)

## 핵심 명령어
```bash
npm run build        # tsc 빌드
npm test             # vitest 전체 테스트
npm run typecheck    # 타입 검사
npm run lint         # eslint
npm run inspector    # MCP Inspector 실행
```

## 아키텍처 원칙
- 변환은 클라이언트 LLM이, 지침·사전·검증은 이 서버가 담당
- 런타임 의존성 2개만: `@modelcontextprotocol/sdk`, `zod`
- 규칙 1개 = 파일 1개 = 골든 테스트 1개 (순수 함수)
- validation-checklist.md가 규칙 ID의 단일 소스
- stdout은 JSON-RPC 채널 — 로깅은 `console.error`만

## 코딩 컨벤션
- ESM 전용, 파일명 kebab-case, 규칙 파일은 규칙 ID 소문자 (sen-01.ts)
- 사용자 대면 문자열은 `src/messages.ts`에 집중
- 테스트 이름에 TC ID 포함 (예: TC-SEN-01-01)
- 커밋 메시지: `T-XX: 내용` 형식

## 하네스 엔지니어링 운영 중
이 프로젝트는 두 개의 Claude Code 인스턴스가 병렬로 작업합니다.
- **Instance-W** (Windows/개인): PL·QA — 설계, 테스트 작성, 품질 검증
- **Instance-U** (Ubuntu/팀): Backend·DevOps — 구현, 배포 준비

### 동기화 규칙
- `src/` 수정 → Instance-U만
- `tests/` 골든 테스트 → Instance-W만
- 핸드오프 커밋: `[HANDOFF→W]`, `[HANDOFF→U]`, `[SYNC]`
- 상세: `docs/plan/06-harness-engineering.md` 참조

### 상태 동기화 (복붙 없이 — agent-sync 채널)
- 세션 시작·재개 시: `scripts/agent-sync.sh pull` 로 상대 최신 상태를 읽는다 (SessionStart 훅이 자동 수행).
- 핸드오프·턴 종료 시: `scripts/agent-sync.sh post <w|u> "진행상황·문제·다음 요청"` 로 내 상태를 남긴다.
- 전용 `agent-sync` 브랜치에 **상태 로그만** 담는다(코드 아님). 코드 핸드오프는 여전히 PR·CI 경유.

## 현재 작업 현황

### 완료
- M1 마일스톤 (T-01~T-06), 76개 테스트 통과

### 다음
- T-07: VOC 규칙군 구현
