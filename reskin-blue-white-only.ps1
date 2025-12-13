# Blue & White Only - Check Livreur & Versements
Write-Host "Applying Blue & White theme..." -ForegroundColor Cyan

$files = @(
    "frontend\src\page\admin\settlementManagement.jsx",
    "frontend\src\page\employee\confirmation\versementemployeemanager.jsx"
)

foreach ($file in $files) {
    if (!(Test-Path $file)) {
        Write-Host "Not found: $file" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $file -Raw -Encoding UTF8
    $original = $content
    
    # Remove all color gradients except blue
    $content = $content -replace 'bg-gradient-to-br from-amber-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-white'
    $content = $content -replace 'bg-gradient-to-br from-emerald-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-white'
    $content = $content -replace 'bg-gradient-to-br from-orange-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-white'
    $content = $content -replace 'bg-gradient-to-br from-green-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-white'
    $content = $content -replace 'bg-gradient-to-br from-purple-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-white'
    
    # Change colored borders to blue
    $content = $content -replace 'border-amber-\d+', 'border-blue-200'
    $content = $content -replace 'border-emerald-\d+', 'border-blue-200'
    $content = $content -replace 'border-orange-\d+', 'border-blue-200'
    $content = $content -replace 'border-green-\d+', 'border-blue-200'
    $content = $content -replace 'border-purple-\d+', 'border-blue-200'
    
    # Change colored text to slate
    $content = $content -replace 'text-amber-\d+', 'text-slate-600'
    $content = $content -replace 'text-emerald-\d+', 'text-slate-900'
    $content = $content -replace 'text-orange-\d+', 'text-slate-600'
    $content = $content -replace 'text-green-\d+', 'text-slate-900'
    $content = $content -replace 'text-purple-\d+', 'text-slate-600'
    
    # Change colored backgrounds to blue or white
    $content = $content -replace 'bg-amber-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-emerald-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-orange-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-green-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-purple-\d+', 'bg-blue-600'
    
    # Change colored shadows to blue
    $content = $content -replace 'shadow-amber-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-emerald-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-orange-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-green-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-purple-\d+/\d+', 'shadow-blue-500/10'
    
    if ($content -ne $original) {
        Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "Modified: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
    else {
        Write-Host "No changes: $(Split-Path $file -Leaf)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Blue & White theme applied!" -ForegroundColor Green
