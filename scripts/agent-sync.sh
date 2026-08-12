#!/usr/bin/env bash
# EASYREAD 하네스 W↔U 상태 동기화 도구
# ------------------------------------------------------------------
# 두 Claude 인스턴스(W=설계·검증, U=구현·배포)가 사람의 복붙 없이 상태를 주고받게 한다.
# 전용 'agent-sync' 브랜치를 메시지 채널로 쓰며, main·기능 브랜치의 작업 트리는 건드리지 않는다
# (임시 worktree로 agent-sync만 갱신). main은 브랜치 보호가 걸려 있으므로 이 채널을 별도로 둔다.
#
# 사용법:
#   scripts/agent-sync.sh pull              # 상대(양쪽) 최신 상태를 출력 — 세션 시작/재개 시
#   scripts/agent-sync.sh post <w|u> "메시지"  # 내 상태를 채널에 기록·푸시 — 핸드오프 시
#   scripts/agent-sync.sh log [w|u]         # 채널 전체 로그 출력
#
# 요구: bash + git. 오프라인이면 조용히 통과(fail-safe)해 세션을 막지 않는다.
set -euo pipefail

BRANCH="agent-sync"
REMOTE="origin"
EMAIL="cheese0318@gmail.com"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$ROOT" ] || { echo "[agent-sync] git 저장소가 아닙니다."; exit 0; }
cd "$ROOT"

_have_channel() { git show-ref --verify -q "refs/remotes/$REMOTE/$BRANCH"; }
_fetch() { git fetch -q "$REMOTE" "$BRANCH" 2>/dev/null || true; }

cmd_pull() {
  _fetch
  if ! _have_channel; then
    echo "[agent-sync] 채널이 아직 없습니다. 한쪽이 첫 post를 하면 생성됩니다."
    return 0
  fi
  echo "===== agent-sync · 상대 상태 (최근) ====="
  local role
  for role in w u; do
    if git cat-file -e "$REMOTE/$BRANCH:$role.md" 2>/dev/null; then
      echo "----- ${role}.md -----"
      git show "$REMOTE/$BRANCH:$role.md" | tail -n 24
      echo
    fi
  done
}

cmd_log() {
  _fetch
  _have_channel || { echo "[agent-sync] 채널 없음."; return 0; }
  local role="${1:-}"
  if [ -n "$role" ]; then
    git show "$REMOTE/$BRANCH:${role}.md" 2>/dev/null || echo "(${role}.md 없음)"
  else
    for role in w u; do
      echo "===== ${role} ====="
      git show "$REMOTE/$BRANCH:${role}.md" 2>/dev/null || true
    done
  fi
}

cmd_post() {
  local role="${1:-}"; shift || true
  local msg="${*:-}"
  case "$role" in w|u) ;; *) echo "역할은 w 또는 u 여야 합니다."; exit 2 ;; esac
  [ -n "$msg" ] || { echo "메시지가 비었습니다."; exit 2; }

  _fetch
  _have_channel || { echo "[agent-sync] 채널이 없습니다. README의 부트스트랩을 먼저 실행하세요."; exit 1; }

  local ts up tmp wt
  ts="$(date -u +%Y-%m-%dT%H:%MZ)"
  up="$(printf '%s' "$role" | tr '[:lower:]' '[:upper:]')"
  tmp="$(mktemp -d)"; wt="$tmp/wt"   # worktree add는 대상 경로가 없어야 하므로 하위 경로 사용

  git worktree add -q --detach "$wt" "$REMOTE/$BRANCH"
  printf '## [%s] %s\n%s\n\n' "$ts" "$up" "$msg" >> "$wt/${role}.md"
  (
    cd "$wt"
    git add "${role}.md"
    git -c user.name="SWJoong [$up]" -c user.email="$EMAIL" commit -q -m "sync(${role}): ${ts}"
    # 동시 push 충돌 대비 최대 3회 재시도(rebase 후)
    pushed=0
    for i in 1 2 3; do
      if git push -q "$REMOTE" "HEAD:$BRANCH"; then pushed=1; break; fi
      git fetch -q "$REMOTE" "$BRANCH" && git rebase -q "$REMOTE/$BRANCH" || true
      sleep 1
    done
    [ "$pushed" = 1 ] || echo "[agent-sync] 경고: push 실패(오프라인?). 로컬 커밋만 남았습니다." >&2
  )
  git worktree remove --force "$wt"
  rm -rf "$tmp"
  echo "[agent-sync] posted (${role} @ ${ts})"
}

case "${1:-}" in
  pull) cmd_pull ;;
  post) shift; cmd_post "$@" ;;
  log)  shift; cmd_log "${1:-}" ;;
  *) echo "usage: scripts/agent-sync.sh {pull | post <w|u> \"메시지\" | log [w|u]}"; exit 2 ;;
esac
