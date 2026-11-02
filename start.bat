@echo off
title DataSolu - Business Analytics Platform
echo ========================================================
echo   DataSolu - منصة تحليل بيانات الأعمال وموقف المشاريع
echo   Smart Business Analytics & Excel Dashboard
echo ========================================================
echo.
echo Starting local web application on http://localhost:5173 ...
echo.
start http://localhost:5173
cmd.exe /c "npm run dev"
pause
