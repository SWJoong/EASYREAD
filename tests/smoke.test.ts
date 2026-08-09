// T-01 완료 기준: 빈(스모크) 테스트로 build·test 파이프라인이 동작함을 확인한다.
// 실제 규칙 골든 테스트는 T-04부터 tests/rules/ 아래에 추가한다.

describe("scaffolding smoke", () => {
  it("빌드·테스트 파이프라인이 동작한다", () => {
    expect(1 + 1).toBe(2);
  });
});
