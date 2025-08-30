@echo off
echo SmartDoc Development Environment Startup
echo ======================================
echo.

echo Starting Backend Server...
start "SmartDoc Backend" cmd /k "cd smartdoc-backend && python src/main.py"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "SmartDoc Frontend" cmd /k "cd smartdoc-frontend && npm run dev"

echo.
echo Both services are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the frontend in your browser...
pause >nul

start http://localhost:5173

echo.
echo Development environment started successfully!
echo Keep both terminal windows open while developing.
echo.
pause
