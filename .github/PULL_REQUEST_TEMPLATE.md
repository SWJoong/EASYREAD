<!-- 하네스 레인: 구현·자산은 src/·assets/(Instance-U), 골든·계약 테스트는 tests/(Instance-W) -->

## 개요
<!-- 무엇을, 왜 바꿨는지 한두 줄 -->

## 변경 사항
-

## 체크리스트
- [ ] 레인 준수 — `src/`·`assets/`(U) 또는 `tests/`(W) 중 내 레인만 변경
- [ ] `npm run lint` · `npm run typecheck` · `npm run build` · `npm test` 전부 green (Node 22)
- [ ] 데이터 변경 시 `node scripts/validate-assets.mjs` 통과 + `assets/dictionary.json`의 `version`·`updatedAt` 갱신
- [ ] 도구·프롬프트·리소스 인터페이스 변경 시 버전 영향 확인 ([05-release-plan.md](../blob/main/docs/plan/05-release-plan.md) §3)
- [ ] 사실 보존(ACC) 관련 변경 시 날짜·금액·기관명·연락처 회귀 예문 추가

## 관련 이슈
<!-- 예: #123 -->
