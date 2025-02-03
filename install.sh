#!/bin/bash

echo "Installing dependencies for backend service..."
cd backend && pnpm install
cd ..

echo "Installing dependencies for eliza service..."
cd eliza && pnpm install
cd ..

echo "Installing dependencies for frontend service..."
cd frontend && pnpm install
cd ..

echo "All dependencies installed successfully!" 