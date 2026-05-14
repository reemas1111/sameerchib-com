#!/usr/bin/env sh
# Runs inside Wrangler’s custom build step. Install deps on deploy only so
# `wrangler dev` stays fast. WRANGLER_COMMAND is set by Wrangler.
set -eu
case "${WRANGLER_COMMAND:-}" in
  deploy | "versions upload")
    npm ci
    ;;
  *)
    ;;
esac
