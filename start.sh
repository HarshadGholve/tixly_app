#!/bin/bash
echo "====================================="
echo " Starting IT Chatbot Services"
echo "====================================="

# Function to handle exit
cleanup() {
    echo "Stopping all services..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "[1/2] Starting FastAPI Backend..."
cd backend || exit
# Creating virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python3 run.py &
BACKEND_PID=$!
cd ..

echo "[2/2] Starting React Frontend..."
cd frontend || exit
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

echo "====================================="
echo " Everything is running!"
echo " Backend is running on: http://localhost:8000"
echo " Frontend is running natively on your assigned port (check vite output)"
echo " Press Ctrl+C to stop both servers."
echo "====================================="

# Wait for background jobs to keep script alive
wait $BACKEND_PID $FRONTEND_PID
