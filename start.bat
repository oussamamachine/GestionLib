@echo off
echo Starting Library Management System...
echo.

start "Backend API" cmd /k "cd backend && dotnet run"
timeout /t 5 /nobreak > nul

start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo System is starting...
echo ================================
echo.
echo Backend API: https://localhost:5001
echo Swagger: https://localhost:5001/swagger
echo Frontend: http://localhost:5173
echo.
echo Demo Credentials:
echo   Admin: admin / admin123
echo   Librarian: librarian / librarian123
echo   Member: member / member123
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping services...
taskkill /FI "WindowTitle eq Backend API*" /T /F
taskkill /FI "WindowTitle eq Frontend*" /T /F
