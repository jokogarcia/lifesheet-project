FROM node:22-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* ./
RUN yarn install  --frozen-lockfile
# Copy source files and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN yarn build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN yarn install --production --frozen-lockfile

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
#COPY .env ./

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["yarn", "start"]
