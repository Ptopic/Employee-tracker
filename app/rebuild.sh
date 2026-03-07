#!/bin/bash

set -e

echo "Cleaning up project..."

echo "Removing iOS and Android directories..."
rm -rf ios
rm -rf android

echo "Removing node_modules and package-lock.json (or yarn.lock)..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -rf .expo

echo "Installing dependencies..."
npm install

echo "Rebuilding project..."
npx expo prebuild
# npx expo prebuild --clean

echo "Starting Expo project..."
echo "If not working try to deinstall app from simulator and run npm run ios"
npx expo --reset-cache

echo "Project rebuild complete!"
