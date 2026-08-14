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
- 🟡 **크로스플랫폼 매트릭스(Node 22/24 × ubuntu·windows, NFR-05)**: 별도 워크플로 `cross-platform.yml`로 **선작성 완료**(ci.yml 무변경 — 필수 체크 `check`는 그대로 보존, additive 공존). 새 체크(`cross-platform (windows-latest, 24)` 등 4개)는 비필수 상태로 실행된다. **활성화(관리자 시점)**: 브랜치 보호 required 목록에 이 4개 체크를 추가하고 필요 시 기존 `check`를 대체한다.
- ⏳ npm 이름(`easyread-mcp`) 선점 확인·게시 인증 등록은 첫 publish 전 관리자 최초 1회 셋업(§5.1) 항목으로 유지.

## 5. 릴리스 절차 (사람 체크리스트)

### 5.1 최초 1회 셋업 — 게시 인증·이름 선점 (관리자, 코드 밖)

첫 `v0.1.0` 태그 전에 **계정 소유자(관리자)**가 한 번 수행한다. npm 계정 자격증명을 다루는 단계라 **코드·에이전트가 대신할 수 없다** — 자격증명(비밀번호·토큰)은 관리자만 취급한다. 이 절차의 실행이 곧 Task #2다.

**(1) npm 이름 선점 확인 — `easyread-mcp`**

- `npm view easyread-mcp` → `404 Not Found`면 이름이 비어 있음(사용 가능). 패키지 정보가 나오면 이미 선점된 것 → 스코프 이름 `@<org>/easyread-mcp`로 전환하고 `package.json` name·`docs/install/*`·README를 함께 갱신한다.
- 이름은 **첫 publish가 성공하는 순간 확정**된다(태그 push → `release.yml` → `npm publish`). 별도의 수동 선점 절차는 필요 없다. 굳이 미리 자리를 맡으려면 로컬 인증 상태에서 1회 `npm publish`도 가능하나 불필요하다.

**(2) 게시 인증 — 아래 A 또는 B 중 하나**

`release.yml`은 이미 `permissions: id-token: write`(provenance 서명용)와 `registry-url`을 갖췄고, publish 스텝은 `NODE_AUTH_TOKEN=${{ secrets.NPM_TOKEN }}`를 소비한다.

- **A. `NPM_TOKEN` 시크릿 — 첫 릴리스 권장(코드 변경 0)**
  1. [npmjs.com](https://www.npmjs.com) 로그인(관리자 계정, 없으면 생성) → 우상단 아바타 → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
  2. 권한: **Packages and scopes = Read and write**, 만료일 지정(예: 90일), (선택)IP 허용범위. 신규 패키지라 아직 `easyread-mcp`를 특정할 수 없으면 계정 전체 write로 발급 → 첫 publish 후 패키지 한정으로 좁혀 재발급.
  3. 표시된 토큰 문자열 복사(**한 번만 보임**).
  4. GitHub 리포 → **Settings → Secrets and variables → Actions → New repository secret** → Name `NPM_TOKEN`, Secret에 붙여넣기.
  5. 이후 `v0.1.0` 태그 push → `release.yml`이 이 토큰으로 인증하고 `--provenance`로 서명까지 수행한다(서명은 토큰과 무관하게 `id-token`으로 동작).
  - 트레이드오프: 장기 토큰이 저장되므로 **만료·회전 관리가 필요**하다. 안정화 후 B로 이전 권장.

- **B. Trusted Publisher(OIDC) — 토큰 없는 하드닝(v0.1.0 이후 권장)**
  1. npmjs.com 패키지 페이지(첫 publish로 생성됨) → **Settings → Trusted Publisher** → GitHub Actions → Organization/Repository = `SWJoong/EASYREAD`, Workflow = `release.yml`, (선택)Environment.
  2. **코드 선행 필요(U 레인)**: OIDC 신뢰 게시는 최신 npm(**11.5.1+**)을 요구하나 Node 22 기본 npm은 10.x다. `release.yml`의 publish 앞에 `npm i -g npm@latest` 스텝을 추가해야 한다(별도 PR).
  3. 설정 후에는 `NPM_TOKEN`·`NODE_AUTH_TOKEN` 없이 publish 가능하다(해당 env 라인 제거).
  - 저장 토큰 0 → 유출 위험 0. 가장 안전한 최종형.

> **요약**: **v0.1.0은 A(`NPM_TOKEN`)로 최단** — 관리자가 시크릿 1개만 추가하면 코드 변경 없이 provenance 게시가 된다. 안정화 후 **B(OIDC)로 이전**해 저장 토큰을 없앤다.

### 5.2 매 릴리스 체크리스트

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
