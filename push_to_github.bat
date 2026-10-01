@echo off
title Push Forms to GitHub
echo =======================================================
echo Pushing All-Type Fillable Forms to GitHub...
echo Repository: https://github.com/smartwebpagestorage-hub/all-type-fillable-form
echo =======================================================
set "PATH=%PATH%;C:\Users\hp\MinGit\cmd;C:\Users\hp\MinGit\mingw64\bin"
cd /d "%~dp0"
git push origin main
echo.
if %errorlevel% equ 0 (
    echo =======================================================
    echo [SUCCESS] Sabhi forms GitHub par push ho gaye hain!
    echo =======================================================
) else (
    echo =======================================================
    echo [NOTICE] Push complete nahi hua. Check authorization.
    echo =======================================================
)
pause
