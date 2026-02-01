#!/usr/bin/env sh

# usage:
# sh bun-upgrade.sh 1.3.7

BUN_VERSION=$1

sedi () {
    case $(uname -s) in
        *[Dd]arwin* | *BSD* ) sed -i '' "$@";;
        *) sed -i "$@";;
    esac
}

echo "Updating Bun version in .bun-version"
echo "$BUN_VERSION" > .bun-version
echo

echo "Updating Bun version in Dockerfile"
sedi "1s|.*|FROM oven/bun\:${BUN_VERSION}-alpine AS base|" Dockerfile
echo

echo "Updating bun version for @types/bun"
bun i "@types/bun@${BUN_VERSION}"
echo
