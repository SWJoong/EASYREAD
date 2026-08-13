# EASYREAD — 쉬운 정보(Easy-Read) MCP 서버

발달장애인·저문해력 사용자를 위해 복잡한 한국어 텍스트를 **쉬운 정보(Easy-Read)** 로 바꾸는 일을 돕는 MCP(Model Context Protocol) 서버 프로젝트입니다.

- 서버는 **지침·사전·검증 도구**를 제공하고, 실제 문장 변환은 클라이언트 LLM(Claude 등)이 수행합니다.
- 기술 스택: TypeScript + `@modelcontextprotocol/sdk` (Node.js 22 LTS+)

## 설치하기

Node.js 22 이상이 필요합니다. 인터넷은 설치할 때만 필요하고, 검사할 때는 필요 없습니다.

- **Claude Desktop**: [docs/install/claude-desktop.md](docs/install/claude-desktop.md) — 설정 파일에 아래 블록을 넣고 앱을 다시 시작합니다.
- **Claude Code**: [docs/install/claude-code.md](docs/install/claude-code.md) — `claude mcp add easyread -- npx -y easyread-mcp` 한 줄.

```json
{ "mcpServers": { "easyread": { "command": "npx", "args": ["-y", "easyread-mcp"] } } }
```

## 이 서버가 제공하는 것

- **도구 4종**: `validate_easy_read`(규칙 검증), `analyze_readability`(가독성 지표), `lookup_easy_word`(쉬운 낱말 찾기), `get_guidelines`(작성 지침).
- **프롬프트 2종**: `simplify-text`(쉬운 정보로 바꾸기), `easy-read-review`(초안 검토).
- **리소스**: `easyread://guidelines`·`.../checklist`·`easyread://dictionary`·`easyread://resources`.
- **검증 규칙 25종**(SEN·VOC·NUM·STR·TYP·ACC). 모두 오프라인·결정적으로 동작합니다.

## 문서

구현 계획은 [docs/plan/](docs/plan/) 아래에 파트별로 정리되어 있습니다.

| 문서 | 담당 역할 |
|---|---|
| [00-overview.md](docs/plan/00-overview.md) | 총괄 — 기술 스택, 준비사항, 로드맵 |
| [01-requirements.md](docs/plan/01-requirements.md) | PM — 요구사항, 사용자 시나리오 |
| [02-architecture.md](docs/plan/02-architecture.md) | PL — 아키텍처, 인터페이스 명세, WBS |
| [03-backend-plan.md](docs/plan/03-backend-plan.md) | Backend — 구현 계획, 컨벤션 |
| [04-qa-plan.md](docs/plan/04-qa-plan.md) | QA — 테스트 전략 |
| [05-release-plan.md](docs/plan/05-release-plan.md) | DevOps — 배포/릴리스 |

## 역할별 Skill

`.claude/skills/` 아래에 역할별 스킬이 있습니다. Claude Code에서 `/pm`, `/pl`, `/backend`, `/qa`, `/devops` 로 호출해 각 파트의 계획을 작성·갱신할 수 있으며, `easyread-domain` 스킬이 쉬운 정보 작성 지침 도메인 지식을 제공합니다.
