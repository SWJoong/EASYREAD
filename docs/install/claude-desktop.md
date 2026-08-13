# Claude Desktop에 EASYREAD 설치하기

Claude Desktop 앱에서 EASYREAD를 쓰는 방법입니다.
어렵지 않습니다. 순서대로 하면 됩니다.

## 먼저 준비할 것

- **Node.js 22 버전 이상**이 필요합니다.
- 인터넷은 설치할 때만 필요합니다. 검사할 때는 인터넷이 없어도 됩니다.

## 설치 순서

### 1. 설정 파일을 엽니다

설정 파일 이름은 `claude_desktop_config.json` 입니다.
아래 위치에 있습니다.

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

파일이 없으면 새로 만듭니다.

### 2. 아래 내용을 넣습니다

파일에 이 내용을 넣고 저장합니다.

```json
{
  "mcpServers": {
    "easyread": {
      "command": "npx",
      "args": ["-y", "easyread-mcp"]
    }
  }
}
```

이미 다른 서버가 있으면 `mcpServers` 안에 `easyread` 부분만 더합니다.

### 3. 앱을 다시 시작합니다

Claude Desktop을 완전히 끄고 다시 켭니다.

### 4. 잘 되었는지 봅니다

- 입력창 근처에 **도구 아이콘**이 보입니다.
- 아이콘을 누르면 `easyread` 도구들이 있습니다.

이제 "이 글을 쉽게 바꿔줘"처럼 부탁하면 됩니다.

## 잘 안 될 때

1. **Node 버전을 확인하세요.** 터미널에 `node -v`를 칩니다. 숫자가 22보다 작으면 새로 설치합니다.
2. **인터넷 걱정은 안 해도 됩니다.** 이 서버는 검사할 때 인터넷에 연결하지 않습니다.
3. **로그를 봅니다.** Claude Desktop의 로그에서 `easyread` 줄을 찾으면 문제를 알 수 있습니다.
