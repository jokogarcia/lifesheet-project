# Lifesheet Backend API

The backend API service for the Lifesheet CV management application.

## Features

- User authentication and authorization
- CV creation, editing, and management
- CV tailoring functionality
- File upload support
- MongoDB integration

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Docker / Docker Compose

## Getting Started

### Prerequisites

- Node.js v18+ or Docker
- MongoDB (if running locally without Docker)

### Installation

#### Local Development

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/lifesheet-backend.git
   cd lifesheet-backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/lifesheet
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   UPLOAD_DIR=uploads
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

#### Docker Deployment

1. Build and start the containers:
   ```sh
   docker-compose up -d
   ```

2. The API will be available at http://localhost:3001

### Database Seeding

To populate the database with sample data:

```sh
# Import sample data
npm run seed

# Remove sample data
npm run seed:delete
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### CV Management

- `POST /api/cvs` - Create a new CV
- `GET /api/cvs` - Get all CVs for the current user
- `GET /api/cvs/:id` - Get a specific CV
- `PUT /api/cvs/:id` - Update a CV
- `DELETE /api/cvs/:id` - Delete a CV
- `POST /api/cvs/:id/tailor` - Tailor a CV for a specific job
- `POST /api/cvs/:id/upload` - Upload an attachment for a CV

## Documentation

Detailed API documentation is available at `/api-docs` when running the server.

## License

This project is licensed under the MIT License.
