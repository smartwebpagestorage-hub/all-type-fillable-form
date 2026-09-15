@echo off
title Pull Forms from GitHub
echo =======================================================
echo Pulling latest updates from GitHub...
echo Repository: https://github.com/smartwebpagestorage-hub/all-type-fillable-form
echo =======================================================
set "PATH=C:\Users\hp\MinGit\cmd;C:\Users\hp\MinGit\mingw64\bin;%PATH%"
cd /d e:\Forms
git.exe pull origin main
echo.
if %errorlevel% equ 0 (
    echo =======================================================
    echo [SUCCESS] Sabhi latest updates GitHub se pull ho gaye!
    echo =======================================================
) else (
    echo =======================================================
    echo [NOTICE] Pull complete nahi hua. Check network/conflicts.
    echo =======================================================
)
pause
