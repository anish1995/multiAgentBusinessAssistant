@echo off
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Creating virtual environment...
  python -m venv .venv
)

echo Installing dependencies...
.venv\Scripts\python.exe -m pip install -q -r requirements.txt

echo Starting AI services on http://localhost:8000
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
