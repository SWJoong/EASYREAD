/**
 * 사용자 대면 문자열 모음(03 §7). 쉬운 정보 프로젝트답게 오류·안내도 쉬운 문장으로 쓴다:
 * 짧게, 한 문장에 한 가지, 무엇을 하면 되는지 함께.
 */

/** 검증 리포트에 항상 붙는 안내(FR-06, PROC-01~03). 도구는 당사자 감수를 대체하지 않는다. */
export const PROC_NOTICE =
  "이 결과는 당사자 감수를 대신하지 않습니다. 발달장애 당사자에게 직접 읽혀서 이해가 되는지 확인하세요. 그림이나 사진을 함께 넣으면 더 좋습니다.";

/** assembleReport의 기본 notices. */
export const DEFAULT_NOTICES: readonly string[] = [PROC_NOTICE];
