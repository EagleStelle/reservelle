@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  run.cmd - one command for everything (Angular 22 SSR)
REM  Usage:
REM    run            -> menu
REM    run dev        -> dev server (ng serve, hot reload)
REM    run prod       -> build prod + run SSR server
REM    run build      -> build prod only
REM    run install    -> install deps only
REM ============================================================

cd /d "%~dp0"

REM --- config: load from .env (gitignored); fall back to .env.example ---
if exist ".env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env") do set "%%a=%%b"
) else if exist ".env.example" (
  echo [config] .env not found, using .env.example defaults
  for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env.example") do set "%%a=%%b"
)

REM Backend API the frontend talks to. NEVER touch the backend itself.
if not defined BACKEND_IP set "BACKEND_IP=127.0.0.1"
if not defined PORT set "PORT=4000"
set "BACKEND_URL=http://%BACKEND_IP%"

set "MODE=%~1"
if "%MODE%"=="" goto menu
goto run

:menu
echo.
echo   lpuL reservation - frontend runner
echo   backend: %BACKEND_URL%
echo.
echo   [1] dev    - live reload dev server
echo   [2] prod   - build + run SSR server
echo   [3] build  - build prod only
echo   [4] install- install deps only
echo.
set /p "CHOICE=pick (1-4): "
if "%CHOICE%"=="1" set "MODE=dev"
if "%CHOICE%"=="2" set "MODE=prod"
if "%CHOICE%"=="3" set "MODE=build"
if "%CHOICE%"=="4" set "MODE=install"
if "%MODE%"=="" goto menu

:run
REM --- deps: install if missing OR if any package unmet ---
if not exist "node_modules" (
  echo [deps] node_modules missing, installing...
  call npm install
  if errorlevel 1 goto fail
) else (
  echo [deps] checking installed packages...
  REM npm ls exits non-zero when deps missing/unmet/out of sync
  call npm ls --depth=0 >nul 2>&1
  if errorlevel 1 (
    echo [deps] missing/unmet packages found, installing...
    call npm install
    if errorlevel 1 goto fail
  ) else (
    echo [deps] all packages present, skipping install
  )
)

if /i "%MODE%"=="install" (
  echo [done] deps ready
  goto end
)

if /i "%MODE%"=="dev" (
  echo [dev] backend=%BACKEND_URL%  serving on http://localhost:4200
  call npm start
  goto end
)

if /i "%MODE%"=="build" (
  echo [build] production build...
  call npm run build
  if errorlevel 1 goto fail
  echo [done] output in dist\frontend
  goto end
)

if /i "%MODE%"=="prod" (
  echo [build] production build...
  call npm run build
  if errorlevel 1 goto fail
  echo [serve] SSR server on http://localhost:%PORT%  backend=%BACKEND_URL%
  call npm run serve:ssr:frontend
  goto end
)

echo [error] unknown mode: %MODE%
echo usage: run [dev^|prod^|build^|install]
goto end

:fail
echo [error] command failed, see output above
exit /b 1

:end
endlocal
