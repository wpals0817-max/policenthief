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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 화면 크기 체크
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 서버 사이드 렌더링 방지
  if (!mounted) {
    return (
      <div className={`w-full bg-white border border-gray-300 rounded-xl shadow-md ${className}`}>
        <div className="text-center py-4">
          <span className="text-gray-400 text-sm">광고 로딩 중...</span>
        </div>
      </div>
    );
  }

  // 모바일용 배너 (340x60)
  const mobileBanner = `
    <script src="https://ads-partners.coupang.com/g.js"></script>
    <script>
      new PartnersCoupang.G({"id":965686,"template":"carousel","trackingCode":"AF4963764","width":"340","height":"60","tsource":""});
    </script>
  `;

  // PC용 배너 (728x110)
  const desktopBanner = `
    <script src="https://ads-partners.coupang.com/g.js"></script>
    <script>
      new PartnersCoupang.G({"id":966991,"template":"carousel","trackingCode":"AF4963764","width":"728","height":"110","tsource":""});
    </script>
  `;

  return (
    <div className={`w-full bg-white border border-gray-300 rounded-xl shadow-md ${className}`}>
      {/* 광고 라벨 */}
      <div className="text-center pt-2 pb-1">
        <span className="text-[10px] text-gray-500 font-medium">AD</span>
      </div>
      
      {/* 쿠팡 배너 - 반응형 + 중앙 정렬 */}
      <div 
        key={isMobile ? 'mobile' : 'desktop'}
        className="w-full flex justify-center items-center py-2 min-h-[70px]"
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
