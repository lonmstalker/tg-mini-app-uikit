#!/usr/bin/env bash
# Regenerates the Linux visual baselines inside the same Playwright Docker
# image that CI uses, so contributors on macOS/Windows can refresh them:
#
#   npm run test:e2e:update:linux
#
# node_modules are shadowed by anonymous volumes — the container does its own
# npm ci and never touches the host install.
set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE="mcr.microsoft.com/playwright:v1.60.0-noble"

docker run --rm --init \
  -v "$PWD":/work \
  -v /work/node_modules \
  -v /work/packages/uikit/node_modules \
  -v /work/examples/demo/node_modules \
  -w /work \
  -e CI=1 \
  "$IMAGE" \
  bash -c "npm ci --no-audit --no-fund && npx playwright test --update-snapshots ${*:-}"
