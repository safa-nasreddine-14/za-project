# Restart the server cleanly
Write-Host "Restarting server..." -ForegroundColor Yellow

# Stop existing servers
& "$PSScriptRoot\stop-server.ps1"

# Wait a moment
Start-Sleep -Seconds 1

# Start fresh server
Write-Host "Starting server..." -ForegroundColor Green
node "$PSScriptRoot\index.js"
