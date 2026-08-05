$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$aiPath = Join-Path $repoRoot "ai-services"
$backendPath = Join-Path $repoRoot "backend"
$frontendPath = Join-Path $repoRoot "frontend"

Write-Host "Starting local stack from: $repoRoot" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Warning "Docker was not found in PATH. PostgreSQL will not be started automatically. Start it manually or make sure Docker Desktop is running."
}
else {
    Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
    Push-Location $repoRoot
    docker compose up -d postgres
    Pop-Location
}

$aiVenvPython = Join-Path $aiPath ".venv\Scripts\python.exe"
if (-not (Test-Path $aiVenvPython)) {
    Write-Host "Creating Python virtual environment for AI service..." -ForegroundColor Yellow
    Push-Location $aiPath
    python -m venv .venv
    Pop-Location
}

Write-Host "Installing AI service dependencies..." -ForegroundColor Yellow
Push-Location $aiPath
& $aiVenvPython -m pip install -q -r requirements.txt
Pop-Location

Write-Host "Launching AI service on http://localhost:8000" -ForegroundColor Green
$aiCommand = @"
Set-Location '$aiPath'
& '.venv\Scripts\Activate.ps1'
python -m uvicorn app.main:app --reload --port 8000
"@
Start-Process powershell.exe -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command", $aiCommand -WorkingDirectory $aiPath

Write-Host "Launching backend on http://localhost:8080 using the dev profile" -ForegroundColor Green
$backendCommand = @"
Set-Location '$backendPath'
mvn spring-boot:run -Dspring-boot.run.profiles=dev
"@
Start-Process powershell.exe -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command", $backendCommand -WorkingDirectory $backendPath

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm was not found in PATH. Install Node.js before starting the frontend."
}

if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontendPath
    npm install
    Pop-Location
}

Write-Host "Launching frontend on http://localhost:3000" -ForegroundColor Green
$frontendCommand = @"
Set-Location '$frontendPath'
npm run dev
"@
Start-Process powershell.exe -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command", $frontendCommand -WorkingDirectory $frontendPath

Write-Host "" 
Write-Host "Local services are starting in separate terminal windows:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "- AI API:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "- Admin login: admin@businessassistant.com / admin123" -ForegroundColor Cyan
