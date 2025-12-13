# HR Pages Reskin - Simple Version
Write-Host "Starting HR Pages Reskin..." -ForegroundColor Cyan

$files = @(
    "frontend\src\page\admin\employee.jsx",
    "frontend\src\page\admin\paiement.jsx",
    "frontend\src\page\admin\employeeDashboard.jsx",
    "frontend\src\page\admin\presence.jsx",
    "frontend\src\page\admin\commissions.jsx",
    "frontend\src\page\admin\affectations.jsx",
    "frontend\src\page\admin\permissions.jsx"
)

$count = 0

foreach ($file in $files) {
    if (!(Test-Path $file)) {
        Write-Host "Not found: $file" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $file -Raw -Encoding UTF8
    $original = $content
    
    # Colors
    $content = $content -replace 'text-gray-900', 'text-slate-900'
    $content = $content -replace 'text-gray-600', 'text-slate-600'
    $content = $content -replace 'text-gray-500', 'text-slate-500'
    $content = $content -replace 'bg-gray-50', 'bg-slate-50'
    $content = $content -replace 'border-gray-200', 'border-slate-200'
    $content = $content -replace 'border-gray-100', 'border-slate-100'
    
    # Shadows
    $content = $content -replace 'shadow-sm border border-slate-100', 'shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100'
    
    # Width
    $content = $content -replace 'min-h-screen bg-slate-50', 'w-full min-h-screen bg-slate-50 animate-[fade-in_0.6s_ease-out]'
    
    if ($content -ne $original) {
        Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "Modified: $(Split-Path $file -Leaf)" -ForegroundColor Green
        $count++
    }
}

Write-Host ""
Write-Host "Reskin complete! $count files modified." -ForegroundColor Green
