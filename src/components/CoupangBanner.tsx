'use client';

import { useEffect, useState } from 'react';

interface CoupangBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export default function CoupangBanner({ 
  position = 'bottom',
  className = ''
}: CoupangBannerProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // 화면 크기 체크
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일용 배너 (320x50)
  const mobileBanner = `
    <div style="width: 100%; display: flex; justify-content: center; align-items: center;">
      <div id="coupang-mobile-banner"></div>
    </div>
    <script src="https://ads-partners.coupang.com/g.js"></script>
    <script>
      new PartnersCoupang.G({
        "id": 965686,
        "template": "carousel",
        "trackingCode": "AF4963764",
        "width": "320",
        "height": "50",
        "tsource": ""
      });
    </script>
  `;

  // PC용 배너 (728x110)
  const desktopBanner = `
    <div style="width: 100%; display: flex; justify-content: center; align-items: center;">
      <div id="coupang-desktop-banner"></div>
    </div>
    <script src="https://ads-partners.coupang.com/g.js"></script>
    <script>
      new PartnersCoupang.G({
        "id": 966991,
        "template": "carousel",
        "trackingCode": "AF4963764",
        "width": "728",
        "height": "110",
        "tsource": ""
      });
    </script>
  `;

  return (
    <div className={`w-full bg-[#0a0a0a] border-t border-gray-800 ${className}`}>
      {/* 쿠팡 배너 - 반응형 + 중앙 정렬 */}
      <div 
        className="w-full flex justify-center items-center py-3"
        dangerouslySetInnerHTML={{
          __html: isMobile ? mobileBanner : desktopBanner
        }}
      />
      
      {/* 면책 문구 - 중앙 정렬 */}
      <p className="text-center text-gray-500 text-[10px] px-4 pb-3">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}

// TypeScript 타입 선언
declare global {
  interface Window {
    PartnersCoupang?: {
      G: new (config: {
        id: number;
        template: string;
        trackingCode: string;
        width: string;
        height: string;
        tsource: string;
      }) => void;
    };
  }
}
