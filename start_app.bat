@echo off
echo ===================================================
echo   Starting A. Sujatha Invoice Generator...
echo ===================================================
echo.
echo Opening invoice generator in your default browser...
start http://localhost:8080/index.html
python -m http.server 8080
pause
