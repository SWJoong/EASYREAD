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

