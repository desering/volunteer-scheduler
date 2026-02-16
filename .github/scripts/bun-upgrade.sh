#!/usr/bin/env sh

set -e

# usage:
# sh bun-upgrade.sh 1.3.7

# for portable sedi function
source "$(dirname "$0")/functions.sh"

BUN_VERSION=$1
if [ -z "$BUN_VERSION" ]; then
  echo "Missing argument for the new version" >&2
  exit 1
else 
  echo "Updating all the buns to $BUN_VERSION"
fi


echo "Updating bun version for @types/bun"
bun install "@types/bun@${BUN_VERSION}" 1> /dev/null
echo

echo "Updating Bun version in .bun-version"
echo "$BUN_VERSION" > .bun-version
echo

echo "Updating Bun version in Dockerfile"
sedi "1s|.*|FROM oven/bun\:${BUN_VERSION}-alpine AS base|" Dockerfile
echo
