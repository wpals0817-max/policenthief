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

  return (
    <div className={`w-full bg-white border border-gray-300 rounded-xl shadow-md ${className}`}>
      {/* 광고 라벨 */}
      <div className="text-center pt-2 pb-1">
        <span className="text-[10px] text-gray-500 font-medium">AD</span>
      </div>
      
      {/* 쿠팡 배너 - iframe 방식 */}
      <div className="w-full flex justify-center items-center py-2">
        {isMobile ? (
          // 모바일용 배너 (340x60)
          <iframe 
            src="https://ads-partners.coupang.com/widgets.html?id=965686&template=carousel&trackingCode=AF4963764&subId=&width=340&height=60&tsource=" 
            width="340" 
            height="60" 
            frameBorder="0" 
            scrolling="no" 
            referrerPolicy="unsafe-url"
            title="쿠팡 파트너스 광고"
          />
        ) : (
          // PC용 배너 (728x110)
          <iframe 
            src="https://ads-partners.coupang.com/widgets.html?id=966991&template=carousel&trackingCode=AF4963764&subId=&width=728&height=110&tsource=" 
            width="728" 
            height="110" 
            frameBorder="0" 
            scrolling="no" 
            referrerPolicy="unsafe-url"
            title="쿠팡 파트너스 광고"
          />
        )}
      </div>
      
      {/* 면책 문구 */}
      <p className="text-center text-gray-500 text-[10px] px-4 pb-3">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}
