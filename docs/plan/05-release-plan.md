# 05. 배포·릴리스 계획 (DevOps)

> 작성 기준: `.claude/skills/devops` 워크플로 · 입력: [02-architecture.md](02-architecture.md) §5·§7, [04-qa-plan.md](04-qa-plan.md) §7 품질 게이트

## 1. 배포 채널 전략

사용자가 서버를 얻는 경로 순서와 근거:

| 순서 | 채널 | 사용자 경험 | 시점 |
|---|---|---|---|
| 1차 | **npm + npx** | 클라이언트 설정에 `npx -y <패키지명>` 한 줄 등록 | M3 |
| 2차 | **MCPB 번들 (Claude Desktop Extension)** | 파일 클릭 한 번으로 설치 — 비개발자(김주무관 페르소나)의 주 경로 | M3 이후 첫 번들 릴리스 |
| 확장 | Streamable HTTP 원격 서버 | 기관 공유 서버 | 백로그(ADR-05) — 수요 확인 후 |

패키지 이름: 1순위 `easyread-mcp`, 충돌 시 스코프 `@<org>/easyread-mcp`. **M3 착수 전에 npm 이름 선점 확인**(체크리스트 항목).

## 2. 패키지 설계

```jsonc
// package.json 핵심 필드
{
  "name": "easyread-mcp",
  "type": "module",
  "bin": { "easyread-mcp": "dist/index.js" },   // shebang 포함 산출물
  "files": ["dist", "assets", "README.md", "LICENSE"],
  "engines": { "node": ">=22" },
  "publishConfig": { "access": "public", "provenance": true }
}
```

- 빌드: `tsc`로 ESM 산출(`dist/`). 번들러(tsup)는 의존성 2개뿐이라 불필요 — 산출물 크기 문제가 생기면 도입.
- `assets/`는 dist 밖 원본 그대로 포함, 경로 해석은 `import.meta.url` 기준(03 §5와 일치).
- LICENSE: MIT + 데이터 출처 고지(NFR-04)를 README와 NOTICE 절에 기재.

## 3. 버전 전략 (semver)

무엇이 breaking인가를 이 프로젝트 기준으로 정의한다:

| 변경 | 버전 |
|---|---|
| 도구/프롬프트/리소스 **이름·입력 스키마·structuredContent 필드 제거·의미 변경** | **major** |
| 규칙 추가, 출력 필드 추가, 새 도구 추가, 기본 임계값 변경 | **minor** (임계값 변경은 릴리스 노트에 강조 — 사용자 판정이 달라짐) |
| 사전 데이터만 갱신(항목 추가·수정), 버그 수정, 메시지 문구 개선 | **patch** |

- `assets/dictionary.json`의 `version` 필드는 패키지 버전과 함께 올린다(데이터-코드 짝 추적).
- v0.x 동안은 minor가 breaking 가능함을 README에 명시(semver 관례).

## 4. CI 파이프라인 (GitHub Actions)

**PR 검증 잡 `ci.yml`** — 트리거: PR, main push:

| 단계 | 명령 | 실패 시 |
|---|---|---|
| 셋업 | Node 22/24 매트릭스 × ubuntu·windows (NFR-05) | 머지 차단 |
| 린트 | `eslint .` (no-console 규칙 포함) | 머지 차단 |
| 타입 | `tsc --noEmit` | 머지 차단 |
| 테스트 | `vitest run` (골든+계약+성능) | 머지 차단 |
| 데이터 검증 | `node scripts/validate-assets.mjs` (zod 스키마로 assets 검사) | 머지 차단 |

**릴리스 잡 `release.yml`** — 트리거: `v*` 태그 push:

| 단계 | 내용 | 실패 시 |
|---|---|---|
| 게이트 재실행 | ci.yml 전 단계 | 중단 |
| 태그-버전 일치 검사 | 태그 `vX.Y.Z` == package.json version | 중단 |
| 배포 | `npm publish --provenance --access public` (OIDC 신뢰 게시 우선, 불가 시 granular 토큰을 시크릿으로) | 중단 |
| 설치 스모크 | 깨끗한 러너에서 `npx -y easyread-mcp@X.Y.Z` 기동 → initialize 응답 확인 스크립트 | 중단(배포됨 상태이므로 결함 등록 + 즉시 patch) |
| 릴리스 노트 | GitHub Release 생성(변경 요약, 임계값 변경 강조) | 수동 보완 |

**구현 현황 (2026-08-14, T-12)**

- ✅ `ci.yml`: 기존 `check` 잡(ubuntu, Node 22)에 **데이터 검증 스텝**(`node scripts/validate-assets.mjs`, 런타임 로더 재사용) 추가. 잡 이름은 유지 — 브랜치 보호 required-check를 깨지 않기 위함.
- ✅ `release.yml`: 위 릴리스 잡을 구현(게이트 재실행 → 태그-버전 일치 → `npm publish --provenance --access public` → npx initialize 스모크 → GitHub Release). 첫 실행 전 준비: npm **Trusted Publisher**(OIDC) 또는 `NPM_TOKEN` 시크릿 등록.
- ⏳ **크로스플랫폼 매트릭스(Node 22/24 × ubuntu·windows, NFR-05)**: required-check 이름이 바뀌어(`check` → `check (os, node)`) 브랜치 보호 설정 갱신이 함께 필요하므로 **후속**으로 분리. 별도 잡으로 추가하고 관리자가 required 목록을 갱신하는 시점에 활성화한다.
- ⏳ npm 이름(`easyread-mcp`) 선점 확인은 첫 publish 전 체크리스트(§5) 항목으로 유지.

## 5. 릴리스 절차 (사람 체크리스트)

1. [ ] QA 게이트 4종(04 §7) 통과 확인 — 릴리스 PR에 Inspector 점검 기록 첨부
2. [ ] 버전 결정(§3 표 기준) — 임계값·스키마 변경 여부 diff로 재확인
3. [ ] `assets/dictionary.json` version·updatedAt 갱신, `scripts/validate-assets` 통과
4. [ ] CHANGELOG 갱신 → 버전 커밋 → `vX.Y.Z` 태그 push (버전-태그 불일치는 CI가 차단)
5. [ ] release.yml 성공 확인 → 로컬에서도 `npx -y easyread-mcp@latest` 스모크
6. [ ] Claude Desktop 실물 설정으로 S1 시나리오 1회(04 §6-B 축약판)
7. [ ] 설치 가이드의 버전 표기·스크린샷 갱신 필요 여부 확인

## 6. 설치 가이드 계획

이 프로젝트의 정신대로 **설치 문서 자체를 쉬운 문장으로** 쓴다(짧은 문장, 단계 번호, 한 단계 한 행동). 산출물: `docs/install/` 아래 클라이언트별 가이드.

| 문서 | 내용 |
|---|---|
| `claude-desktop.md` | 설정 파일 위치(OS별) → JSON에 추가할 블록(복사용) → 재시작 → 확인 방법(도구 아이콘). 그림 포함 계획 |
| `claude-code.md` | `claude mcp add easyread -- npx -y easyread-mcp` 한 줄 + 확인 방법 |
| 공통 | 문제 해결 3항목(Node 버전, 방화벽 오해 — 네트워크 불필요 명시, 로그 보는 법) |

설정 예시(가이드에 들어갈 내용):

```json
{ "mcpServers": { "easyread": { "command": "npx", "args": ["-y", "easyread-mcp"] } } }
```

**구현 현황 (2026-08-14, T-12)**: `docs/install/claude-desktop.md`·`docs/install/claude-code.md`를 쉬운 문장(짧은 문장·단계 번호)으로 작성했고, README에 설치·사용 섹션과 위 설정 블록을 추가했다. 그림·스크린샷은 첫 릴리스 후 보완(백로그).

## 7. 운영·모니터링

- **이슈 트리아지**: GitHub Issues 템플릿 2종 — `오탐/미탐 신고`(예문·기대·실제, 04 §8 골든셋 편입 절차와 연결), `설치 문제`. S1(사실 왜곡) 라벨은 핫픽스 트랙.
- **사전 데이터 갱신 릴리스**: 분기 1회 정기 patch를 기본 리듬으로, 파일럿 피드백 편입. 데이터 PR은 `validate-assets` + 출처 필드 필수를 CI로 강제.
- **의존성/보안**: Dependabot(주간), `npm audit` CI 경고. 런타임 의존 2개 원칙(03 §2) 덕에 공급망 표면이 작음을 유지하는 것이 핵심 통제.
- 텔레메트리는 **수집하지 않는다**(NFR-03). 사용 현황은 npm 다운로드 수와 이슈로만 파악.

## 8. 변경 이력

| 날짜 | 변경 | 작성 |
|---|---|---|
| 2026-08-09 | 최초 작성 | DevOps (devops 스킬) |
| 2026-08-14 | T-12 구현 반영 — `release.yml`(publish 파이프라인)·`ci.yml` 데이터 검증 스텝·`scripts/validate-assets.mjs`·`LICENSE`(MIT+데이터 출처 고지)·`docs/install/*`·README 설치 섹션. 크로스플랫폼 매트릭스는 브랜치 보호 의존으로 후속, MCPB는 계획대로 M3 이후. | DevOps (devops 스킬) |
