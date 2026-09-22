@echo off
title Yatra Mesh - Shared Mobility Platform
color 0A
echo ======================================================================
echo                  YATRA MESH MOBILITY PLATFORM
echo          Corporate Shared Transit ^& Edge Safety Mesh Engine
echo ======================================================================
echo.
echo  [1/2] Opening Yatra Mesh Application Portal in your browser...
start "" "index.html"
echo.
echo  [2/2] Starting Next.js development server on http://localhost:3000...
echo        (The launcher portal will automatically redirect once compilation finishes)
echo.
echo  ----------------------------------------------------------------------
echo  Press Ctrl+C at any time in this window to stop the server.
echo  ----------------------------------------------------------------------
echo.

npm run dev
pause
