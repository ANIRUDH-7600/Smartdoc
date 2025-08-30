@echo off
echo SmartDoc File Upload Tool
echo ========================
echo.

if "%~1"=="" (
    echo Usage: upload-file.bat "path\to\file.pdf"
    echo.
    echo This will prompt you for username and password
    echo.
    pause
    exit /b 1
)

if not exist "%~1" (
    echo Error: File not found: %~1
    pause
    exit /b 1
)

echo File to upload: %~1
echo.

set /p username="Username: "
set /p password="Password: "

echo.
echo Uploading file...

powershell -ExecutionPolicy Bypass -File "%~dp0upload-file.ps1" -FilePath "%~1" -Username "%username%" -Password "%password%"

echo.
pause
