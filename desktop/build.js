const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const frontDir = path.join(rootDir, 'front');
const backDir = path.join(rootDir, 'back');
const desktopDir = path.join(rootDir, 'desktop');

console.log('🚀 Iniciando compilación de Alevia Pay Desktop...');

function run(command, cwd) {
  console.log(`\n📦 Ejecutando: ${command} en ${path.relative(rootDir, cwd) || '.'}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

try {
  // 1. Compilar Frontend
  console.log('\n[1/3] Compilando Frontend (Vue 3 / Vite)...');
  run('npm run build', frontDir);

  // 2. Compilar Backend
  console.log('\n[2/3] Compilando Backend (NestJS)...');
  run('npm run build', backDir);

  // 3. Empaquetar con Electron Builder para Windows
  console.log('\n[3/3] Generando instalador de Windows (.exe)...');
  run('npm run dist:win', desktopDir);

  console.log('\n✅ ¡Compilación finalizada con éxito!');
  console.log('📁 El instalador se encuentra en: desktop/release/');
} catch (error) {
  console.error('\n❌ Error durante la compilación:', error.message);
  process.exit(1);
}
