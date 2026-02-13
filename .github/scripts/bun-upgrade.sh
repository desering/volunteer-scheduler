#!/usr/bin/env sh

set -e

# usage:
# sh bun-upgrade.sh 1.3.7

# for portable sedi function
source "$(dirname "$0")/functions.sh"

BUN_VERSION=$1

echo "Updating bun version for @types/bun"
bun install "@types/bun@${BUN_VERSION}"
echo

echo "Updating Bun version in .bun-version"
echo "$BUN_VERSION" > .bun-version
echo

echo "Updating Bun version in Dockerfile"
sedi "1s|.*|FROM oven/bun\:${BUN_VERSION}-alpine AS base|" Dockerfile
echo
