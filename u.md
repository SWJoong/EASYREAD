# U → W 상태 채널

> Instance-U(구현·배포)가 W에게 남기는 진행상황·핸드오프·문제점 로그.

## [2026-08-12T14:44Z] U
[U→W 진행보고] 배정 2건 완료.
(1) CI 액션 v4→v5: PR #4 생성 (feat/ci-actions-bump). CI green 대기.
(2) T-14 자료 카탈로그: PR #5 생성 (feat/t14-resources). assets/resources.json 62건 배치 + src/data/resources.ts zod 로더(dictionary.ts 패턴) + easyread://resources 핸들러(server.ts). typecheck·lint·build·테스트 86개 전량 통과.
W 액션: (a) PR #4 리뷰·머지(동작변경 없음), (b) PR #5 골든·계약 테스트 작성(62건 필수필드·url_status·id 유일성), (c) VOC-03~06 골든 테스트 준비 시 알려줘.

## [2026-08-12T15:26Z] U
[U→W 진행보고] T-14 GREEN. W 골든테스트 PR #6 브랜치(claude/...bidcn2)에 T-14 구현 얹음(push afdeb86). 결과: 골든 8/8 ✅, 전체 94/94·typecheck·lint·build ✅(Node22), PR#6 CI check pass. 계약정합 리팩터: (a) 타입 z.infer화로 Catalog·ResourceEntry export가 검증결과와 항상 일치, (b) meta.counts.total 타입 고정(passthrough로 라벨·집계 보존)—TC-06, (c) category·language 알려진 enum으로 강화(데이터 전수확인), (d) pdf_url·note .optional() 유지(5·6건). server.ts 핸들러 타입참조 Catalog로 통일. 원본 easy_read_resources.json↔assets/resources.json 정규화JSON 동일 확인. // PR #5(feat/t14-resources·구현전용)는 PR #6이 상위집합이라 superseded로 close함. // W 액션: PR#6 draft→ready·main머지 판단. 다음 대기: VOC-03~06·NUM/STR/TYP 골든테스트 오면 즉시 착수. PR#4(CI v5) 머지 판단도 대기중.

## [2026-08-13T06:12Z] U
[U→W 진행보고] T-16 GREEN. 골든테스트 브랜치(claude/mcp-reference-check-wlfk25)에 U 구현 2건 얹음(push 619b864, PR #7 CI pass). 전체 102/102·typecheck·lint·build ✅(Node22), T-16 골든 16/16(sen-07 7 + resources 9). // (1) SEN-07: src/rules/sen/sen-07.ts 신규 + index 등록. 어절경계 마커(관형형+것 인접·여부·정확일치 대한/관한/통한/대하여/관하여·함/됨/음으로써), 문장당 1건, core()로 양끝 문장부호 제거(마커d 문장끝·대한 정확일치 견고화). 관형형은 는/은/을 + 종성 ㄴ·ㄹ(갈것/만들것)까지. // (2) 카탈로그 66: 4건 추가(kr-18 소소한소통 note에 3대실행원칙, us-01 digital.gov, ca-01 accessible.canada.ca, nz-04 digital.govt.nz) 모두 guideline_standard·unverified. meta total66·by_region(KR18/NZ4/US1/CA1 합66)·by_category.guideline_standard33·region_labels US/CA·disclaimer 보강일. verified59/unverified7 정합. // ⚠️ 주의: 핸드오프 예상('나머지 93 green')과 달리 tests/rules/registry.test.ts TC-CORE-13(등록 규칙 ID 스냅샷)도 red였음 — senRules에 SEN-07 넣으면 필연. T-07(27e97d1)에서 VOC 등록 때 U가 이 스냅샷을 갱신한 선례대로 'SEN-07' 한 줄 추가함(레지스트리 배선=U레인). W 확인 부탁. // W 액션: PR #7 draft→ready·main머지 판단(브랜치보호 strict니 PR #2 등과 머지순서 유의). 다음 대기: VOC-03~06·NUM/STR/TYP 골든테스트.

## [2026-08-13T06:42Z] U
[U→W 핸드오프] T-07 VOC-03~06 규칙 구현 완료 → 골든 테스트 요청. PR #9(draft, feat/voc-03-06, main기준). 사용자 지시로 이번엔 구현 선행(골든테스트는 W). // 계약: voc-01·02식 lookup(어절정확일치). VOC-03(warning) terminology 풀이없으면 용어별 첫사용 1건(풀이신호=용어+이란/란/이라는/라는/이라고/라고 또는 뒤15자내 뜻·의미). VOC-04(info) idiom 매출현. VOC-05(warning) abbreviation 첫등장 뒤 '('공백허용 없으면 1건, 약어별 첫등장만. VOC-06(info) 지시어(이/그/해당/상기 등)밀도=지시어수/문장수, 잠정 MIN_COUNT=3&문장당>0.5면 문서1건. // 확정요망: VOC-03 풀이패턴범위·'인접문장'경계(현 원문전체), VOC-06 임계값·부착위치(현 문서1건, per-sentence 선호시 알려줘). 이견 시 구현 조정. // 검증: typecheck·lint·build·전체94/94 ✅, 스크래치 15/15(tests엔 미커밋-W레인보존). registry.test.ts TC-CORE-13 스냅샷 VOC-03~06 추가(배선=U레인, 27e97d1 선례). // ⚠️머지순서: T-16(PR#7) 먼저 머지되면 이 브랜치 main병합 시 registry.test.ts 한곳 충돌(SEN-07↔VOC-03~06), 두줄 합치면 끝. // W액션: tests/rules/voc-03~06.test.ts 작성해 이 브랜치에 얹으면 계약 확정·green.

## [2026-08-13T06:50Z] U
[U→W 진행보고] T-07 VOC-03~06 GREEN. 상황: 내가 구현하는 동안 네가 골든테스트(PR #8)를 동시에 올림 — 네 계약에 맞춰 구현을 PR #8 브랜치에 재작성해 얹음(push 9210c78). VOC 골든 22/22·전체 124/124·typecheck·lint·build ✅(Node22). // 내 초기 구현(feat/voc-03-06, PR #9)과 네 계약이 세부에서 달라 재작성: VOC-03 풀이 스코프를 '같은 문장'+마커셋['이란','라는 뜻','뜻입니다','뜻이','설명','(']로, VOC-05 괄호를 '다음어절 ( 시작 or 매칭어절 ( 포함'으로, VOC-06 지시어 집합을 네 목록대로·임계값 count>문장수로 정합. VOC-04는 그대로 일치. // PR #9는 superseded로 close함. registry 스냅샷은 네가 선반영(U는 src만) 지시대로 tests 미변경. // W액션: PR #8 draft→ready·머지 판단(사용자). T-16 이미 main에 있으니 이 브랜치는 main기준 clean. 다음(T-08): NUM/STR/TYP 골든테스트 오면 착수.

## [2026-08-13T12:45Z] U
[U→W 진행보고] PR #10 완전 GREEN — 규칙 13 + 도구 3 모두 구현. push cd3d7a3(rules daeb22c + tools cd3d7a3). 전체 193/193·typecheck·lint·build ✅(Node22). tests·registry 스냅샷 미변경(네가 선반영) — src/만. // [규칙13] T-07(NUM4·STR2·TYP3=9)+T-10(ACC4): src/rules/{num,str,typ,acc}/ + src/text/extractors.ts(공유추출기) + registry [...sen,voc,num,str,typ,acc]. 골든 T-08 37/37·ACC 13/13. ACC는 requiresOriginal. // [도구3] T-08 analyze/lookup/guidelines: src/tools/*.ts + server.ts 등록. 계약 19/19. get_guidelines의 ruleIds는 registry에서 파생(런타임 단일소스), get_guidelines content는 assets에 지침파일이 없어 섹션별 인라인 Markdown으로 제공(비어있지않음 계약 충족 — 후에 번들 asset 로드로 대체가능, backlog). // 착수 중 네가 9add1aa(도구계약) 추가해서 내 rules 커밋을 rebase로 통합함(파일 disjoint). // W액션: PR #10 QA검증(레인준수+전건green) 후 사용자 머지 요청. 다음: T-09 프롬프트·리소스 or 사용자 판단.

## [2026-08-13T14:07Z] U
[U→W] 사용자가 분담안 승인 — U는 T-09 구현 담당. W가 T-09 프롬프트 2종(simplify-text FR-05·easy-read-review FR-08)+리소스 3종(easyread://guidelines·guidelines/checklist·dictionary FR-09) 계약/골든테스트를 작성해 핸드오프하면 즉시 착수함. 그때까지 U 대기. // 요청: 리소스 계약에서 (a) 각 리소스 URI·MIME(guidelines=text/markdown, checklist=text/markdown, dictionary=application/json 예상), (b) easyread://guidelines 본문 소스 — assets/guidelines/*.md를 U가 만들지, 아니면 .claude/skills easyread-domain references에서 파생할지 명확히 해줘(get_guidelines content도 현재 인라인이라 이 소스로 통일 가능). (c) dictionary 리소스는 이미 있는 assets/dictionary.json 그대로 노출인지 확인. // 로컬 main 647f582 동기화 완료. T-11(통합·성능)은 W solo 진행 OK. 착수 전 브랜치·최근 CI로 네 선작성 여부 먼저 확인하겠음(VOC 동시성 교훈).

## [2026-08-13T14:33Z] U
[U→W 진행보고] T-09 GREEN + T-11 함께 통과. PR #11 브랜치에 T-09 구현 얹음(push e5a5e14). 전체 214/214·typecheck·lint·build ✅(Node22). tests 무변경 — src만. // [프롬프트] simplify-text(절차·정확성·감수+초안 3요소, text필수, audience 기본'발달장애인…'), easy-read-review(규칙 ID 인용+validate_easy_read 호출, original 시 사실 대조+원문). src/prompts/{simplify,review}.ts. 계약 11/11. // [리소스] server.ts에 easyread://guidelines(text/markdown, src/data/guidelines.ts 정적본문)·guidelines/checklist(registry에서 규칙ID표 생성, SEN-01 포함)·dictionary(주입 dictionary.entries JSON, 주입시만). 계약 4/4. ※readResource 응답 contents에 mimeType 명시해야 통과(list 메타만으론 부족) — 반영함. // 네 T-11(1b170c4, integration e2e+perf)이 먼저 올라와 있어 rebase로 통합함(disjoint). T-11 6/6도 내 T-09 구현 얹으니 green(전 FR 완비 확인). // 참고(비차단): 기존 easyread://resources(T-14) read 핸들러엔 contents.mimeType이 없음 — 계약 테스트가 없어 미검출된 잠재 불일치. 필요시 후속 정리. // W액션: PR #11 QA검증(레인준수+전건green) 후 사용자 머지 요청. M2 잔여(T-09·T-11) 이걸로 완료.

## [2026-08-13T17:05Z] U
[U→W 진행보고] T-12 배포 파이프라인 착수·완료 → PR #13(feat/t12-release, main기준). DevOps라 규칙 골든 없음 — W QA(레인·green) 후 사용자 머지 요청. // 산출: release.yml(v* 태그→게이트→태그-버전 일치→npm publish --provenance→npx initialize 스모크→GH Release), ci.yml에 '데이터 검증' 스텝 추가(check 잡 이름 유지=브랜치보호 불변), scripts/validate-assets.mjs(런타임 로더 재사용 zod 게이트), LICENSE(MIT+데이터출처), docs/install/{claude-desktop,claude-code}.md+README 설치섹션(쉬운 문장), eslint.config에 scripts/*.mjs Node 전역, 05-release-plan 갱신. // 검증: lint·typecheck·build·test 214/214·validate-assets 로컬 통과. // 첫 릴리스 전(관리자): npm Trusted Publisher(OIDC) or NPM_TOKEN 시크릿, easyread-mcp 이름 선점 확인. // 계획대로 보류: MCPB(M3 이후), CI 크로스플랫폼 매트릭스(required-check 이름 변경→브랜치보호 설정 갱신 필요, 별도 잡 후속). // 별건: 네가 언급한 easyread://resources mimeType 후속은 네가 계약테스트 추가하면 U가 정리 — 대기중.

## [2026-08-13T17:22Z] U
[U→W 진행보고] TC-RES-05 완료. easyread://resources read 핸들러 contents에 mimeType:'application/json' 1줄 추가(push 13717fc, 브랜치 claude/mcp-reference-check-wlfk25). 신규 3종과 동일 패턴. 리소스·릴리스 계약 12/12·전체 222/222·typecheck·lint·build ✅(Node22). src/server.ts만 변경 — tests·docs 미변경. // PR #12 이제 전체 green일 것(TC-RES-05가 마지막 red였음). W액션: QA(레인·전건 green) 후 사용자 머지. // PR #13(T-12) 머지 확인함(main 3f79d43) — 고마워. // 다음: M3 첫 릴리스(v0.1.0 태그) 준비. 관리자 선행(코드밖): npm Trusted Publisher(OIDC) or NPM_TOKEN + easyread-mcp 이름 선점. W npx 설치 스모크 테스트 후보 진행하면 U가 필요한 src 대응.

## [2026-08-14T08:23Z] U
[U→W 진행보고] 병렬작업 (b) 완료 — GitHub 이슈·PR 템플릿. PR #(신규, feat/t12-community, main기준). .github/만: ISSUE_TEMPLATE/{false-detection(오탐·미탐: 예문·기대·실제·규칙ID→골든셋 편입 04§8 연결, 사실왜곡 S1 안내), install-problem(클라이언트·OS·Node·증상·로그, 네트워크불필요 안내)}·config.yml·PULL_REQUEST_TEMPLATE.md(레인·게이트·데이터버전·ACC회귀 체크리스트). 쉬운 문장. YAML 파싱 통과·탭 없음. 코드·테스트 무변경. // (c) CI 크로스플랫폼 매트릭스는 required-check 이름 변경→브랜치보호 관리자 갱신 필요라 사용자 판단으로 남김(워크플로 선작성만 하면 활성화는 관리자). 사용자 지시 오면 착수. // PR #12 머지(main dc3e990) 확인. 네 npx/stdio 스모크 테스트(tests/release/smoke.test.ts)와 disjoint(.github/). W QA 후 사용자 머지 부탁.

## [2026-08-14T09:17Z] U
[U→W 진행보고] (c) 크로스플랫폼 CI 매트릭스 선작성 완료 → PR #17(feat/t12-ci-matrix, main 055d7f9 기준). 사용자 '①선택적 선작업' 지시(네 09:09Z 핸드오프) 착수. // 설계: 별도 워크플로 .github/workflows/cross-platform.yml 신규 — ci.yml 무변경이라 필수 체크 'check'(ubuntu·Node22) 이름 그대로 보존, additive 공존. Node 22/24 × ubuntu·windows 4셀(스텝은 check와 동일: ci·lint·typecheck·build·test·데이터검증, fail-fast:false). // CI: 5체크 전부 green — 'check' + cross-platform 4셀. ★windows-latest(22·24) 포함 전셀 pass = 227 테스트·빌드·데이터검증이 windows에서도 통과(크로스플랫폼 결함 0). 새 체크 4종은 비필수(non-blocking). // 활성화(브랜치보호 required 목록에 4체크 추가·필요시 check 대체)는 관리자 시점 — 이 PR은 설정 무변경. docs/plan/05 §4 현황 갱신(⏳→🟡) 동반. 레인: .github/·docs/plan만, src·tests 무변경. // 백로그(get_guidelines 인라인→번들 asset 로드)는 레인 순수 유지 위해 미포함 — 원하면 별도 src PR로. // W액션: PR #17 QA(레인·green) 후 사용자 머지. 관리자 선행(첫 릴리스 npm 인증+easyread-mcp 이름 선점)은 코드밖 대기 유지.

## [2026-08-14T11:00Z] U
[U→W 점검 결과 분담 요청] 사용자 /goal로 릴리스 준비성 점검(①실사용 테스트 ②참고자료 저작권 ③배포 준비 +기타) 완료 → 15개 Task로 정리(U 세션 TaskCreate). 레인 분담 아래.

★W 담당 Task(요청 — W 쪽에서 확정·진행):
 (W-a) 릴리스 전 수동 게이트 리허설 실행·기록: 04-qa §6 A(Inspector)·B(Claude Desktop S1~S3, '동일원문 3회 변환→각 validate 원문대조 ACC error 0건'). PR#16 체크리스트 사용. +messages.ts 등 도구 문자열 쉬운문장 도그푸딩.
 (W-b) resources.json 66건 description 원본성 QA — 출처 초록 전재 아닌 자체요약인지 스팟검수(verified 59건 우선), 전재의심 결함등록→U 재작성.
 (W-c) 파일럿 실사용 테스트 프로토콜 설계 — 페르소나(김주무관·박간사)·시나리오 태스크스크립트·지표(설치5분·태스크성공·ACC0·보조규칙 오탐<20%)·피드백양식(false-detection 템플릿→골든셋 04§8)·당사자 감수 연계. (성공지표 '파일럿1곳 실안내문1건'의 실행판)
 (W-d) NFR-03 프라이버시 무로깅 실증 테스트 — 입력 본문이 stderr/응답에 안 남음 단정 + console.error 사용처 코드리뷰.

관리자/사용자 선행(코드밖): npm 이름선점+게시인증(OIDC/NPM_TOKEN) / cross-platform 4체크 required 승격(PR#17 머지후) / EU Easy-to-Read 로고 미사용·정부자료 공공누리 최종확인(법적) / 파일럿 협력기관 접촉(R-04).

U 담당 착수(순차 PR): [P0] package.json 배포메타(repository·bugs·homepage·author) — ★현재 repository 필드 없음→ release.yml의 npm publish --provenance 실패 위험(블로커). / SECURITY.md(+ReDoS·입력상한 점검요약) / CHANGELOG.md / resources.json 항목별 라이선스·공공누리 필드 / 번들데이터 저작권 감사+루트 easy_read_resources.json(구버전 초안·미배포) 정리 / 비개발자 설치·첫사용 따라하기 가이드(W-c와 짝).

핵심 발견 공유: 저작권 스탠스는 sources.md §5(자체 재구성·전재금지)로 문서화·양호, 사전/카탈로그에 source·url 보존 — 남은 건 (1)공공누리 유형 항목별 데이터화 미완 (2)최종 법적확인(사람) (3)description 원본성 QA(W-b). 배포 최우선 블로커는 provenance용 repository 필드. 지금 U가 P0부터 착수.

## [2026-08-14T11:33Z] U
[U→W] U 레인 점검 실행 전부 완료(순서대로). // #1 provenance 메타 — PR#18 머지됨(main). #8 리소스 항목별 라이선스/공공누리 필드(스키마 optional+66건 분류+meta.license_note) — PR#20. #4·#5 SECURITY.md(+보안 점검 요약)·CHANGELOG.md — PR#21. #9 번들데이터 저작권 감사+루트 easy_read_resources.json(구버전 62건 초안) 삭제 — 완료. #13 docs/install/first-use.md 첫사용 따라하기(+두 가이드 링크) — PR#22. #3 npm pack 드라이런 검증 — tarball=LICENSE·README·assets 2종·dist/** 121파일, 스트레이 0(src·tests·docs·삭제파일 미포함). // PR#20·21·22 = 로컬 풀게이트 green·main 동기화 완료(BEHIND 해소), CI 재green 후 사용자 머지 대기. // 네 PR#19(#14 NFR-03 무로깅 + TC-REL-08 provenance 회귀가드) 머지 확인 — 내 #1과 정합, 고마워. // 저작권 감사 결과: dictionary 112건 전부 '자체 구축', guidelines 원칙 요약(전재 아님), resources description 자체요약 → NFR-04 정합. license 필드는 '미검증' 항목을 명시 표기 = #10(네 description 원본성 QA)·#11(법적 최종확인)의 입력. // 남은 W: #6 릴리스 전 수동 게이트 리허설(+messages 도그푸딩)·#10 description 원본성 QA·#12 파일럿 실사용 프로토콜. 관리자: #2 npm 이름·인증, #7 cross-platform required 승격. 사용자/법무: #11·#15.

## [2026-08-14T11:45Z] U
[U→W] PR #20·21·22 전부 머지 완료 → main c2d6a41. U 레인 점검 실행분 전량 main 반영: 리소스 항목별 라이선스/공공누리 필드(#8)·SECURITY.md+CHANGELOG.md(#4·5)·docs/install/first-use.md 첫사용 가이드(#13)·번들데이터 저작권 감사+스트레이 삭제(#9)·npm pack tarball 검증(#3, 121파일 clean). #1 provenance는 이미 머지됨. // 진행 중인 네 작업 브랜치는 최신 main(c2d6a41)로 rebase 권장. // 남은: W #6(수동 게이트 리허설+messages 도그푸딩)·#10(description 원본성 QA)·#12(파일럿 실사용 프로토콜) / 관리자 #2(npm 이름·인증)·#7(cross-platform required 승격) / 사용자·법무 #11·#15. U 코드 작업 대기 없음.

## [2026-08-14T15:08Z] U
[U→W] 네 14:57Z 핸드오프·리허설 반영 — U PR 2건 올림(둘 다 [HANDOFF→W] QA 대기).
 • PR #25 (src): server.ts:66 리소스 description '62건'→'66건' 정정. tests/data/resources.test.ts가 length===66 단정 = 66 정본. 로컬 게이트 green(230). W 14:57Z 핸드오프 클리어.
 • PR #26 (docs, 05 §5.1): Task #2 실행 런북 신설 — npm 이름 선점 확인 + 게시 인증 A(NPM_TOKEN, 첫릴리스 권장·코드변경0)/B(OIDC Trusted Publisher, npm11.5.1+ 선행) 택1. release.yml 실제 배선(id-token:write·NODE_AUTH_TOKEN=secrets.NPM_TOKEN)에 정합. (사용자 요청 '계정 자격증명 과정 설명'의 산출물)
 ★핸드오프(W/명세): docs/plan/02-architecture.md에도 '62건' 3곳 stale — L38 ADR-07·L166 WBS T-14·L192 변경이력. 02는 네 명세 레인이라 U 미수정, 66으로 정정 요청(src PR #25와 짝).
 • 네 백로그 a/b/c(조사 받침판정·ACC 날짜표시 공백·validate 빈문자열 이중메시지) 접수 — 전부 저우선·무해, 원하면 U가 별도 src PR로 정리 가능(지시 대기).
 • draft #23(토큰효율)·#24(파일럿 프로토콜)은 사용자 QA 대기 유지. U 코드 잔여 대기 없음.

## [2026-08-14T15:50Z] U
[U→W] v0.1.0 릴리스 1차 시도 = publish 실패(코드 아님, 자격증명). 상황 공유:
 • release.yml: 게이트·태그검사·빌드·provenance 서명까지 전부 성공 → 마지막 레지스트리 PUT에서 E403 "You may not perform that action with these credentials".
 • ★게시 안 됨: npm view easyread-mcp = 여전히 404(버전 0.1.0 미소진). 롤백 불필요. v0.1.0 태그 origin에 유지 → 토큰 수정 후 동일 태그로 재실행 예정.
 • 원인 추정: NPM_TOKEN이 신규 패키지 publish 권한 없음 — (1)granular이 '특정 패키지'로 스코프됨(신규라 선택 불가→생성 불가) or read-only, (2)계정 2FA-for-publish 미우회. 5 §5.1 런북의 '신규는 All packages write' 주의점에 해당.
 • 조치: 사용자/관리자가 토큰 재발급(granular=All packages Read/Write, or classic Automation 토큰)→GitHub 시크릿 NPM_TOKEN 갱신→U가 gh run rerun --failed로 재실행. 코드 변경 없음.
 • CHANGELOG v0.1.0 마감(PR#27) 머지됨 → main 5aa2d88. 그 외 릴리스 준비(버전·이름·게이트) 모두 green.

## [2026-08-14T16:15Z] U
[U→W] ★★ v0.1.0 게시 성공 — easyread-mcp@0.1.0 npm 공개(latest), provenance 서명 완료.
 • publish 관문: attempt4에서 통과. 원인=npm 계정 2FA-for-writes 강제 → Classic Automation 토큰으로 해결(granular/Publish 토큰은 2FA 우회 안 됨). 코드 변경 0, 태그 v0.1.0 그대로.
 • 설치 스모크는 워크플로에서 실패했으나 ★전파지연 오탐: publish 1초 후 npx 실행→CDN 전파 전 빈 응답. U가 게시본 npx 스모크 독립 재검=initialize result 정상(serverInfo easyread 0.1.0·protocol 2025-06-18·tools/prompts/resources). 실결함 아님.
 • GitHub Release v0.1.0 수동 생성 완료(워크플로가 스모크 실패로 건너뜀). CHANGELOG 기반 노트.
 ★후속(U .github, 비차단): release.yml 설치 스모크에 전파 대기+재시도 추가 필요 — 다음 릴리스 오탐 방지. 사용자 지시 오면 PR.
 • #2(이름 선점+게시 인증) 완료. 이제 #6 Desktop 실물 검증은 게시본(npx -y easyread-mcp)으로 실행 가능. 남은: #7 관리자 required 승격·#11 법무 최종확인. main 5aa2d88.

## [2026-08-14T16:23Z] U
[U→W] PR #29 머지 완료 → main cab94b4. release.yml 설치 스모크에 전파 대기+재시도(최대 12회·15s·npm view 노출 확인→npx initialize) 추가 = v0.1.0에서 겪은 전파지연 오탐 재발 방지. 다음 릴리스(v*)부터 실효, 현 게시본에는 영향 없음.
 • 네 PR #28(02-architecture 62→66 정정) 머지 확인 — 내 src #25와 짝 맞음, 고마워. 이제 '62건' 잔존 0.
 • v0.1.0 상태: npm easyread-mcp@0.1.0 latest·provenance, GitHub Release 게시됨, 독립 npx 재검 정상. #2 완료.
 • U 코드 대기 없음. 남은: #6 Desktop 실물 검증(게시본으로 가능)·#7 관리자 required 승격·#10 원본성 QA(네 완료분)·#11 법무·#12 파일럿 프로토콜(네 PR #24 머지됨).

## [2026-08-14T16:37Z] U
[U→W] PR #31 머지 → main 7d26b86. README v0.1.0 반영·정리(배지 npm/CI/MIT/Node·감수전초안 상단 고지·npx 설치·써보기 4단계·번들데이터 66건·보안/기여/라이선스 섹션). README만, src·tests 무변경. 문구 쉬운문장·링크 QA는 W 확인 환영(이미 머지, 사후 리뷰).
 ★참고: npmjs.com의 README는 v0.1.0 게시 시점 스냅샷이라 여전히 구버전 표기 — 갱신본은 다음 publish(v0.1.1+) 때 npm 전면에 반영됨. GitHub는 즉시 반영.
 U 코드 대기 없음. 남은: #6 Desktop 실물 검증·#7 required 승격·#11 법무.

## [2026-08-14T16:43Z] U
[U→W #6 지원] 게시본(npx easyread-mcp@0.1.0) stdio end-to-end 검증 완료 — §6-A(Inspector 상당)를 실배포 아티팩트로 실행(dist 검증보다 강함).
 • 표면: 도구4·프롬프트2·리소스4, serverInfo easyread 0.1.0, 리소스 mimeType 정상(TC-RES-05 정합).
 • 동작: validate_easy_read 원문대조 ACC ✅ — 날짜 왜곡(3월2일→3월20일)에 ACC-01 error 포착, verdict fail(summary byGroup ACC:1). 사실보존 초안=pass. analyze_readability/lookup_easy_word('제출'→냄·내기)/get_guidelines(정확성)/resources.read(dictionary 112건)/prompts.get(simplify-text) 전부 정상. 도구 출력 notices에 '당사자 감수 대신 안 함' 고지 포함 확인.
 • 참고(네 백로그 b): ACC 메시지 날짜 표시가 공백제거형 '2026년3월2일' — 값 정확·표시만 아티팩트. 저우선 유지.
 • 남은 §6-B(실 Claude Desktop 3회 LLM 변환→각 validate ACC0)는 실클라이언트+비결정이라 사용자 실행분 — 네 런북대로. 서버측(게시본)은 U가 검증 끝, §6-B는 클라이언트 통합만 남음.

## [2026-08-14T16:57Z] U
[U→W #6/설치문제] Ubuntu Claude Desktop easyread 설치 실패 진단·해결.
 원인 2개: (1) 리눅스 설정 ~/.config/Claude/claude_desktop_config.json에 mcpServers 블록 자체가 없었음 — 우리 install 문서에 리눅스 경로가 빠져 있었음. (2) 시스템 node=v18.19.1(<22)이고 GUI(Desktop)가 nvm PATH를 못 봐 시스템 node로 서버를 띄워 실패(터미널에선 정상).
 해결: 실기 config에 easyread 추가 — command=nvm npx 절대경로, env.PATH에 nvm bin 최우선(+HOME)로 node 22 강제. 원본 백업 보관. 실기 검증: env 교체 최악조건(오직 PATH+HOME)에서 initialize OK, 해당 PATH의 env node=v22.23.2.
 문서 갭 메움: PR #32 머지(claude-desktop.md에 Linux 경로 + '잘 안 될 때' 4번 절대경로/env.PATH 예시). main 743aac6.
 사용자 Desktop 완전 재시작 후 §6-B(동일 원문 3회 변환→각 validate ACC0) 실행 가능. 서버측(게시본)은 U가 이미 검증 완료.

## [2026-08-14T17:45Z] U
[U→W 버그수정] 네 17:14Z 도구 스키마 방언 버그 수정 완료 → PR #33 머지, main ba95440.
 원인: SDK 1.30.0이 zod→JSON Schema를 target 미지정으로 변환→zod-to-json-schema 기본 draft-07 방출. SDK에 방언 지정 공개 API 없음(1.30.0 최신).
 수정: src/schema-dialect.ts 신설 — 도구 등록 전 tools/list 핸들러 래핑, 응답 각 도구 input/outputSchema의 $schema 선언 제거(본문은 두 방언 공통)→클라 기본(2020-12) 해석. serverInfo·package.json 0.1.0→0.1.1, CHANGELOG [0.1.1].
 검증: 로컬 dist tools/list 4도구 전부 $schema 없음·스키마 정의 유지, Ajv 2020-12로 8개 스키마 컴파일 OK. 게이트 green(230). 골든 무영향(toBeDefined 유지).
 ★회귀 테스트 제안(W 레인): tools/list 각 도구 input/outputSchema에 $schema 부재 + Ajv2020 컴파일 단정 → TC 추가 검토.
 다음: v0.1.1 태그 push→release.yml 자동 게시(사용자 확인 대기). 스모크 재시도(#16) 적용돼 전파오탐 없이 나갈 것.

## [2026-08-14T18:04Z] U
[U→W] ★v0.1.1 게시 완료 — 방언 버그 fix 반영. easyread-mcp@0.1.1 npm latest·provenance, GitHub Release v0.1.1 생성.
 • 게시본 독립 검증: npx -y easyread-mcp@0.1.1 initialize 정상(serverInfo 0.1.1), tools/list 4도구 전부 $schema 없음 = 방언 fix 실사용 반영 확인.
 • ★CI 설치 스모크는 또 오탐: publish 성공했으나 러너 npx가 게시 직후 tarball 전파를 3분(#16 재시도 12회)내 못 받아 initialize 미확인→GitHub Release 스킵→수동 생성. 내 머신에선 정상. 2회 연속(v0.1.0·v0.1.1) 오탐 = 재시도로 미해결.
 • 후속 과제 등록(U): release.yml에서 GitHub Release를 스모크 앞으로 이동 + 스모크 비치명적화(별도 체크 분리). 지시 오면 PR.
 • Ubuntu 실기 설치도 수정 완료(claude_desktop_config에 easyread 추가, node22 강제) — 사용자 Desktop 재시작 시 npx 미고정이라 0.1.1 수신 예상.

## [2026-08-15T05:57Z] U
[U→W 파일럿 오탐 3종 → 04 §8 골든셋 후보] /easyread-domain 실공고(서울시장애인일자리센터 사무보조 채용) 변환→validate(게시본 0.1.1, 방언 fix 실사용 정상) 결과. 변환문은 사실 보존 OK, 아래는 규칙 오탐:
 1. ACC-01 [error] "주 5일"의 '5일'을 날짜로 오인 → "원문 날짜 5일이 변환문에 없음" 거짓 error. ★verdict를 fail로 만드는 주범·error급이라 우선순위 높음(실사용자 혼란).
 2. ACC-03 [warning] "모집인원"·"일부"(일부 서서)를 기관명으로 오인 → 흔한 명사 과매칭.
 3. VOC-02 [warning] 이메일 job@jobcenter.or.kr을 job@jobcenter.·or.·kr 조각으로 쪼개 외국어 오탐 + 단위 '20kg' 외국어 오탐.
 개선 방향(골든셋 편입 후 U가 규칙 수정, 네 골든 선작성 필요): ACC 날짜추출기 "주 N일" 제외 / ACC-03 기관명 패턴 정교화 / VOC-02 이메일·단위 토큰 제외. analyze는 정상(43문장·평균3.4어절·최장7어절·어려운낱말0).
 사용자가 /goal로 '토큰 최적화'도 지시 — 변환 테스트 시 웹 전체로드·드라이버 반복작성 절감 방안 적용 중.

## [2026-08-15T07:47Z] U
[U→W 변환 속도 분석] 사용자 질문(변환 품질 유지하며 속도↑ 방법) 답변 근거 공유.
 ■ 서버측 검증/분석 실측(dist stdio 왕복 포함, 중앙값): validate(원문대조) 500자 2.1ms · 2,000자 4.0ms · 10,000자 11.1ms · 45,000자(상한근처) 32.6ms / analyze는 10k 2.7ms·45k 9.9ms. → ★NFR-02(10,000자<1초)를 ~100배 여유 충족. 서버는 병목 아님(개선 여지 ms 단위).
 ■ 체감 병목 = 클라이언트 LLM 변환 생성시간(초 단위) + 웹 fetch(일회성). 검증은 무시 가능.
 ■ 품질 유지 속도개선 지렛대(효과순): (1)모델 계층화 — 변환은 규칙적이라 빠른 모델(Haiku/Sonnet)로 대량 변환+Opus는 어려운 대목·감수만, 품질은 결정적 validate(ACC)로 방어 (2)컨텍스트 최소화 — 사전/지침 전문 대신 lookup_easy_word·get_guidelines(section) 슬라이스 (3)긴 문서 청크 병렬 변환(섹션 경계) (4)validate 주도 국소 수정(검증이 ms라 전체 재변환 대신 걸린 문장만).
 ■ 가능한 후속(협의): 이 지침을 simplify-text 프롬프트(src·U) 또는 05/01 문서에 반영. 지금은 사용자 판단 대기 — 지시 오면 U가 프롬프트/문서화.
 (측정 스크립트는 스크래치 perf.mjs. 재현 필요하면 scripts/mcp-validate.mjs 계열로 승격 가능.)

## [2026-08-15T07:49Z] U
[U→W 추가 오탐 재현 + VOC 사전 공백] 사용자 쉬운정보 검증 요청(장애인일자리사업 공고 변환) + MCP 활용법 상담 중 확인(게시본 0.1.1).
 ■ ACC-03 재현(05:57Z 항목2 보강 사례): 원문 "시·군·구청"을 의미 그대로 "시청/군청/구청" 세 기관명으로 완전히 풀어써도(세 낱말 전부 변환문에 존재) "원문의 기관명 시·군·구청이 변환문에 없습니다" warning 오탐 지속. 즉 기관명 매칭이 원문 부분문자열 완전일치 기반으로 추정 — 압축표기를 풀어쓴 동의 표현은 인식 못 함. 대화 로그에 재현 텍스트 있음, 필요하면 스크립트화 가능.
 ■ VOC 사전 공백(신규 발견): lookup_easy_word("인증") → found:false, related:[](대체어 제안도 없음). 사전이 복지·행정 도메인 위주라 IT/웹앱 UI 일반어(인증·로그인·업로드 등) 커버리지가 비어있는 것으로 추정. 사용자가 "웹앱 쉬운모드 버튼/설명란에도 쓸 수 있나" 문의하다 발견 — 확장 검토 시 assets/dictionary.json 대상(U 레인).
 ■ 참고(비문제): 짧은 완결문 UI 설명 문구(예시: "아래 버튼을 눌러 본인 인증을 진행해 주세요.")는 validate pass(0/0/0) — SEN류는 UI 카피에도 문제없이 동작, 격차는 VOC 사전 커버리지 쪽에 국한.
 다음: 골든셋 편입·우선순위는 사용자·W 판단 대기. ACC-03 기관명 매칭 정교화는 05:57Z 항목과 같은 축이라 묶어서 U가 착수 가능(지시 오면 진행).

## [2026-08-21T01:00Z] U
[U→W 디지털/웹 확장 검토+A·C 구현] 사용자 /goal '웹사이트/서비스 구축 조언 기능' 5관점 검토 완료. 결론: 전용 도구·서비스형은 ADR-01/07·FR-11(원격HTTP Won't)·QA골든과 충돌→비채택. 실수요(웹/앱 UI 쉬운정보; lookup('인증')→found:false)를 기존 채널 좁은슬라이스로 대응. // PR #40 (feat/digital-web-guidance, main기반): A) dictionary.json 웹/앱 UI 용어 25종 추가(112→137, loanword16·difficult8·terminology1/새로고침). C) guidelines에 '웹·디지털에 담기(참고)' 절 + get_guidelines 절차 포인터(규칙아님·section enum 불변). 게이트: validate-assets OK·build·241 green(회귀0)·typecheck·src린트 OK. 흔한동사(저장·삭제 등)는 오탐위험 제외→네 골든판단. // ★W선행 필요(test-first): (1)신규사전어 lookup/VOC 골든 (2)B 리소스 KWCAG·행안부·NIA는 TC-DATA-14-01 건수66 하드코딩+category enum(web_digital?) 네가 먼저 갱신해야 U가 데이터추가 (3)D 프롬프트 easy-read-web은 02계약+계약테스트 선행 (4)문서 01(페르소나C 디지털매체·FR·지표)/02(ADR)/04 + skill references/guidelines.md 동기화. // 참고: untracked scripts/mcp-validate.mjs(이전 브랜치 §10.4 A안 WIP)는 이 PR 무관·미커밋, full lint엔 console에러 뜸.

