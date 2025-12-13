# HR Pages Reskin Script - Blue & White Theme
# PowerShell - Style improvements for all HR pages

Write-Host "🎨 Starting HR Pages Reskin (Blue & White Theme)..." -ForegroundColor Cyan
Write-Host ""

$hrPages = @(
    "frontend\src\page\admin\employee.jsx",
    "frontend\src\page\admin\paiement.jsx",
    "frontend\src\page\admin\employeeDashboard.jsx",
    "frontend\src\page\admin\presence.jsx",
    "frontend\src\page\admin\commissions.jsx",
    "frontend\src\page\admin\affectations.jsx",
    "frontend\src\page\admin\permissions.jsx"
)

$totalModified = 0

foreach ($file in $hrPages) {
    if (!(Test-Path $file)) {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing: $(Split-Path $file -Leaf)..." -ForegroundColor Gray
    $content = Get-Content $file -Raw -Encoding UTF8
    $original = $content
    
    # 1. Main container - 100% width + animation
    $content = $content -replace 'className="min-h-screen bg-gray-50', 'className="w-full min-h-screen bg-slate-50 animate-[fade-in_0.6s_ease-out]'
    $content = $content -replace 'className="min-h-screen bg-gray-100', 'className="w-full min-h-screen bg-slate-50 animate-[fade-in_0.6s_ease-out]'
    
    # 2. Headers - Better shadows and spacing
    $content = $content -replace 'bg-white shadow-sm border', 'bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border'
    $content = $content -replace 'bg-white rounded-2xl shadow-sm', 'bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]'
    $content = $content -replace 'bg-white rounded-xl shadow-sm', 'bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]'
    
    # 3. Borders - slate instead of gray
    $content = $content -replace 'border-gray-200', 'border-slate-200'
    $content = $content -replace 'border-gray-100', 'border-slate-100'
    
    # 4. Text colors - slate instead of gray
    $content = $content -replace 'text-gray-900', 'text-slate-900'
    $content = $content -replace 'text-gray-800', 'text-slate-900'
    $content = $content -replace 'text-gray-700', 'text-slate-700'
    $content = $content -replace 'text-gray-600', 'text-slate-600'
    $content = $content -replace 'text-gray-500', 'text-slate-500'
    $content = $content -replace 'text-gray-400', 'text-slate-400'
    
    # 5. Backgrounds - slate instead of gray
    $content = $content -replace 'bg-gray-50(?! )', 'bg-slate-50'
    $content = $content -replace 'bg-gray-100(?! )', 'bg-slate-100'
    
    # 6. Buttons - Blue theme with hover effects
    $content = $content -replace 'bg-blue-500 text-white', 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95'
    $content = $content -replace 'bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors(?! )', 'bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/20'
    
    # 7. Hover states
    $content = $content -replace 'hover:bg-gray-50', 'hover:bg-slate-50'
    $content = $content -replace 'hover:bg-gray-100', 'hover:bg-slate-100'
    
    # 8. Table headers
    $content = $content -replace 'bg-gray-50 text-gray', 'bg-slate-50 text-slate'
    
    # 9. Input focus states
    $content = $content -replace 'focus:ring-blue-500 focus:border-blue-500', 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
    
    # 10. Badges - Better styling
    $content = $content -replace 'bg-green-100 text-green-600', 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    $content = $content -replace 'bg-blue-100 text-blue-600', 'bg-blue-50 text-blue-700 border border-blue-200'
    $content = $content -replace 'bg-red-100 text-red-600', 'bg-red-50 text-red-700 border border-red-200'
    $content = $content -replace 'bg-yellow-100 text-yellow-600', 'bg-amber-50 text-amber-700 border border-amber-200'
    
    if ($content -ne $original) {
        Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "  ✅ Modified: $(Split-Path $file -Leaf)" -ForegroundColor Green
        $totalModified++
    }
    else {
        Write-Host "  ⚪ No changes: $(Split-Path $file -Leaf)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✨ HR Pages Reskin Complete!" -ForegroundColor Green
Write-Host "📊 Files modified: $totalModified" -ForegroundColor Green
Write-Host "🎯 Only styles changed, data preserved." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
