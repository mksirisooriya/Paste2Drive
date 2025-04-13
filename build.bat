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

REM Check for 7-Zip
where 7z >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo Using 7-Zip to create package...
    
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
      README.md ^
      PRIVACY-POLICY.md ^
      -x!*.git* ^
      -x!*.DS_Store ^
      -x!node_modules\*
      
    echo Package created successfully: %BUILD_DIR%\%ZIP_NAME%
) ELSE (
    echo 7-Zip not found. Checking for PowerShell...
    powershell -Command "& {if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {exit 0} else {exit 1}}" >nul 2>nul
    
    IF %ERRORLEVEL% EQU 0 (
        echo Using PowerShell to create package...
        
        REM Create a temporary directory with only the files we want
        mkdir temp_build
        copy manifest.json temp_build\
        copy background.js temp_build\
        copy content.js temp_build\
        copy popup.html temp_build\
        copy popup.js temp_build\
        copy popup.css temp_build\
        copy options.html temp_build\
        copy options.js temp_build\
        copy utility.js temp_build\
        mkdir temp_build\images
        copy images\*.png temp_build\images\
        copy README.md temp_build\
        copy PRIVACY-POLICY.md temp_build\
        
        REM Create zip with PowerShell
        powershell -Command "& {Compress-Archive -Path temp_build\* -DestinationPath '%BUILD_DIR%\%ZIP_NAME%' -Force}"
        
        REM Clean up
        rmdir /s /q temp_build
        
        echo Package created successfully: %BUILD_DIR%\%ZIP_NAME%
    ) ELSE (
        echo Neither 7-Zip nor PowerShell Compress-Archive is available.
        echo Please manually zip the necessary files or install 7-Zip.
    )
)

echo.
echo Build complete: %BUILD_DIR%\%ZIP_NAME%
echo Ready to upload to Chrome Web Store!
echo.