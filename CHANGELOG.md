# 변경 이력 (Changelog)

이 파일은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따르며,
버전 규칙은 [유의적 버전(SemVer)](https://semver.org/lang/ko/)을 따릅니다.
버전 판정 기준은 [docs/plan/05-release-plan.md](docs/plan/05-release-plan.md) §3을 참고하세요.

## [Unreleased]

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

[Unreleased]: https://github.com/SWJoong/EASYREAD/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/SWJoong/EASYREAD/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/SWJoong/EASYREAD/releases/tag/v0.1.0
