#!/bin/bash
echo "=== Updating LMS MFIH Application ==="
cd /home/mfih/mfih_LMS || exit 1

# Pull latest changes
echo "--> Fetching latest code from GitHub..."
git fetch origin main
git reset --hard origin/main

# Rebuild containers
echo "--> Rebuilding Docker containers..."
docker compose down
docker compose up -d --build

echo "=== LMS Application updated successfully! ==="
