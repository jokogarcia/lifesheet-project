#!/bin/bash
# Change to the directory containing this script
BRANCHNAME="${1:-master}"
cd "$(dirname "$0")"
cd ..
git fetch
git checkout "$BRANCHNAME"
git pull
docker compose up -d --build
