#!/bin/bash

# Build script for Windows using Docker with Wine
set -e

# Check if we're in the project root
if [ ! -f "package.json" ]; then
  echo "Error: Must be run from project root (package.json not found)"
  exit 1
fi

echo "Building Windows executable using Docker..."

docker run --rm -ti \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 --env DEBUG="electron-builder" \
 --env pnpm_CACHE_FOLDER="/root/.cache/pnpm" \
 --env ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES="true" \
 --env ELECTRON_SKIP_BINARY_DOWNLOAD="true" \
 -v ${PWD}:/project \
 -v ${PWD##*/}-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 -v ~/.cache/pnpm:/root/.cache/pnpm \
 electronuserland/builder:wine \
 /bin/bash -c "cd /project && \
   echo 'Upgrading pnpm to latest version...' && \
   npm install -g pnpm@latest && \
   echo 'Installing dependencies...' && \
   pnpm install --frozen-lockfile --network-timeout 300000 && \
   echo 'Building Electron app...' && \
   pnpm build:electron && \
   echo 'Building Windows executable (skipping native rebuilds)...' && \
   pnpm electron:build:win --config.nativeRebuilder=legacy"

echo "Windows build completed successfully!"