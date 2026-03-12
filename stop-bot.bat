@echo off
echo Stopping Companion Bot...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Companion Bot" >nul 2>&1
if %errorlevel%==0 (
    echo Bot stopped.
) else (
    echo No running bot found. Killing all node processes matching bot.js...
    wmic process where "commandline like '%%bot.js%%'" call terminate >nul 2>&1
    echo Done.
)
pause
