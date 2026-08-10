# 03. 백엔드 구현 계획 (Backend)

> 작성 기준: `.claude/skills/backend` 워크플로 · 계약: [02-architecture.md](02-architecture.md) §3 인터페이스 명세 · 규칙 스펙: [validation-checklist.md](../../.claude/skills/easyread-domain/references/validation-checklist.md)

## 1. 프로젝트 구조

02 문서 §5의 모듈 구조를 그대로 사용한다. 디렉터리별 책임:

| 경로 | 책임 | 금지 사항 |
|---|---|---|
| `src/index.ts` | 엔트리. shebang(`#!/usr/bin/env node`), 데이터 로드 → 서버 연결. 로드 실패 시 stderr 메시지 후 exit 1 | 비즈니스 로직 |
| `src/server.ts` | `McpServer` 생성과 등록 호출만 | 핸들러 본문 구현 |
| `src/tools/*.ts` | 도구 1개 = 파일 1개. 입력 파싱 → 모듈 호출 → 응답 조립 | 규칙 로직 직접 구현 |
| `src/rules/**` | 규칙 1개 = 파일 1개(순수 함수). `registry.ts`가 규칙 목록 조립 | I/O, 콘솔 출력 |
| `src/text/*.ts` | 문장 분리·어절 계산·span 유틸. 무의존 최하위 | 상위 모듈 import |
| `src/prompts/*.ts` | 프롬프트 메시지 조립(순수 함수) | — |
| `src/data/*.ts` | assets 로딩 + zod 스키마. 기동 시 1회 로드, 이후 읽기 전용 | 런타임 재로딩 |
| `assets/` | dictionary.json, guidelines/, rules-config.json | 코드 |
| `tests/` | vitest. `tests/rules/`(골든), `tests/tools/`(계약), `tests/text/` | — |

## 2. 의존성

| 패키지 | 용도 | 선정 이유 / 정책 |
|---|---|---|
| `@modelcontextprotocol/sdk` | MCP 서버 프레임워크 | 공식 SDK(ADR-02). 캐럿 범위 고정, **구현 착수 시 modelcontextprotocol.io 최신 문서로 API 재확인** |
| `zod` | 입력 스키마·데이터 검증 | SDK 표준 조합. 스키마가 곧 명세 |
| `vitest` | 테스트 러너 | dev. TS 네이티브, watch 빠름 |
| `typescript`, `tsx` | 빌드/개발 실행 | dev. 빌드는 `tsc`(ESM 산출), 개발은 `tsx watch` |
| `@modelcontextprotocol/inspector` | 수동 테스트 | dev(npx 실행, 의존성 미추가 가능) |
| eslint + @typescript-eslint | 린트 | dev. `no-console` 규칙으로 stdout 오염 방지(§6) |

원칙: **런타임 의존성은 SDK+zod 2개로 유지한다.** 추가하려면 ADR로 근거를 남긴다(번들 크기·공급망 리스크 관리).

### 확정 버전 (T-01 착수 시 재확인, 2026-08-09)

| 패키지 | 범위 | 구분 | 비고 |
|---|---|---|---|
| `@modelcontextprotocol/sdk` | `^1.30.0` | runtime | peer `@cfworker/json-schema`는 **optional**이라 미설치가 정상. 필요 기능 사용 시점에 추가 |
| `zod` | `^4.4.3` | runtime | SDK peer `^3.25 || ^4.0` 충족 |
| `typescript` | `~6.0.3` | dev | **의도적 패치 핀.** typescript-eslint 8.66이 `typescript <6.1.0`만 지원하고, `typescript@7`(네이티브 포팅본)은 컴파일러 API 재작성 중이라 린트 파서가 미지원. 6.0.x는 JS 기반 마지막 안정 릴리스 |
| `tsx` | `^4.23.11` | dev | 개발 실행(`tsx watch`). esbuild 기반이라 TS 버전 무관 |
| `vitest` | `^4.1.10` | dev | Node 22 지원. esbuild 트랜스파일이라 TS 버전 무관 |
| `eslint` | `^10.8.1` | dev | flat config. `eslint.config.js` |
| `typescript-eslint` | `^8.66.0` | dev | 메타 패키지(parser+plugin+config). 비타입체크 recommended 적용 |
| `@eslint/js` | `^10.0.1` | dev | flat config용 JS 권장 규칙 |
| `@types/node` | `^22.20.1` | dev | 런타임 Node 22에 맞춤(major 정렬) |

- 빌드/타입/린트/테스트는 스크립트로 분리: `build`(tsc, `tsconfig.build.json` → `dist/` src만), `typecheck`(tsc `--noEmit`, src+tests), `lint`(`eslint .`), `test`(`vitest run`). CI 게이트(05 §4)와 1:1.
- tsconfig는 2단 구성: `tsconfig.json`(무발행 베이스 — 편집기·타입·린트·테스트 공용), `tsconfig.build.json`(src만 발행). ESM은 `module/moduleResolution: nodenext` + `verbatimModuleSyntax`(상대 import에 `.js` 확장자 필수).

## 3. 도구별 구현 방침

각 도구의 처리 흐름과 "까다로운 입력 3종" 동작. 응답은 항상 `content`(사람용 텍스트) + `structuredContent`(02 §3.1 스키마) 병행, `outputSchema` 선언.

### `validate_easy_read`
1. zod 파싱(1~50,000자) → 2. `text/`로 문장·단락 분리 → 3. registry에서 활성 규칙 조회(`excludeRules`·`original` 유무 반영) → 4. 규칙 실행, 위반 수집 → 5. 리포트 조립(verdict 판정: error≥1 → fail, warning≥1 → needs-review, 그 외 pass) → 6. `notices`에 PROC 문구 첨부(FR-06).

| 까다로운 입력 | 동작 |
|---|---|
| 빈 문자열/공백만 | zod min(1) + trim 검사 → 입력 검증 오류(McpError InvalidParams) |
| 50,001자 | "텍스트가 너무 깁니다. 나눠서 검사해 주세요." 오류 + 한도 명시 |
| 이모지·URL·표 문자 혼합 | 문장 분리는 유지, URL은 어절 1개로 계산, 규칙 span은 코드포인트가 아닌 UTF-16 인덱스 기준임을 스키마 설명에 명시 |

### `analyze_readability`
문장 분리 → 통계 집계(문장 수·평균/최장 어절·단락 수) → 사전 매칭으로 difficultWords 집계. 까다로운 입력: 문장부호 없는 장문(개행 기준 보조 분리), 숫자만 있는 입력(문장 0개로 처리하고 안내), 극단적 반복 단어(difficultWords는 상위 20개로 절단).

### `lookup_easy_word`
정확 일치 → 없으면 부분 일치(포함) 상위 `limit`건을 `related`로. 까다로운 입력: 공백 포함 구("수급 자격" → 공백 제거·원형 両방 시도), 조사 붙은 형태("구비서류를" → 어미/조사 단순 제거 휴리스틱 1회 재시도), 영단어(소문자화 후 loanword 카테고리 탐색).

### `get_guidelines`
enum 섹션 → 해당 Markdown 반환 + `ruleIds` 목록. 까다로운 입력 없음(enum 강제). "전체" 요청은 각 영역 요약+개별 조회 안내(토큰 절약).

### Prompts (`simplify-text`, `easy-read-review`)
`src/prompts/`의 순수 함수로 메시지 조립. FR-05 AC의 3요소(절차·정확성 원칙·감수 고지)는 **상수 문자열 모듈로 분리**해 테스트에서 포함 여부를 검사할 수 있게 한다.

### Resources
3종 URI(02 §3.3)를 정적 텍스트로 등록. dictionary는 로드된 데이터를 JSON.stringify(들여쓰기 없이).

## 4. 규칙 엔진 설계

```ts
// rules/types.ts (개요)
interface Rule {
  id: string;                    // "SEN-01" — validation-checklist와 1:1
  group: "SEN"|"VOC"|"NUM"|"STR"|"TYP"|"ACC";
  defaultSeverity: "error"|"warning"|"info";
  check(ctx: RuleContext): Violation[];   // 순수 함수
}
interface RuleContext {
  sentences: Sentence[];         // text/에서 분리·어절 계산 완료
  paragraphs: Paragraph[];
  raw: string;
  original?: ParsedText;         // ACC 전용
  dictionary: Dictionary;        // 읽기 전용
  config: ResolvedRuleConfig;    // rules-config + 사용자 config 병합
}
```

- **규칙 1개 = 파일 1개 = 골든 테스트 파일 1개** (예: `rules/sen/sen-01.ts` ↔ `tests/rules/sen-01.test.ts`). QA의 TC ID와 파일명이 대응된다.
- `registry.ts`는 규칙 배열을 정적 import로 조립한다(동적 로딩 금지 — 번들·기동 단순성).
- 규칙 추가 절차(ADR-03): validation-checklist.md에 행 추가 → rules-config.json에 심각도 → 규칙 파일 + 골든 테스트 → registry 등록. 이 절차를 CONTRIBUTING에 기재한다. 각 규칙의 표준 근거는 easyread-domain/references/sources.md(규칙 ID↔표준 조항)를 참조하고, 규칙 파일 상단 주석에 근거 표준을 1줄로 남긴다.
- ACC 규칙은 `original`이 있을 때만 registry가 활성화한다. 날짜/금액/연락처 추출기는 `text/extractors.ts`로 분리해 ACC 규칙들이 공유한다.

## 5. 데이터 적재

- `data/dictionary.ts`: 기동 시 1회 `assets/dictionary.json` 읽기 → zod 파싱 → 실패 시 **어떤 항목이 왜 실패했는지** stderr로 출력 후 exit 1 (조용한 데이터 오류 방지).
- 검색 구조: 정확 일치는 `Map<string, Entry>`, 부분 일치는 선형 탐색(시드 수백 건 규모에서 충분 — NFR-02 여유). 1만 건 초과 시점에 인덱스 도입을 백로그로.
- `rules-config.json`도 동일하게 zod 검증. 사용자 `config` 인자와의 병합은 "사용자 값 우선, 미지정은 기본값" 단순 규칙.
- 빌드 시 assets는 `files` 필드로 패키지에 포함하고, 경로 해석은 `import.meta.url` 기준(전역 설치·npx 환경 모두 동작).

## 6. 오류 처리 규약

- 입력 검증 실패: zod 스키마의 한국어 메시지로 안내(무엇을 고치면 되는지 포함). **SDK 1.30은 이 InvalidParams(McpError)를 `isError: true` CallToolResult로 변환해 반환**하므로(T-05 확인), 클라이언트 LLM이 메시지를 읽고 고칠 수 있다. zod `min/max/refine`로 빈 문자열·5만자 초과·공백만 입력을 막는다.
- 내부 예외: 도구 핸들러 최상위에서 잡아 "서버 내부 오류" + 오류 코드로 응답. **스택·입력 본문을 응답이나 로그에 싣지 않는다**(NFR-03).
- 로깅: stdio 서버이므로 **stdout 사용 절대 금지**(JSON-RPC 채널 오염). `console.error`만 허용하고, eslint `no-console: ["error", { allow: ["error"] }]`로 강제. 로그에도 사용자 텍스트 본문 미포함(길이·규칙 ID 같은 메타데이터만).
- 응답 크기: violations는 200건에서 절단하고 summary에 `truncated: true` 표시(초장문 입력 보호).

## 7. 코딩 컨벤션

- ESM 전용(`"type": "module"`), Node 22 기준. 파일명 kebab-case, 규칙 파일은 규칙 ID 소문자(`sen-01.ts`).
- 함수는 순수 함수 우선. I/O는 `index.ts`와 `data/`에만 존재한다.
- 사용자 대면 문자열(오류 메시지, 리포트 문구)은 `src/messages.ts`에 모은다 — 쉬운 정보 프로젝트답게 **오류 메시지도 쉬운 문장으로** 쓴다(짧게, 행동 지시 포함).
- 주석은 "코드로 표현 못 하는 제약"만: 규칙 파일 상단에 validation-checklist의 해당 행 요지 1줄.
- 테스트 이름에 TC ID 포함(04 문서 규약): `it("TC-SEN-01-01: 16어절 문장은 error", …)`.

## 8. 구현 순서 (WBS 연동)

T-01 → T-02 → T-03 → T-04 → T-05 (M1 뼈대: Inspector로 SEN 검증 확인)
→ T-06(사전 시드) → T-07(잔여 규칙군) → T-08(도구 3종) → T-09(프롬프트·리소스) → T-10(ACC) → T-11(통합·성능).

각 작업 완료 시 이 문서 아래 체크박스에 표시하고, 계약(02 §3)과 달라진 점이 있으면 **먼저 02를 고친 뒤** 코드를 맞춘다.

- [x] T-01 스캐폴딩 (2026-08-09 — build·typecheck·lint·test 4종 그린)  - [x] T-02 text/ (2026-08-09 — 문장 분리기 격리, 25 테스트 통과)  - [x] T-03 규칙 코어 (2026-08-10 — registry·엔진·리포트 조립기, 리포트 zod 스키마 검증, 37 테스트)  - [x] T-04 SEN (2026-08-10 — SEN-01~05 + 골든·오탐 방지, 64 테스트)  - [x] T-05 서버 뼈대 (2026-08-10 — validate_easy_read stdio 등록, InMemory 계약 + 실 stdio 스모크, **M1 완료**)
- [ ] T-06 사전 시드  - [ ] T-07 규칙군 완성  - [ ] T-08 도구 3종  - [ ] T-09 프롬프트·리소스  - [ ] T-10 ACC  - [ ] T-11 통합·성능(M2)

## 9. 변경 이력

| 날짜 | 변경 | 작성 |
|---|---|---|
| 2026-08-09 | 최초 작성 | Backend (backend 스킬) |
| 2026-08-09 | T-01 스캐폴딩 구현 완료 — 확정 버전 표 추가, `typescript@~6.0.3` 채택 근거 기록(typescript-eslint 호환) | Backend (backend 스킬) |
| 2026-08-09 | 규칙 엔진 §4에 표준 근거(sources.md) 연결, 규칙 파일 주석에 근거 표준 명시 규약 추가 | Backend (표준 감사) |
| 2026-08-09 | T-02 구현 완료 — src/text(문장 분리기·어절·span), 경계 케이스(따옴표·숫자 마침표·날짜·괄호·개행·이모지) 25 테스트 통과 | Backend (backend 스킬) |
| 2026-08-10 | T-03 규칙 엔진 코어 — types/config/registry/report/engine + messages(PROC 안내), 리포트 zod 스키마·더미 규칙 검증, 37 테스트 | Backend (backend 스킬) |
| 2026-08-10 | T-04 SEN 규칙군 — SEN-01~05(rules/sen/) registry 등록, 참·오탐 방지 골든 테스트, 64 테스트 | Backend (backend 스킬) |
| 2026-08-10 | T-05 서버 뼈대 — index/server/tools/validate, validate_easy_read(stdio) 등록, InMemory 계약 테스트 + 실 stdio 스모크, 70 테스트. **M1 완료** | Backend (backend 스킬) |
