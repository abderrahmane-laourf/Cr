#!/usr/bin/env node

/**
 * Script de Reskin Automatique - Blue & White Theme
 * Change SEULEMENT les styles, PAS les données
 */

const fs = require('fs');
const path = require('path');

// Patterns de remplacement (styles uniquement)
const replacements = [
  // 1. Width - 100% partout
  {
    find: /max-w-lg mx-auto/g,
    replace: 'w-full'
  },
  {
    find: /max-w-7xl mx-auto/g,
    replace: 'w-full'
  },
  {
    find: /max-w-2xl mx-auto/g,
    replace: 'w-full'
  },
  {
    find: /max-w-4xl mx-auto/g,
    replace: 'w-full'
  },
  
  // 2. Cards - Nouvelle shadow
  {
    find: /bg-white rounded-2xl shadow-sm border border-slate-100/g,
    replace: 'bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-200'
  },
  {
    find: /bg-white rounded-xl shadow-sm border border-slate-200/g,
    replace: 'bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-200'
  },
  
  // 3. Boutons primaires - Blue theme
  {
    find: /bg-blue-500 text-white/g,
    replace: 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95'
  },
  
  // 4. Texte - Hiérarchie
  {
    find: /text-slate-800 font-extrabold/g,
    replace: 'text-slate-900 font-extrabold'
  },
  {
    find: /text-slate-500 font-medium/g,
    replace: 'text-slate-600 font-medium'
  },
  
  // 5. Badges - Nouveau style
  {
    find: /bg-blue-100 text-blue-600 px-2 py-0\.5 rounded/g,
    replace: 'bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1'
  },
  {
    find: /bg-emerald-100 text-emerald-600 px-2 py-0\.5 rounded/g,
    replace: 'bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1'
  },
  {
    find: /bg-amber-100 text-amber-600 px-2 py-0\.5 rounded/g,
    replace: 'bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1'
  },
  {
    find: /bg-red-100 text-red-600 px-2 py-0\.5 rounded/g,
    replace: 'bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1'
  },
  
  // 6. Inputs - Focus states
  {
    find: /border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/g,
    replace: 'border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
  },
  
  // 7. Hover states - Tables
  {
    find: /hover:bg-slate-50 transition-colors/g,
    replace: 'hover:bg-slate-50/80 transition-colors duration-150'
  }
];

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ find, replace }) => {
      if (content.match(find)) {
        content = content.replace(find, replace);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Reskinned: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir les dossiers
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let count = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (processFile(fullPath)) {
        count++;
      }
    }
  });
  
  return count;
}

// Exécution
console.log('🎨 Starting Blue & White Reskin...\n');

const adminPath = path.join(__dirname, '../src/page/admin');
const employeePath = path.join(__dirname, '../src/page/employee');

let totalModified = 0;

if (fs.existsSync(adminPath)) {
  console.log('📁 Processing Admin pages...');
  totalModified += processDirectory(adminPath);
}

if (fs.existsSync(employeePath)) {
  console.log('\n📁 Processing Employee pages...');
  totalModified += processDirectory(employeePath);
}

console.log(`\n✨ Reskin complete! ${totalModified} files modified.`);
console.log('🎯 Only styles changed, data preserved.');
