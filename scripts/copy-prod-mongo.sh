#!/bin/bash
# This script copies the production MongoDB database to the local development environment.
# The local Mongo container must be running for this script to work.
# All data in the local MongoDB database will be dropped and replaced with the production data.
# No data annonymization is performed, so be careful when using this script.
ssh joaquin@irazu.com.ar "docker exec lifesheet-project-mongo-1 sh -lc 'mongodump --db lifesheet --archive --gzip'" | docker exec -i lifesheet-project-mongo-1 sh -lc "mongorestore --archive --gzip --drop"