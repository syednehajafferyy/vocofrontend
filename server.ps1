$port = 3000
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

Write-Host "Starting VOCO Rooftop Server on http://localhost:$port..."

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
} catch {
    Write-Error "Could not start HttpListener on port $port. Is another process using it? $_"
    exit 1
}

Write-Host "Server running at http://localhost:$port"

function Get-ContentJson {
    $p = Join-Path $root "data\content.json"
    if (Test-Path $p) { return Get-Content -Raw $p -Encoding UTF8 }
    return "{}"
}

function Render-Page([string]$templateName) {
    $tplPath = Join-Path $root "lib\$templateName"
    $tpl = Get-Content -Raw $tplPath -Encoding UTF8
    $content = Get-ContentJson
    $safe = $content.Replace("</", "<\/").Replace("<!--", "<\u0021--")
    return $tpl.Replace("{{CONTENT}}", $safe).Replace("{{TPL}}", "")
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $rawUrl = $request.RawUrl
        $path = $request.Url.AbsolutePath
        $method = $request.HttpMethod

        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if ($method -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        # Helper to read request body
        $body = ""
        if ($request.HasEntityBody) {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()
        }

        $resPath = Join-Path $root "data\reservations.json"
        $ordersPath = Join-Path $root "data\orders.json"
        $contentPath = Join-Path $root "data\content.json"

        # Routes
        if ($path -eq "/" -or $path -eq "/index.html") {
            $html = Render-Page "template.html"
            $buf = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentType = "text/html; charset=utf-8"
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        elseif ($path -eq "/menu") {
            $html = Render-Page "menu.html"
            $buf = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentType = "text/html; charset=utf-8"
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        elseif ($path -eq "/admin") {
            $html = Get-Content -Raw (Join-Path $root "lib\admin.html") -Encoding UTF8
            $buf = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentType = "text/html; charset=utf-8"
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        elseif ($path -eq "/admin-login") {
            $html = Get-Content -Raw (Join-Path $root "lib\login.html") -Encoding UTF8
            $buf = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentType = "text/html; charset=utf-8"
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        elseif ($path -eq "/admin/preview") {
            $html = Render-Page "template.html"
            $buf = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentType = "text/html; charset=utf-8"
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        elseif ($path -eq "/api/content") {
            if ($method -eq "GET") {
                $c = Get-ContentJson
                $buf = [System.Text.Encoding]::UTF8.GetBytes($c)
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
            elseif ($method -eq "POST") {
                Set-Content -Path $contentPath -Value $body -Encoding UTF8
                $respJson = '{"ok":true}'
                $buf = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
        }
        elseif ($path -eq "/api/reservations") {
            if ($method -eq "GET") {
                $json = if (Test-Path $resPath) { Get-Content -Raw $resPath -Encoding UTF8 } else { "[]" }
                $buf = [System.Text.Encoding]::UTF8.GetBytes($json)
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
            elseif ($method -eq "POST") {
                $list = if (Test-Path $resPath) { (Get-Content -Raw $resPath -Encoding UTF8 | ConvertFrom-Json) } else { @() }
                $newItem = $body | ConvertFrom-Json
                $newItem | Add-Member -MemberType NoteProperty -Name "id" -Value ("res_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "_" + (Get-Random -Maximum 1000)) -Force
                $newItem | Add-Member -MemberType NoteProperty -Name "status" -Value "Pending" -Force
                $newItem | Add-Member -MemberType NoteProperty -Name "createdAt" -Value (Get-Date -Format "o") -Force
                $all = @($newItem) + @($list)
                Set-Content -Path $resPath -Value ($all | ConvertTo-Json -Depth 10) -Encoding UTF8
                $respJson = '{"ok":true}'
                $buf = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
            elseif ($method -eq "PATCH") {
                $bObj = $body | ConvertFrom-Json
                $list = if (Test-Path $resPath) { (Get-Content -Raw $resPath -Encoding UTF8 | ConvertFrom-Json) } else { @() }
                foreach ($item in $list) {
                    if ($item.id -eq $bObj.id) {
                        if ($bObj.status) { $item.status = $bObj.status }
                    }
                }
                Set-Content -Path $resPath -Value ($list | ConvertTo-Json -Depth 10) -Encoding UTF8
                $buf = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
            elseif ($method -eq "DELETE") {
                $id = $request.QueryString["id"]
                $list = if (Test-Path $resPath) { (Get-Content -Raw $resPath -Encoding UTF8 | ConvertFrom-Json) } else { @() }
                $filtered = @($list | Where-Object { $_.id -ne $id })
                Set-Content -Path $resPath -Value ($filtered | ConvertTo-Json -Depth 10) -Encoding UTF8
                $buf = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
        }
        elseif ($path -eq "/api/orders") {
            if ($method -eq "GET") {
                $json = if (Test-Path $ordersPath) { Get-Content -Raw $ordersPath -Encoding UTF8 } else { "[]" }
                $buf = [System.Text.Encoding]::UTF8.GetBytes($json)
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
            elseif ($method -eq "POST") {
                $list = if (Test-Path $ordersPath) { (Get-Content -Raw $ordersPath -Encoding UTF8 | ConvertFrom-Json) } else { @() }
                $newItem = $body | ConvertFrom-Json
                $newItem | Add-Member -MemberType NoteProperty -Name "id" -Value ("ord_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "_" + (Get-Random -Maximum 1000)) -Force
                $newItem | Add-Member -MemberType NoteProperty -Name "status" -Value "Received" -Force
                $newItem | Add-Member -MemberType NoteProperty -Name "createdAt" -Value (Get-Date -Format "o") -Force
                $all = @($newItem) + @($list)
                Set-Content -Path $ordersPath -Value ($all | ConvertTo-Json -Depth 10) -Encoding UTF8
                $respJson = '{"ok":true}'
                $buf = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
            elseif ($method -eq "PATCH") {
                $bObj = $body | ConvertFrom-Json
                $list = if (Test-Path $ordersPath) { (Get-Content -Raw $ordersPath -Encoding UTF8 | ConvertFrom-Json) } else { @() }
                foreach ($item in $list) {
                    if ($item.id -eq $bObj.id) {
                        if ($bObj.status) { $item.status = $bObj.status }
                    }
                }
                Set-Content -Path $ordersPath -Value ($list | ConvertTo-Json -Depth 10) -Encoding UTF8
                $buf = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
            elseif ($method -eq "DELETE") {
                $id = $request.QueryString["id"]
                $list = if (Test-Path $ordersPath) { (Get-Content -Raw $ordersPath -Encoding UTF8 | ConvertFrom-Json) } else { @() }
                $filtered = @($list | Where-Object { $_.id -ne $id })
                Set-Content -Path $ordersPath -Value ($filtered | ConvertTo-Json -Depth 10) -Encoding UTF8
                $buf = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
                $response.ContentType = "application/json; charset=utf-8"
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
        }
        elseif ($path -eq "/api/login") {
            $response.AppendHeader("Set-Cookie", "voco_admin=active_session; Path=/; HttpOnly")
            $buf = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
            $response.ContentType = "application/json; charset=utf-8"
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        elseif ($path -eq "/api/logout") {
            $response.AppendHeader("Set-Cookie", "voco_admin=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
            $buf = [System.Text.Encoding]::UTF8.GetBytes('{"ok":true}')
            $response.ContentType = "application/json; charset=utf-8"
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        else {
            $localFile = Join-Path $root ($path.TrimStart('/'))
            if (Test-Path $localFile -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($localFile)
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $buf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.OutputStream.Write($buf, 0, $buf.Length)
            }
        }
        $response.Close()
    } catch {
        try { $response.Close() } catch {}
    }
}
