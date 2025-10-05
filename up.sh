#! /bin/bash

docker compose -f docker-compose-only-mongo-and-redis.yml up -d
(cd lifesheet-backend && yarn dev) &
(cd lifesheet-fe && yarn dev) &
wait
