# EASYREAD — 쉬운 정보(Easy-Read) MCP 서버

[![npm](https://img.shields.io/npm/v/easyread-mcp)](https://www.npmjs.com/package/easyread-mcp)
[![CI](https://github.com/SWJoong/EASYREAD/actions/workflows/ci.yml/badge.svg)](https://github.com/SWJoong/EASYREAD/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](#설치하기)

발달장애인·저문해력 사용자를 위해 복잡한 한국어 텍스트를 **쉬운 정보(Easy-Read)** 로 바꾸는 일을 돕는 MCP(Model Context Protocol) 서버입니다.

- 서버는 **지침·사전·검증 도구**를 제공하고, 실제 문장 변환은 클라이언트 LLM(Claude 등)이 수행합니다.
- 모든 검증은 **오프라인·결정적**으로 동작하며, 입력을 저장하거나 기록하지 않습니다.
- 기술 스택: TypeScript + `@modelcontextprotocol/sdk` (Node.js 22 LTS+), 런타임 의존성 2개.

> ⚠️ **이 도구의 결과는 감수를 거치지 않은 초안입니다.** 도구는 감수를 대신하지 않습니다.
> 최종본은 반드시 **발달장애인 당사자의 확인·감수**를 거쳐 정합니다.

## 설치하기

Node.js 22 이상이 필요합니다. 인터넷은 **설치할 때만** 필요하고, 검사할 때는 필요 없습니다.

**Claude Code** — 터미널에 한 줄:

```bash
claude mcp add easyread -- npx -y easyread-mcp
```

**Claude Desktop** — 설정 파일에 아래 블록을 넣고 앱을 다시 시작합니다:

```json
{ "mcpServers": { "easyread": { "command": "npx", "args": ["-y", "easyread-mcp"] } } }
```

자세한 순서: [Claude Desktop 설치](docs/install/claude-desktop.md) · [Claude Code 설치](docs/install/claude-code.md)

**처음이라면 → [처음 사용해보기(따라하기)](docs/install/first-use.md)** — 예시 문장으로 한 번 연습해 봅니다.

## 써보기

1. 어려운 글을 한 토막 준비합니다.
2. `simplify-text` 프롬프트로 **쉬운 정보 초안**을 만듭니다.
3. `validate_easy_read`로 초안을 **원문과 함께** 검사합니다 — 규칙 위반과 함께, 날짜·금액·기관명이 바뀌지 않았는지(정확성 ACC)를 확인합니다.
4. `error`가 없어질 때까지 고치고, 마지막에 **당사자 감수**를 받습니다.

## 제공 기능

- **도구 4종**: `validate_easy_read`(규칙 검증·원문 대조), `analyze_readability`(가독성 지표), `lookup_easy_word`(쉬운 낱말 찾기), `get_guidelines`(작성 지침).
- **프롬프트 2종**: `simplify-text`(쉬운 정보로 바꾸기), `easy-read-review`(초안 검토).
- **리소스 4종**: `easyread://guidelines` · `.../checklist` · `easyread://dictionary` · `easyread://resources`.
- **검증 규칙 25종**: 문장(SEN)·어휘(VOC)·숫자(NUM)·구성(STR)·표기(TYP)·정확성(ACC).
- **번들 데이터**: 쉬운 낱말 사전과 Easy-Read 근거·표준·사례 카탈로그 66건(각 항목에 출처·라이선스 분류 보존).

## 보안·프라이버시

오프라인 동작(네트워크 미호출), 입력 무저장·무로깅, 입력 크기 상한. 자세한 내용은 [SECURITY.md](SECURITY.md)를 참고하세요. 버전별 변경 내역은 [CHANGELOG.md](CHANGELOG.md)에 있습니다.

## 개발·기여

구현 계획은 [docs/plan/](docs/plan/) 아래 파트별로 정리되어 있습니다.

| 문서 | 담당 역할 |
|---|---|
| [00-overview.md](docs/plan/00-overview.md) | 총괄 — 기술 스택, 준비사항, 로드맵 |
| [01-requirements.md](docs/plan/01-requirements.md) | PM — 요구사항, 사용자 시나리오 |
| [02-architecture.md](docs/plan/02-architecture.md) | PL — 아키텍처, 인터페이스 명세, WBS |
| [03-backend-plan.md](docs/plan/03-backend-plan.md) | Backend — 구현 계획, 컨벤션 |
| [04-qa-plan.md](docs/plan/04-qa-plan.md) | QA — 테스트 전략 |
| [05-release-plan.md](docs/plan/05-release-plan.md) | DevOps — 배포/릴리스 |

`.claude/skills/` 아래 역할별 스킬(`/pm`·`/pl`·`/backend`·`/qa`·`/devops`)로 각 파트 계획을 작성·갱신할 수 있고, `easyread-domain` 스킬이 쉬운 정보 작성 도메인 지식을 제공합니다.

빌드·테스트:

```bash
npm ci && npm run build && npm test
```

버그·오탐/미탐 신고는 [이슈 템플릿](.github/ISSUE_TEMPLATE)으로 받습니다.

## 라이선스

[MIT](LICENSE). 번들 데이터의 출처·이용조건 고지는 LICENSE의 데이터 고지(NFR-04)와 `assets/resources.json`의 `license` 필드를 참고하세요.
