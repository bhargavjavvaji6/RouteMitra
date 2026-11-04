$ErrorActionPreference = "Continue"
Set-Location (Split-Path -Parent $PSScriptRoot)
Write-Host "== Flutter version ==" -ForegroundColor Cyan
flutter --version
Write-Host "== Dependencies ==" -ForegroundColor Cyan
flutter pub get
Write-Host "== Static analysis ==" -ForegroundColor Cyan
flutter analyze
Write-Host "== Android devices ==" -ForegroundColor Cyan
flutter devices
