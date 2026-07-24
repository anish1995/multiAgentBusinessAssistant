Set-Location $PSScriptRoot

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

Write-Host "Installing dependencies..."
& .\.venv\Scripts\python.exe -m pip install -q -r requirements.txt

Write-Host "Starting AI services on http://localhost:8000"
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
