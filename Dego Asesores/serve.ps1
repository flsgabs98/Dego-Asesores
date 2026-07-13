param(
  [int]$Port = 8420,
  [string]$Root = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml"
  ".mp4"  = "video/mp4"
  ".ogg"  = "audio/ogg"
  ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response
  try {
    $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $Root ($path.TrimStart("/"))

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $contentType = $mime[$ext]
      if (-not $contentType) { $contentType = "application/octet-stream" }
      $response.ContentType = $contentType
      $response.Headers.Add("Accept-Ranges", "bytes")

      $fileLength = (Get-Item $filePath).Length
      $rangeHeader = $request.Headers["Range"]

      if ($rangeHeader -and $rangeHeader -match "bytes=(\d*)-(\d*)") {
        $start = if ($matches[1]) { [int64]$matches[1] } else { 0 }
        $end = if ($matches[2]) { [int64]$matches[2] } else { $fileLength - 1 }
        $length = $end - $start + 1

        $response.StatusCode = 206
        $response.Headers.Add("Content-Range", "bytes $start-$end/$fileLength")
        $response.ContentLength64 = $length

        $stream = [System.IO.File]::OpenRead($filePath)
        $stream.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
        $buffer = New-Object byte[] 65536
        $remaining = $length
        while ($remaining -gt 0) {
          $toRead = [Math]::Min($buffer.Length, $remaining)
          $read = $stream.Read($buffer, 0, $toRead)
          if ($read -le 0) { break }
          $response.OutputStream.Write($buffer, 0, $read)
          $remaining -= $read
        }
        $stream.Close()
      } else {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } else {
      $response.StatusCode = 404
      $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
      $response.OutputStream.Write($notFound, 0, $notFound.Length)
    }
  } catch {
    $response.StatusCode = 500
  } finally {
    $response.OutputStream.Close()
  }
}
