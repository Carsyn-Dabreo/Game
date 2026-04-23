@echo off
setlocal enabledelayedexpansion

REM CyberGrid Full-Stack Setup Script for Windows
REM This script sets up the entire development environment

echo 🚀 Setting up CyberGrid Full-Stack Environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
        pause
        exit /b 1
    )
)

echo [INFO] Docker and Docker Compose are installed

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or later.
    pause
    exit /b 1
)

echo [INFO] Node.js is installed

REM Setup backend
echo [STEP] Setting up backend...
cd server

echo [INFO] Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo [WARNING] .env file not found. Creating from template...
    copy .env.example .env >nul
    echo [WARNING] Please edit server\.env file with your API keys and configuration
)

REM Create logs directory
if not exist logs mkdir logs
if not exist uploads mkdir uploads

cd ..
echo [INFO] Backend setup completed

REM Setup frontend
echo [STEP] Setting up frontend...

echo [INFO] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo [WARNING] Frontend .env file not found. Creating...
    (
        echo VITE_API_URL=http://localhost:3001
        echo VITE_SOCKET_URL=http://localhost:3001
        echo VITE_APP_TITLE=CyberGrid
    ) > .env
)

echo [INFO] Frontend setup completed

REM Setup database
echo [STEP] Setting up database with Docker...

echo [INFO] Starting PostgreSQL database...
docker-compose up -d db
if errorlevel 1 (
    echo [ERROR] Failed to start database
    pause
    exit /b 1
)

echo [INFO] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo [INFO] Database setup completed

REM Start development servers
echo [STEP] Starting development servers...

echo [INFO] Starting backend server...
cd server
start "Backend Server" cmd /k "npm run dev"
cd ..

echo [INFO] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo [INFO] Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo [SUCCESS] Development servers are running!
echo [INFO] Frontend: http://localhost:5173
echo [INFO] Backend API: http://localhost:3001
echo [INFO] Database: localhost:5432
echo.
echo [WARNING] Close the server windows to stop the services
echo [INFO] To stop database: docker-compose down

pause
