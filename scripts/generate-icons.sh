#!/bin/bash

# PWA 아이콘 생성 스크립트
# 필요: ImageMagick (brew install imagemagick)

echo "🎨 PWA 아이콘 생성 중..."

# 디렉토리 확인
ICON_DIR="public/icons"
SOURCE_ICON="$ICON_DIR/icon.svg"

if [ ! -f "$SOURCE_ICON" ]; then
  echo "❌ 소스 아이콘을 찾을 수 없습니다: $SOURCE_ICON"
  echo "💡 임시 아이콘을 생성합니다..."
  
  # 임시 아이콘 생성 (emoji 사용)
  convert -size 192x192 xc:'#3b82f6' \
    -gravity center \
    -pointsize 120 \
    -font Arial \
    -fill white \
    -annotate +0+0 '🚔' \
    "$ICON_DIR/icon-192.png"
  
  convert -size 512x512 xc:'#3b82f6' \
    -gravity center \
    -pointsize 320 \
    -font Arial \
    -fill white \
    -annotate +0+0 '🚔' \
    "$ICON_DIR/icon-512.png"
  
  echo "✅ 임시 아이콘 생성 완료!"
  echo "⚠️  나중에 디자인된 아이콘으로 교체하세요"
  
else
  echo "📦 SVG를 PNG로 변환 중..."
  
  # 192x192
  convert -background none -resize 192x192 "$SOURCE_ICON" "$ICON_DIR/icon-192.png"
  echo "✅ icon-192.png 생성 완료"
  
  # 512x512
  convert -background none -resize 512x512 "$SOURCE_ICON" "$ICON_DIR/icon-512.png"
  echo "✅ icon-512.png 생성 완료"
fi

# 파일 크기 확인
echo ""
echo "📊 생성된 아이콘 정보:"
ls -lh "$ICON_DIR"/*.png

echo ""
echo "✨ 완료! manifest.json이 아이콘을 참조할 수 있습니다."
