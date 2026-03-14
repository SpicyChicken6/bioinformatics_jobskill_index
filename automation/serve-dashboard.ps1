param([string]$Root = 'E:\workdir\bioinformatics-board', [int]$Port = 4173)
Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()
$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.csv' = 'text/csv; charset=utf-8'
  '.md' = 'text/markdown; charset=utf-8'
  '.txt' = 'text/plain; charset=utf-8'
}
try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [System.Web.HttpUtility]::UrlDecode($context.Request.Url.AbsolutePath)
    if ([string]::IsNullOrWhiteSpace($requestPath) -or $requestPath -eq '/') {
      $requestPath = '/index.html'
    }
    $relativePath = $requestPath.TrimStart('/') -replace '/', '\\'
    $fullPath = Join-Path $Root $relativePath
    $rootPath = [System.IO.Path]::GetFullPath($Root)
    $resolvedPath = [System.IO.Path]::GetFullPath($fullPath)
    if (-not $resolvedPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $resolvedPath -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $buffer = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
      $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
      $context.Response.Close()
      continue
    }
    $extension = [System.IO.Path]::GetExtension($resolvedPath).ToLowerInvariant()
    $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
    $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
    $context.Response.StatusCode = 200
    $context.Response.ContentType = $contentType
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
