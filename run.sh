#!/bin/bash

# Windows-style path to git-bash.exe
GIT_BASH_PATH="C:\\Program Files\\Git\\git-bash.exe"

# Get paths
BACKEND_PATH="$(pwd)/Backend"
FRONTEND_PATH="$(pwd)/Frontend/src"

# Runs Backend in current terminal
echo "Starting Backend in this terminal"
cd "$BACKEND_PATH"
python app.py &

# Runs Frontend in new terminal
echo "Starting Frontend in new terminal"
start "" "$GIT_BASH_PATH" -c "cd \"$FRONTEND_PATH\" && echo Starting Frontend && npm run start"
