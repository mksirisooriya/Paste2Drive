@echo off
REM Build script for Paste2Drive Chrome Extension

REM Set variables
FOR /F "tokens=2 delims=:," %%a IN ('findstr /C:"\"version\"" manifest.json') DO (
    SET VERSION=%%a
    SET VERSION=!VERSION:"=!
    SET VERSION=!VERSION: =!
)

SET BUILD_DIR=build
SET ZIP_NAME=paste2drive-v%VERSION%.zip

REM Create build directory if it doesn't exist
IF NOT EXIST %BUILD_DIR% mkdir %BUILD_DIR%

REM Remove previous build if it exists
IF EXIST "%BUILD_DIR%\%ZIP_NAME%" del "%BUILD_DIR%\%ZIP_NAME%"

REM Check if 7-Zip is installed
where 7z >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo 7-Zip not found. Please install 7-Zip or add it to your PATH.
    echo You can download 7-Zip from https://www.7-zip.org/
    echo.
    echo Alternatively, you can manually zip the required files.
    goto :EOF
)

echo Creating zip file for Paste2Drive v%VERSION%...

REM Create the zip file using 7-Zip
7z a -tzip "%BUILD_DIR%\%ZIP_NAME%" ^
  manifest.json ^
  background.js ^
  content.js ^
  popup.html ^
  popup.js ^
  popup.css ^
  options.html ^
  options.js ^
  utility.js ^
  images\*.png ^
  -x!*.git* ^
  -x!*.DS_Store ^
  -x!node_modules\*

echo.
echo Build complete: %BUILD_DIR%\%ZIP_NAME%
echo Ready to upload to Chrome Web Store!
echo.