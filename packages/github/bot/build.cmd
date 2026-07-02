@echo off
setlocal enabledelayedexpansion

echo "Installing all dependencies..."
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
echo "Installed all dependencies"

echo "Transpiling..."
call npx tsc
if %errorlevel% neq 0 exit /b %errorlevel%
echo "Transpiled"

echo import { main } from './dist/index.js'; export { main }; > index.js

echo "Clearing existing dependencies..."
rmdir /s /q node_modules
echo "Cleared existing dependencies"

echo "Installing prod dependencies..."
call npm install --production
echo "Installed prod dependencies"
if %errorlevel% neq 0 exit /b %errorlevel%