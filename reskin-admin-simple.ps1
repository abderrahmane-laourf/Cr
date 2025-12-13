# Simple Reskin Script - Blue & White Theme
# PowerShell - Admin Pages Only

Write-Host "Starting Blue & White Reskin for Admin Pages..." -ForegroundColor Cyan

$adminPath = "frontend\src\page\admin"
$totalModified = 0

if (!(Test-Path $adminPath)) {
    Write-Host "Path not found: $adminPath" -ForegroundColor Red
    exit
}

$files = Get-ChildItem -Path $adminPath -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Width changes
    $content = $content -replace 'max-w-lg mx-auto', 'w-full'
    $content = $content -replace 'max-w-7xl mx-auto', 'w-full'
    $content = $content -replace 'max-w-2xl mx-auto', 'w-full'
    $content = $content -replace 'max-w-4xl mx-auto', 'w-full'
    $content = $content -replace 'max-w-6xl mx-auto', 'w-full'
    
    # Card shadows
    $content = $content -replace 'shadow-sm border border-slate-100', 'shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100'
    
    # Text colors
    $content = $content -replace 'text-slate-800 font-extrabold', 'text-slate-900 font-extrabold'
    $content = $content -replace 'text-slate-500 font-medium', 'text-slate-600 font-medium'
    
    # Padding
    $content = $content -replace 'bg-white p-4 rounded', 'bg-white p-6 rounded'
    $content = $content -replace 'bg-white p-5 rounded', 'bg-white p-6 rounded'
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "Modified: $($file.Name)" -ForegroundColor Green
        $totalModified++
    }
}

Write-Host ""
Write-Host "Reskin complete! $totalModified files modified." -ForegroundColor Green
