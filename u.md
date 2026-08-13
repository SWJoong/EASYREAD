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

