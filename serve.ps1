param(
  [int]$Port = 5173,
  [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$rootFull = [System.IO.Path]::GetFullPath($Root)
if (-not $rootFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
  $rootFull += [System.IO.Path]::DirectorySeparatorChar
}

$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
}

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  try {
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($Body.Length -gt 0) {
      $Stream.Write($Body, 0, $Body.Length)
    }
  } catch {
    return
  }
}

function Send-Text {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$Text
  )

  $body = [System.Text.Encoding]::UTF8.GetBytes($Text)
  Send-Response -Stream $Stream -StatusCode $StatusCode -StatusText $StatusText -Body $body
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$listener.Start()

Write-Host "Qing Ledger is running:"
Write-Host "  http://localhost:$Port"
try {
  Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
    ForEach-Object { Write-Host "  http://$($_.IPAddress):$Port" }
} catch {
  Write-Host "  Use ipconfig to find the LAN IP address."
}
Write-Host "Press Ctrl+C to stop."

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 5000
      $client.SendTimeout = 5000
      $stream = $client.GetStream()
      $stream.ReadTimeout = 5000
      $stream.WriteTimeout = 5000
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()

      while ($true) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) { break }
      }

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        Send-Text -Stream $stream -StatusCode 400 -StatusText "Bad Request" -Text "Bad Request"
        continue
      }

      $parts = $requestLine.Split(" ")
      if ($parts.Length -lt 2 -or $parts[0] -ne "GET") {
        Send-Text -Stream $stream -StatusCode 405 -StatusText "Method Not Allowed" -Text "Method Not Allowed"
        continue
      }

      $path = $parts[1].Split("?")[0]
      if ($path -eq "/") { $path = "/index.html" }
      $path = [System.Uri]::UnescapeDataString($path)
      $relative = $path.TrimStart([char]"/").Replace("/", [string][System.IO.Path]::DirectorySeparatorChar)
      $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootFull, $relative))

      if (-not $fullPath.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-Text -Stream $stream -StatusCode 403 -StatusText "Forbidden" -Text "Forbidden"
        continue
      }

      if (-not [System.IO.File]::Exists($fullPath)) {
        Send-Text -Stream $stream -StatusCode 404 -StatusText "Not Found" -Text "Not Found"
        continue
      }

      $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
      $contentType = $contentTypes[$extension]
      if (-not $contentType) { $contentType = "application/octet-stream" }

      $body = [System.IO.File]::ReadAllBytes($fullPath)
      Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -Body $body -ContentType $contentType
    } catch {
      if ($stream) {
        $message = "Server Error: $($_.Exception.Message)"
        try {
          Send-Text -Stream $stream -StatusCode 500 -StatusText "Internal Server Error" -Text $message
        } catch {
          continue
        }
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
