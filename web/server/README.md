# Allo Police Server

## Quick Start

### Starting the Server
```powershell
npm start
```

### If You Get "EADDRINUSE" Error

This means the server is already running! You have two options:

**Option 1: Use the existing running server** (recommended)
- Just leave it running and use the app

**Option 2: Restart the server**
```powershell
.\restart-server.ps1
```

### Stop All Servers
```powershell
.\stop-server.ps1
```

## Common Issues

### Port 3000 Already in Use
- Run `.\stop-server.ps1` to kill all servers
- Then run `npm start` again

### Server Not Responding
- Run `.\restart-server.ps1` to restart cleanly
