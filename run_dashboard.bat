@echo off
REM ==========================================================
REM IMPORTANT SETUP NOTE
REM ----------------------------------------------------------
REM After downloading this project, YOU MUST CHANGE THE PATHS
REM below to match your local project location.
REM
REM Example:
REM cd /d "C:\Users\user\Downloads\Capstone project\backend"
REM cd /d "C:\Users\user\Downloads\Capstone project\frontend\Geowatch_Nabeul"
REM
REM If the paths are not updated, the script will NOT work.
REM ==========================================================

echo Starting Django backend...
cd /d "C:\Users\user\Downloads\Capstone project\backend"
call env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py load_accuracy_data
start cmd /k "python manage.py runserver"

echo.
echo Starting React frontend...
cd /d "C:\Users\user\Downloads\Capstone project\frontend\Geowatch_Nabeul"
start cmd /k "npm install && npm run dev"

echo.
echo Dashboard is starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo NEW FEATURE: Click anywhere on map to get real pixel information!
echo.
pause