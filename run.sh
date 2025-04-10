#!/bin/bash

# Path to git-bash.exe (for opening a new terminal)
GIT_BASH_PATH="/c/Program Files/Git/git-bash.exe"

# Get paths
BACKEND_PATH="$(pwd)/Backend"
FRONTEND_PATH="$(pwd)/Frontend/src"

# Start Backend in this terminal
echo "Starting Backend in this terminal"
cd "$BACKEND_PATH"
python app.py &

# Start Frontend in a new terminal and keep it open
echo "Starting Frontend in new terminal"
"$GIT_BASH_PATH" -c "cd \"$FRONTEND_PATH\" && echo Starting Frontend && npm run start; echo Press any key to exit...; exec bash" &
