#!/usr/bin/env bash
# Publish a workspace package only when its exact version is NOT on npm yet.
# `npm view --json` is the probe: E404 means "version absent" → publish; a
# clean answer means "already released" → skip; ANY other failure (auth,
# network, registry outage) aborts BEFORE `npm publish` — a swallowed
# transient error must never turn into a blind publish attempt.
#
# TK_PUBLISH_DRY=1 replaces the actual `npm publish` with an echo so all three
# branches are locally verifiable without touching the registry.
set -euo pipefail

PKG="${1:?usage: publish-if-absent.sh <package-name>}"
# The workspace symlink in node_modules points at the package dir (npm ci ran).
VER="$(node -p "require('./node_modules/${PKG}/package.json').version")"

run_publish() {
  if [ "${TK_PUBLISH_DRY:-}" = "1" ]; then
    echo "DRY: would publish ${PKG}@${VER}"
    return 0
  fi
  npm publish --provenance --access public -w "$PKG"
}

set +e
VIEW="$(npm view "${PKG}@${VER}" version --json 2>/dev/null)"
CODE=$?
set -e

if [ "$CODE" -eq 0 ] && [ -n "$VIEW" ]; then
  echo "${PKG}@${VER} is already on npm — skipping"
  exit 0
fi

# npm >=9 prints a JSON error object on stdout with --json; older npms exit 0
# with empty output for a missing version of an existing package — both mean
# "absent". Anything that is not a clean E404 fails the release.
if [ "$CODE" -eq 0 ]; then
  run_publish
  exit 0
fi

if node -e '
  let raw = "";
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    try {
      const parsed = JSON.parse(raw);
      process.exit(parsed?.error?.code === "E404" ? 0 : 1);
    } catch {
      process.exit(1);
    }
  });' <<<"$VIEW"; then
  run_publish
  exit 0
fi

echo "::error::npm view ${PKG}@${VER} failed and it is not E404 — aborting before publish:"
printf '%s\n' "$VIEW"
exit 1
