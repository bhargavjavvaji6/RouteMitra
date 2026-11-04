param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectPath = "C:\Projects\routemitra"
)

$ErrorActionPreference = "Stop"

# Resolve paths
$ProjectPath = [System.IO.Path]::GetFullPath($ProjectPath)
$PackageRoot = [System.IO.Path]::GetFullPath(
    (Split-Path -Parent $PSScriptRoot)
)

Write-Host "`nRouteMitra installer" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath"
Write-Host "Package: $PackageRoot"

# Helper: compare normalized paths
function Test-SamePath {
    param(
        [string]$PathA,
        [string]$PathB
    )

    $a = [System.IO.Path]::GetFullPath($PathA).TrimEnd('\')
    $b = [System.IO.Path]::GetFullPath($PathB).TrimEnd('\')

    return [string]::Equals(
        $a,
        $b,
        [System.StringComparison]::OrdinalIgnoreCase
    )
}

# Validate existing Flutter project
if (-not (Test-Path (Join-Path $ProjectPath "pubspec.yaml") -PathType Leaf)) {
    throw "Project pubspec.yaml was not found: $ProjectPath"
}

if (-not (Test-Path (Join-Path $ProjectPath "lib") -PathType Container)) {
    throw "Project lib folder was not found: $ProjectPath"
}

# Validate package source files BEFORE changing the project
$requiredSources = @(
    "lib",
    "assets",
    "pubspec.yaml",
    "firestore.rules",
    "README_DEPLOYMENT.md"
)

foreach ($item in $requiredSources) {
    $source = Join-Path $PackageRoot $item

    if (-not (Test-Path $source)) {
        throw "Required package source is missing: $source. Check that the ZIP was extracted correctly."
    }
}

# Do not install a package into itself
if (Test-SamePath $PackageRoot $ProjectPath) {
    Write-Host "`nSource package and project are the same directory." -ForegroundColor Yellow
    Write-Host "Self-copy operations will be skipped."
}

# Create backup before modifying the project
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupRoot = Join-Path $ProjectPath "_routemitra_source_backup_$stamp"

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

Copy-Item `
    -LiteralPath (Join-Path $ProjectPath "lib") `
    -Destination (Join-Path $backupRoot "lib") `
    -Recurse -Force

Copy-Item `
    -LiteralPath (Join-Path $ProjectPath "pubspec.yaml") `
    -Destination (Join-Path $backupRoot "pubspec.yaml") `
    -Force

$existingAssets = Join-Path $ProjectPath "assets"

if (Test-Path $existingAssets) {
    Copy-Item `
        -LiteralPath $existingAssets `
        -Destination (Join-Path $backupRoot "assets") `
        -Recurse -Force
}

$firebaseOptions = Join-Path $ProjectPath "lib\firebase_options.dart"

if (Test-Path $firebaseOptions) {
    Copy-Item `
        -LiteralPath $firebaseOptions `
        -Destination (Join-Path $backupRoot "firebase_options.dart") `
        -Force
}

Write-Host "`nBackup created: $backupRoot" -ForegroundColor Green

# Copy lib only when source and destination differ
$sourceLib = Join-Path $PackageRoot "lib"
$targetLib = Join-Path $ProjectPath "lib"

if (-not (Test-SamePath $sourceLib $targetLib)) {
    # Preserve the user's Firebase configuration
    $savedFirebaseOptions = Join-Path $backupRoot "firebase_options.dart"

    Remove-Item -LiteralPath $targetLib -Recurse -Force
    New-Item -ItemType Directory -Path $targetLib -Force | Out-Null

    Get-ChildItem -LiteralPath $sourceLib -Force |
    Copy-Item -Destination $targetLib -Recurse -Force

    if (Test-Path $savedFirebaseOptions) {
        Copy-Item `
            -LiteralPath $savedFirebaseOptions `
            -Destination (Join-Path $targetLib "firebase_options.dart") `
            -Force
    }

    Write-Host "Flutter source files copied." -ForegroundColor Green
}
else {
    Write-Host "Skipped copying lib onto itself." -ForegroundColor Yellow
}

# Copy assets only when source and destination differ
$sourceAssets = Join-Path $PackageRoot "assets"
$targetAssets = Join-Path $ProjectPath "assets"

if (-not (Test-SamePath $sourceAssets $targetAssets)) {
    New-Item -ItemType Directory -Path $targetAssets -Force | Out-Null

    Get-ChildItem -LiteralPath $sourceAssets -Force |
    Copy-Item -Destination $targetAssets -Recurse -Force

    Write-Host "Assets copied." -ForegroundColor Green
}
else {
    Write-Host "Skipped copying assets onto themselves." -ForegroundColor Yellow
}

# Copy configuration/documentation only when source and destination differ
$filesToCopy = @(
    "pubspec.yaml",
    "firestore.rules",
    "README_DEPLOYMENT.md"
)

foreach ($file in $filesToCopy) {
    $sourceFile = Join-Path $PackageRoot $file
    $targetFile = Join-Path $ProjectPath $file

    if (-not (Test-SamePath $sourceFile $targetFile)) {
        Copy-Item -LiteralPath $sourceFile -Destination $targetFile -Force
        Write-Host "Copied $file" -ForegroundColor Green
    }
    else {
        Write-Host "Skipped copying $file onto itself." -ForegroundColor Yellow
    }
}

Write-Host "`nInstallation steps completed." -ForegroundColor Green
Write-Host "Your existing android and ios folders were not intentionally replaced." -ForegroundColor Cyan
Write-Host "`nNext commands:" -ForegroundColor Yellow
Write-Host "  Set-Location '$ProjectPath'"
Write-Host "  flutter pub get"
Write-Host "  flutter analyze"
Write-Host "  flutter build apk --debug"
