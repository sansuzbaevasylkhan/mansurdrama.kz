const fs = require('fs');
const path = require('path');

function findRouteFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      findRouteFiles(full, files);
    } else if (item === 'route.ts') {
      files.push(full);
    }
  }
  return files;
}

const files = findRouteFiles('app/api');
const broken = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // NextRequest кез-келген жерде қолданылады ма?
  const usesNextRequest = /\bNextRequest\b/.test(content);
  // Импорт бар ма (типі ретінде)?
  // "NextRequest" типі ретінде — параметр типі немесе локалды айнымалы типі
  const hasNextRequestImport = /import\s*\{[^}]*\bNextRequest\b[^}]*\}\s*from\s*['"]next\/server['"]/.test(content);
  if (usesNextRequest && !hasNextRequestImport) {
    broken.push(file);
  }
}

console.log('=== СЫНҒАН ФАЙЛДАР (NextRequest жоқ импорт) ===');
broken.forEach(f => console.log('  ' + f.split(path.sep).join('/')));
console.log('\nБарлығы:', broken.length, 'файл');
