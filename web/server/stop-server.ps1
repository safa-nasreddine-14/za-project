# Stop all Node.js processes running on port 3000
Write-Host "Stopping all servers on port 3000..." -ForegroundColor Yellow

$processes = netstat -ano | Select-String ":3000" | Select-String "LISTENING"

if ($processes) {
    foreach ($line in $processes) {
        $pid = ($line -split '\s+')[-1]
        Write-Host "Killing process $pid..." -ForegroundColor Red
        taskkill /F /PID $pid 2>$null
    }
    Write-Host "All server processes stopped." -ForegroundColor Green
} else {
    Write-Host "No server running on port 3000." -ForegroundColor Cyan
}
