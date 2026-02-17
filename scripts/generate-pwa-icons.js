#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconDir = path.join(__dirname, '../public/icons');
const svgPath = path.join(iconDir, 'icon.svg');

console.log('🎨 PWA 아이콘 생성 중...\n');

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('❌ icon.svg를 찾을 수 없습니다:', svgPath);
    process.exit(1);
  }

  const sizes = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
  ];

  for (const { size, name } of sizes) {
    const outputPath = path.join(iconDir, name);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      console.log(`✅ ${name} 생성 완료 (${sizeKB} KB)`);
    } catch (error) {
      console.error(`❌ ${name} 생성 실패:`, error.message);
    }
  }

  console.log('\n📊 생성된 아이콘:');
  const files = fs.readdirSync(iconDir).filter(f => f.endsWith('.png'));
  files.forEach(file => {
    const stats = fs.statSync(path.join(iconDir, file));
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ${file}: ${sizeKB} KB`);
  });

  console.log('\n✨ 완료! PWA 아이콘이 준비되었습니다.');
}

generateIcons().catch(error => {
  console.error('오류 발생:', error);
  process.exit(1);
});
