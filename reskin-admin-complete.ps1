# Complete Reskin Script - Blue & White Theme
# PowerShell - Comprehensive style changes for ALL admin pages

Write-Host "🎨 Starting COMPLETE Blue & White Reskin for Admin Pages..." -ForegroundColor Cyan
Write-Host ""

$adminPath = "frontend\src\page\admin"
$totalModified = 0
$changesCount = 0

# Function to process files with comprehensive replacements
function Process-AdminFiles {
    param($path)
    
    if (!(Test-Path $path)) {
        Write-Host "⚠️  Path not found: $path" -ForegroundColor Yellow
        return 0
    }
    
    $files = Get-ChildItem -Path $path -Filter "*.jsx" -Recurse
    $count = 0
    
    foreach ($file in $files) {
        Write-Host "Processing: $($file.Name)..." -ForegroundColor Gray
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $original = $content
        $fileChanges = 0
        
        # ========== WIDTH CHANGES ==========
        if ($content -match 'max-w-lg mx-auto') {
            $content = $content -replace 'max-w-lg mx-auto', 'w-full'
            $fileChanges++
        }
        if ($content -match 'max-w-7xl mx-auto') {
            $content = $content -replace 'max-w-7xl mx-auto', 'w-full'
            $fileChanges++
        }
        if ($content -match 'max-w-2xl mx-auto') {
            $content = $content -replace 'max-w-2xl mx-auto', 'w-full'
            $fileChanges++
        }
        if ($content -match 'max-w-4xl mx-auto') {
            $content = $content -replace 'max-w-4xl mx-auto', 'w-full'
            $fileChanges++
        }
        if ($content -match 'max-w-6xl mx-auto') {
            $content = $content -replace 'max-w-6xl mx-auto', 'w-full'
            $fileChanges++
        }
        
        # ========== CARDS & CONTAINERS ==========
        # Main cards
        if ($content -match 'bg-white rounded-2xl shadow-sm border border-slate-100(?! hover)') {
            $content = $content -replace 'bg-white rounded-2xl shadow-sm border border-slate-100(?! hover)', 'bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-200'
            $fileChanges++
        }
        if ($content -match 'bg-white rounded-xl shadow-sm border border-slate-200(?! hover)') {
            $content = $content -replace 'bg-white rounded-xl shadow-sm border border-slate-200(?! hover)', 'bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-200'
            $fileChanges++
        }
        if ($content -match 'bg-white p-5 rounded-2xl shadow-sm') {
            $content = $content -replace 'bg-white p-5 rounded-2xl shadow-sm', 'bg-white p-6 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]'
            $fileChanges++
        }
        if ($content -match 'bg-white p-4 rounded-2xl shadow-sm') {
            $content = $content -replace 'bg-white p-4 rounded-2xl shadow-sm', 'bg-white p-6 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]'
            $fileChanges++
        }
        
        # ========== TEXT COLORS ==========
        if ($content -match 'text-slate-800 font-extrabold') {
            $content = $content -replace 'text-slate-800 font-extrabold', 'text-slate-900 font-extrabold'
            $fileChanges++
        }
        if ($content -match 'text-slate-500 font-medium') {
            $content = $content -replace 'text-slate-500 font-medium', 'text-slate-600 font-medium'
            $fileChanges++
        }
        if ($content -match 'text-slate-500 text-xs') {
            $content = $content -replace 'text-slate-500 text-xs', 'text-slate-600 text-xs'
            $fileChanges++
        }
        
        # ========== BUTTONS ==========
        # Primary buttons (blue)
        if ($content -match 'bg-blue-500 text-white(?! font-semibold)') {
            $content = $content -replace 'bg-blue-500 text-white', 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95'
            $fileChanges++
        }
        if ($content -match 'bg-blue-600 text-white px-4 py-2 rounded-lg(?! font-semibold)') {
            $content = $content -replace 'bg-blue-600 text-white px-4 py-2 rounded-lg', 'bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95'
            $fileChanges++
        }
        
        # ========== BADGES ==========
        if ($content -match 'bg-blue-100 text-blue-600 px-2 py-0\.5 rounded(?! border)') {
            $content = $content -replace 'bg-blue-100 text-blue-600 px-2 py-0\.5 rounded', 'bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1 font-bold'
            $fileChanges++
        }
        if ($content -match 'bg-emerald-100 text-emerald-600 px-2 py-0\.5 rounded(?! border)') {
            $content = $content -replace 'bg-emerald-100 text-emerald-600 px-2 py-0\.5 rounded', 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1 font-bold'
            $fileChanges++
        }
        if ($content -match 'bg-amber-100 text-amber-600 px-2 py-0\.5 rounded(?! border)') {
            $content = $content -replace 'bg-amber-100 text-amber-600 px-2 py-0\.5 rounded', 'bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1 font-bold'
            $fileChanges++
        }
        if ($content -match 'bg-red-100 text-red-600 px-2 py-0\.5 rounded(?! border)') {
            $content = $content -replace 'bg-red-100 text-red-600 px-2 py-0\.5 rounded', 'bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1 font-bold'
            $fileChanges++
        }
        
        # ========== INPUTS ==========
        if ($content -match 'border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500(?! focus:border-blue-500)') {
            $content = $content -replace 'border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500', 'border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
            $fileChanges++
        }
        if ($content -match 'border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500(?! focus:border-blue-500)') {
            $content = $content -replace 'border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500', 'border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
            $fileChanges++
        }
        
        # ========== HOVER STATES ==========
        if ($content -match 'hover:bg-slate-50 transition-colors(?! duration)') {
            $content = $content -replace 'hover:bg-slate-50 transition-colors', 'hover:bg-slate-50/80 transition-colors duration-150'
            $fileChanges++
        }
        
        # ========== PAGE WRAPPER ANIMATION ==========
        if ($content -match 'className="space-y-4 pb-20(?! animate)') {
            $content = $content -replace 'className="space-y-4 pb-20', 'className="w-full space-y-6 pb-20 animate-[fade-in_0.6s_ease-out]'
            $fileChanges++
        }
        if ($content -match 'className="space-y-6 pb-20(?! animate)') {
            $content = $content -replace 'className="space-y-6 pb-20', 'className="w-full space-y-6 pb-20 animate-[fade-in_0.6s_ease-out]'
            $fileChanges++
        }
        
        # ========== TABLE HEADERS ==========
        if ($content -match 'bg-slate-50(?! border-b).*text-slate-500') {
            $content = $content -replace '(bg-slate-50)(\s+)(text-slate-500)', '$1 border-b border-slate-100$2$3 uppercase tracking-wider'
            $fileChanges++
        }
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
            Write-Host "  ✅ Modified: $($file.Name) ($fileChanges changes)" -ForegroundColor Green
            $count++
            $script:changesCount += $fileChanges
        }
        else {
            Write-Host "  ⚪ No changes: $($file.Name)" -ForegroundColor DarkGray
        }
    }
    
    return $count
}

# Process Admin pages
Write-Host "📁 Processing ALL Admin pages..." -ForegroundColor Yellow
Write-Host ""
$totalModified = Process-AdminFiles $adminPath

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✨ Reskin COMPLETE!" -ForegroundColor Green
Write-Host "📊 Files modified: $totalModified" -ForegroundColor Green
Write-Host "🔧 Total changes: $changesCount" -ForegroundColor Green
Write-Host "🎯 Only styles changed, data preserved." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
