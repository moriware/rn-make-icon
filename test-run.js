#!/usr/bin/env node

/**
 * Script de teste básico para verificar se o pacote está funcionando
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando testes do rn-make-icon...\n');

// Teste 1: Verificar se o build existe
console.log('✅ Teste 1: Verificando se o diretório dist/ existe...');
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.error(
    '❌ ERRO: Diretório dist/ não encontrado. Execute npm run build primeiro.',
  );
  process.exit(1);
}
console.log('   ✓ Diretório dist/ encontrado\n');

// Teste 2: Verificar se o arquivo principal existe
console.log('✅ Teste 2: Verificando se dist/index.js existe...');
if (!fs.existsSync(path.join(__dirname, 'dist', 'index.js'))) {
  console.error('❌ ERRO: dist/index.js não encontrado.');
  process.exit(1);
}
console.log('   ✓ dist/index.js encontrado\n');

// Teste 3: Verificar se o shebang está presente
console.log('✅ Teste 3: Verificando shebang no dist/index.js...');
const indexContent = fs.readFileSync(
  path.join(__dirname, 'dist', 'index.js'),
  'utf8',
);
if (!indexContent.startsWith('#!/usr/bin/env node')) {
  console.error('❌ ERRO: Shebang não encontrado no início do arquivo.');
  process.exit(1);
}
console.log('   ✓ Shebang presente\n');

// Teste 4: Executar comando --version
console.log('✅ Teste 4: Testando comando --version...');
try {
  const version = execSync('node dist/index.js --version', {
    encoding: 'utf8',
  });
  console.log('   ✓ Versão:', version.trim());
} catch (error) {
  console.error('❌ ERRO ao executar --version:', error.message);
  process.exit(1);
}

// Teste 5: Executar comando --help
console.log('\n✅ Teste 5: Testando comando --help...');
try {
  const help = execSync('node dist/index.js --help', { encoding: 'utf8' });
  if (!help.includes('Commands:') || !help.includes('gerar')) {
    console.error('❌ ERRO: Comando --help não retornou a saída esperada.');
    process.exit(1);
  }
  console.log('   ✓ Comando --help funcionando corretamente');
} catch (error) {
  console.error('❌ ERRO ao executar --help:', error.message);
  process.exit(1);
}

// Teste 6: Verificar package.json
console.log('\n✅ Teste 6: Verificando configuração do package.json...');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'),
);
if (packageJson.main !== 'dist/index.js') {
  console.error(
    '❌ ERRO: package.json main deveria ser "dist/index.js", mas é:',
    packageJson.main,
  );
  process.exit(1);
}
if (packageJson.bin['rn-make-icon'] !== 'dist/index.js') {
  console.error(
    '❌ ERRO: package.json bin deveria ser "dist/index.js", mas é:',
    packageJson.bin['rn-make-icon'],
  );
  process.exit(1);
}
console.log('   ✓ Configuração do package.json está correta');

// Teste 7: Verificar se as imagens de exemplo existem
console.log('\n✅ Teste 7: Verificando arquivos de exemplo...');
const exampleIcon = path.join(__dirname, 'example', 'icon.png');
if (!fs.existsSync(exampleIcon)) {
  console.error('❌ ERRO: Arquivo de exemplo example/icon.png não encontrado.');
  process.exit(1);
}
console.log('   ✓ Arquivo example/icon.png encontrado');

// Teste 8: Verificar estrutura de arquivos essenciais
console.log('\n✅ Teste 8: Verificando estrutura de arquivos essenciais...');
const essentialFiles = [
  'dist/lib/creator/index.js',
  'dist/lib/creator/android.js',
  'dist/lib/creator/ios.js',
  'dist/utils/index.js',
];

for (const file of essentialFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ ERRO: Arquivo essencial ${file} não encontrado.`);
    process.exit(1);
  }
}
console.log('   ✓ Todos os arquivos essenciais encontrados');

console.log('\n🎉 Todos os testes passaram com sucesso!');
console.log('\n📦 Seu pacote está pronto para ser publicado!');
console.log('\n💡 Próximos passos:');
console.log('   1. Teste localmente com: npm link');
console.log('   2. Crie um projeto React Native de teste');
console.log('   3. Execute: rn-make-icon gerar example/icon.png');
console.log('   4. Publique com: npm publish');
