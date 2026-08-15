/**
 * ACC(사실 보존) 규칙군이 공유하는 값 추출기. 원문·변환문에서 같은 종류의 값을 뽑아
 * "원문에 있으나 변환문에 없는 값 = 사실 누락/왜곡"을 판정하는 데 쓴다(W 정의 인터페이스).
 * v0.1 휴리스틱 — 형태소 분석 없이 정규식·접미 매칭. 과소탐지 가능(문서화된 backlog).
 */

// 날짜·시간: "2026년", "3월 2일", "3월", "2일", "3시(3시 30분)". 공백은 정규화로 제거해 비교한다.
const DATE_RE =
  /\d+\s*년(?:\s*\d+\s*월)?(?:\s*\d+\s*일)?|\d+\s*월\s*\d+\s*일|\d+\s*월|\d+\s*일|\d+\s*시(?:\s*\d+\s*분)?/g;
// 금액·수량: 숫자(+콤마) + 단위(만/억/천/백 또는 원/명/개…). 단위가 있어야 매칭(날짜 숫자 오탐 방지).
const AMOUNT_RE =
  /\d[\d,]*\s*(?:억|만|천|백)\s*(?:원|명|개|건|가지)?|\d[\d,]*\s*(?:원|명|개|건|가지|권|장|대|마리|시간)/g;
// 연락처: 전화(\d{2,4}-\d{3,4}-\d{4}) · URL(http(s):// … 또는 www. …).
const CONTACT_RE = new RegExp("\\d{2,4}-\\d{3,4}-\\d{4}|https?://\\S+|www\\.\\S+", "g");

// 기관명 후보 접미(휴리스틱). 조사를 떼고 이 접미로 끝나는 어절을 기관명 후보로 본다.
// 단자 접미('청'·'부'·'원')는 흔한 명사(신청·일부·인원…)를 과매칭해 제외하고,
// 자주 쓰는 구체 기관명을 명시 접미로 둔다(정밀도 우선 — ACC-03은 보조 warning).
const INSTITUTION_SUFFIXES = [
  "공단", "공사", "위원회", "구청", "시청", "도청", "교육청",
  "경찰청", "국세청", "소방청", "연구원", "진흥원", "병원", "법원",
  "재단", "협회", "조합", "센터",
];
const TRAILING_JOSA = /(?:은|는|이|가|을|를|에서|에게|에|의|과|와|도|으로|로|까지|부터)$/;

function stripSpaces(s: string): string {
  return s.replace(/\s+/g, "");
}

export function extractDates(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(DATE_RE)) {
    const token = m[0];
    // '주 5일'·'주5일'(근무 빈도)의 'N일'은 날짜가 아니다 → 바로 앞이 '주'면 제외.
    if (/^\s*\d+\s*일$/.test(token)) {
      const before = text.slice(0, m.index).replace(/\s+$/, "");
      if (before.endsWith("주")) continue;
    }
    out.push(stripSpaces(token));
  }
  return out;
}

export function extractAmounts(text: string): string[] {
  return [...text.matchAll(AMOUNT_RE)].map((m) => stripSpaces(m[0]));
}

export function extractContacts(text: string): string[] {
  return [...text.matchAll(CONTACT_RE)].map((m) => m[0]);
}

export function extractProperNouns(text: string): string[] {
  const names: string[] = [];
  for (const token of text.split(/\s+/)) {
    // 가운뎃점 압축표기(시·군·구청)는 풀어쓴 형태(시청·군청·구청)와 문자열 매칭이 안 돼 오탐 → 제외.
    if (token.includes("·")) continue;
    const word = token.replace(TRAILING_JOSA, "");
    if (word.length >= 2 && INSTITUTION_SUFFIXES.some((suffix) => word.endsWith(suffix))) {
      names.push(word);
    }
  }
  return names;
}
