'use client';

import { useEffect, useRef } from 'react';

interface CoupangBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

/**
 * 쿠팡 파트너스 배너 컴포넌트
 * 
 * 사용법:
 * 1. 쿠팡 파트너스 가입: https://partners.coupang.com
 * 2. "링크 생성" → "배너" 선택
 * 3. 배너 크기: 320x50 (모바일) 또는 728x90 (PC)
 * 4. 생성된 코드를 아래 COUPANG_BANNER_SCRIPT에 붙여넣기
 */

// TODO: 쿠팡 파트너스 가입 후 실제 배너 코드로 교체
const COUPANG_BANNER_SCRIPT = `
<!-- 쿠팡 파트너스 배너 코드를 여기에 붙여넣기 -->
<!-- 예시:
<script src="https://ads-partners.coupang.com/g.js"></script>
<script>
  new PartnersCoupang.G({
    id: YOUR_SUBID,
    template: "carousel",
    trackingCode: "YOUR_TRACKING_CODE",
    width: "320",
    height: "50"
  });
</script>
-->
`;

export default function CoupangBanner({ 
  position = 'bottom',
  className = ''
}: CoupangBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 쿠팡 배너 스크립트 로드
    if (bannerRef.current && COUPANG_BANNER_SCRIPT.trim()) {
      // 실제 스크립트가 있으면 삽입
      // 현재는 플레이스홀더
    }
  }, []);

  // 실제 배너 코드가 없으면 플레이스홀더 표시 (개발용)
  const hasRealBanner = COUPANG_BANNER_SCRIPT.includes('PartnersCoupang');

  if (!hasRealBanner) {
    return (
      <div 
        className={`w-full bg-gray-100 border-t border-gray-200 ${className}`}
        style={{
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="text-center text-gray-400 text-xs py-3">
          <p>쿠팡 파트너스 배너 영역</p>
          <p className="mt-1 text-[10px]">
            CoupangBanner.tsx 파일에서 배너 코드 추가
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={bannerRef}
      className={`w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: COUPANG_BANNER_SCRIPT }}
    />
  );
}
