# Lifesheet - CV Management Application

A modern web application for creating, managing, and tailoring CV/resumes.

## Running with Docker

### Prerequisites
- Docker
- Docker Compose

### Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/lifesheet.git
   cd lifesheet
   ```

2. Build and start the containers:
   ```
   docker-compose up -d
   ```

3. Access the application at http://localhost:3000

### Docker Commands

- Build and start services:
  ```
  docker-compose up -d
  ```

- Stop services:
  ```
  docker-compose down
  ```

- View logs:
  ```
  docker-compose logs -f
  ```

- Rebuild containers after making changes:
  ```
  docker-compose up -d --build
  ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Development

### Prerequisites
- Node.js v18+
- pnpm

### Setup

1. Install dependencies:
   ```
   pnpm install
   ```

2. Start the development server:
   ```
   pnpm dev
   ```

3. Access the application at http://localhost:3000
