# Claude Code에 EASYREAD 설치하기

Claude Code(터미널)에서 EASYREAD를 쓰는 방법입니다.

## 먼저 준비할 것

- **Node.js 22 버전 이상**이 필요합니다.

## 설치 순서

### 1. 명령어 한 줄을 칩니다

터미널에 아래를 칩니다.

```bash
claude mcp add easyread -- npx -y easyread-mcp
```

### 2. 잘 되었는지 봅니다

아래를 치면 등록된 서버 목록이 나옵니다.

```bash
claude mcp list
```

`easyread`가 목록에 있으면 성공입니다.

이제 "이 글을 쉽게 바꿔줘"처럼 부탁하면 됩니다.

**다음: [처음 사용해보기(따라하기)](first-use.md)** — 예시 문장으로 한 번 연습해 보세요.

## 잘 안 될 때

1. **Node 버전을 확인하세요.** `node -v`를 칩니다. 숫자가 22보다 작으면 새로 설치합니다.
2. **인터넷 걱정은 안 해도 됩니다.** 이 서버는 검사할 때 인터넷에 연결하지 않습니다.
3. **다시 등록하려면** 먼저 `claude mcp remove easyread`로 지우고 1번을 다시 합니다.
