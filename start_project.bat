@echo off
echo Starting GrowFarm Project Services...

echo [1/3] Starting Node.js Backend...
start "GrowFarm Node Server" cmd /k "cd server && npm start"

echo [2/3] Starting ML FastAPI...
start "GrowFarm ML API" cmd /k "cd ""ML FAST API"" && uvicorn main:app1 --reload --port 8006"

echo [3/3] Starting React Frontend...
start "GrowFarm Frontend" cmd /k "cd client && npm run dev"

echo.
echo ----------------------------------
echo Frontend: http://localhost:3005
echo Node API: http://localhost:8005
echo ML API:   http://localhost:8006
echo ----------------------------------
echo.
echo Keep the new windows open. You can close this one.
pause
