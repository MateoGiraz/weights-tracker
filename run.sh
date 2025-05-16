#!/bin/bash

cd "$(dirname "$0")" || exit

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Start the development server
echo "Starting the application..."
npm run dev 