#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 간단한 PNG 생성 (Canvas 없이)
// SVG를 읽고 데이터 URL로 사용할 수 있도록 준비

const iconDir = path.join(__dirname, '../public/icons');
const svgPath = path.join(iconDir, 'icon.svg');

console.log('🎨 PWA 아이콘 생성 중...');

if (!fs.existsSync(svgPath)) {
  console.error('❌ icon.svg를 찾을 수 없습니다');
  process.exit(1);
}

// SVG 내용 읽기
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('📦 SVG 파일 확인됨');
console.log('⚠️  ImageMagick이 필요합니다: brew install imagemagick');
console.log('');
console.log('📝 임시 방법: 온라인 도구 사용');
console.log('   1. https://realfavicongenerator.net/ 방문');
console.log('   2. public/icons/icon.svg 업로드');
console.log('   3. 192x192, 512x512 PNG 다운로드');
console.log('   4. public/icons/ 폴더에 저장');
console.log('');
console.log('또는 다음 명령어로 ImageMagick 설치:');
console.log('   brew install imagemagick');
console.log('   bash scripts/generate-icons.sh');

// 임시로 간단한 HTML 파일 생성
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>아이콘 생성기</title>
</head>
<body>
  <h1>아이콘을 생성하려면:</h1>
  <ol>
    <li>터미널에서 <code>brew install imagemagick</code> 실행</li>
    <li>그 다음 <code>bash scripts/generate-icons.sh</code> 실행</li>
  </ol>
  
  <h2>또는 온라인 도구 사용:</h2>
  <ol>
    <li><a href="https://realfavicongenerator.net/" target="_blank">RealFaviconGenerator</a> 방문</li>
    <li>아래 SVG 이미지를 우클릭하여 저장 후 업로드</li>
    <li>생성된 192x192, 512x512 PNG를 <code>public/icons/</code>에 저장</li>
  </ol>
  
  <h3>현재 SVG:</h3>
  <div style="padding: 20px; background: #f0f0f0;">
    ${svgContent}
  </div>
  
  <h3>SVG 내용:</h3>
  <pre style="background: #f0f0f0; padding: 10px; overflow-x: auto;">${svgContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;

const outputPath = path.join(__dirname, '../icon-generator.html');
fs.writeFileSync(outputPath, htmlContent);

console.log('');
console.log(`✅ 가이드 파일 생성: ${outputPath}`);
console.log('   브라우저에서 열어서 아이콘을 생성하세요');
