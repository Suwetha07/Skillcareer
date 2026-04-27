$services = @(
  @{ Name = 'user-service'; Path = 'services\user-service'; Port = 5001 },
  @{ Name = 'career-service'; Path = 'services\career-service'; Port = 5002 },
  @{ Name = 'skill-service'; Path = 'services\skill-service'; Port = 5003 },
  @{ Name = 'roadmap-service'; Path = 'services\roadmap-service'; Port = 5004 },
  @{ Name = 'content-service'; Path = 'services\content-service'; Port = 5005 },
  @{ Name = 'progress-service'; Path = 'services\progress-service'; Port = 5006 },
  @{ Name = 'api-gateway'; Path = 'api-gateway'; Port = 5000 }
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($service in $services) {
  $isRunning = netstat -ano | Select-String ":$($service.Port)\s"
  if ($isRunning) {
    Write-Host "$($service.Name) already running on port $($service.Port)"
    continue
  }

  $workingDirectory = Join-Path $repoRoot $service.Path
  Start-Process powershell -ArgumentList '-NoExit', '-Command', 'node server.js' -WorkingDirectory $workingDirectory
  Write-Host "Starting $($service.Name) on port $($service.Port)"
}
