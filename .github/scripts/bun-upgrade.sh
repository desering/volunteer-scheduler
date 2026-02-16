#!/usr/bin/env sh
# This script updates bun environment using version from the Dockerfile
#
# usage:
# ./bun-upgrade.sh

set -e

echo -n "Checking bun version in Dockerfile"
NEW_BUN_VERSION=$(sed -n 's|.*FROM oven/bun:\(.*\)-alpine AS base|\1|p' Dockerfile)
if [ -z "$NEW_BUN_VERSION" ]; then
  echo "Cannot determine bun version from Dockerfile" >&2
  exit 1
else
  echo "Updating all the other buns to $NEW_BUN_VERSION"
fi

echo "Updating Bun version in .bun-version"
echo "$BUN_VERSION" > .bun-version
echo

echo "Updating bun version for @types/bun"
bun install "@types/bun@${NEW_BUN_VERSION}" 1> /dev/null
echo
