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

