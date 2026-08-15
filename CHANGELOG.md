# 변경 이력 (Changelog)

이 파일은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따르며,
버전 규칙은 [유의적 버전(SemVer)](https://semver.org/lang/ko/)을 따릅니다.
버전 판정 기준은 [docs/plan/05-release-plan.md](docs/plan/05-release-plan.md) §3을 참고하세요.

## [Unreleased]

## [0.1.2] - 2026-08-15

### Fixed
- **파일럿 규칙 오탐 3종**: 실공고 변환 파일럿에서 나온 규칙 오탐을 수정(골든 테스트 10건 추가).
  - **ACC-01**: "주 5일"(근무 빈도)의 '5일'을 날짜로 오인해 거짓 `error`를 내던 문제. 바로 앞이 '주'인 'N일'은 날짜에서 제외(독립 'N일'은 계속 탐지).
  - **ACC-03**: 흔한 명사(모집인원·일부 등)를 기관명으로 오인하던 과매칭. 단자 접미('청'·'부'·'원')를 제거하고 구체 기관명(경찰청·국세청·소방청·병원·법원)을 명시. 가운뎃점 압축표기(시·군·구청)는 후보에서 제외.
  - **VOC-02**: 이메일·도메인을 마침표에서 쪼개(`job@jobcenter.`·`or.`·`kr`) 외국어로 오탐하던 문제. 문장 분리기가 종결부호를 **뒤가 공백/끝일 때만** 경계로 삼도록 하고(근본 원인), 이메일·URL·측정단위(20kg) 토큰을 판정에서 제외.

### Added
- **효율적 변환·활용 팁**: `easyread://guidelines` 리소스와 README에 토큰 절약·도구 활용·변환 속도 팁 추가.

### Changed
- **릴리스 워크플로**: npm publish 성공 시 GitHub Release를 설치 스모크보다 먼저 생성하고, 설치 스모크를 비치명적(`continue-on-error`)으로 변경 — 레지스트리 전파 지연에 따른 스모크 오탐이 릴리스 게시를 막지 않도록 함.

## [0.1.1] - 2026-08-15

### Fixed
- **도구 스키마 방언 호환성**: 도구의 `inputSchema`·`outputSchema`가 JSON Schema **draft-07**로 방출돼, 최신 MCP 클라이언트(2020-12만 검증)에서 도구 호출이 `unsupported dialect` 오류로 거부되던 문제를 수정. tools/list 응답에서 `$schema` 방언 선언을 제거해 클라이언트 기본 방언(2020-12)으로 해석되게 함. (검증 규칙·구조는 변경 없음)

## [0.1.0] - 2026-08-15

첫 공개 릴리스.

### Added
- **도구 4종**: `validate_easy_read`(규칙 검증·원문 대조), `analyze_readability`(가독성 지표), `lookup_easy_word`(쉬운 낱말 찾기), `get_guidelines`(작성 지침).
- **프롬프트 2종**: `simplify-text`(쉬운 정보로 바꾸기), `easy-read-review`(초안 검토).
- **리소스 4종**: `easyread://guidelines`, `easyread://guidelines/checklist`, `easyread://dictionary`, `easyread://resources`.
- **검증 규칙 25종**: 문장(SEN)·어휘(VOC)·숫자(NUM)·구성(STR)·표기(TYP)·정확성(ACC). 모두 오프라인·결정적으로 동작.
- **번들 데이터**: 쉬운 낱말 사전과 Easy-Read 근거·표준·사례 카탈로그(66건). 각 항목에 출처와 라이선스 분류 정보 보존.
- **배포 파이프라인**: `v*` 태그 기반 npm publish(provenance) 워크플로, 데이터 검증 CI 게이트, Node 22/24 × ubuntu·windows 크로스플랫폼 매트릭스(NFR-05).
- **설치 가이드**: Claude Desktop·Claude Code용 문서, MIT 라이선스(+데이터 출처 고지).

### Security
- 오프라인 동작(네트워크 미호출), 입력 무저장·무로깅, 입력 크기 상한. 자세한 내용은 [SECURITY.md](SECURITY.md).

[Unreleased]: https://github.com/SWJoong/EASYREAD/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/SWJoong/EASYREAD/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/SWJoong/EASYREAD/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/SWJoong/EASYREAD/releases/tag/v0.1.0
