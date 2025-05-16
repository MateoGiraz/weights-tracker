#!/bin/bash
# Shell script for testing the Weights Tracker API

echo "=== Register a new user ==="
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser4", "password": "password123"}'
echo -e "\n"

echo "=== Login to get a token ==="
TOKEN_RESPONSE=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}')
echo "$TOKEN_RESPONSE"
echo -e "\n"

# Extract token from response
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Using token: $TOKEN"
echo -e "\n"

# Creating a unique workout name with timestamp
TIMESTAMP=$(date +%s)
WORKOUT_NAME="My Workout Split $TIMESTAMP"

echo "=== Create a new routine ==="
ROUTINE_RESPONSE=$(curl -X POST http://localhost:3000/api/routines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"$WORKOUT_NAME\"}")
echo "$ROUTINE_RESPONSE"
echo -e "\n"

# Extract routine ID from JSON using grep and sed
ROUTINE_ID=$(echo "$ROUTINE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Using routine ID: $ROUTINE_ID"
echo -e "\n"

# Check if ROUTINE_ID was extracted successfully
if [ -z "$ROUTINE_ID" ]; then
  echo "Failed to extract routine ID. Exiting tests."
  exit 1
fi

echo "=== Get all routines ==="
curl -X GET http://localhost:3000/api/routines \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== Get today's routine ==="
curl -X GET http://localhost:3000/api/routines/today \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== Get a specific routine ==="
curl -X GET "http://localhost:3000/api/routines/$ROUTINE_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== Update a routine name ==="
curl -X PUT "http://localhost:3000/api/routines/$ROUTINE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Updated $WORKOUT_NAME\"}"
echo -e "\n"

echo "=== Add MONDAY to routine ==="
DAY_RESPONSE=$(curl -X POST "http://localhost:3000/api/routines/$ROUTINE_ID/days" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"weekday": "MONDAY"}')
echo "$DAY_RESPONSE"
echo -e "\n"

# Extract day ID from JSON
DAY_ID=$(echo "$DAY_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Using day ID: $DAY_ID"
echo -e "\n"

# Check if DAY_ID was extracted successfully
if [ -z "$DAY_ID" ]; then
  echo "Failed to extract day ID. Continuing with partial tests."
else
  echo "=== Add WEDNESDAY to routine ==="
  curl -X POST "http://localhost:3000/api/routines/$ROUTINE_ID/days" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"weekday": "WEDNESDAY"}'
  echo -e "\n"

  echo "=== Get all days for a routine ==="
  curl -X GET "http://localhost:3000/api/routines/$ROUTINE_ID/days" \
    -H "Authorization: Bearer $TOKEN"
  echo -e "\n"

  echo "=== Get a specific day ==="
  curl -X GET "http://localhost:3000/api/routines/$ROUTINE_ID/days/$DAY_ID" \
    -H "Authorization: Bearer $TOKEN"
  echo -e "\n"

  echo "=== Update a day ==="
  curl -X PUT "http://localhost:3000/api/routines/$ROUTINE_ID/days/$DAY_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"weekday": "FRIDAY"}'
  echo -e "\n"
fi

echo "=== Create Bench Press exercise ==="
EXERCISE_NAME="Bench Press $TIMESTAMP" 
EXERCISE_RESPONSE=$(curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"$EXERCISE_NAME\"}")
echo "$EXERCISE_RESPONSE"
echo -e "\n"

# Extract exercise ID from JSON
EXERCISE_ID=$(echo "$EXERCISE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Using exercise ID: $EXERCISE_ID"
echo -e "\n"

# Check if EXERCISE_ID was extracted successfully
if [ -z "$EXERCISE_ID" ]; then
  echo "Failed to extract exercise ID. Continuing with partial tests."
else
  echo "=== Create Squat exercise ==="
  curl -X POST http://localhost:3000/api/exercises \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\": \"Squat $TIMESTAMP\"}"
  echo -e "\n"

  echo "=== Get all exercises ==="
  curl -X GET http://localhost:3000/api/exercises \
    -H "Authorization: Bearer $TOKEN"
  echo -e "\n"

  if [ ! -z "$DAY_ID" ]; then
    echo "=== Add Bench Press to day ==="
    curl -X POST "http://localhost:3000/api/routines/$ROUTINE_ID/days/$DAY_ID/exercises" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"exerciseId\": \"$EXERCISE_ID\"}"
    echo -e "\n"

    echo "=== Get all exercises for a day ==="
    curl -X GET "http://localhost:3000/api/routines/$ROUTINE_ID/days/$DAY_ID/exercises" \
      -H "Authorization: Bearer $TOKEN"
    echo -e "\n"
  fi

  echo "=== Add a weight record for Bench Press ==="
  WEIGHT_RESPONSE=$(curl -X POST "http://localhost:3000/api/exercises/$EXERCISE_ID/weights" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"weight": 225, "reps": 5, "sets": 3}')
  echo "$WEIGHT_RESPONSE"
  echo -e "\n"

  # Extract weight ID from JSON
  WEIGHT_ID=$(echo "$WEIGHT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "Using weight ID: $WEIGHT_ID"
  echo -e "\n"

  if [ ! -z "$WEIGHT_ID" ]; then
    echo "=== Get all weight records for Bench Press ==="
    curl -X GET "http://localhost:3000/api/exercises/$EXERCISE_ID/weights" \
      -H "Authorization: Bearer $TOKEN"
    echo -e "\n"

    echo "=== Delete a weight record ==="
    curl -X DELETE "http://localhost:3000/api/exercises/$EXERCISE_ID/weights/$WEIGHT_ID" \
      -H "Authorization: Bearer $TOKEN"
    echo -e "\n"
  fi

  if [ ! -z "$DAY_ID" ]; then
    echo "=== Remove Bench Press from day ==="
    curl -X DELETE "http://localhost:3000/api/routines/$ROUTINE_ID/days/$DAY_ID/exercises/$EXERCISE_ID" \
      -H "Authorization: Bearer $TOKEN"
    echo -e "\n"

    echo "=== Delete a day ==="
    curl -X DELETE "http://localhost:3000/api/routines/$ROUTINE_ID/days/$DAY_ID" \
      -H "Authorization: Bearer $TOKEN"
    echo -e "\n"
  fi
fi

echo "=== Delete a routine ==="
curl -X DELETE "http://localhost:3000/api/routines/$ROUTINE_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "Test complete!" 