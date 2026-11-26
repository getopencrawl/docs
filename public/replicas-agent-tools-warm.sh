#!/bin/sh
# Install the public OpenCrawl tools once per Replicas environment image.
(
  set -eu
  # Keep the image source and installed Codex hook commands administrator-owned.
  sudo -n -- /usr/bin/env -i PATH=/usr/bin:/bin /bin/sh -eu -c '
    stage=$(/usr/bin/mktemp -d)
    trap '\''/bin/rm -rf -- "$stage"'\'' EXIT
    cd "$stage"
    /usr/bin/curl -fsSL --retry 3 --proto "=https" --proto-redir "=https" \
      https://raw.githubusercontent.com/getopencrawl/opencrawl-core/216f650226e94f7a45d87269e193cf19b3765a99/deploy/replicas/agent-tools.mjs -o agent-tools.mjs
    printf "%s  %s\n" 2f03913ee8ffb50696018cf47004cf116863ebe11c04d474a94c6461333dc394 agent-tools.mjs | /usr/bin/sha256sum --check --status
    /opt/replicas/node/bin/node "$stage/agent-tools.mjs" image
  '
  /opt/replicas/node/bin/node /opt/opencrawl-replicas/agent-tools.mjs user
  if ! command -v opencrawl >/dev/null; then
    npm install --global --prefix "$HOME/.local" @getopencrawl/cli@0.4.185
    "$HOME/.local/bin/opencrawl" --version
  else
    opencrawl --version
  fi
)
