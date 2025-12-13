# Reskin Script - Blue & White Theme
# PowerShell - Change styles only, preserve data

Write-Host "🎨 Starting Blue & White Reskin..." -ForegroundColor Cyan
Write-Host ""

$adminPath = "frontend\src\page\admin"
$employeePath = "frontend\src\page\employee"
$totalModified = 0

# Function to process files
function Process-Files {
    param($path)
    
    if (!(Test-Path $path)) {
        Write-Host "⚠️  Path not found: $path" -ForegroundColor Yellow
        return 0
    }
    
    $files = Get-ChildItem -Path $path -Filter "*.jsx" -Recurse
    $count = 0
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $original = $content
        
        # 1. Width - 100%
        $content = $content -replace 'max-w-lg mx-auto', 'w-full'
        $content = $content -replace 'max-w-7xl mx-auto', 'w-full'
        $content = $content -replace 'max-w-2xl mx-auto', 'w-full'
        $content = $content -replace 'max-w-4xl mx-auto', 'w-full'
        
        # 2. Cards - New shadow
        $content = $content -replace 'bg-white rounded-2xl shadow-sm border border-slate-100', 'bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-200'
        
        # 3. Text colors
        $content = $content -replace 'text-slate-800 font-extrabold', 'text-slate-900 font-extrabold'
        $content = $content -replace 'text-slate-500 font-medium', 'text-slate-600 font-medium'
        
        # 4. Badges
        $content = $content -replace 'bg-blue-100 text-blue-600 px-2 py-0\.5 rounded text-xs', 'bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1 text-xs font-bold'
        $content = $content -replace 'bg-emerald-100 text-emerald-600 px-2 py-0\.5 rounded text-xs', 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1 text-xs font-bold'
        $content = $content -replace 'bg-amber-100 text-amber-600 px-2 py-0\.5 rounded text-xs', 'bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1 text-xs font-bold'
        
        # 5. Hover states
        $content = $content -replace 'hover:bg-slate-50 transition-colors(?!.*duration)', 'hover:bg-slate-50/80 transition-colors duration-150'
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "✅ Reskinned: $($file.Name)" -ForegroundColor Green
            $count++
        }
    }
    
    return $count
}

# Process Admin pages
Write-Host "📁 Processing Admin pages..." -ForegroundColor Yellow
$totalModified += Process-Files $adminPath

Write-Host ""

# Process Employee pages
Write-Host "📁 Processing Employee pages..." -ForegroundColor Yellow
$totalModified += Process-Files $employeePath

Write-Host ""
Write-Host "✨ Reskin complete! $totalModified files modified." -ForegroundColor Green
Write-Host "🎯 Only styles changed, data preserved." -ForegroundColor Cyan
