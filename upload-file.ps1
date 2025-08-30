# PowerShell script for uploading files to SmartDoc backend
# Usage: .\upload-file.ps1 -FilePath "path\to\file.pdf" -Username "yourusername" -Password "yourpassword"

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

# API endpoints
$baseUrl = "http://localhost:5000/api"
$loginUrl = "$baseUrl/login"
$uploadUrl = "$baseUrl/upload"

Write-Host "SmartDoc File Upload Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Step 1: Login to get token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = $Username
        password = $Password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -ContentType "application/json" -Body $loginBody
    
    if ($loginResponse.access_token) {
        $token = $loginResponse.access_token
        Write-Host "Login successful! User: $($loginResponse.user.username)" -ForegroundColor Green
    } else {
        Write-Host "Login failed: No access token received" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "Error: File not found at $FilePath" -ForegroundColor Red
    exit 1
}

$fileName = Split-Path $FilePath -Leaf
Write-Host "Step 2: Uploading file: $fileName" -ForegroundColor Yellow

# Step 3: Upload file
try {
    # Create multipart form data manually
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
        "Content-Type: application/octet-stream",
        "",
        [System.IO.File]::ReadAllBytes($FilePath),
        "--$boundary--"
    )
    
    $body = $bodyLines -join $LF
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $uploadResponse = Invoke-RestMethod -Uri $uploadUrl -Method POST -Headers $headers -Body $body
    
    Write-Host "Upload successful!" -ForegroundColor Green
    Write-Host "Document ID: $($uploadResponse.document_id)" -ForegroundColor Cyan
    Write-Host "Filename: $($uploadResponse.filename)" -ForegroundColor Cyan
    Write-Host "Chunks processed: $($uploadResponse.chunks_processed)" -ForegroundColor Cyan
    Write-Host "Total chunks: $($uploadResponse.total_chunks)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error details: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
    exit 1
}

Write-Host "`nFile upload completed successfully!" -ForegroundColor Green
