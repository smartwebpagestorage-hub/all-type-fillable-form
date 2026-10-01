$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   Sarkari Forms Seva - 1-Click Builder            " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$desktopDir = "f:\Coding\Forms\desktop"
$rootDir = "f:\Coding\Forms"

# 1. Compile Main App
Write-Host "`n[1/4] Compiling SarkariFormsSeva.exe..." -ForegroundColor Yellow
& $csc /target:winexe /nologo /r:System.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.Management.dll /r:System.Core.dll /out:"$desktopDir\SarkariFormsSeva.exe" "$desktopDir\SarkariFormsSevaApp.cs"
if ($LASTEXITCODE -ne 0) { throw "Failed to compile SarkariFormsSeva.exe" }
Write-Host "  -> SarkariFormsSeva.exe compiled successfully!" -ForegroundColor Green

# 2. Compile Uninstaller
Write-Host "`n[2/4] Compiling Uninstall.exe..." -ForegroundColor Yellow
& $csc /target:winexe /nologo /r:System.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll /out:"$desktopDir\Uninstall.exe" "$desktopDir\Uninstall.cs"
if ($LASTEXITCODE -ne 0) { throw "Failed to compile Uninstall.exe" }
Write-Host "  -> Uninstall.exe compiled successfully!" -ForegroundColor Green

# 3. Create Payload Zip
Write-Host "`n[3/4] Packaging offline assets into payload.zip..." -ForegroundColor Yellow
$tempStaging = "$desktopDir\staging"
if (Test-Path $tempStaging) { Remove-Item -Recurse -Force $tempStaging }
New-Item -ItemType Directory -Path $tempStaging | Out-Null

# Copy all HTML files from root
Get-ChildItem -Path $rootDir -Filter "*.html" | ForEach-Object {
    Copy-Item $_.FullName -Destination $tempStaging
}

# Copy CSS and JS
Get-ChildItem -Path $rootDir -Filter "*.css" | ForEach-Object {
    Copy-Item $_.FullName -Destination $tempStaging
}
Get-ChildItem -Path $rootDir -Filter "*.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination $tempStaging
}

# Copy image folder
if (Test-Path "$rootDir\image") {
    Copy-Item -Recurse "$rootDir\image" -Destination "$tempStaging\image"
}

# Copy compiled executables
Copy-Item "$desktopDir\SarkariFormsSeva.exe" -Destination $tempStaging
Copy-Item "$desktopDir\Uninstall.exe" -Destination $tempStaging

# Compress staging directory to payload.zip
$payloadZip = "$desktopDir\payload.zip"
if (Test-Path $payloadZip) { Remove-Item -Force $payloadZip }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempStaging, $payloadZip)
Remove-Item -Recurse -Force $tempStaging
$zipSize = (Get-Item $payloadZip).Length / 1MB
Write-Host ("  -> payload.zip created ({0:N2} MB)" -f $zipSize) -ForegroundColor Green

# 4. Compile Standalone Installer with embedded zip
Write-Host "`n[4/4] Compiling Sarkari-Forms-Seva-Setup.exe (Standalone Embedded Installer)..." -ForegroundColor Yellow
$setupExe = "$desktopDir\Sarkari-Forms-Seva-Setup.exe"
& $csc /target:winexe /nologo /r:System.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.Management.dll /r:System.Core.dll /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll /resource:"$payloadZip",payload.zip /out:"$setupExe" "$desktopDir\Installer.cs"
if ($LASTEXITCODE -ne 0) { throw "Failed to compile Sarkari-Forms-Seva-Setup.exe" }

# Clean temporary zip
Remove-Item -Force $payloadZip

# Copy to root folder as well
Copy-Item "$setupExe" -Destination "$rootDir\Sarkari-Forms-Seva-Setup.exe" -Force

$setupSize = (Get-Item $setupExe).Length / 1MB
Write-Host ("`n[SUCCESS] Setup executable created: {0} ({1:N2} MB)" -f $setupExe, $setupSize) -ForegroundColor Cyan
Write-Host "Also copied to root: $rootDir\Sarkari-Forms-Seva-Setup.exe" -ForegroundColor Cyan
Write-Host "Password protected with: 040278221195080511110416" -ForegroundColor Green
Write-Host "Hardware-locked to Motherboard UUID & MachineGuid" -ForegroundColor Green

