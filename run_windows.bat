@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"
set "FRONTEND_URL=http://localhost:5173"

:: Add Maven to PATH if not already there
where mvn >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "%USERPROFILE%\.maven\maven-3.9.16\bin" (
        set "PATH=%USERPROFILE%\.maven\maven-3.9.16\bin;%PATH%"
    )
)

echo ============================================================
echo UM Food Delivery System - WIA1002 OCC7 GROUP7
echo ============================================================
echo.
echo This launcher will start the backend and frontend in separate windows.
echo Please keep the opened terminal windows running while using the system.
echo.

if not exist "%BACKEND_DIR%\pom.xml" (
    echo ERROR: backend\pom.xml was not found.
    echo Please run this file from the project root directory.
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo ERROR: frontend\package.json was not found.
    echo Please run this file from the project root directory.
    pause
    exit /b 1
)

echo Starting Spring Boot backend from:
echo %BACKEND_DIR%
:: Find the JAR file in target folder
set "JAR_FILE="
for /f "delims=" %%i in ('dir /b /s "%BACKEND_DIR%\target\um-dabau-backend.jar" 2^>nul') do set "JAR_FILE=%%i"

:: If specific name not found, look for any jar
if not defined JAR_FILE (
    for /f "delims=" %%i in ('dir /b /s "%BACKEND_DIR%\target\*.jar" ^| findstr /v "original" 2^>nul') do set "JAR_FILE=%%i"
)

if defined JAR_FILE (
    start "UM Food Delivery - Backend" cmd /k title UM Food Delivery - Backend ^& echo Starting backend server using Java... ^& java -jar "%JAR_FILE%"
) else (
    echo WARNING: JAR file not found. Falling back to mvn if available.
    start "UM Food Delivery - Backend" cmd /k cd /d "%BACKEND_DIR%" ^& echo Starting backend server ... ^& mvn spring-boot:run
)

echo.
echo Starting React frontend from:
echo %FRONTEND_DIR%
start "UM Food Delivery - Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && echo Installing frontend dependencies if needed... && npm install && echo Starting frontend server on %FRONTEND_URL% && npm start"

echo.
echo Waiting a few seconds before opening the browser...
timeout /t 8 /nobreak >nul

echo Opening frontend in your default browser:
echo %FRONTEND_URL%
start "" "%FRONTEND_URL%"

echo.
echo Launcher finished. Backend and frontend are running in separate terminal windows.
pause
