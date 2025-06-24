docker compose -f docker-compose-only-mongo.yml up -d
cd lifesheet-backend
yarn dev
cd ../lifesheet
yarn dev
