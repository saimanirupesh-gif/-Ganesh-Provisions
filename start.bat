@echo off
cd /d "%~dp0server"
echo Starting Ganesh Provisions at http://localhost:3001
echo Do not open index.html directly — use the URL above.
npm start
