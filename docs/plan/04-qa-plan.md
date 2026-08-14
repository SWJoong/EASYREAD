# 04. QA 계획 (QA)

> 작성 기준: `.claude/skills/qa` 워크플로 · 입력: [01-requirements.md](01-requirements.md) FR 수용 기준, [02-architecture.md](02-architecture.md) §3 계약, [validation-checklist.md](../../.claude/skills/easyread-domain/references/validation-checklist.md)

## 1. 테스트 전략 개요

품질의 축은 두 개이고 분리해서 다룬다.

1. **규칙 엔진 정확성** — 규칙 ID별로 "잡아야 할 것을 잡고, 잡지 말아야 할 것을 안 잡는가". 순수 함수이므로 **골든 테스트로 전부 자동화**한다. 여기가 이 제품 신뢰의 근원이다.
2. **MCP 계약 준수** — 02 §3 명세대로 도구가 응답하는가. SDK InMemory transport 통합 테스트로 자동화한다.

자동화하지 않는 것: LLM 변환 품질(프롬프트의 효과), 실제 클라이언트 UX. 이는 §6 수동 점검 절차로 반복 가능하게 만든다. 이유: LLM 출력은 비결정적이라 CI 단정에 넣으면 플레이키 테스트가 되고, 신뢰를 잃은 CI는 없느니만 못하다.

## 2. 테스트 레벨

| 레벨 | 대상 | 도구 | 실행 시점 |
|---|---|---|---|
| 단위 | `text/` 유틸, 규칙 함수(rules/**), 프롬프트 조립 함수 | vitest | 매 커밋(CI) |
| 통합 | 도구 4종 계약(입력→structuredContent), 리소스·프롬프트 등록 | vitest + SDK InMemory transport | 매 커밋(CI) |
| 성능 | NFR-02 (10,000자 validate 1초) | 시간 단정 테스트 | 매 커밋(CI, 1초 AC 단정 — CI 실측 ~65ms로 여유 큼) |
| 수동 | Inspector 점검, Claude Desktop 시나리오 S1~S3 | MCP Inspector, Claude Desktop | 마일스톤 종료 시·릴리스 전 |

### 2.1 구현 현황 (M2 완성·M3 준비 · 2026-08-14, 230 TC 전건 green)

계획 단계의 "대표 케이스"(§3·§4·§5)가 전 규칙·전 도구·프롬프트·리소스로 확장 구현되었다. 실제 테스트 현황:

| 영역 | 파일 | TC 접두 | 비고 |
|---|---|---|---|
| 규칙 골든 (25종) | `tests/rules/<규칙>.test.ts` | `TC-<규칙ID>-*` | SEN·VOC·NUM·STR·TYP·ACC. 위반/정상/경계 + 보조 규칙 오탐 방지 |
| registry 통합 | `tests/rules/registry.test.ts` | `TC-CORE-13~15` | 등록 규칙 ID 스냅샷·validate·excludeRules |
| 도구 계약 (4종) | `tests/tools/{validate,analyze,lookup,guidelines}.test.ts` | `TC-TOOL-{VALIDATE,ANALYZE,LOOKUP,GUIDELINES}-*` | SDK InMemory transport |
| 프롬프트 (2종) | `tests/prompts/{simplify,review}.test.ts` | `TC-PROMPT-{SIMPLIFY,REVIEW}-*` | FR-05 3요소 · FR-08 규칙 ID 인용 |
| 리소스 (FR-09) | `tests/resources/contract.test.ts` | `TC-RES-*` | guidelines·checklist·dictionary·resources MIME·내용 |
| 통합 E2E | `tests/integration/e2e.test.ts` | `TC-INT-*` | 조립 서버로 전 FR 교차 검증 |
| 성능 (NFR-02) | `tests/integration/nfr-perf.test.ts` | `TC-PERF-*` | 10,000자 검증 < 1초 |
| 자료 카탈로그 | `tests/data/resources.test.ts` | `TC-DATA-14-*` | 66건 필수필드·URL·유일성 |
| 릴리스 준비성 | `tests/release/{package,smoke}.test.ts` | `TC-REL-*`·`TC-SMOKE-*` | package.json 배포 계약(provenance `repository` 포함)·빌드 dist stdio 설치 스모크 |
| 프라이버시 (NFR-03) | `tests/privacy/nfr-03.test.ts` | `TC-PRIV-*` | 입력 본문 stderr 무로깅(빌드 dist stdio) |

품질 게이트(§7) 충족: 전건 통과 · `자동` 규칙 3종 케이스 보유 · NFR-02 통과 · NFR-03 무로깅 실증. (`TC-RES-05` mimeType 정합·`TC-REL-08` provenance `repository` 필드는 반영 완료.)

## 3. 규칙별 골든 테스트

### 규약 (전 규칙 공통)

- 규칙마다 최소 3종: **위반**(탐지해야 함) / **정상**(탐지하면 안 됨) / **경계**(임계값 직전·직후).
- `보조` 등급 규칙(SEN-02·03·05, VOC-03~06, STR-03, ACC-03)은 **정상(오탐 방지) 케이스를 위반 케이스보다 많게** 배치한다. 오탐 허용선: 골든셋 내 오탐 0건이 게이트이되, 골든셋 밖 실문서 파일럿에서 보조 규칙 오탐률 20% 초과 시 해당 규칙 심각도 하향 또는 비활성화를 결함으로 등록한다.
- 예문은 공공 안내문 문체로 자체 작성한다(실제 기관 문서 복사 금지 — 저작권).
- 케이스 ID: `TC-<규칙ID>-<번호>`, vitest 테스트 이름에 포함(추적성).

### 대표 케이스 (구현 시 전 규칙으로 확장, 여기 표는 형식의 기준)

| TC ID | 입력 요지 | 기대 |
|---|---|---|
| TC-SEN-01-01 | 16어절 한 문장 | SEN-01 error 1건, span이 해당 문장 전체 |
| TC-SEN-01-02 | 9어절 문장 3개 | SEN-01 위반 0건 |
| TC-SEN-01-03 | 정확히 10어절 / 11어절 문장 | 10어절: 0건, 11어절: warning (경계 검증) |
| TC-SEN-04-01 | "신청하지 않으면 받을 수 없습니다" | SEN-04 error |
| TC-SEN-04-02 | "신청하지 않아도 됩니다" (단일 부정) | SEN-04 위반 0건 |
| TC-VOC-01-01 | 사전 등재 한자어 "구비서류" 포함 문장 | VOC-01 warning + suggestion에 "필요한 서류" |
| TC-VOC-01-02 | 대체어로 이미 쓴 문장 "필요한 서류를 가져오세요" | VOC-01 위반 0건 |
| TC-VOC-03-01 | "임의가입 대상입니다" (풀이 없음) | VOC-03 warning |
| TC-VOC-03-02 | "임의가입이란 …라는 뜻입니다" 풀이 인접 | VOC-03 위반 0건 (오탐 방지) |
| TC-NUM-03-01 | "익일 개관합니다" | NUM-03 warning |
| TC-TYP-01-01 | "3월 2일~3월 31일" | TYP-01 warning + "부터/까지" 제안 |

## 4. 도구 계약 테스트

도구별 정상/경계/오류 3분류. ID: `TC-TOOL-<도구>-<번호>`.

| TC ID | 시나리오 | 기대 |
|---|---|---|
| TC-TOOL-VALIDATE-01 | S2 정상 검증 (위반 2건 예문) | verdict=needs-review, summary.byGroup 정확, notices에 감수 고지(FR-06) |
| TC-TOOL-VALIDATE-02 | 빈 문자열 | InvalidParams 오류, 한국어 안내 메시지 |
| TC-TOOL-VALIDATE-03 | 50,001자 | 한도 안내 오류 |
| TC-TOOL-VALIDATE-04 | `excludeRules: ["SEN-01"]` | SEN-01 미보고, 다른 규칙 정상 |
| TC-TOOL-ANALYZE-01 | 3문장 표본 | 02 §3.1 통계 필드 전부 존재·값 검증 |
| TC-TOOL-LOOKUP-01 | 등재어 "구비서류" | found=true, alternatives 포함 |
| TC-TOOL-LOOKUP-02 | 미등재어 | found=false (오류 아님), related 배열 존재 |
| TC-TOOL-GUIDELINES-02 | section="문장" | SEN 지침만, ruleIds가 SEN-*만 포함 |
| TC-PROMPT-SIMPLIFY-02 | simplify-text 조립 | FR-05 AC 3요소(절차/정확성/감수 고지) 문자열 포함 |
| TC-RES-01 | 리소스 목록·조회 | easyread:// 지침·체크리스트·사전 노출, MIME 일치 |

## 5. 정확성(ACC) 테스트

사실 보존은 이 제품의 절대 규칙(guidelines §7)이므로 별도 절을 둔다. `original` 제공 시:

| TC ID | 시나리오 | 기대 |
|---|---|---|
| TC-ACC-01-01 | 원문 "3월 31일까지" ↔ 변환문 "3월 30일까지" | ACC-01 error |
| TC-ACC-01-02 | 날짜 동일, 표기만 변경("삼월 말"→"3월 31일") — 원문에 3월 31일 존재 | 위반 0건 |
| TC-ACC-02-01 | 금액 10만 원 ↔ 변환문 1만 원 | ACC-02 error |
| TC-ACC-02-02 | "47.3%" → "10명 중 5명 정도" + 원문 값 병기 | 위반 0건 (의도된 단순화 판정) |
| TC-ACC-04-01 | 전화번호 한 자리 오타 | ACC-04 error |

## 6. 수동 점검 절차

**A. MCP Inspector 체크리스트** (마일스톤 종료마다):
1. `npm run inspector`(= `npx @modelcontextprotocol/inspector node dist/index.js`) 로 서버 연결 — 도구 4·프롬프트 2·리소스 4 목록 확인
2. 각 도구 스키마 표시가 02 §3.1 표와 일치하는지 육안 대조
3. S2 예문으로 validate 실행 → 리포트 가독성(사람용 content) 점검
4. 잘못된 입력(빈 값) → 오류 메시지가 "쉬운 문장" 컨벤션(03 §7)을 지키는지

**B. Claude Desktop 시나리오 리허설** (릴리스 전):
1. 설정 파일에 npx 등록 → 재시작 → 서버 인식 확인
2. S1 전체 흐름: simplify-text → 도구 호출 관찰 → 결과물에 감수 고지 존재 확인
3. **동일 원문 3회 변환** 후 각각 validate(원문 대조) → ACC error 0건 확인(비결정성 속 사실 보존 확인 절차)
4. S3: 대화 중 lookup_easy_word 자연 호출 유도

### 6.1 릴리스 전 수동 점검 기록 (복사용 — 릴리스 PR에 첨부, §7 게이트 4)

아래 블록을 릴리스 PR 본문에 붙여넣고 담당자가 채운다. 자동 게이트는 CI 런 링크로 갈음하고, **수동 A·B만 직접 확인**한다(자동으로 못 잡는 실물 UX·비결정 사실 보존이 이 절의 존재 이유다).

~~~md
## 릴리스 전 점검 — vX.Y.Z
담당: @____ · 일자: 20__-__-__ · 대상 태그: vX.Y.Z

### 자동 게이트 (CI에서 검증됨 — 런 링크로 갈음)
- [ ] `check` 전건 green (골든+계약+성능) — 런: ____
- [ ] 설치 스모크 TC-SMOKE-01~05 (빌드 산출물 stdio 기동 · 도구4·프롬프트2·리소스4 노출 · validate end-to-end) — 위 런 포함
- [ ] NFR-02: 10,000자 validate < 1초 (TC-PERF-*) — 위 런 포함

### 수동 A · MCP Inspector (§6-A)
- [ ] `npm run inspector` 연결 — 도구 4·프롬프트 2·리소스 4 목록 표시
- [ ] 각 도구 입력 스키마가 02 §3.1과 일치(육안)
- [ ] S2 예문 validate → 사람용 리포트 가독성 양호
- [ ] 빈 입력 → 오류 메시지가 쉬운 문장(03 §7) 준수

### 수동 B · Claude Desktop 실물 (§6-B, 릴리스 전 필수)
- [ ] npx 등록 → 재시작 → 서버 인식(도구 아이콘)
- [ ] S1: simplify-text 흐름 결과물에 감수 고지(FR-06) 존재
- [ ] **동일 원문 3회 변환** 후 각각 validate(원문 대조) → ACC error 0건
- [ ] S3: 대화 중 lookup_easy_word 자연 호출

### 판정
- [ ] 위 전부 통과 → 릴리스 승인
- 실패 시: 결함 등록(§8, ACC 실패는 S1 핫픽스) 후 보류
~~~

> 자동 게이트(전건 green·스모크·성능)는 **매 PR CI에서 이미 강제**되므로, 릴리스 시 실질 점검은 수동 A·B다. 특히 B의 3회 변환 ACC 0건은 비결정 LLM 환경에서 사실 보존을 확인하는 유일한 수동 관문이다(FR-06 · guidelines §7).

## 7. 품질 게이트 (릴리스 차단 조건)

적게, 그러나 절대적으로:

1. 골든 테스트·계약 테스트 **전건 통과** (CI)
2. `자동` 등급 규칙 전체가 골든셋 3종(위반/정상/경계)을 보유 — 커버리지 %가 아니라 **케이스 존재**가 게이트
3. NFR-02 성능 테스트 통과
4. 수동 절차 A(Inspector) 완료 기록 — 릴리스 PR에 체크리스트 첨부

## 8. 결함 관리

- 심각도: `S1 사실 왜곡`(ACC 오탐/미탐, 잘못된 suggestion으로 의미 변경 유도) > `S2 기능 불능` > `S3 오탐/미탐(일반 규칙)` > `S4 문구·사용성`. S1은 핫픽스 릴리스 대상.
- 모든 수정된 결함은 **재현 예문을 골든셋에 추가**한 뒤 닫는다(회귀 방지 규칙).
- 파일럿에서 수집한 실문서 오탐 사례는 익명화(기관명·연락처 치환) 후 골든셋에 편입한다.

## 9. 변경 이력

| 날짜 | 변경 | 작성 |
|---|---|---|
| 2026-08-09 | 최초 작성 | QA (qa 스킬) |
| 2026-08-13 | M2 완성 반영 — §2.1 구현 현황(214 TC) 추가, 성능 임계 정정(1초 AC·실측 ~65ms), §4 TC ID 실구현 정합, `TC-RES-05`(easyread://resources mimeType) 후속 등록 | QA (W / qa 스킬) |
| 2026-08-14 | M3 준비 — §6.1 릴리스 전 수동 점검 기록(복사용 체크리스트, §7 게이트 4의 첨부 산출물) 추가, §6-A 리소스 수 정정(3→4, 스모크 TC-SMOKE-04와 정합), `npm run inspector` 명령 반영. 설치 스모크(TC-SMOKE-01~05, 227 TC) 자동 게이트 편입 | QA (W / qa 스킬) |
| 2026-08-14 | 릴리스 준비성 계약 강화 — `TC-REL-08`(provenance용 `repository.url`·bugs·homepage·author 회귀 가드, /goal 점검서 발견한 P0 블로커 재발 방지) + NFR-03 무로깅 실증(`TC-PRIV-01~02`, 빌드 dist stdio에서 입력 본문 stderr 무로깅) 추가. §2.1 인벤토리 230 TC 갱신 | QA (W / qa 스킬) |
