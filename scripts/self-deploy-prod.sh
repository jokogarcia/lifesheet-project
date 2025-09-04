#!/bin/bash
# Change to the directory containing this script
cd "$(dirname "$0")"
cd ..
git fetch
git checkout master
git pull
ENV_FILE=.env.prod docker compose up -d --build
