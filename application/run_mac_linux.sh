#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/source code/backend"
FRONTEND_DIR="$ROOT_DIR/source code/frontend"
FRONTEND_URL="http://localhost:5173"

echo "============================================================"
echo "UM Food Delivery System - WIA1002 OCC7 GROUP7"
echo "============================================================"
echo
echo "This launcher will start the backend and frontend."
echo "Please keep the opened terminal windows running while using the system."
echo

if [ ! -f "$BACKEND_DIR/pom.xml" ]; then
  echo "ERROR: backend/pom.xml was not found."
  echo "Please run this file from the project root directory."
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "ERROR: frontend/package.json was not found."
  echo "Please run this file from the project root directory."
  exit 1
fi

BACKEND_CMD="cd '$ROOT_DIR' && echo 'Starting backend server on http://localhost:8080' && mvn -f '$BACKEND_DIR/pom.xml' spring-boot:run"
FRONTEND_CMD="cd '$FRONTEND_DIR' && echo 'Installing frontend dependencies if needed...' && npm install && echo 'Starting frontend server on $FRONTEND_URL' && npm start"

start_new_terminal() {
  local title="$1"
  local command="$2"

  if [[ "$OSTYPE" == "darwin"* ]]; then
    osascript <<EOF
tell application "Terminal"
  do script "$command"
  set custom title of front window to "$title"
  activate
end tell
EOF
  elif command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title="$title" -- bash -lc "$command; exec bash"
  elif command -v konsole >/dev/null 2>&1; then
    konsole --new-tab -p tabtitle="$title" -e bash -lc "$command; exec bash"
  elif command -v xfce4-terminal >/dev/null 2>&1; then
    xfce4-terminal --title="$title" --command="bash -lc \"$command; exec bash\""
  elif command -v x-terminal-emulator >/dev/null 2>&1; then
    x-terminal-emulator -T "$title" -e bash -lc "$command; exec bash"
  else
    echo "No supported terminal emulator was found. Starting $title in the background."
    bash -lc "$command" &
  fi
}

echo "Starting Spring Boot backend from:"
echo "$BACKEND_DIR"
start_new_terminal "UM Food Delivery - Backend" "$BACKEND_CMD"

echo
echo "Starting React frontend from:"
echo "$FRONTEND_DIR"
start_new_terminal "UM Food Delivery - Frontend" "$FRONTEND_CMD"

echo
echo "Waiting a few seconds before opening the browser..."
sleep 8

echo "Opening frontend in your default browser:"
echo "$FRONTEND_URL"
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$FRONTEND_URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$FRONTEND_URL" >/dev/null 2>&1 &
else
  echo "Please open $FRONTEND_URL manually."
fi

echo
echo "Launcher finished. Backend and frontend are running in separate terminal windows where supported."
