#!/bin/bash
# Change to the directory containing this script
cd "$(dirname "$0")"
cd ..
git fetch
git checkout master
git pull
docker compose up -d --build
