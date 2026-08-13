import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { parseDictionary } from "../../src/data/dictionary.js";
import type { Dictionary } from "../../src/rules/index.js";
import type { Catalog } from "../../src/data/resources.js";

/**
 * 도구 계약 테스트 공용 하네스(T-08 analyze/lookup/guidelines). validate.test.ts의 InMemory
 * 연결 패턴을 3개 파일이 공유한다. 파일별 정리(afterEach)는 각 파일이 close()로 관리한다.
 */
export interface ConnectedClient {
  client: Client;
  close: () => Promise<void>;
}

/** 서버·클라이언트를 인메모리로 연결한다. dictionary·catalog를 주면 해당 리소스도 등록된다. */
export async function connectClient(dictionary?: Dictionary, catalog?: Catalog): Promise<ConnectedClient> {
  const server = createServer(dictionary, catalog);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}

/**
 * 도구 계약 검증용 소형 사전. analyze(어려운 단어 집계)·lookup(등재/부분일치)에 필요한 최소 항목만.
 * 부분일치(related)·limit 검증을 위해 "신청"을 접두로 공유하는 항목을 여럿 둔다.
 */
export function makeTestDictionary(): Dictionary {
  return parseDictionary({
    version: "test",
    updatedAt: "2026-08-13",
    entries: [
      {
        word: "구비서류",
        category: "difficult",
        alternatives: ["필요한 서류"],
        explanation: "제출해야 하는 서류",
        example: "필요한 서류를 내세요.",
        source: "테스트 사전",
      },
      { word: "신청", category: "difficult", alternatives: ["내기"], source: "테스트 사전" },
      { word: "신청서", category: "difficult", alternatives: ["내는 서류"], source: "테스트 사전" },
      { word: "신청기간", category: "difficult", alternatives: ["내는 기간"], source: "테스트 사전" },
    ],
  });
}

/** content 배열에서 첫 text를 꺼낸다(도구 응답 검증 공용). */
export function firstText(content: unknown): string | undefined {
  const arr = content as Array<{ type: string; text?: string }> | undefined;
  return arr?.[0]?.text;
}
