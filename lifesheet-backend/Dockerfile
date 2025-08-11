FROM node:22-bullseye as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* ./
RUN yarn install  --frozen-lockfile
# Copy source files and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN yarn build

# Runtime stage
FROM node:22-bullseye

WORKDIR /app

# Install chrome
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*


# Copy package files and install production dependencies
COPY package*.json ./
COPY yarn.lock* ./
# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN yarn install --production --frozen-lockfile

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
#COPY .env ./

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["yarn", "start"]
