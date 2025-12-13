# STRICT Blue & White ONLY - Remove ALL other colors
Write-Host "Applying STRICT Blue & White theme (no other colors)..." -ForegroundColor Cyan

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
    
    # Replace ALL colored gradients with white
    $content = $content -replace 'bg-gradient-to-r from-emerald-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-gradient-to-r from-red-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-gradient-to-r from-orange-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-gradient-to-r from-amber-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-gradient-to-r from-green-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-gradient-to-r from-purple-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-gradient-to-r from-pink-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-gradient-to-r from-yellow-\d+ (via-\w+-\d+ )?to-\w+-\d+', 'bg-blue-600'
    
    # Replace ALL colored backgrounds
    $content = $content -replace 'bg-emerald-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-green-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-red-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-rose-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-orange-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-amber-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-yellow-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-purple-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-pink-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-teal-\d+', 'bg-blue-600'
    $content = $content -replace 'bg-cyan-\d+', 'bg-blue-600'
    
    # Replace ALL colored text
    $content = $content -replace 'text-emerald-\d+', 'text-slate-900'
    $content = $content -replace 'text-green-\d+', 'text-slate-900'
    $content = $content -replace 'text-red-\d+', 'text-slate-900'
    $content = $content -replace 'text-rose-\d+', 'text-slate-900'
    $content = $content -replace 'text-orange-\d+', 'text-slate-900'
    $content = $content -replace 'text-amber-\d+', 'text-slate-900'
    $content = $content -replace 'text-yellow-\d+', 'text-slate-900'
    $content = $content -replace 'text-purple-\d+', 'text-slate-900'
    $content = $content -replace 'text-pink-\d+', 'text-slate-900'
    $content = $content -replace 'text-teal-\d+', 'text-slate-900'
    
    # Replace ALL colored borders
    $content = $content -replace 'border-emerald-\d+', 'border-blue-200'
    $content = $content -replace 'border-green-\d+', 'border-blue-200'
    $content = $content -replace 'border-red-\d+', 'border-blue-200'
    $content = $content -replace 'border-rose-\d+', 'border-blue-200'
    $content = $content -replace 'border-orange-\d+', 'border-blue-200'
    $content = $content -replace 'border-amber-\d+', 'border-blue-200'
    $content = $content -replace 'border-yellow-\d+', 'border-blue-200'
    $content = $content -replace 'border-purple-\d+', 'border-blue-200'
    $content = $content -replace 'border-pink-\d+', 'border-blue-200'
    $content = $content -replace 'border-teal-\d+', 'border-blue-200'
    
    # Replace ALL colored shadows
    $content = $content -replace 'shadow-emerald-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-green-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-red-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-orange-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-amber-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-purple-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-pink-\d+/\d+', 'shadow-blue-500/10'
    $content = $content -replace 'shadow-teal-\d+/\d+', 'shadow-blue-500/10'
    
    # Replace colored 50 backgrounds (light colors) with blue-50 or white
    $content = $content -replace 'bg-emerald-50', 'bg-blue-50'
    $content = $content -replace 'bg-green-50', 'bg-blue-50'
    $content = $content -replace 'bg-red-50', 'bg-blue-50'
    $content = $content -replace 'bg-orange-50', 'bg-blue-50'
    $content = $content -replace 'bg-amber-50', 'bg-blue-50'
    $content = $content -replace 'bg-purple-50', 'bg-blue-50'
    $content = $content -replace 'bg-pink-50', 'bg-blue-50'
    $content = $content -replace 'bg-teal-50', 'bg-blue-50'
    
    if ($content -ne $original) {
        Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "Modified: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
    else {
        Write-Host "No changes: $(Split-Path $file -Leaf)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "STRICT Blue & White theme applied!" -ForegroundColor Green
Write-Host "All colors replaced with Blue or White only." -ForegroundColor Cyan
