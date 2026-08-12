# 06. 하네스 엔지니어링 운영 계획서

> 두 개의 Claude Code 인스턴스를 병렬 운영하여 EASYREAD M2 마일스톤을 완성한다.

---

## 1. 배경

| 항목 | 내용 |
|------|------|
| 현재 상태 | M1 완료 (T-01~T-06), 76개 테스트 통과 |
| 목표 | M2 기능 완성 (도구 4종, 프롬프트 2종, 리소스 3종, 전 규칙군) |
| 남은 작업 | T-07 ~ T-11+ (VOC/NUM/STR/TYP/ACC 규칙, analyze/lookup/guidelines 도구, 프롬프트, 리소스) |

### 인스턴스 구성

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  Instance-W (Windows)       │     │  Instance-U (Ubuntu)        │
│  개인 Claude 계정            │     │  팀 Claude 계정              │
│  역할: PL / QA              │     │  역할: Backend / DevOps      │
│  브랜치: feat/* 작업         │     │  브랜치: feat/* 작업          │
│                             │     │                             │
│  "설계 → 검증" 축            │     │  "구현 → 배포" 축             │
└──────────────┬──────────────┘     └──────────────┬──────────────┘
               │                                   │
               └───────── GitHub (main) ───────────┘
                     SWJoong/EASYREAD
```

---

## 2. 역할 분담

### Instance-W (Windows / 개인 계정) — "설계·검증 축"

| 역할 | 담당 작업 | 스킬 |
|------|----------|------|
| PL | 아키텍처 결정, 인터페이스 명세 갱신, ADR 추가 | `/pl` |
| QA | 골든 테스트 작성, 계약 테스트, 품질 게이트 점검 | `/qa` |
| PM | 요구사항 변경 시 01-requirements.md 갱신 | `/pm` |

**핵심 산출물:**
- 규칙 골든 테스트 (`tests/rules/voc-*.test.ts`, `num-*.test.ts` 등)
- 도구 계약 테스트 (`tests/tools/analyze.test.ts`, `lookup.test.ts`, `guidelines.test.ts`)
- 아키텍처 문서 갱신 (`docs/plan/02-architecture.md`)

### Instance-U (Ubuntu / 팀 계정) — "구현·배포 축"

| 역할 | 담당 작업 | 스킬 |
|------|----------|------|
| Backend | 규칙 구현, 도구 핸들러, 데이터 로더 | `/backend` |
| DevOps | CI 파이프라인, npm 배포 준비, 스크립트 | `/devops` |

**핵심 산출물:**
- 규칙 구현 (`src/rules/voc/`, `src/rules/num/` 등)
- 도구 핸들러 (`src/tools/analyze.ts`, `src/tools/lookup.ts`, `src/tools/guidelines.ts`)
- 프롬프트·리소스 (`src/prompts/`, `src/resources/`)
- CI 워크플로우 (`.github/workflows/`)

---

## 3. Git 워크플로우

### 3.1 브랜치 전략

```
main ─────────────────────────────────────────────► (항상 그린)
  │
  ├── feat/t07-voc-rules ──── Instance-U 구현 ──► PR → main
  │     │
  │     └── test/t07-voc-golden ── Instance-W 테스트 ──► PR → feat/t07
  │
  ├── feat/t08-tools ──── Instance-U 구현 ──► PR → main
  │     │
  │     └── test/t08-tool-contracts ── Instance-W 테스트 ──► PR → feat/t08
  │
  └── ...
```

### 3.2 동기화 프로토콜

```
1. Instance-U가 feat/ 브랜치 생성 → 구현 → push
2. Instance-W가 해당 브랜치 pull → 테스트 작성 → push (또는 test/ 서브브랜치)
3. 테스트 통과 확인 후 main에 merge
4. 양쪽 모두 main pull → 다음 태스크
```

**충돌 방지 원칙:**
- `src/` 파일은 Instance-U만 수정
- `tests/` 파일은 Instance-W가 우선 (Instance-U는 구현 중 최소한의 스모크 테스트만)
- `docs/` 문서는 역할에 따라 분리 (PL→02, QA→04, Backend→03, DevOps→05)
- 공유 파일(`server.ts`, `registry.ts`, `messages.ts`) 수정은 Instance-U가 담당, Instance-W는 리뷰

---

## 4. 태스크별 실행 계획

### Phase 1: 규칙 확장 (T-07 ~ T-09)

#### T-07: VOC 규칙군

| 순서 | 인스턴스 | 작업 | 브랜치 |
|------|---------|------|--------|
| 1 | **U** | `src/rules/voc/` VOC-01~06 구현, registry 등록 | `feat/t07-voc-rules` |
| 2 | **W** | VOC-01~06 골든 테스트 작성 (위반/정상/경계 3종+) | `test/t07-voc-golden` |
| 3 | **U** | 테스트 실패 시 구현 수정 | `feat/t07-voc-rules` |
| 4 | 합류 | PR → main merge | - |

#### T-08: NUM·STR·TYP 규칙군

| 순서 | 인스턴스 | 작업 | 브랜치 |
|------|---------|------|--------|
| 1 | **U** | NUM-01~04, STR-01~04, TYP-01~03 구현 | `feat/t08-num-str-typ` |
| 2 | **W** | 규칙별 골든 테스트 + 경계 케이스 | `test/t08-golden` |
| 3 | 합류 | 수정·확인 후 merge | - |

#### T-09: ACC 규칙군 (원문 필요)

| 순서 | 인스턴스 | 작업 | 브랜치 |
|------|---------|------|--------|
| 1 | **W** | ACC 규칙 명세 확정 (`text/extractors.ts` 인터페이스 정의) | `feat/t09-acc-spec` |
| 2 | **U** | `text/extractors.ts` 구현 + ACC-01~04 구현 | `feat/t09-acc-rules` |
| 3 | **W** | ACC 골든 테스트 (날짜/금액/고유명사/연락처 보존) | `test/t09-acc-golden` |
| 4 | 합류 | merge | - |

### Phase 2: 도구·프롬프트·리소스 (T-10 ~ T-11)

#### T-10: 나머지 도구 3종

| 순서 | 인스턴스 | 작업 |
|------|---------|------|
| 1 | **W** | 도구 계약 테스트 선작성 (TDD) — 입력/출력 스키마·오류 케이스 |
| 2 | **U** | `analyze_readability`, `lookup_easy_word`, `get_guidelines` 구현 |
| 3 | **U** | `server.ts`에 등록, 스모크 통과 |
| 4 | **W** | 계약 테스트 실행·확인 |

#### T-11: 프롬프트·리소스

| 순서 | 인스턴스 | 작업 |
|------|---------|------|
| 1 | **U** | `simplify-text`, `easy-read-review` 프롬프트 구현 |
| 2 | **U** | `easyread://guidelines`, `easyread://dictionary` 리소스 구현 |
| 3 | **W** | MCP Inspector 수동 점검 + 통합 테스트 |

### Phase 3: 마무리

| 작업 | 인스턴스 | 내용 |
|------|---------|------|
| 성능 테스트 | **W** | NFR-02 (10k자 1초) 검증 |
| CI 파이프라인 | **U** | `.github/workflows/ci.yml` 작성 |
| 품질 게이트 | **W** | QA 게이트 4종 전체 통과 확인 |
| 릴리스 준비 | **U** | CHANGELOG, 버전 태그, npm publish 준비 |

---

## 5. 커뮤니케이션 규약

### 5.1 핸드오프 커밋 메시지 컨벤션

태스크 인계 시 커밋 메시지에 상태를 명시한다:

```
[HANDOFF→W] T-07: VOC-01~06 구현 완료, 골든 테스트 필요
[HANDOFF→U] T-07: VOC 골든 테스트 작성 완료, 실패 2건 수정 필요
[SYNC] T-07: VOC 규칙 전건 통과, main merge 준비
```

### 5.2 CLAUDE.md 동기화 섹션

`CLAUDE.md` 파일 최하단에 **작업 현황 섹션**을 유지한다:

```markdown
## 현재 작업 현황

### 활성 태스크
- T-07 VOC 규칙: Instance-U 구현 중 (feat/t07-voc-rules)

### 완료 대기
- (없음)

### 다음 태스크
- T-08 NUM/STR/TYP 규칙
```

양쪽 인스턴스 모두 작업 시작/완료 시 이 섹션을 갱신하고 push한다.

### 5.3 충돌 발생 시

1. 충돌 파일이 `tests/`면 → Instance-W의 버전을 우선
2. 충돌 파일이 `src/`면 → Instance-U의 버전을 우선
3. 충돌 파일이 `docs/`면 → 해당 역할 담당 인스턴스의 버전을 우선
4. 판단 불가 → 사용자가 수동 해결

---

## 6. 각 인스턴스의 CLAUDE.md 설정

### Instance-W (Windows) — CLAUDE.md 추가 내용

```markdown
## 하네스 역할: PL / QA (설계·검증 축)

### 담당 범위
- tests/ 디렉토리의 테스트 작성·수정
- docs/plan/02-architecture.md, 04-qa-plan.md 갱신
- 코드 리뷰 (src/ 변경사항 확인)

### 금지 사항
- src/ 코드 직접 수정 (Instance-U 영역)
- server.ts, registry.ts, messages.ts 직접 수정
- main 브랜치에 직접 push (PR 경유)

### 작업 패턴
1. Instance-U의 feat/ 브랜치를 pull
2. 테스트 작성 → push
3. 실패 시 [HANDOFF→U] 커밋으로 인계
```

### Instance-U (Ubuntu) — CLAUDE.md 추가 내용

```markdown
## 하네스 역할: Backend / DevOps (구현·배포 축)

### 담당 범위
- src/ 디렉토리의 코드 구현
- assets/ 데이터 갱신
- .github/workflows/ CI 구성
- docs/plan/03-backend-plan.md, 05-release-plan.md 갱신

### 금지 사항
- tests/ 골든 테스트 작성 (Instance-W 영역, 스모크 테스트만 허용)
- docs/plan/02-architecture.md 명세 변경 (Instance-W에 요청)
- main 브랜치에 직접 push (PR 경유)

### 작업 패턴
1. feat/ 브랜치 생성 → 구현 → push
2. [HANDOFF→W] 커밋으로 테스트 요청
3. Instance-W 테스트 통과 후 merge
```

---

## 7. 실행 순서 요약

```
Phase 1 — 규칙 확장
───────────────────────────────────────────────
Week 1:  T-07 VOC    U:구현 → W:테스트 → merge
Week 1:  T-08 NUM등  U:구현 → W:테스트 → merge  (T-07과 병렬 가능)
Week 2:  T-09 ACC    W:명세 → U:구현 → W:테스트 → merge

Phase 2 — 도구·프롬프트
───────────────────────────────────────────────
Week 2:  T-10 도구   W:계약테스트 → U:구현 → 확인
Week 3:  T-11 프롬프트 U:구현 → W:Inspector 점검

Phase 3 — 마무리
───────────────────────────────────────────────
Week 3:  성능·CI·게이트 → M2 완성 선언
```

---

## 8. 성공 기준

- [ ] 전 규칙군 (SEN/VOC/NUM/STR/TYP/ACC) 구현 + 골든 테스트 통과
- [ ] 도구 4종 (`validate`, `analyze`, `lookup`, `guidelines`) MCP Inspector 동작
- [ ] 프롬프트 2종 (`simplify-text`, `easy-read-review`) 등록
- [ ] 리소스 3종 (`guidelines`, `checklist`, `dictionary`) 노출
- [ ] NFR-02 성능 통과 (10k자 < 1초)
- [ ] QA 품질 게이트 4종 전체 통과
- [ ] 두 인스턴스 간 충돌 없이 merge 완료

---

## 9. 자동 상태 동기화 — 복붙 제거 (agent-sync)

두 인스턴스가 다른 계정·기기(우분투 VSCode 확장 · 윈도우 네이티브)에서 돌기 때문에 공식 크로스세션 메시징(macOS·Linux 한정, 네이티브 윈도우 미지원)을 그대로 쓰기 어렵다. 대신 **이미 공유 중인 GitHub 저장소**를 채널로 삼아 사람의 복붙을 없앤다.

### 9.1 하네스 관점 (피드포워드 · 피드백)

| 방향 | 우리 프로젝트의 구현 | 성격 |
|------|--------------------|------|
| **피드포워드(가이드)** | `CLAUDE.md` · `docs/plan/*` · `.claude/skills/*` | 행동 이전에 방향 고정 |
| **피드백(계산적 센서)** | CI `lint·typecheck·build·test` · 골든 테스트 | 결정적·빠름 → **매 PR** |
| **피드백(추론적 센서)** | W의 코드 리뷰(LLM 기반) | 느리고 비결정적 → **병합 전** |

우리의 **W(설계·검증) / U(구현·배포) 분리**는 "계획–실행–검증을 서로 다른 세션에 두라"는 원칙 그 자체다 — 자기 결과를 자기가 채점하지 않게 한다.

### 9.2 agent-sync 채널

- 전용 `agent-sync` 브랜치(orphan)에 `w.md`·`u.md` 상태 로그만 둔다. **코드는 담지 않고 main에 병합하지 않는다.** main은 브랜치 보호가 걸려 있으므로 잦은 상태 핑을 별도 채널로 분리한다.
- 도구: `scripts/agent-sync.sh {pull | post <w|u> "메시지" | log [w|u]}`. 임시 worktree로 이 브랜치만 갱신해 작업 중인 브랜치를 건드리지 않는다.

### 9.3 흐름 (복붙 0회)

```
세션 시작/재개 ─▶ agent-sync.sh pull   (SessionStart 훅이 자동 → 상대 최신 상태를 컨텍스트에 로드)
   작업 …
핸드오프/턴 종료 ─▶ agent-sync.sh post <내 역할> "진행·문제·다음 요청"
```

코드 핸드오프는 여전히 **PR·CI 경유**(§3). agent-sync는 "무엇을 했고 다음에 뭘 해달라"는 **대화만** 나른다. 사람이 할 일은 "다음 작업 시작해줘" 트리거뿐 — 메시지 복붙은 사라진다.

### 9.4 기기별 훅 설정

공유 `.claude/settings.json`에 SessionStart 훅(`agent-sync.sh pull`)을 커밋해 양쪽이 자동으로 상대 상태를 받는다.
- 훅 미지원 환경(일부 확장)에서는 **CLAUDE.md 규칙**에 따라 에이전트가 `pull`/`post`를 직접 호출한다 → 훅은 자동화 보강일 뿐, 1차 메커니즘은 CLAUDE.md 규칙(피드포워드).
- (선택) 완전 자동화를 원하면 Stop 훅에 `post`를 걸 수 있으나, 메시지 내용 통제를 위해 기본은 **에이전트가 명시적으로 post**한다.

### 9.5 실시간이 필요해지면 (백로그)

git 폴링으로 부족하면 `agent-comms`(TCP 메시) 등 MCP 실시간 채널을 Tailscale/ngrok 터널로 확장 검토. 설정 부담이 크므로 **git 방식으로 시작**하고 실시간성이 정말 필요할 때 확장한다.

---

## 부록: 빠른 시작 체크리스트

### Instance-U (Ubuntu, 이 머신) 초기 설정

```bash
# 1. 저장소 clone (완료)
cd /home/choi/문서/EASYREAD

# 2. 의존성 설치
npm install

# 3. 빌드·테스트 확인
npm run build && npm test

# 4. CLAUDE.md에 하네스 역할 섹션 추가
# (위 6절 Instance-U 내용)
```

### Instance-W (Windows) 초기 설정

```bash
# 1. 저장소 clone
git clone https://github.com/SWJoong/EASYREAD.git
cd EASYREAD

# 2. 의존성 설치
npm install

# 3. CLAUDE.md에 하네스 역할 섹션 추가
# (위 6절 Instance-W 내용)

# 4. 본 계획서(06-harness-engineering.md) 확인
```
