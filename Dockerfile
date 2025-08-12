FROM node:22 as builder
WORKDIR /app
COPY lifesheet-fe/package*.json ./
COPY lifesheet-fe/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY lifesheet-fe/ ./
RUN yarn build
FROM nginx:alpine as server
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-conf/default.conf /etc/nginx/conf.d/default.conf