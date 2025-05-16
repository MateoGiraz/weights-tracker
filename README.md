# Weights Tracker App

A workout tracking application to record weights and track progress in the gym.

## Backend Overview

The backend is built with:

- Next.js API Routes
- Prisma ORM
- PostgreSQL Database
- JWT Authentication

## Database Models

- **User**: Stores user information with username and password
- **Routine**: Represents a workout routine (e.g., "Push-Pull-Legs")
- **Day**: Represents a specific day of the week (MONDAY, TUESDAY, etc.) in a routine
- **Exercise**: Represents an exercise (e.g., "Bench Press")
- **DayExercise**: Connects exercises to specific days (many-to-many)
- **Weight**: Records weight amounts with timestamps for tracking progress

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file with your database connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/weights_tracker?schema=public"
   JWT_SECRET="your_jwt_secret_key_here"
   ```
4. Create and migrate the database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
  ```json
  { "username": "user123", "password": "password123" }
  ```

- **POST /api/auth/login** - Login
  ```json
  { "username": "user123", "password": "password123" }
  ```

### Routines

- **GET /api/routines** - Get all routines for the user
- **GET /api/routines/today** - Get routines for the current weekday
- **POST /api/routines** - Create a new routine
  ```json
  { "name": "Push Pull Legs" }
  ```
- **GET /api/routines/:routineId** - Get a specific routine
- **PUT /api/routines/:routineId** - Update a routine
  ```json
  { "name": "Upper Lower Split" }
  ```
- **DELETE /api/routines/:routineId** - Delete a routine

### Days

- **GET /api/routines/:routineId/days** - Get all days for a routine
- **POST /api/routines/:routineId/days** - Create a new day
  ```json
  { "weekday": "MONDAY" }
  ```
- **GET /api/routines/:routineId/days/:dayId** - Get a specific day
- **PUT /api/routines/:routineId/days/:dayId** - Update a day
  ```json
  { "weekday": "TUESDAY" }
  ```
- **DELETE /api/routines/:routineId/days/:dayId** - Delete a day

### Exercises

- **GET /api/exercises** - Get all exercises
- **POST /api/exercises** - Create a new exercise
  ```json
  { "name": "Bench Press" }
  ```

### Day Exercises

- **GET /api/routines/:routineId/days/:dayId/exercises** - Get all exercises for a day
- **POST /api/routines/:routineId/days/:dayId/exercises** - Add an exercise to a day
  ```json
  { "exerciseId": "123e4567-e89b-12d3-a456-426614174000" }
  ```
- **DELETE /api/routines/:routineId/days/:dayId/exercises/:exerciseId** - Remove an exercise from a day

### Weights

- **GET /api/exercises/:exerciseId/weights** - Get all weights for an exercise
- **POST /api/exercises/:exerciseId/weights** - Add a weight record
  ```json
  { "amount": 100.5 }
  ```
- **DELETE /api/exercises/:exerciseId/weights/:weightId** - Delete a weight record

## Authentication

All API endpoints except for registration and login require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## License

This project is licensed under the MIT License.
