@echo off
cd /d "%~dp0"
echo Resuming Gemini location seeding (cached batches are skipped)...
echo Progress check:
call npm run db:check-gemini-progress
echo.
echo Starting seed — leave this window open.
call npm run db:seed-gemini-locations
echo.
echo Seed finished with exit code %ERRORLEVEL%
pause
