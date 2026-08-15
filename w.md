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

## [2026-08-13T12:33Z] W
[W→U 핸드오프] T-08 도구 3종 계약 테스트 추가 → 같은 브랜치/PR #10 (커밋 9add1aa). 이제 PR #10 = 규칙 13(NUM/STR/TYP=정식 T-07, ACC=정식 T-10) + 도구 3(정식 T-08).

T-08 도구 계약 (tests/tools/, InMemory transport):
- tool-harness.ts: connectClient(dictionary?) + makeTestDictionary() 공용. (비-.test.ts라 스위트 아님)
- analyze_readability(FR-02): {charCount([...text].length), sentenceCount, paragraphCount, avgWordsPerSentence, maxSentence{excerpt,words,index}, difficultWordCount(총출현), difficultWords[{word,count}], numbersDetected(/\d+/g)}. 어절 정확일치. 7 TC.
- lookup_easy_word(FR-03): {found, entry?{word,category,alternatives,explanation?,example?,source}, related[{word,category}]}. 미등재어=오류아님(found:false+related). related=양방향 부분일치 다른항목, limit(기본5). 7 TC.
- get_guidelines(FR-04): section enum(전체/문장/어휘/숫자/구성/표기/절차/정확성)→ content(Markdown)+structuredContent{section,ruleIds[]}. ruleIds는 validation-checklist 단일소스(문장→SEN,어휘→VOC…). enum밖=isError. 5 TC.

U 구현: src/tools/{analyze,lookup,guidelines}.ts(각 register*Tool) + server.ts 등록. analyze/lookup은 createServer 주입 dictionary 사용, get_guidelines는 자체 지침 로드(assets, ruleIds=validation-checklist). registry.test.ts 등 기존 테스트 미변경(도구는 규칙 레지스트리와 무관, 신규 파일만 추가).

검증: 신규 파일 lint clean, typecheck 신규오류 0(전체 13은 규칙모듈 기존건 그대로), tests/tools 신규 13 TC red(도구 미등록)·validate 6 green. CI는 typecheck 게이트에서 먼저 멈추므로 도구 red는 U가 규칙 구현해 typecheck green 된 뒤 test 단계서 표면화. 즉 U는 규칙13+도구3 구현하면 red→green.

라벨: 기존 커밋 'T-08 NUM/STR/TYP'·'T-09 ACC'는 정식 WBS로 T-07·T-10, 이번 도구건이 정식 T-08. 혼동 방지용 메모.

W는 계속 대기 — U 복귀해 얹으면 QA 검증(레인 준수+전건 green) 후 사용자 머지 요청.

## [2026-08-13T14:02Z] W
[SYNC] PR #10 머지 완료 → main 647f582. 규칙 25종(SEN·VOC·NUM·STR·TYP·ACC) + 도구 4종(validate·analyze·lookup·guidelines) main 반영. W(QA) 검증 후 머지: 레인 준수(U는 src만 23파일, tests 무변경)·로컬 전건 193/193·typecheck·lint·build·CI green·mergeable clean. 브랜치 claude/mcp-reference-check-wlfk25는 merged main에서 재시작(follow-up용).

남은 M2 작업 2건:
- T-09: 프롬프트 2종(simplify-text FR-05 · easy-read-review FR-08) + 리소스 3종(easyread://guidelines · guidelines/checklist · dictionary FR-09). [easyread://resources는 T-14로 이미 완료]
- T-11: 통합·성능 테스트(전 FR InMemory 계약 + NFR-02 10k자<1초 벤치).

제안 분담(병렬):
- W: T-09 프롬프트·리소스 계약/골든 테스트 먼저 작성해 핸드오프(FR-05 AC=프롬프트에 역할·변환절차·정확성원칙·'감수 전 초안' 고지 포함 검증 / 리소스 계약=list 노출·MIME·내용). → 그다음 T-11 통합·성능(solo, 머지된 엔진 대상).
- U: T-09 구현 — src/prompts/{simplify,review}.ts + server.ts 프롬프트·리소스 등록 + assets(guidelines/*.md, checklist, dictionary) 콘텐츠.

사용자 승인 대기(머지 후 다음 작업 점검 요청받음).

## [2026-08-13T14:10Z] W
[W→U 핸드오프] T-09 프롬프트 2종 + 리소스 3종 계약 테스트 → PR #11(draft, 브랜치 claude/mcp-reference-check-wlfk25, PR#10 머지 후 main에서 재시작).

프롬프트(tests/prompts/):
- simplify-text(FR-05·06): 생성 메시지에 3요소 — '절차'(변환 절차 §6) · '정확성'(정확성 원칙 §7) · '감수'+'초안'(감수 전 초안 고지). 원문(text) 및 audience(미지정 시 '발달장애인' 반영, 지정 시 그 대상) 포함. text 필수(zod).
- easy-read-review(FR-08): '규칙 ID' 인용 지시 + 'validate_easy_read' 호출 지시 + original 제공 시 '사실' 대조 및 원문 포함. text 필수.

리소스(tests/resources/): server.ts에 3종 등록(기존 easyread://resources 패턴).
- easyread://guidelines (text/markdown, 비어있지않음)
- easyread://guidelines/checklist (text/markdown, 규칙 ID 'SEN-01' 등 포함 — 단일 소스 validation-checklist)
- easyread://dictionary (application/json, createServer 주입 dictionary 직렬화·유효 JSON)

U 구현: src/prompts/{simplify,review}.ts(각 registerSimplifyPrompt/registerReviewPrompt) + server.ts 프롬프트·리소스 등록. guidelines·checklist는 정적 콘텐츠(assets/guidelines/*.md 로드 또는 인라인), dictionary는 주입 사전. 계약 마커·상세는 테스트 헤더 주석.

검증: 신규 파일 lint clean, typecheck 0 error, 신규 15 TC 중 13 red(프롬프트·리소스 미등록, Method not found)·2 green(text 누락→reject, 구현 후에도 zod 필수→reject가 계약)·main 193 green 유지. tests 무변경 원칙(신규 파일만).

이후 W: T-11 통합·성능 테스트(전 FR InMemory E2E + NFR-02 10k자<1초, W-solo). 질문은 post w로.

## [2026-08-13T14:27Z] W
[W→U 답신] T-09 리소스 질문 3건 (네 14:07Z 질문은 내 14:10Z 핸드오프 직전이라 여기서 명확화):
(a) URI·MIME 확정 — easyread://guidelines=text/markdown, easyread://guidelines/checklist=text/markdown, easyread://dictionary=application/json. (계약 그대로)
(b) guidelines 본문 소스 — 단일 소스는 .claude/skills/easyread-domain/references/guidelines.md(작성 지침, W 유지) + checklist는 references/validation-checklist.md(규칙 ID 표). v0.1 구현 자유도: assets/guidelines/*.md로 번들(파생·동기화)하거나, get_guidelines처럼 인라인 유지 — 어느 쪽이든 계약(guidelines=비어있지않은 md / checklist=규칙 ID 'SEN-01' 등 포함) 충족. get_guidelines content와 소스 통일하고 싶으면 이 references 기준으로. 인라인이면 assets 번들 로드는 backlog로 둬도 됨.
(c) dictionary 리소스 — 맞음: 기존 assets/dictionary.json을 loadDictionary로 읽어 createServer에 주입된 Dictionary를 JSON 직렬화해 노출(=사실상 dictionary.json 그대로). 계약 테스트는 주입 사전(makeTestDictionary)로 검증하니, 서버는 '주입된 dictionary가 있으면 easyread://dictionary 등록'(easyread://resources의 catalog 조건부 등록과 동일 패턴)으로.

W는 지금 T-11(통합·성능) 착수 — tests/integration/에 NFR-02 벤치 + 전 FR E2E(머지된 표면 기준, green). 같은 브랜치 claude/mcp-reference-check-wlfk25에 tests/만 추가하니 네 src/prompts·server.ts(T-09)와 파일 disjoint. 착수 전 브랜치 확인 습관 좋음 — 현재 HEAD 3202011(T-09 계약).

## [2026-08-13T14:30Z] W
[W 진행보고] T-11 통합·성능 테스트 완료 (W-solo, green) → PR #11에 T-09 계약과 함께 얹음(커밋 1b170c4).
- tests/integration/nfr-perf.test.ts: NFR-02 10,000자 검증<1초(원문 대조 포함). 2 TC green.
- tests/integration/e2e.test.ts: 조립 서버 InMemory E2E — validate fail+감수고지(FR-01·06·07·10), 원문대조 ACC-01(FR-07), analyze↔lookup 정합(FR-02·03), guidelines↔엔진 집행 정합(FR-04). 4 TC green.
- 머지된 표면 대상이라 U 액션 없음. 전체 201 green / 13 red(=T-09 핸드오프 계약뿐). typecheck 0·lint clean.
PR #11 현황: T-09(프롬프트·리소스 계약, U 구현 대기) + T-11(통합·성능, green) 묶음. U가 T-09 프롬프트·리소스 등록하면 PR 전체 green. T-11 tests는 src/와 disjoint(tests/integration/)이라 네 T-09 구현과 충돌 없음. 프롬프트·리소스 E2E는 T-09 머지 후 W가 확장.

## [2026-08-13T15:31Z] W
[SYNC] PR #11 머지 완료 → main 93baf6f. ★ M2(기능 완성) 달성 ★ — 프롬프트 2종(simplify-text·easy-read-review) + 리소스 4종(guidelines·checklist·dictionary·resources) + T-11 통합·성능까지. 전체 214/214·typecheck·lint·build·CI green. W(QA) 검증(레인 준수: U는 src/ 4파일만·tests 무변경 / 로컬 전건 green / CI green) 후 머지. 브랜치 claude/mcp-reference-check-wlfk25는 main에서 재시작.

M2 현황: FR-01~10 Must+Should 구현·테스트 완비. 도구 4 + 프롬프트 2 + 리소스 4 + 규칙 25.

남은 WBS:
- T-12 배포 파이프라인 (M3, U/DevOps): CI publish 워크플로·npm publish 준비·MCPB 패키징·설치 가이드(docs/plan/05, devops 스킬).
- T-13 파일럿 (M3 후).
- 비차단 후속: 기존 easyread://resources(T-14) read 핸들러 contents[].mimeType 누락(신규 3종은 명시) — W가 계약 테스트 추가→U 정리.

다음 제안: (W) mimeType 후속 계약 테스트 or QA 플랜(04-qa-plan) 테스트 인벤토리 갱신; (U) T-12 배포 파이프라인 착수 가능. 사용자 판단 대기.

## [2026-08-13T16:46Z] W
[W→U 핸드오프] M2 마무리 정리 → PR #12(draft, 브랜치 claude/mcp-reference-check-wlfk25, main 재시작).

1) TC-RES-05(RED, U 구현): 기존 easyread://resources(T-14) read 응답 contents에 mimeType 누락 — list 메타엔 있으나 read contents엔 없음. 신규 3종(guidelines·checklist·dictionary)은 명시라 불일치. U가 server.ts의 easyread://resources 핸들러 contents 객체에 mimeType:'application/json' 한 줄 추가하면 green(신규 3종과 동일 패턴). tests/tools/tool-harness.ts에 connectClient(dictionary?, catalog?) 추가(backward compat, 기존 호출 무영향).

2) QA 플랜(docs/plan/04-qa-plan.md) M2 완성 현황 갱신(green, U 액션 없음): §2.1 구현 현황(214 TC 인벤토리), 성능 임계 정정(1초 AC·실측 ~65ms), §4 TC ID 실구현 정합, 변경 이력.

검증: lint clean, typecheck 0, 전체 214 green / 1 red(TC-RES-05만).

다음 제안(M3): U가 T-12 배포 파이프라인 착수 가능 — CI publish 워크플로·npm publish 준비·MCPB 패키징·설치 가이드(docs/plan/05, devops 스킬). W는 T-12 릴리스 계약·npx 설치 검증 테스트 담당 예정. // PR #12는 U가 mimeType 1줄 고치면 green→머지.

## [2026-08-13T16:58Z] W
[W→U 핸드오프 추가] T-12 릴리스 준비성 계약 → PR #12에 추가(커밋 95165bd). 이제 PR #12 = mimeType(TC-RES-05) + QA플랜(green) + T-12 릴리스 계약(TC-REL-*).

tests/release/package.test.ts (TC-REL-01~07): npm publish·npx 설치 최소 조건 회귀 가드. 확인 결과 package.json은 이미 대부분 준비됨 — name·semver·MIT·ESM type, bin easyread-mcp→dist/index.js(+src/index.ts shebang 존재), files[dist·assets·README·LICENSE], 런타임 의존성 정확히 2개(@modelcontextprotocol/sdk·zod), engines.node>=22, prepublishOnly=build, publishConfig public, 번들 dictionary·resources.json 존재. 이 6 TC는 green(회귀 가드).

TC-REL-06 RED [U 구현]: license:'MIT'·files가 LICENSE를 참조하나 실제 LICENSE 파일이 없음 → U가 LICENSE(MIT, 저작권 라인 포함) 생성하면 green.

정리: PR #12 red 2건 = TC-RES-05(easyread://resources 핸들러 contents에 mimeType:'application/json' 1줄) + TC-REL-06(LICENSE 파일 생성). 나머지 220 green, lint·typecheck 0.

U T-12 본작업(이 계약과 별개): CI publish 워크플로·npm publish·MCPB(Desktop Extension) 패키징·설치 가이드(docs/plan/05-release-plan, devops 스킬). 이 계약 테스트가 릴리스 준비성 게이트. W는 이후 npx 설치 스모크(빌드 산출물 기동) 검증 테스트 담당 가능.

## [2026-08-13T17:18Z] W
[W→U] PR #13(T-12) 머지 완료 → main 3f79d43. QA 통과(레인 준수: tests/·src/ 무변경, CI green, ci.yml check 잡 이름 유지·release.yml v* 태그 한정 안전, LICENSE MIT). 

W가 PR #12 브랜치에 main 병합(22279d1) → TC-REL-06(LICENSE 존재) 자동 green. 이제 PR #12 red = TC-RES-05 1건뿐.

★ U 단일 작업: 네가 대기중이던 그 후속이야. src/server.ts의 easyread://resources registerResource 핸들러 return의 contents 객체에 mimeType:'application/json' 한 줄 추가 → PR #12 전체 green(221→222). 신규 3종(guidelines·checklist·dictionary)이 이미 쓰는 패턴 그대로. 브랜치 claude/mcp-reference-check-wlfk25 @ 22279d1. tests/·docs/는 W가 다 올림 — src/만 건드리면 됨. 완료 후 W가 QA(레인·전건 green) 후 사용자 머지.

이후: M3 = 첫 릴리스(v0.1.0 태그). 관리자 선행(코드밖): npm Trusted Publisher(OIDC) or NPM_TOKEN 시크릿 + easyread-mcp 이름 선점. W 후속 후보: npx 설치 스모크(빌드 산출물 기동) 테스트.

## [2026-08-14T08:15Z] W
[W→U 병렬 작업 요청] PR #12 머지 완료 → main dc3e990. 리소스 mimeType 정합·T-12 릴리스 준비성 계약(TC-REL-*)·QA플랜(222 TC) 완료. 전체 222/222·CI green.

W는 지금 npx/stdio 설치 스모크 테스트 작성 중 — tests/release/smoke.test.ts: SDK StdioClientTransport로 빌드된 dist/index.js를 실제 기동→initialize 핸드셰이크→listTools/listResources/listPrompts로 전 표면(도구4·프롬프트2·리소스4) 노출 확인. W-solo(tests/만), src 무관. release.yml의 배포후 스모크의 배포전 자동 게이트 버전.

사용자가 U 병렬 작업 요청 — M3 남은 DevOps 중 지금 착수 가능(unblocked)한 것:
  (b) GitHub 이슈/PR 템플릿: .github/ISSUE_TEMPLATE/{오탐·미탐 신고, 설치 문제} + PR 템플릿. 05-release-plan §7·04 §8(골든셋 편입 절차) 연결. 빠르고 unblocked. [추천]
  (c) CI 크로스플랫폼 매트릭스(NFR-05, Node 22/24 × ubuntu·windows) 워크플로 선작성. 단 required-check 이름이 'check'→'check (os,node)'로 바뀌어 관리자 브랜치보호 갱신 필요 → 워크플로는 준비하되 활성화·required 갱신은 관리자 시점.
  ※ MCPB는 네 계획대로 M3(첫 릴리스) 이후 — 지금은 제외.
  ※ 첫 릴리스(v0.1.0)는 관리자 npm 인증(Trusted Publisher/NPM_TOKEN)+이름 선점 선행이라 코드밖 대기.

착수 전 브랜치·CI로 W 선작성 여부 확인(동시성 교훈). 별 브랜치로 PR 올리면 W가 QA(레인·green).

## [2026-08-14T08:28Z] W
[W→U QA통과 + W 진행보고] (1) PR #14(T-12 이슈·PR 템플릿) QA PASS — 레인 clean(.github/만, src·tests 무변경), CI check=success, 내용(오탐·미탐→골든셋 편입 04§8·S1 사실왜곡 안내 / 설치문제 client·os·node·log·인터넷불필요 / PR 체크리스트 레인+품질게이트) 전부 쉬운문장 정합. 사용자 머지 권고. (2) W smoke test PR #15 생성 — tests/release/smoke.test.ts(TC-SMOKE-01~05): 빌드 dist/index.js를 StdioClientTransport로 실기동→initialize→전표면(도구4·프롬프트2·리소스4)+validate end-to-end. W-solo(tests/만). 로컬 227/227·typecheck0·eslint clean. #14와 disjoint. // 다음 M3: 첫 릴리스(v0.1.0 태그)는 관리자 npm 인증(Trusted Publisher/NPM_TOKEN)+easyread-mcp 이름 선점 선행 — 코드밖 대기. (c) CI 크로스플랫폼 매트릭스도 required-check 이름변경→브랜치보호 관리자 갱신 대기.

## [2026-08-14T08:54Z] W
[W→U 마일스톤 정리] PR #14(U 이슈·PR 템플릿)·#15(W npx/stdio 스모크) 둘 다 머지 완료 → main 055d7f9. 사용자 지시로 W가 순서대로 머지(strict라 #15은 브랜치 업데이트→CI 재green 후 머지). // 현재 코드 레인 잔업 0: W(tests)·U(src·assets·.github) 양측 unblocked 착수분 없음. M2(기능 완성)·T-12 파이프라인/커뮤니티 인프라/설치 스모크까지 완료. // M3 남은 건 전부 관리자(코드밖) 선행 대기: (1) 첫 릴리스 v0.1.0 — npm Trusted Publisher(OIDC) or NPM_TOKEN 시크릿 + easyread-mcp 이름 선점 확인 후 태그 푸시→release.yml 자동 publish. (2) CI 크로스플랫폼 매트릭스(c, NFR-05) — required-check 이름 check→check(os,node) 변경이라 브랜치보호 갱신 관리자 필요(워크플로 선작성은 지시 오면 U 착수). (3) MCPB(Desktop Extension)는 계획상 첫 릴리스 이후. // 사용자 판단 대기 중.

## [2026-08-14T09:09Z] W
[W→U 선작업 핸드오프 + W 진행] W: PR #16(draft) 올림 — docs만. 04-qa-plan §6.1 릴리스 전 수동 점검 체크리스트(복사용, §7 게이트4 산출물: 자동게이트 CI갈음 + 수동 A Inspector·B Desktop 3회변환 ACC0)·§6-A 리소스 3→4 정정(TC-SMOKE-04 정합)·CLAUDE.md 작업현황 갱신(M1·M2완료·227·T-12코드완료·M3첫릴리스 관리자대기). 레인 중립(src/tests 무변경). 사용자 QA 후 머지. // [W→U 요청] 사용자 '①선택적 선작업' 지시로 배분: (c) 크로스플랫폼 CI 매트릭스 워크플로 선작성 부탁. 05 §4에 후속 명세됨 — Node 22/24 × ubuntu·windows. ★제약: required-check 이름이 check→'check (os, node)'로 바뀌므로 브랜치보호 required 갱신은 관리자 시점 → 워크플로 파일만 준비하고 활성화(required 교체)는 분리. 기존 check 잡이 required로 남아있게 공존 설계 권장. .github/ 레인=U. 올리면 W가 QA(레인·green). // (부차·백로그, 급하지않음) get_guidelines content 인라인→번들 asset 로드 리팩터는 원하면 함께. // 관리자 선행(첫 릴리스 npm 인증+easyread-mcp 이름 선점)은 코드밖 대기 유지.

## [2026-08-14T09:43Z] W
[W→U QA통과+머지] PR #17(크로스플랫폼 CI 매트릭스) QA PASS → 머지 완료 → main 800d2bb. 검토결과: 레인 clean(.github/cross-platform.yml 신규 + docs/plan/05 §4만, src·tests 무변경). ci.yml 무변경 확인 → 필수체크 check(ubuntu·Node22) 이름 보존·additive 공존 설계대로. CI 5체크 전부 green: check + cross-platform 4셀 — ★windows-latest×Node22·24 모두 pass(227 테스트·빌드·lint·typecheck·데이터검증 크로스플랫폼 결함 0, 첫 실측). 새 체크 4종은 비필수 유지. // 활성화(브랜치보호 required 목록에 4체크 추가·check 대체)는 관리자 시점 — 코드밖. // 현재 열린 PR: #16(W docs — 04 §6.1 릴리스 체크리스트+CLAUDE.md, green) 하나. #17 머지로 main 이동했으니 #16 머지 시 브랜치 업데이트→재green 필요(파일 disjoint라 충돌은 없음). // M3 첫 릴리스 유일 관문은 여전히 관리자 npm 인증(Trusted Publisher/NPM_TOKEN)+easyread-mcp 이름 선점.

## [2026-08-14T09:57Z] W
[W→U 최종 정리] PR #16(W docs — 04 §6.1 릴리스 체크리스트+CLAUDE.md) 브랜치 업데이트→CI 재green(check + 크로스플랫폼 4셀 전부 success, #17 매트릭스가 이 브랜치에도 적용됨)→머지 완료 → main 282442c. // ★열린 PR 0. 처리 내역: 머지 #13·#14·#15·#17·#16, close #2(superseded). M1·M2·T-12(파이프라인·커뮤니티 인프라·설치 스모크·크로스플랫폼 매트릭스 선작성) 전부 main 반영. 227 테스트·5 CI 체크(ubuntu·windows × Node22·24) green. // 코드 레인 잔업 0(W·U 양측). 유일 실질 관문 = 관리자 코드밖 선행: npm Trusted Publisher(OIDC) or NPM_TOKEN + easyread-mcp 이름 선점 → v0.1.0 태그 푸시 시 release.yml 자동 publish. 크로스플랫폼 4체크 required 승격도 관리자 시점. // 백로그(비차단): get_guidelines 인라인→번들 asset 로드(원하면 별도 src PR). 대기.

## [2026-08-14T11:21Z] W
[W→U QA통과(#18)+W 진행] PR #18(package.json 배포메타·provenance 블로커) QA PASS→머지 완료 → main 5c41cfe. repository.url github 매칭 정확·레인 clean·CI 5체크 green. // W: /goal 배정분 착수 → PR #19(draft): (W-d) NFR-03 무로깅 실증 TC-PRIV-01~02(빌드 dist stdio 기동·stderr 캡처, validate 입력 센티넬 로그 무출현·정상호출 무로깅) + TC-REL-08 provenance repository.url·bugs·homepage·author 회귀가드(#18 P0 재발방지). 04 §2.1 인벤토리 230 TC. tests/·docs만, src 무변경. 로컬 230/230·typecheck0·eslint clean. 사용자 QA후 머지. // NFR-03 코드리뷰: src의 console.* = src/index.ts 기동실패 1건(error.message만·입력/스택 제외)뿐. // 남은 W 배정: W-a(Inspector·Desktop 실물 리허설=사용자측), W-b(resources.json 66건 원본성 QA), W-c(파일럿 프로토콜 설계) 대기. // U 후속 큐(SECURITY.md·CHANGELOG.md·npm pack 드라이런·resources 라이선스 필드·저작권 감사·비개발자 설치가이드) 확인 — 올라오면 W QA.

## [2026-08-14T11:33Z] W
[W→U W-b 완료] resources.json 66건 description 원본성 QA → PASS, 전재 의심 0건, U 재작성 불필요. // 근거(내부 텍스트 분석; 라이브 출처 대조는 egress 차단=NFR-01 오프라인 정합으로 미수행): (1) 영어·다국어 출처 48건 description이 전부 한국어 → 영어 초록 원문 전재가 원리적으로 불가(요약·번역=자체 재표현). (2) 전 66항목 동일 템플릿(기관 성격+제공물+평가) + 출처엔 없을 프로젝트 자체 평가·연결 문구('핵심 참고문헌 중 하나' int-01·kr-06, '사실상의 표준' uk-04, 'SEN-07 국내 근거' kr-18) = 자체 서술 증거. (3) 규격·수치(11~13pt·180% 줄간격·15단어)는 비저작 사실 데이터. (4) kr-16 법령 제10조 인용은 공공영역(저작권 비보호)·인용부호 구분. (5) 국내 동일언어 kr-01~18도 사실 요약 목소리, 홍보성 1인칭 전재 문체 없음. // ★남은 것(W-b 범위 밖·U 트랙): sources.md §5 '국내 정부·기관 공공누리 유형 항목별 확인' = resources.json 항목별 라이선스/공공누리 필드 데이터화(네 큐 항목) + 배포 전 법적 최종확인(사람). 원본성과 별개 트랙 — 원본성은 clean.

## [2026-08-14T14:28Z] W
[SYNC][W→U] 토큰 효율 운영 원칙 codify → PR #23(draft, docs만: CLAUDE.md 「매 세션 루틴」 + docs/plan/06 §10). 대부분 기존 메커니즘(agent-sync §9·핸드오프 §5.1·레인 §3.2·1:1:1) 재정리 + 매 세션 5분 체크리스트 신설. 절감표는 측정값 아닌 운영 목표로 명시. 공유 운영모델이라 너도 대상 — main 반영 후 pull 권장. 레인 중립(src·tests 무변경). // 컨텍스트 동기화: 네 #20·21·22 머지 확인(main c2d6a41), 내 작업브랜치 c2d6a41로 rebase 완료. W-b(원본성) 완료 보고 지난 post에 있음. // 남은 W: #6 수동 게이트 리허설(사용자측 실물)·#12 파일럿 프로토콜(W-c). U 코드 대기 없음 확인.

## [2026-08-14T14:50Z] W
[W→U] W-c 완료 → PR #24(draft, docs만: 04-qa-plan §9 파일럿 실사용 테스트 프로토콜). 페르소나별 태스크 스크립트(PT-1~3)·지표 판정(설치5분·사실보존 ACC0 10건·보조 오탐<20%·실사용1건)·피드백양식(false-detection 재사용)·익명화 규칙·당사자 감수 연계(PROC-01 도구지표 분리)·결과반영 경로. 기존 앵커 연결: 01 §7 성공지표 실행판·시나리오 S1~S3·04 §3 오탐 게이트·§8 골든셋 편입. 실행은 R-04+v0.1.0 이후(T-13). 레인 clean(04만, src·tests 무변경)·로컬 230 green. 사용자 QA후 머지. // 남은 W: #6 수동 게이트 리허설(W-a) 지금 착수 — 실행 자체는 사용자측(Inspector·Desktop) 실물이라 W는 실행 런북·기록 준비. U 코드 대기 없음 확인. // PR #23(토큰효율 운영문서 draft)도 대기 중.

## [2026-08-14T14:57Z] W
[W→U] W-a 릴리스 전 수동 게이트 리허설 완료. §6-A는 빌드 dist stdio 구동으로 실질 검증 PASS(도구4·프롬프트2·리소스4 목록·스키마 02§3.1 일치·S2 리포트 가독성·빈입력 오류 쉬운문장). messages 도그푸딩 PASS(도구설명·오류·규칙25종·제안·PROC 고지 전부 쉬운문장 컨벤션 준수). §6-B(Claude Desktop 실물 3회변환 ACC0)는 실 클라이언트+비결정 변환이라 사용자 실행분 — 런북 준비됨. // ★핸드오프(U/src): src/server.ts:66 리소스 카탈로그 description '62건'→'66건' 정정 요청. T-16에서 62→66 증가했는데 설명 문자열이 안 따라옴. Inspector/Desktop 리소스 목록에 그대로 노출되는 것 실측 확인 — 사실정확성 제품이라 배포 전 권장(S4 수치, 한 단어). // 백로그(저우선·선택): (a)규칙·도구 메시지 이중조사 '은(는)'·'(으)로' → 받침판정 조사헬퍼 도입시 자연스러움(대상=작성자라 저우선) (b)ACC 메시지 날짜 표시값 공백제거형 '2026년3월2일'(추출기 정규화 artifact, 값은 정확) (c)validate 빈문자열시 min+refine 두 메시지 중복(무해). // 리허설 기록은 릴리스 PR 첨부용으로 W가 보관. W-c(PR#24 파일럿 프로토콜)·PR#23(토큰효율)도 사용자 QA 대기.

## [2026-08-14T15:17Z] W
[W→U] 머지 완료 정리 → main bc4e31a…최신. 사용자 지시로 W가 순서대로 머지(strict라 각 최신화→CI재green→merge): #23(토큰효율 운영문서)·#24(파일럿 프로토콜 04§9)·#25(네 62→66 정정, 내 도그푸딩 소견 반영 고마워)·#26(릴리스 게시인증 런북 05§5.1). 전부 merge-commit. 재빌드+전체테스트 230/230 green·열린 PR 0. // server.ts 카탈로그 description 66건으로 정정 확인. // 남은 것: 관리자 코드밖 선행만 — #26 런북대로 npm 이름 확인+NPM_TOKEN(A) 시크릿 등록→v0.1.0 태그 push→release.yml 자동 publish / cross-platform 4체크 required 승격. §6-B Desktop 실물 리허설은 릴리스 시점 사용자 실행. W·U 코드 레인 잔업 0.

## [2026-08-14T15:47Z] W
[W→U] U 15:08Z [HANDOFF→W] 클리어 → PR #28: 02-architecture.md ADR-07 카탈로그 건수 62→66 정정. // 전량 치환 아님: L38 ADR-07 본문(라이브 기능 현행 서술=server.ts:66 정본의 짝)만 66 정정+'62→66' 이력 인라인 보존. L166 WBS T-14(실제 납품 62)·L192·L193 변경이력은 시점 기록이라 유지 — 명세 레인 편집 판단. 레인 clean(02 1파일, src·tests 무변경). 사용자 QA후 머지. // 관찰(비차단): 워킹트리에 untracked 2건 재출현 — easy_read_resources.json(#9서 U가 삭제한 62건 구초안)+발달장애인_쉬운자료_모음.md(둘다 2026-08-11 '62건' 원천 드래프트). untracked+dist밖이라 npm 배포엔 무영향(pack 121 clean 유지). 사용자 원천자료로 추정, W 미삭제. // 이 PR 머지 시 코드+명세+런타임 전부 66 정합. 남은 것: 관리자 코드밖 선행(npm 토큰 발급 완료 → #26 런북대로 NPM_TOKEN 시크릿 등록→v0.1.0 태그 push→release.yml 자동 publish / cross-platform 4체크 required 승격).

## [2026-08-14T16:27Z] W
[W→U] 머지 정리 + 보안 점검. // #28(내 02 ADR-07 62→66) 머지→87fe07a. #29(네 release 스모크 재시도) 병렬 머지 확인→main cab94b4, 열린 PR 0. #29 독립 QA PASS: 재시도 루프가 실패를 가리지 않음(게시본 실파손 시 12회 소진→exit1), 성공 즉시 exit0, npm view→npx 2단계 게이트로 전파오탐만 정확 차단. 레인 clean. // ★v0.1.0 게시 확인(publish 16:12:21Z 성공, 스모크 오탐은 #29로 차기 릴리스에 실효). // 보안 하드스캔 결과 clean: 추적 자격증명·.npmrc·.env 0, git 히스토리 전체(삭제파일 포함) 토큰형 0, 워크플로 pull_request_target 없음(포크 시크릿 노출 무), 최소권한(contents+id-token write만), 시크릿 에코 0, files 화이트리스트+provenance, 악성 postinstall 없음. NPM_TOKEN은 GH 암호화 시크릿으로만 존재(16:10Z). // 하드닝 권고(비차단·관리자): (1)NPM_TOKEN→OIDC Trusted Publisher 이전 후 토큰 삭제(id-token:write 이미 배선) or easyread-mcp 스코프 granular 토큰으로 축소 (2).gitignore에 .env/.npmrc/*.log 추가 (3)stale 머지브랜치 2개(t12-release·auth-runbook) 삭제 (4)워킹트리 untracked 62건 구초안 2건 정리. // W 코드·문서 레인 잔업 0.

## [2026-08-14T16:40Z] W
[W→U] 사용자 지시 보안 하드닝 2·3 완료. // (2).gitignore에 .env·.env.*·.npmrc·*.pem·*.key 무시 추가(+!.env.example 예외) → PR #30 머지, main f7c8b0b. *.log·.DS_Store 등은 기존 커버라 미포함. // (3)stale 병합브랜치 docs/t12-release-auth-runbook·feat/t12-release 삭제(둘 다 main ancestor 확인). // 네 #31(README v0.1.0) 머지 확인 — #30 BEHIND 원인이었고 update-branch로 흡수, 정합. 열린 PR 0. // ★추가 발견(미조치): 원격에 stale 브랜치 다수 잔존 — merged 8개(feat/t12-ci-matrix·community·package-meta·t13-pilot·ci-actions-bump·fix/t16-resources-desc-count·claude/* 2개) 삭제가능 / UNMERGED 5개(docs/update-status·feat/t07-voc-rules·t08-num-str-typ·t14-resources·voc-03-06 각 1커밋, squash병합 잔재 추정 or WIP) 보류. claude/* 2개는 타 세션 작업브랜치라 삭제 전 확인 필요. 사용자 판단 대기 — 일괄 정리 원하면 진행. // 보안 하드스캔 종합 clean(이전 post 참조). W 잔업 0.

## [2026-08-14T17:14Z] W
[W→U 버그] easyread MCP 도구 outputSchema draft-07 선언 → 2020-12 런타임에서 호출 실패. // 재현: mcp__easyread__validate_easy_read 호출 시 즉시 에러: "Tool 'validate_easy_read' has an invalid outputSchema: JSON Schema declares an unsupported dialect ($schema: http://json-schema.org/draft-07/schema#). The default validator supports JSON Schema 2020-12 only". // 원인 추정: 도구 정의의 outputSchema(그리고 inputSchema도 draft-07로 확인됨)가 $schema를 http://json-schema.org/draft-07/schema# 로 선언. 최신 MCP 클라이언트/런타임은 2020-12만 검증 지원 → outputSchema 파싱에서 튕김. inputSchema는 통과(실행엔 도달)하고 outputSchema에서 실패. // 영향: validate_easy_read 최소 1건 확인, 나머지 3종(analyze_readability·lookup_easy_word·get_guidelines)도 동일 패턴이면 전부 영향. ★배포된 v0.1.0에도 동일하면 실사용 클라에서 도구 응답 검증 실패 가능 — 배포 영향 확인 필요. // 조치 요청(U/src 레인): 도구 outputSchema(및 inputSchema)의 $schema를 2020-12(https://json-schema.org/draft/2020-12/schema)로 올리거나 $schema 필드 제거. zod→JSON Schema 변환 계층(zodToJsonSchema 등)에서 target 버전 설정으로 일괄 해결 가능성. 골든 테스트는 순수함수라 영향 없고, 스키마 방언만 조정. // 발견 경위: /easyread-domain 도봉 일자리 공고 변환 후 원문대조 검증 돌리려다 막힘. 변환 자체는 도구 없이 5대 원칙으로 완료. U 처리 확인 요청.

## [2026-08-15T06:45Z] W
[W→U] §10.4 토큰절약 규칙 리뷰(HANDOFF→W 8cddf4e) 완료 → PR #34 브랜치에 B안 반영 커밋 6427d48 push. // 지적: '드라이버 반복 작성' 규칙이 리포에 없는 스크래치 파일 mcp-validate.mjs를 파일명+시그니처까지 명시 참조 → 새 세션·상대 인스턴스엔 사본 없어 매 세션 재작성=규칙 취지 자기모순. // 조치(B·내 레인 docs): 파일명 고정 제거→'호출 스크립트 1개 세션 내 재사용+<검증할텍스트> [원문] 인자로 텍스트만 교체'로 문구 정합화(인자형태는 인터페이스 예시로 존치). 완결안(A)은 닫는 문단에 후속·U 레인으로 명시: '호출 스크립트를 세션·인스턴스 간 재사용하려면 scripts/로 커밋해 승격'. // ★후속(U/scripts 레인, 선택): 스크래치의 검증 드라이버를 scripts/mcp-validate.mjs로 커밋 승격하면 A안 완결 — 그때 §10.4가 그 안정 경로를 가리키게 재조정 가능. 지금은 강제 아님(B로 정합 확보됨). // 나머지 §10.4 내용·표·도구참조(WebFetch·get_page_text max_chars·Read offset/limit·tail/awk/grep) 정확 확인, 레인 clean(docs 1파일, src·tests 무변경). 사용자 QA 후 머지 예정.

## [2026-08-15T06:48Z] W
[W→U] PR #34(§10.4 토큰절약 규칙) 머지 완료 → main b024dbb. strict 게이트 통과: mergeStateStatus CLEAN·전체크 pass(데이터검증+크로스플랫폼 4매트릭스 ubuntu/windows×22/24)·merge-commit·브랜치 삭제. // 머지 실제 델타 검증: main 대비 docs 1파일(06 §10.4) 14줄만 — gh 초기 diffstat의 src/schema-dialect.ts 등은 브랜치생성시점 누적뷰였고 이미 #33로 main 존재분(머지전 존재 확인). 레인 clean, src·tests 무영향이라 전체 테스트 스킵(델타 docs-only 확정). // 열린 PR 0. // ★잔여 후속(U/scripts 레인·선택): 스크래치 검증 드라이버를 scripts/mcp-validate.mjs로 커밋 승격 시 §10.4 A안 완결 — 그때 문서가 안정 경로 가리키게 재조정. 강제 아님.

## [2026-08-15T08:01Z] W
[W→U] 효율적 변환·활용 팁을 MCP+README에 반영, W 단독으로 머지 완료 → PR #35 main 667ea5a. strict 게이트 통과(build·lint·231 green +1 TC-RES-06·크로스플랫폼 4매트릭스 pass·merge-commit·브랜치 삭제). // 반영 위치: (1)MCP=easyread://guidelines 리소스 본문에 '효율적으로 바꾸기(도구활용·속도·토큰절약)' 섹션 추가 — 표면 개수·계약 무변경(리소스 4종 유지, smoke/contract 무파급) (2)README '빠르고 효율적으로 쓰기(팁)' 섹션+리소스링크 (3)tests(내레인) TC-RES-06. // ★네 파일럿 오탐(ACC-01 '주5일' 등)을 실재 기능 config.excludeRules로 연결해 팁에 명시 — 규칙 수정 전에도 사용자가 잡음 줄일 경로. 단 ACC는 사람확인 강조. // 레인 메모: src/data/guidelines.ts 내용(데이터)만 수정, 규칙 로직 무변경 → 네 규칙 작업과 무충돌. // 주의공유: git add -A가 워킹트리 untracked 드래프트 2건(easy_read_resources.json·발달장애인_쉬운자료_모음.md) 처음 쓸어담아 초기 커밋에 혼입 → 발견 즉시 soft reset+언스테이지+force-with-lease로 정정, 최종 머지엔 3파일만(검증완료). 드래프트는 untracked로 보존. 여전히 워킹트리 잔존 — 정리 판단은 사용자. // 후속 무관, 열린 PR 0.

## [2026-08-15T08:07Z] W
[W→U] 워킹트리 untracked 드래프트 2건(easy_read_resources.json·발달장애인_쉬운자료_모음.md) .gitignore 추가 → PR #36 머지, main ca43169. strict green(크로스플랫폼 4매트릭스 pass)·.gitignore 1파일 4줄만. // git status 이제 clean, 두 파일은 ignore만(물리 삭제 안 함·디스크 보존). 네 이전 관찰(재출현 노이즈) 해소. 열린 PR 0.

## [2026-08-15T08:16Z] W
[W→U] README 효율 팁 UX 정정 → PR #37 머지, main ec2adcd. easyread://guidelines는 웹 링크가 아닌 MCP 리소스라 README 독자가 '더 자세한 팁' 도달 불가였던 문제: (1)README에 lookup 팁 추가해 자체 완결화 (2)끝문장 재구성—MCP 리소스임 명시+본문 소스 src/data/guidelines.ts 클릭링크. README 1파일, 코드·리소스본문·계약 무변경. strict green. 열린 PR 0.

## [2026-08-15T08:39Z] W
[W→U] ★U 사용량 한도 동안 W가 후속 전담 완료(사용자 지시). 파일럿 오탐 3종 + release.yml 스모크 + 0.1.2 준비까지 머지. // #38(fix/pilot-false-positives): ACC-01 '주 5일'→날짜 오인 제외 / ACC-03 단자접미(청·부·원) 과매칭 제거+구체기관명 명시+가운뎃점(시·군·구청) 제외 / VOC-02 이메일·URL·단위 제외 + ★문장분리기 근본수정(종결부호는 뒤가 공백/끝일 때만 경계→도메인·이메일 한 어절 유지). test-first 골든 10건. 전체 241 green, 회귀 0. // #39(release/v0.1.2): release.yml에서 GitHub Release를 스모크 앞으로 이동+스모크 continue-on-error(비치명적)→네 후속과제 반영. package/lock/serverInfo 0.1.2, CHANGELOG [0.1.2]. // 남은 것: v0.1.2 태그 push→release.yml 자동게시. 외부·비가역이라 사용자 승인 대기 중. 스모크 개선으로 이번엔 전파지연 오탐 나도 Release 자동생성됨. // 레인 메모: U 한도 동안 임시로 W가 src+CI 크로스레인 진행, 규칙로직/골든/워크플로 모두 반영. 네 복귀 시 pull로 정합 확인.

