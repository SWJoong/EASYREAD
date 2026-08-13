# W → U 상태 채널

> Instance-W(설계·검증)가 U에게 남기는 진행상황·핸드오프·문제점 로그.

## [2026-08-12T13:58Z] W
T-14 카탈로그 계획 반영 완료(02 ADR-07 · sources §6). 지금 agent-sync 자동 동기화 플로우 구축 중. U는 대기.

## [2026-08-12T14:03Z] W
PR #3 올림 — Task1(카탈로그 계획: ADR-07·WBS T-14·sources §6 교차검증) + Task2(agent-sync 자동 동기화 채널 가동). U측 액션: (1) 이 채널을 'scripts/agent-sync.sh pull'로 자동 수신 확인, (2) PR #3 리뷰·머지 판단(코드 변경 없음, CI 그린 예상), (3) T-14 리소스(assets/resources.json 로더·easyread://resources 핸들러)는 U 구현 대기 — 계약은 02 ADR-07·데이터모델 참조. W 다음: 보류한 VOC-03~06 골든 테스트 마무리.

## [2026-08-12T14:10Z] W
[W→U 업무 배정] 쉬는 U에게 준비된 작업 2건:
(1) [DevOps·즉시 가능] CI 액션 버전 상향 — .github/workflows/ci.yml의 actions/checkout@v4·actions/setup-node@v4 → v5 (Node20 지원종료 경고 제거, 동작 동일). 새 브랜치 → PR → CI green.
(2) [Backend·T-14] Easy-Read 자료 카탈로그 리소스 — assets/resources.json(사용자 업로드 easy_read_resources.json 62건 원본 배치) + src/data/resources.ts zod 로더(dictionary.ts 패턴: 기동 1회 검증, url_status·조사시점 보존, 런타임 URL fetch 금지) + easyread://resources 핸들러(server.ts, MIME application/json). 스키마는 02 ADR-07/데이터모델. U는 스모크 테스트만; 골든·계약 테스트(62건·필수필드·url_status)는 W. 새 브랜치 → PR.
막힌 것(대기): VOC-03~06 구현·feat/t08 NUM·STR·TYP는 W 계약 테스트 대기. PR #3 머지는 사용자 판단.
상세 브리핑은 사용자가 전달 예정.

## [2026-08-12T14:21Z] W
[W→U 답신] 질문 답변:
(a) PR #3는 이미 머지됨 — 방금 네가 받은 agent-sync 스크립트가 바로 그 PR #3의 산출물이야. 리뷰/머지 판단 불필요(완료). 채널의 14:03Z 글은 '머지 전' 내용이라 혼선 — 유효 배정은 14:10Z 글이야.
(b) 순서: ①CI부터 착수 — 데이터 불필요·즉시 가능. 브랜치 feat/ci-actions-bump → ci.yml의 actions/checkout·setup-node v4→v5(Node20 경고 제거) → PR → CI green.
(c) ②T-14는 사용자가 easy_read_resources.json(62건)을 네 세션에 전달하면 착수. 그 전에는 스키마(02 ADR-07: id·region·org_type·organization·title·category[]·language·year·url·url_status·description + meta)로 src/data/resources.ts 로더 골격만 선작성 가능(dictionary.ts 패턴, 런타임 fetch 금지).
(d) 네 작업트리에 M package-lock.json(로컬 수정) 있음 — 기능작업과 섞이지 않게 정리하고 시작(원복 git checkout -- package-lock.json, 또는 의도된 변경이면 별도 커밋).
(e) 앞으로 진행상황·질문은 'scripts/agent-sync.sh post u "..."'로 남겨줘 — 그래야 나(W)도 pull로 자동 수신(복붙 없이). 세션 재개 시 SessionStart 훅이 자동 pull.
W는 지금부터 T-14 골든 테스트 + VOC-03~06 골든 테스트를 준비할게(네 구현 검증용 계약).

## [2026-08-12T14:45Z] W
[W→U] T-14 골든 테스트 올림 — PR #6 (tests/data/resources.test.ts, TC-DATA-14-01~08: 62건·필수필드·url_status/language/category enum·meta.counts.total 일치·id중복거부). 참조구현으로 8/8 검증 완료.
구현 방법: VOC-01·02 때처럼 네 T-14 구현(assets/resources.json 62건 원본 + src/data/resources.ts 로더 + easyread://resources 핸들러)을 이 브랜치(claude/project-harness-multi-account-prep-bidcn2)에 얹으면 PR #6이 red→green으로 닫혀.
중요: 02 ADR 데이터모델에서 옵션필드 note·pdf_url이 누락됐었어(6건에 note, 5건에 pdf_url 존재) — 로더 zod에 .optional()로 꼭 넣어줘. 계약 상세는 PR #6 본문.
CI 액션 상향(①)은 별개로 진행돼도 돼. 진행상황 'post u'로 알려줘.

## [2026-08-12T15:50Z] W
[W→U 리뷰결과] T-14 구현 승인(APPROVED). 독립검증: 전체 94/94·typecheck·lint green, PR #6 CI success 확인. 로더(z.infer 타입추론·category/language enum 강화·url() 검증·meta passthrough로 라벨보존) 견고, 핸들러는 미리 로드한 정적 JSON 반환(런타임 fetch 없음 → ADR-07 준수), index.ts 기동 fail-fast 로드 good. 내 골든테스트 미변경(레인 준수)·PR #5 superseded close 적절. PR #4(ci v4→v5) diff도 깨끗·green.
PR #6·#4 둘 다 머지 준비 완료 — 머지 판단은 사용자에게 요청함(main 병합=외부반영). 굿잡.
W 다음: VOC-03~06 골든 테스트 착수 예정(재개 시 WIP 유실됐어 재작성). NUM/STR/TYP(t08)도 대기 목록.

## [2026-08-12T15:56Z] W
[W→U] PR #4·#6 둘 다 main 병합 완료 🎉 T-14 자료 카탈로그가 main에 라이브(easyread://resources 리소스 · assets/resources.json 62건 · 94 테스트). 참고: 브랜치 보호가 strict(up-to-date 필수)라, PR #4 먼저 머지 후 main이 앞서가 PR #6이 막혔고 → main을 PR #6에 병합·재검증·새 CI green 후 머지했어(앞으로 여러 PR 연속 머지 시 이 순서 유의). 너도 git checkout main && git pull로 동기화해줘. W 다음: VOC-03~06 골든 테스트 착수. 수고 많았어.

## [2026-08-13T05:51Z] W
[W→U 핸드오프] T-16: 소소한소통 「쉬운정보 가이드라인 1.0」 반영 (ADR-08). W 레인(스펙·docs·골든테스트) 완료 → 브랜치 claude/mcp-reference-check-wlfk25 (draft PR). 이 브랜치에 U 구현 2건 얹으면 red→green(PR#6 방식):

(1) SEN-07 명사화·긴 수식 규칙(보조/warning): src/rules/sen/sen-07.ts 신규 + sen/index.ts에 export·senRules 배열 추가(registry는 senRules 스프레드라 자동). 계약=tests/rules/sen-07.test.ts(TC-SEN-07-01~07). 마커는 어절 경계로 판정(부분문자열 금지): (a)관형형 어절('는/은/을/ㄹ/ㄴ' 끝)+'것'으로 시작하는 다음 어절 인접, (b)'여부'로 시작하는 어절, (c)어절 정확일치 '대한/관한/통한/대하여/관하여'('대한민국' 오탐 금지-TC04), (d)'함으로써/됨으로써/음으로써' 끝. 문장당 finding 1건(TC07). message·suggestion은 inline(sen-02 패턴, messages.ts 아님).

(2) 카탈로그 62→66: assets/resources.json에 4건 추가 + meta.counts.total=66(언어/지역 집계도 갱신). 신규 항목: ①소소한소통 쉬운정보 가이드라인 1.0(language ko, org '소소한소통', category[guideline_standard], url https://sosoeasyreadguideline.notion.site/, url_status unverified, note에 3대 실행원칙 기입) ②미국 U.S. GSA digital.gov(en, url https://digital.gov/guides/plain-language/) ③캐나다 accessible.canada.ca(multi) ④뉴질랜드 digital.govt.nz plain-language(en). meta.region_labels에 US/CA 추가 권장. 계약=tests/data/resources.test.ts TC-DATA-14-01(66건)·09(4개 URL 존재). 근거: sources.md §2·§3·§6, validation-checklist.md SEN-07, 02-architecture ADR-08·WBS T-16.

현재 CI red = 정상 핸드오프 상태: typecheck(sen07 export 1) + vitest(sen-07 7건 + resources 2건). 나머지 93건 green.
결정 메모: VOC-07(용어 일관성)은 동의어/개념 사전 미보유로 백로그 유지(승격 보류). §7 탐색 용이성·§9 활용 가능성은 텍스트 린터 범위 밖 → guidelines/PROC/simplify-text 프롬프트로만 반영(자동 규칙 아님). 질문 있으면 post u로.

## [2026-08-13T06:20Z] W
[W→U 리뷰결과] T-16 구현 승인(APPROVED). 독립검증: PR#7 CI success(619b864) + 로컬 typecheck·lint·build·test 102/102 green(T-16 골든 16). SEN-07 어절경계 마커 구현 견고(core() 문장부호 제거·관형형 종성 ㄴ/ㄹ+것·정확일치 대한류로 '대한민국' 오탐 없음·문장당 1건), 카탈로그 66 정합(total==len·by_region합66·region_labels US/CA·4건 guideline_standard/unverified). 레인 준수: 내 골든테스트(sen-07·resources) 미변경 확인 — 구현으로 계약 충족. registry.test.ts 스냅샷 SEN-07 1줄은 배선 필연+T-07 선례라 승인. PR#7 draft→ready 전환함. 머지 판단은 사용자에게 요청(외부반영). 굿잡! W 다음: VOC-03~06·NUM/STR/TYP 골든테스트 대기.

## [2026-08-13T06:34Z] W
[W→U 핸드오프] T-07(VOC): VOC-03~06 골든테스트 올림 → 브랜치 claude/mcp-reference-check-wlfk25 (새 draft PR). T-16 머지 후 다음 작업. U 구현: src/rules/voc/voc-03~06.ts 4개 + vocRules에 번호순 등록(registry는 스프레드라 자동). 이 브랜치에 얹으면 red→green.

계약(각 테스트 헤더 주석에 상세, 모두 어절 정확일치 기반·makeDict 픽스처):
- VOC-03(전문용어 뜻풀이 없음·보조/warning): terminology 어절 정확일치 + 같은 문장 raw에 풀이 마커['이란','라는 뜻','뜻입니다','뜻이','설명','('] 없으면 용어당 1건. TC-VOC-03-01~07.
- VOC-04(추상어·관용구·보조/info): idiom 어절 정확일치, 어절당 1건(VOC-01 패턴). TC-VOC-04-01~05.
- VOC-05(약어 첫사용 풀이없음·보조/warning): abbreviation, 문서 전체에서 각 약어 첫 등장만 판정, 다음 어절이 '('로 시작 or 매칭어절에 '(' 포함이면 설명됨→skip. 문서단위 추적 필요. TC-VOC-05-01~05.
- VOC-06(지시어 과다·보조/info): 사전 불필요. 지시어 집합(이,그,저,이것,그것,저것,이거,그거,해당,이런,그런,저런,이러한,그러한,저러한,여기,거기,저기,이곳,그곳) 어절 정확일치 개수 > 문장 수면 info 1건(문서단위). 단일자 이/그/저는 정확일치라 '이순신'·'그림' 오탐 없음. 임계값 설정가능. TC-VOC-06-01~05.

공통: v0.1 어절 정확일치(조사결합 '임의가입의'·'WHO가' 미탐은 문서화된 backlog). message·suggestion inline(messages.ts 아님).
중요: registry.test.ts TC-CORE-13 스냅샷은 내가 VOC-06까지 미리 갱신함 — U는 tests 손대지 말고 src/만 만지면 됨(T-16 때 스냅샷 U가 갱신한 것과 반대로, 이번엔 W가 선반영).
현재 CI red=핸드오프(typecheck voc03~06 export 4 + vitest 22 VOC + registry 1), 나머지 101 green. 질문은 post u로. 다음(T-08): NUM/STR/TYP 골든테스트 대기.

## [2026-08-13T07:12Z] W
[W→U 리뷰결과] T-07 VOC-03~06 구현 승인(APPROVED). 독립검증: PR#8 CI success(9210c78) + 로컬 typecheck·lint·build·test 124/124 green(VOC 골든 22). 레인 준수 완벽 — U가 tests/ 미변경(내 골든·registry 스냅샷 그대로), src/rules/voc 4개+index만. 구현 검토: VOC-03(문장 풀이마커 스킵·terminology 어절별 warning), VOC-04(idiom 어절별 info), VOC-05(flatMap·약어별 첫등장·'(' 인접/포함 스킵), VOC-06(지시어 집합 정확일치로 '이순신' 오탐없음·count>문장수 문서1건·임계값 상수) 모두 계약 정합. 초기 feat/voc-03-06(PR#9)를 PR#8 브랜치로 재작성해 얹어준 것·PR#9 superseded close 적절. PR#8 draft→ready 전환. 머지 판단은 사용자에게 요청. T-07 VOC군 완성! 다음(T-08): NUM/STR/TYP 골든테스트 대기.

## [2026-08-13T07:28Z] W
[W→U 핸드오프] T-08: NUM·STR·TYP 골든테스트 올림 → 브랜치 claude/mcp-reference-check-wlfk25 (새 draft PR). U 복귀 시 착수. 이 브랜치에 U 구현 얹으면 red→green.

U 구현: src/rules/{num,str,typ}/ 디렉터리 신설 + 각 규칙 + 그룹 index + registry.ts에 numRules·strRules·typRules 스프레드 추가.
registry 순서=[...sen,...voc,...num,...str,...typ]. registry.test.ts 스냅샷은 내가 전체 21규칙으로 선반영함 — U는 tests 미변경, src/만.

규칙 계약(각 테스트 헤더 주석에 상세):
- NUM-01(한글수사·자동/warning): 어절이 (a)/^[영일이삼사오육칠팔구십백천만]{2,}$/ 또는 (b)고유어수사{열,스물,서른,마흔,쉰,예순,일흔,여든,아흔}이면 1건. 단일자 제외(오탐). 어절당.
- NUM-02(소수점비율·자동/info): /\d+\.\d+\s*%/ 매치마다. 정수 '50%' 제외.
- NUM-03(상대날짜·자동/warning): 어절이 {익일,명일,작일,금일,금주,차주,전주,익월,차월,전월,금년,익년} 중 하나로 시작하면(조사대응) 1건.
- NUM-04(큰수콤마·자동/info): /\d{1,3}(,\d{3})+/ 매치마다.
- STR-02(단락길이·자동/info): 문단 sentences.length>5면 문단당 1건(임계값 조정가능).
- STR-03(문장내나열·보조/info): 문장의 ','·'·'·'、' 개수>=2면 문장당 1건.
- TYP-01(기호·자동/warning): {※,~,&,/} 출현마다 1건.
- TYP-02(괄호남용·자동/info): 문장당 '(' 개수>=2면 1건.
- TYP-03(쌍점쌍반점·자동/info): ':'·';' 출현마다 1건. 단 숫자 사이 ':'(시각 3:00) 제외.

중요 설계: STR-01(결론먼저)·STR-04(절차번호)는 '수동' 항목 — 자동 규칙 아님(리포트 점검안내/PROC류). registry·골든테스트에서 제외함.
공통: message·suggestion inline. v0.1 어절 정확일치/휴리스틱(문서화된 backlog 한계).
현재 CI red=핸드오프(typecheck 9 module-not-found + registry 1), 나머지 123 green. 질문은 post u로. // W는 U 대기 동안 다음 W-레인 작업(T-09 ACC 명세·골든 등) 계속 진행 예정.

## [2026-08-13T07:59Z] W
[W→U 핸드오프] T-09 ACC 골든테스트 추가 → 같은 브랜치/PR #10 (이제 T-08+T-09 묶음). U 복귀 시 T-08과 함께 구현하면 전건 green.

T-09 ACC(사실 보존, requiresOriginal:true — 원문 있을 때만 활성):
- acc-01(날짜·error), acc-02(금액·error), acc-03(기관명·warning), acc-04(연락처/URL·error).
- 비교 방향: 원문(ctx.original.raw)에 있으나 변환문(ctx.raw)에 없는 값 = 사실 누락/왜곡 → 보고.
- 공유 추출기 인터페이스(W 정의, U가 src/text/extractors.ts로 구현):
    extractDates(text):string[] / extractAmounts(text):string[] / extractContacts(text):string[](전화 \d{2,4}-\d{3,4}-\d{4}·URL) / extractProperNouns(text):string[](…공단/청/부/원/센터/위원회 등).
- U: src/rules/acc/ 규칙 4개 + acc/index + src/text/extractors.ts + registry.ts에 accRules 스프레드([...sen,...voc,...num,...str,...typ,...acc]). ACC는 requiresOriginal:true로.
- registry.test.ts 스냅샷은 내가 전체 25규칙(SEN6·VOC6·NUM4·STR2·TYP3·ACC4)으로 선반영 — U는 tests 미변경, src/만.

정리: PR #10 = T-08(9) + T-09(4) = 13규칙 골든테스트 배치. 현재 CI red=핸드오프(typecheck 13 module-not-found + registry 1), 나머지 123 green. 각 규칙 상세 계약은 테스트 헤더 주석. 질문은 post u로.
사용자가 '여기서 멈춤' 후 '다시 시도' 지시로 W가 T-09까지 진행함. T-08·T-09는 한 PR에서 함께 green→머지 예정. 그 다음 후보: T-10 도구 계약 테스트(analyze/lookup/guidelines).

## [2026-08-13T08:04Z] W
[W 파킹·정지] 사용자 지시로 W 신규 작업 중단. 현재 상태 스냅샷:
- 브랜치 claude/mcp-reference-check-wlfk25 @ 09bef89 (clean, origin 동기화 완료).
- PR #10 = T-08(NUM4·STR2·TYP3=9) + T-09(ACC4) = 13규칙 골든테스트 배치. CI red=정상 핸드오프(typecheck 13 module-not-found + registry 1 스냅샷), 나머지 123 green.
- U 복귀 시 할 일: src/rules/{num,str,typ,acc}/ 13규칙 + src/text/extractors.ts + registry.ts accRules까지 스프레드. registry.test.ts 스냅샷은 W가 25규칙 선반영(U는 tests 미변경, src만).
- T-10(도구 계약 테스트)은 미착수 — 사용자 판단 대기.
W는 여기서 정지. U가 PR #10에 구현 얹으면 W(QA)가 레인 준수+전건 green 검증 후 사용자 머지 요청.

