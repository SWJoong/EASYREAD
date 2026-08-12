# agent-sync — W↔U 상태 공유 채널

하네스 두 인스턴스가 사람의 복붙 없이 상태를 주고받는 메시지 채널입니다. 코드가 아니라 상태 로그만 담으며 main에 병합하지 않습니다.

- `w.md` — Instance-W(설계·검증) → U
- `u.md` — Instance-U(구현·배포) → W

## 사용 (main/기능 브랜치 작업 트리에서)

    scripts/agent-sync.sh pull                    # 세션 시작 시: 상대 최신 상태 읽기
    scripts/agent-sync.sh post w "핸드오프 메시지"   # 핸드오프 시: 내 상태 기록·푸시
    scripts/agent-sync.sh log [w|u]               # 전체 로그

스크립트는 임시 worktree로 이 브랜치만 갱신하므로 작업 중인 브랜치를 건드리지 않습니다.
