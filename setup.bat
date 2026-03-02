@echo off
echo ================================
echo Library Management System Setup
echo ================================
echo.

echo [1/4] Setting up Backend...
cd backend
echo Restoring .NET packages...
call dotnet restore
if %errorlevel% neq 0 (
    echo ERROR: Failed to restore backend packages
    pause
    exit /b 1
)

echo.
echo [2/4] Setting up Frontend...
cd ..\frontend
echo Installing npm packages...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend packages
    pause
    exit /b 1
)

echo.
echo [3/4] Creating environment files...
if not exist .env (
    echo VITE_API_URL=https://localhost:5001/api > .env
    echo Created .env file
)

echo.
echo [4/4] Setup Complete!
echo.
echo ================================
echo Next Steps:
echo ================================
echo.
echo 1. Start Backend:
echo    cd backend
echo    dotnet run
echo.
echo 2. Start Frontend (in new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:5173
echo.
echo Demo Credentials:
echo    Admin: admin / admin123
echo    Librarian: librarian / librarian123
echo    Member: member / member123
echo.
echo ================================
pause
