# 00. 프로젝트 총괄 — 쉬운 정보(Easy-Read) MCP

## 프로젝트 개요

**EASYREAD**는 복잡한 한국어 텍스트를 발달장애인 등 낮은 문해력 독자를 위한 **쉬운 정보(Easy-Read)** 로 바꾸는 작업을 돕는 MCP 서버다. 핵심 설계 원칙은 하나다:

> **변환은 클라이언트 LLM이, 지침·사전·검증은 서버가.**

서버는 API 키 없이 오프라인에서 동작하는 결정적 도구(검증·분석·사전·지침)를 제공하고, 실제 문장 변환은 Claude 같은 클라이언트 LLM이 서버의 프롬프트와 도구를 활용해 수행한다. 도구 산출물은 언제나 "당사자 감수 전 초안"이다 — 도구는 감수를 대체하지 않는다.

## 기술 스택 (확정 추천안)

| 구성 | 선택 | 근거 |
|---|---|---|
| 언어/런타임 | **TypeScript, Node.js 22 LTS+** | MCP 생태계 표준, npx 배포로 설치 마찰 최소 (ADR-02) |
| MCP 프레임워크 | **`@modelcontextprotocol/sdk`** (공식) | 성숙도·레퍼런스 최다. `McpServer` + `registerTool/Prompt/Resource` 패턴 |
| 스키마 | **zod** | 도구 입력 검증 + 번들 데이터 검증을 한 도구로 |
| 테스트 | **vitest** | 규칙 골든 테스트 + InMemory transport 계약 테스트 |
| 빌드/개발 | tsc(ESM) / tsx watch | 런타임 의존성은 SDK+zod 2개로 유지(공급망 최소화) |
| 디버깅 | MCP Inspector | 마일스톤·릴리스 수동 점검 |
| transport | stdio 우선 | 로컬 1차 시나리오. Streamable HTTP는 백로그 (ADR-05) |
| 한국어 처리 | 휴리스틱 + 사전 매칭 | 형태소 분석기는 v0.1 제외, 도입 조건 정의됨 (ADR-04) |
| 배포 | npm/npx → MCPB(Desktop Extension) | 상세: [05-release-plan.md](05-release-plan.md) |

## 준비사항 체크리스트 (구현 착수 전)

**개발 환경**
- [ ] Node.js 22 LTS 이상 설치 (`node -v`)
- [ ] 테스트 클라이언트: Claude Desktop 또는 Claude Code
- [ ] npm 패키지 이름 `easyread-mcp` 사용 가능 여부 확인 (M3 전까지)

**도메인 데이터 (이 프로젝트의 진짜 준비물)**
- [ ] 쉬운 정보 지침 원천 자료 수집·최신판 확인:
  - 보건복지부·한국지적발달장애인복지협회 「발달장애인을 위한 쉬운 정보 만들기」 지침
  - 소소한소통 쉬운 정보 가이드·사례
  - 국립국어원 쉬운 언어(공공언어 개선) 자료
  - (참고) Inclusion Europe "Information for All"
- [ ] 저작권 검토 — 원문 전재 금지, **자체 요약·재구성**만 번들 (NFR-04)
- [ ] 어려운 단어→쉬운 단어 **사전 시드 100건 이상** 구축 (스키마: [02-architecture.md](02-architecture.md) §4)
- [ ] 지침 데이터가 `easyread-domain` 스킬 references와 어긋나면 스킬을 갱신 (단일 소스 유지)

**협력 (병행 진행)**
- [ ] 파일럿·당사자 감수 협력 기관 접촉 (M2 완료 전 시작 — 리스크 R-04)

## 로드맵 요약

| 마일스톤 | 목표 상태 | 상세 |
|---|---|---|
| **M1 — 걷는 뼈대** | Inspector에서 `validate_easy_read`(문장 규칙군) 동작 확인 | WBS T-01~05 |
| **M2 — 기능 완성** | 도구 4종·프롬프트 2종·리소스 3종 + 전 규칙군 + 사전 시드, 성능 통과 | T-06~11 |
| **M3 — 공개 배포** | npm 공개, npx 설치 검증, 설치 5분 지표 통과 | T-12 |
| 이후 | 파일럿(실문서 10건·감수 연계), MCPB 번들, 형태소 분석기 검토 | T-13, 백로그 |

## 파트별 계획 문서

| 문서 | 역할(Skill) | 핵심 내용 |
|---|---|---|
| [01-requirements.md](01-requirements.md) | PM (`/pm`) | 페르소나·시나리오, FR-01~11(MoSCoW)·NFR-01~05, 성공 지표 |
| [02-architecture.md](02-architecture.md) | PL (`/pl`) | ADR 6건, **MCP 인터페이스 명세(계약)**, 데이터 모델, WBS·마일스톤 |
| [03-backend-plan.md](03-backend-plan.md) | Backend (`/backend`) | 프로젝트 구조, 규칙 엔진 설계(규칙=순수함수), 오류·로깅 규약 |
| [04-qa-plan.md](04-qa-plan.md) | QA (`/qa`) | 규칙별 골든 테스트 규약, 계약 테스트, 품질 게이트 4종 |
| [05-release-plan.md](05-release-plan.md) | DevOps (`/devops`) | npm/MCPB 채널, semver 기준, CI·릴리스 체크리스트 |

**문서 간 규약**: 검증 규칙의 단일 소스는 [validation-checklist.md](../../.claude/skills/easyread-domain/references/validation-checklist.md)(규칙 ID 체계)이며, 인터페이스 변경은 02 → 03/04 순서로 전파한다. 각 역할 스킬은 `.claude/skills/`에 있고 다음 세션부터 `/pm` 등으로 호출해 해당 문서를 갱신할 수 있다.

## 변경 이력

| 날짜 | 변경 | 작성 |
|---|---|---|
| 2026-08-09 | 최초 작성 (계획 수립 세션) | 총괄 |
